"""
AI-facing endpoints:
  - GET /api/prediction : returns near-future availability for a zone
  - POST /api/events/ai : ingestion endpoint the AI/sensor pipeline calls
    whenever it detects a car entering/leaving a slot (feeds real-time updates)
  - POST /api/violations : AI reports illegal parking detections

The prediction here uses a simple weighted-average heuristic over recent
ParkingEvents as a placeholder. Swap this out for your AI teammate's actual
model output once ready — the response contract (schemas.PredictionOut)
should stay the same so the frontend never needs to change.
"""
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.ws_manager import manager

router = APIRouter(prefix="/api", tags=["ai"])


def _mock_predict(current_available: int, total_slots: int) -> List[dict]:
    """Naive placeholder: assumes gradual decline toward peak-hour occupancy."""
    predictions = []
    for horizon, drop_factor in [(15, 0.9), (30, 0.75), (60, 0.55)]:
        predicted = max(int(current_available * drop_factor), 0)
        predictions.append({
            "horizon_minutes": horizon,
            "available": predicted,
            "confidence": round(0.9 - (horizon / 300), 2),  # rough confidence decay
        })
    return predictions


@router.get("/prediction", response_model=schemas.PredictionOut)
def get_prediction(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    occupied = db.query(models.ParkingSlot).filter(
        models.ParkingSlot.zone_id == zone_id,
        models.ParkingSlot.status == models.SlotStatus.occupied,
    ).count()
    current_available = max(zone.total_slots - occupied, 0)

    # If real predictions exist in DB (written by AI service), prefer those.
    cutoff = datetime.utcnow() - timedelta(minutes=10)
    stored = db.query(models.Prediction).filter(
        models.Prediction.zone_id == zone_id,
        models.Prediction.generated_at >= cutoff,
    ).all()

    if stored:
        predictions = [
            {
                "horizon_minutes": p.horizon_minutes,
                "available": p.predicted_available,
                "confidence": p.confidence,
            }
            for p in stored
        ]
    else:
        predictions = _mock_predict(current_available, zone.total_slots)

    return schemas.PredictionOut(
        zone_id=zone_id,
        current_available=current_available,
        predictions=predictions,
    )


@router.post("/events/ai")
async def ingest_ai_event(
    slot_id: str,
    event_type: str,  # "car_in" | "car_out"
    confidence: float = 1.0,
    db: Session = Depends(get_db),
):
    """Called by the AI/vision pipeline whenever occupancy changes."""
    slot = db.query(models.ParkingSlot).filter(models.ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    if event_type not in ("car_in", "car_out"):
        raise HTTPException(status_code=400, detail="event_type must be car_in or car_out")

    slot.status = models.SlotStatus.occupied if event_type == "car_in" else models.SlotStatus.free

    event = models.ParkingEvent(
        slot_id=slot_id, event_type=event_type, source="ai", confidence=confidence
    )
    db.add(event)
    db.commit()

    await manager.broadcast({
        "type": "slot_update",
        "zone_id": slot.zone_id,
        "slot_id": slot_id,
        "status": slot.status.value,
    })

    return {"message": "Event recorded", "slot_id": slot_id, "new_status": slot.status.value}


@router.post("/violations", response_model=schemas.ViolationOut)
async def report_violation(
    zone_id: str = None,
    location_note: str = None,
    evidence_url: str = None,
    plate_number: str = None,
    db: Session = Depends(get_db),
):
    """AI calls this when it detects a vehicle parked in a restricted/illegal area."""
    violation = models.Violation(
        zone_id=zone_id,
        location_note=location_note,
        evidence_url=evidence_url,
        plate_number=plate_number,
        status="unverified",
    )
    db.add(violation)
    db.commit()
    db.refresh(violation)

    await manager.broadcast({
        "type": "violation_alert",
        "violation_id": violation.id,
        "location": location_note,
    })

    return violation
