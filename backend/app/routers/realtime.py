from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws_manager import manager

router = APIRouter(tags=["realtime"])


@router.websocket("/ws/parking")
async def parking_websocket(websocket: WebSocket):
    """
    Frontend connects here once. Every reservation, cancellation, AI event,
    or violation broadcasts a JSON message like:
      {"type": "slot_update", "zone_id": "...", "slot_id": "...", "status": "occupied"}
      {"type": "violation_alert", "violation_id": "...", "location": "..."}
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive; client doesn't need to send anything meaningful
    except WebSocketDisconnect:
        manager.disconnect(websocket)
