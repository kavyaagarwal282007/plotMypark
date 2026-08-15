"""
Run this after your database is set up to populate demo data so the
frontend/AI teams (and judges) have something real to hit.

Usage:
    python seed.py
"""
import random
from geoalchemy2.elements import WKTElement

from app.database import SessionLocal, Base, engine
from app import models, auth

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# --- Admin + demo citizen user ---
if not db.query(models.User).filter(models.User.email == "admin@parking.gov.in").first():
    db.add(models.User(
        name="City Admin",
        email="admin@parking.gov.in",
        phone="9999999999",
        hashed_password=auth.hash_password("admin123"),
        role=models.UserRole.admin,
    ))

if not db.query(models.User).filter(models.User.email == "citizen@example.com").first():
    db.add(models.User(
        name="Test Citizen",
        email="citizen@example.com",
        phone="8888888888",
        hashed_password=auth.hash_password("citizen123"),
        role=models.UserRole.citizen,
    ))

db.commit()

# --- Sample zones (example: around a city center — adjust lat/lng to your demo city) ---
sample_zones = [
    {"name": "MG Road Street Parking", "lat": 26.8467, "lng": 80.9462, "slots": 20, "base_price": 20},
    {"name": "Hazratganj Parking Lot", "lat": 26.8500, "lng": 80.9400, "slots": 35, "base_price": 25},
    {"name": "Station Road Parking", "lat": 26.8420, "lng": 80.9500, "slots": 15, "base_price": 15},
]

for z in sample_zones:
    existing = db.query(models.ParkingZone).filter(models.ParkingZone.name == z["name"]).first()
    if existing:
        continue

    zone = models.ParkingZone(
        name=z["name"],
        address=z["name"],
        location=WKTElement(f"POINT({z['lng']} {z['lat']})", srid=4326),
        total_slots=z["slots"],
        base_price=z["base_price"],
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    for i in range(z["slots"]):
        status = random.choices(
            [models.SlotStatus.free, models.SlotStatus.occupied],
            weights=[0.4, 0.6],
        )[0]
        db.add(models.ParkingSlot(
            zone_id=zone.id,
            slot_number=f"{z['name'][:2].upper()}-{i+1:02d}",
            status=status,
        ))
    db.commit()

print("Seed complete. Login with admin@parking.gov.in / admin123 or citizen@example.com / citizen123")
db.close()
