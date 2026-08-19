"""
Endpoints for parking-space owners (Airbnb-style: a private individual or
business lists their own lot/vacant land for citizens to book), separate
from city-managed ParkingZones (which have owner_id = null).

Matches the frontend's owner-register / owner-dashboard / manage-parking /
owner-bookings pages.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/owner", tags=["owner"])


def _slot_counts(zone_id: str, db: Session):
    total = db.query(models.ParkingSlot).filter(models.ParkingSlot.zone_id == zone_id).count()
    occupied = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone_id,
        models.ParkingSlot.status == models.SlotStatus.occupied,
    ).count()
    return total, max(total - occupied, 0)


def _zone_to_owner_out(zone: models.ParkingZone, db: Session) -> schemas.OwnerSpaceOut:
    total, available = _slot_counts(zone.id, db)
    return schemas.OwnerSpaceOut(
        id=zone.id,
        name=zone.name,
        address=zone.address,
        total_slots=total,
        available_slots=available,
        base_price=zone.base_price,
        status=zone.status.value,
        space_type=zone.space_type,
        opening_time=zone.opening_time,
        closing_time=zone.closing_time,
    )


@router.post("/spaces", response_model=schemas.OwnerSpaceOut)
def register_space(
    payload: schemas.OwnerSpaceCreate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(auth.require_owner),
):
    """Owner submits a new parking space. Starts as 'pending' until an admin approves it."""
    zone = models.ParkingZone(
        name=payload.space_name,
        address=payload.address,
        location=WKTElement(f"POINT({payload.longitude} {payload.latitude})", srid=4326),
        total_slots=payload.capacity,
        base_price=payload.price,
        owner_id=owner.id,
        status=models.ZoneStatus.pending,
        space_type=payload.space_type,
        opening_time=payload.opening_time,
        closing_time=payload.closing_time,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    for i in range(payload.capacity):
        db.add(models.ParkingSlot(
            zone_id=zone.id,
            slot_number=f"{payload.space_name[:2].upper()}-{i + 1:02d}",
            status=models.SlotStatus.free,
        ))
    db.commit()

    return _zone_to_owner_out(zone, db)


@router.get("/spaces", response_model=List[schemas.OwnerSpaceOut])
def list_my_spaces(
    db: Session = Depends(get_db),
    owner: models.User = Depends(auth.require_owner),
):
    zones = db.query(models.ParkingZone).filter(models.ParkingZone.owner_id == owner.id).all()
    return [_zone_to_owner_out(z, db) for z in zones]


@router.get("/spaces/{zone_id}", response_model=schemas.OwnerSpaceOut)
def get_my_space(
    zone_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(auth.require_owner),
):
    zone = db.query(models.ParkingZone).filter(
        models.ParkingZone.id == zone_id, models.ParkingZone.owner_id == owner.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Space not found")
    return _zone_to_owner_out(zone, db)


@router.patch("/spaces/{zone_id}", response_model=schemas.OwnerSpaceOut)
def update_my_space(
    zone_id: str,
    payload: schemas.OwnerSpaceUpdate,
    db: Session = Depends(get_db),
    owner: models.User = Depends(auth.require_owner),
):
    zone = db.query(models.ParkingZone).filter(
        models.ParkingZone.id == zone_id, models.ParkingZone.owner_id == owner.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Space not found")

    if payload.price is not None:
        zone.base_price = payload.price
    if payload.opening_time is not None:
        zone.opening_time = payload.opening_time
    if payload.closing_time is not None:
        zone.closing_time = payload.closing_time
    if payload.status is not None:
        if payload.status not in ("active", "closed"):
            raise HTTPException(status_code=400, detail="status must be 'active' or 'closed'")
        zone.status = models.ZoneStatus(payload.status)

    db.commit()
    db.refresh(zone)
    return _zone_to_owner_out(zone, db)


@router.get("/spaces/{zone_id}/bookings", response_model=List[schemas.OwnerBookingOut])
def get_space_bookings(
    zone_id: str,
    db: Session = Depends(get_db),
    owner: models.User = Depends(auth.require_owner),
):
    zone = db.query(models.ParkingZone).filter(
        models.ParkingZone.id == zone_id, models.ParkingZone.owner_id == owner.id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Space not found")

    slot_ids = [s.id for s in db.query(models.ParkingSlot).filter(models.ParkingSlot.zone_id == zone_id).all()]
    bookings = db.query(models.Booking).filter(models.Booking.slot_id.in_(slot_ids)).all()

    results = []
    for b in bookings:
        driver = db.query(models.User).filter(models.User.id == b.user_id).first()
        results.append(schemas.OwnerBookingOut(
            id=b.id,
            slot_id=b.slot_id,
            driver_name=driver.name if driver else "Unknown",
            start_time=b.start_time,
            end_time=b.end_time,
            price_charged=b.price_charged,
            status=b.status.value,
        ))
    return results
