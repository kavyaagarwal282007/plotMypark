from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, parking, booking, ai, admin, realtime

# Creates tables if they don't exist. For real migrations, use Alembic instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Street Parking API",
    description="Backend for real-time smart street parking management (SIH)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend's domain before final submission
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(booking.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(realtime.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "smart-street-parking-backend"}


@app.get("/health")
def health():
    return {"status": "healthy"}
