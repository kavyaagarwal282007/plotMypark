import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, Boolean, ForeignKey, DateTime,
    Enum, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    citizen = "citizen"
    admin = "admin"


class SlotStatus(str, enum.Enum):
    free = "free"
    occupied = "occupied"
    reserved = "reserved"
    disabled = "disabled"


class BookingStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    refunded = "refunded"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="owner")
    bookings = relationship("Booking", back_populates="user")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    plate_number = Column(String, unique=True, nullable=False, index=True)
    vehicle_type = Column(String, default="car")  # car, bike, truck

    owner = relationship("User", back_populates="vehicles")


class ParkingZone(Base):
    """A logical parking area, e.g. a street or lot, containing many slots."""
    __tablename__ = "parking_zones"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    total_slots = Column(Integer, default=0)
    base_price = Column(Float, default=20.0)  # per hour, in ₹
    created_at = Column(DateTime, default=datetime.utcnow)

    slots = relationship("ParkingSlot", back_populates="zone")


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    zone_id = Column(UUID(as_uuid=False), ForeignKey("parking_zones.id"), nullable=False)
    slot_number = Column(String, nullable=False)
    status = Column(Enum(SlotStatus), default=SlotStatus.free, nullable=False)
    sensor_id = Column(String, nullable=True)  # links to AI/IoT source
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("ParkingZone", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    slot_id = Column(UUID(as_uuid=False), ForeignKey("parking_slots.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=False), ForeignKey("vehicles.id"), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    price_charged = Column(Float, nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.active)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    slot = relationship("ParkingSlot", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    booking_id = Column(UUID(as_uuid=False), ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_ref = Column(String, nullable=True)  # gateway transaction id
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")


class ParkingEvent(Base):
    """Raw occupancy events pushed in by AI/sensors (car-in, car-out)."""
    __tablename__ = "parking_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    slot_id = Column(UUID(as_uuid=False), ForeignKey("parking_slots.id"), nullable=False)
    event_type = Column(String, nullable=False)  # "car_in" | "car_out"
    source = Column(String, default="ai")  # ai | manual | sensor
    confidence = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Violation(Base):
    __tablename__ = "violations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    zone_id = Column(UUID(as_uuid=False), ForeignKey("parking_zones.id"), nullable=True)
    location_note = Column(String, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    evidence_url = Column(String, nullable=True)  # snapshot/clip from AI
    status = Column(String, default="unverified")  # unverified | confirmed | dismissed
    plate_number = Column(String, nullable=True)


class Prediction(Base):
    """Cached AI predictions for a zone, refreshed periodically."""
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    zone_id = Column(UUID(as_uuid=False), ForeignKey("parking_zones.id"), nullable=False)
    horizon_minutes = Column(Integer, nullable=False)  # 15, 30, 60
    predicted_available = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
