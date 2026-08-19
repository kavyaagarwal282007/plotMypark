from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_SetSRID, ST_X, ST_Y
from geoalchemy2.shape import to_shape

from app.database import get_db
from app import models, schemas, auth
from app.recommendation import compute_score, score_to_label, compute_dynamic_price
from app.ws_manager import manager

router = APIRouter(prefix="/api/parking", tags=["parking"])


def _zone_to_out(zone: models.ParkingZone, db: Session) -> schemas.ParkingZoneOut:
    occupied = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone.id,
        models.ParkingSlot.status == models.SlotStatus.occupied,
    ).count()
    available = zone.total_slots - occupied
    point = to_shape(zone.location)
    price = compute_dynamic_price(zone.base_price, occupied, zone.total_slots)

    return schemas.ParkingZoneOut(
        id=zone.id,
        name=zone.name,
        address=zone.address,
        latitude=point.y,
        longitude=point.x,
        total_slots=zone.total_slots,
        available_slots=max(available, 0),
        base_price=zone.base_price,
        current_price=price,
    )


@router.get("", response_model=List[schemas.ParkingZoneOut])
def list_parking(db: Session = Depends(get_db)):
    # Only show zones citizens can actually book: city-managed zones
    # (owner_id is null) and owner-listed zones that are approved/active.
    zones = db.query(models.ParkingZone).filter(
        (models.ParkingZone.owner_id.is_(None)) | (models.ParkingZone.status == models.ZoneStatus.active)
    ).all()
    return [_zone_to_out(z, db) for z in zones]


@router.get("/nearby", response_model=List[schemas.NearbyParkingOut])
def nearby_parking(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_m: int = Query(1500, description="Search radius in meters"),
    db: Session = Depends(get_db),
):
    """
    Smart Parking Recommendation.
    Ranks nearby zones by a blended score of availability, distance, and
    traffic — not just raw distance — and labels each ✅ recommended /
    ⚠️ ok / ❌ avoid.
    """
    user_point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)

    zones = (
        db.query(
            models.ParkingZone,
            ST_Distance(models.ParkingZone.location, user_point).label("distance"),
        )
        .filter(ST_Distance(models.ParkingZone.location, user_point) <= radius_m)
        .filter(
            (models.ParkingZone.owner_id.is_(None)) | (models.ParkingZone.status == models.ZoneStatus.active)
        )
        .order_by("distance")
        .all()
    )

    results = []
    for zone, distance in zones:
        occupied = db.query(models.ParkingSlot).filter(
            models.ParkingSlot.zone_id == zone.id,
            models.ParkingSlot.status == models.SlotStatus.occupied,
        ).count()
        available = max(zone.total_slots - occupied, 0)
        availability_rate = available / zone.total_slots if zone.total_slots else 0

        # TODO: replace with live traffic feed / AI congestion signal
        traffic_level = "medium"

        score = compute_score(distance, availability_rate, traffic_level)
        label = score_to_label(score)
        price = compute_dynamic_price(zone.base_price, occupied, zone.total_slots)
        point = to_shape(zone.location)

        results.append(schemas.NearbyParkingOut(
            id=zone.id,
            name=zone.name,
            address=zone.address,
            latitude=point.y,
            longitude=point.x,
            total_slots=zone.total_slots,
            available_slots=available,
            base_price=zone.base_price,
            current_price=price,
            distance_meters=round(distance, 1),
            traffic_level=traffic_level,
            recommendation=label,
            score=score,
        ))

    # Best recommendation first
    results.sort(key=lambda r: r.score, reverse=True)
    return results


@router.get("/{zone_id}", response_model=schemas.ParkingZoneOut)
def get_parking_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Parking zone not found")
    return _zone_to_out(zone, db)


@router.post("/{zone_id}/reserve")
async def reserve_slot(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Reserves the first free slot in a zone (simple strategy for MVP)."""
    slot = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone_id,
        models.ParkingSlot.status == models.SlotStatus.free,
    ).first()
    if not slot:
        raise HTTPException(status_code=409, detail="No free slots in this zone")

    slot.status = models.SlotStatus.reserved
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == zone_id).first()
    occupied = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone_id,
        models.ParkingSlot.status == models.SlotStatus.occupied,
    ).count()
    price = compute_dynamic_price(zone.base_price, occupied, zone.total_slots)

    booking = models.Booking(
        user_id=current_user.id,
        slot_id=slot.id,
        start_time=datetime.utcnow(),
        price_charged=price,
        status=models.BookingStatus.active,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    await manager.broadcast({
        "type": "slot_update",
        "zone_id": zone_id,
        "slot_id": slot.id,
        "status": "reserved",
    })

    return {"booking_id": booking.id, "slot_id": slot.id, "price": price}


@router.post("/{zone_id}/cancel")
async def cancel_reservation(
    zone_id: str,
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    slot = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.id == slot_id, models.ParkingSlot.zone_id == zone_id
    ).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    booking = db.query(models.Booking).filter(
        models.Booking.slot_id == slot_id,
        models.Booking.user_id == current_user.id,
        models.Booking.status == models.BookingStatus.active,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="No active booking found for this slot")

    booking.status = models.BookingStatus.cancelled
    booking.end_time = datetime.utcnow()
    slot.status = models.SlotStatus.free
    db.commit()

    await manager.broadcast({
        "type": "slot_update",
        "zone_id": zone_id,
        "slot_id": slot_id,
        "status": "free",
    })

    return {"message": "Reservation cancelled", "slot_id": slot_id}
