from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.recommendation import compute_dynamic_price
from app.ws_manager import manager

router = APIRouter(prefix="/api", tags=["booking"])


@router.post("/booking", response_model=schemas.BookingOut)
async def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    slot = db.query(models.ParkingSlot).filter(models.ParkingSlot.id == payload.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.status != models.SlotStatus.free:
        raise HTTPException(status_code=409, detail="Slot is not available")

    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == slot.zone_id).first()
    occupied = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone.id,
        models.ParkingSlot.status == models.SlotStatus.occupied,
    ).count()
    price = compute_dynamic_price(zone.base_price, occupied, zone.total_slots)

    start = payload.start_time or datetime.utcnow()
    end = start + timedelta(minutes=payload.duration_minutes)

    booking = models.Booking(
        user_id=current_user.id,
        slot_id=slot.id,
        vehicle_id=payload.vehicle_id,
        start_time=start,
        end_time=end,
        price_charged=price,
        status=models.BookingStatus.active,
    )
    slot.status = models.SlotStatus.reserved
    db.add(booking)
    db.commit()
    db.refresh(booking)

    await manager.broadcast({
        "type": "slot_update",
        "zone_id": zone.id,
        "slot_id": slot.id,
        "status": "reserved",
    })

    return booking


@router.get("/bookings", response_model=List[schemas.BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Booking).filter(models.Booking.user_id == current_user.id).order_by(
        models.Booking.created_at.desc()
    ).all()
