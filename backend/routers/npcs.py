from fastapi import APIRouter, HTTPException
import uuid

# Import necessary components from app_setup
from ..app_setup import db, manager # manager might be needed if NPC updates trigger broadcasts

router = APIRouter()

@router.post("/npcs", tags=["NPCs"])
async def create_npc(master_id: str, npc_data: dict):
    # Check if the user is the master
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create NPCs")

    npc_id = f"npc-{uuid.uuid4()}"
    await db.create_npc(npc_id, master_id, npc_data)

    # Return all NPCs for the master, including the new one
    npcs = await db.get_npcs(master_id)
    # Optional: Broadcast NPC list update to the master via websocket
    return npcs

@router.get("/npcs/{master_id}", tags=["NPCs"])
async def get_npcs(master_id: str):
    # Check if the user is the master (or authorized)
    # For simplicity, we assume only the master can view their NPCs for now
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        # Changed to 404 as the user might not be the master, or doesn't exist
        raise HTTPException(status_code=404, detail="Master user not found or not authorized")

    return await db.get_npcs(master_id)

@router.put("/npcs/{npc_id}", tags=["NPCs"])
async def update_npc(npc_id: str, npc_data: dict):
    # Optional: Add validation to check if the requesting user is the master owner of the NPC
    await db.update_npc(npc_id, npc_data)
    # Optional: Broadcast NPC update to the master via websocket
    return {"success": True}

@router.delete("/npcs/{npc_id}", tags=["NPCs"])
async def delete_npc(npc_id: str):
    # Optional: Add validation to check if the requesting user is the master owner of the NPC
    await db.delete_npc(npc_id)
    # Optional: Broadcast NPC deletion to the master via websocket
    return {"success": True} 