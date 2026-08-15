from datetime import datetime, time
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api", tags=["admin"])


@router.get("/analytics", response_model=schemas.AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin),
):
    total_zones = db.query(models.ParkingZone).count()
    total_slots = db.query(models.ParkingSlot).count()
    occupied_slots = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.status == models.SlotStatus.occupied
    ).count()
    occupancy_rate = round(occupied_slots / total_slots, 3) if total_slots else 0.0

    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    revenue_today = (
        db.query(models.Payment)
        .filter(
            models.Payment.status == models.PaymentStatus.success,
            models.Payment.created_at >= today_start,
        )
        .with_entities(models.Payment.amount)
        .all()
    )
    revenue_sum = sum(r[0] for r in revenue_today) if revenue_today else 0.0

    active_bookings = db.query(models.Booking).filter(
        models.Booking.status == models.BookingStatus.active
    ).count()

    return schemas.AnalyticsOut(
        total_zones=total_zones,
        total_slots=total_slots,
        occupied_slots=occupied_slots,
        occupancy_rate=occupancy_rate,
        revenue_today=round(revenue_sum, 2),
        active_bookings=active_bookings,
    )


@router.get("/violations", response_model=List[schemas.ViolationOut])
def list_violations(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin),
):
    return db.query(models.Violation).order_by(models.Violation.detected_at.desc()).all()


@router.post("/violations/{violation_id}/verify")
def verify_violation(
    violation_id: str,
    confirmed: bool,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin),
):
    violation = db.query(models.Violation).filter(models.Violation.id == violation_id).first()
    if not violation:
        return {"error": "Violation not found"}
    violation.status = "confirmed" if confirmed else "dismissed"
    db.commit()
    return {"violation_id": violation_id, "status": violation.status}
