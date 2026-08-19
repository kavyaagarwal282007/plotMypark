from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "citizen"  # "citizen" | "owner" (admin accounts aren't self-registered)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Parking ----------
class ParkingSlotOut(BaseModel):
    id: str
    slot_number: str
    status: str

    class Config:
        from_attributes = True


class ParkingZoneOut(BaseModel):
    id: str
    name: str
    address: Optional[str]
    latitude: float
    longitude: float
    total_slots: int
    available_slots: int
    base_price: float
    current_price: float

    class Config:
        from_attributes = True


class NearbyParkingOut(ParkingZoneOut):
    distance_meters: float
    traffic_level: str  # "low" | "medium" | "high" — placeholder until AI feeds this
    recommendation: str  # "recommended" | "ok" | "avoid"
    score: float


# ---------- Booking ----------
class BookingCreate(BaseModel):
    slot_id: str
    vehicle_id: Optional[str] = None
    start_time: Optional[datetime] = None
    duration_minutes: int = 60


class BookingOut(BaseModel):
    id: str
    slot_id: str
    start_time: datetime
    end_time: Optional[datetime]
    price_charged: Optional[float]
    status: str

    class Config:
        from_attributes = True


# ---------- Prediction ----------
class PredictionOut(BaseModel):
    zone_id: str
    current_available: int
    predictions: List[dict]  # [{"horizon_minutes": 15, "available": 7, "confidence": 0.89}, ...]


# ---------- Owner ----------
class OwnerSpaceCreate(BaseModel):
    space_name: str
    space_type: str = "existing"  # "existing" | "vacant"
    capacity: int
    price: float
    address: str
    latitude: float
    longitude: float
    opening_time: str = "08:00"
    closing_time: str = "22:00"


class OwnerSpaceOut(BaseModel):
    id: str
    name: str
    address: Optional[str]
    total_slots: int
    available_slots: int
    base_price: float
    status: str
    space_type: Optional[str]
    opening_time: Optional[str]
    closing_time: Optional[str]

    class Config:
        from_attributes = True


class OwnerSpaceUpdate(BaseModel):
    price: Optional[float] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    status: Optional[str] = None  # "active" | "closed"


class OwnerBookingOut(BaseModel):
    id: str
    slot_id: str
    driver_name: str
    start_time: datetime
    end_time: Optional[datetime]
    price_charged: Optional[float]
    status: str

    class Config:
        from_attributes = True


# ---------- Admin / Analytics ----------
class ViolationOut(BaseModel):
    id: str
    location_note: Optional[str]
    detected_at: datetime
    evidence_url: Optional[str]
    status: str

    class Config:
        from_attributes = True


class AnalyticsOut(BaseModel):
    total_zones: int
    total_slots: int
    occupied_slots: int
    occupancy_rate: float
    revenue_today: float
    active_bookings: int
