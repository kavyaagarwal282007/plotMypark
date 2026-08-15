"""
Smart Parking Recommendation + Dynamic Pricing engine.

This is the differentiator feature: instead of just returning "nearest
parking", we score each zone using distance, availability, and traffic,
and also compute a live demand-based price.

Swap the traffic_level source with a real traffic API (e.g. Google Roads /
TomTom) or your AI team's congestion output later. For the prototype it
defaults to "medium" if no live source is wired in yet.
"""
from datetime import datetime
from typing import Literal

TrafficLevel = Literal["low", "medium", "high"]

# Weights for the recommendation score — tune these during testing.
W_AVAILABILITY = 0.5
W_DISTANCE = 0.3
W_TRAFFIC = 0.2

TRAFFIC_PENALTY = {"low": 0.0, "medium": 0.5, "high": 1.0}

# Pricing tuning
PRICE_ALPHA = 0.8          # sensitivity of price to occupancy
PEAK_HOURS = [(8, 11), (17, 20)]  # (start_hour, end_hour) 24h format
PEAK_MULTIPLIER = 1.4
NORMAL_MULTIPLIER = 1.0


def compute_score(distance_meters: float, availability_rate: float, traffic_level: TrafficLevel) -> float:
    """
    Higher score = better recommendation.
    availability_rate: 0.0 - 1.0 (free_slots / total_slots)
    distance_meters: normalized against a soft cap of 1000m for scoring
    """
    distance_score = max(0.0, 1 - min(distance_meters, 1000) / 1000)
    traffic_score = 1 - TRAFFIC_PENALTY[traffic_level]

    score = (
        W_AVAILABILITY * availability_rate
        + W_DISTANCE * distance_score
        + W_TRAFFIC * traffic_score
    )
    return round(score, 3)


def score_to_label(score: float) -> str:
    if score >= 0.7:
        return "recommended"   # ✅
    elif score >= 0.45:
        return "ok"            # ⚠️
    return "avoid"             # ❌


def time_multiplier(now: datetime = None) -> float:
    now = now or datetime.now()
    hour = now.hour
    for start, end in PEAK_HOURS:
        if start <= hour < end:
            return PEAK_MULTIPLIER
    return NORMAL_MULTIPLIER


def compute_dynamic_price(base_price: float, occupied: int, total: int, now: datetime = None) -> float:
    """
    price = base_price * (1 + alpha * occupancy_rate) * time_multiplier
    """
    if total <= 0:
        return round(base_price, 2)
    occupancy_rate = occupied / total
    price = base_price * (1 + PRICE_ALPHA * occupancy_rate) * time_multiplier(now)
    return round(price, 2)
