from fastapi import APIRouter, HTTPException
from typing import Optional
import uuid

# Import necessary components from app_setup
from ..app_setup import db, manager

router = APIRouter()

@router.post("/shared-abilities", tags=["Shared Abilities"])
async def create_shared_ability(master_id: str, ability_data: dict):
    # Check if the user is the master
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create shared abilities")

    ability_id = f"ability-{uuid.uuid4()}"
    await db.create_shared_ability(ability_id, master_id, ability_data)

    # Broadcast the update to all clients
    await manager.broadcast_shared_abilities()

    # Return the created ability data (consider returning the full item from db)
    ability_data["id"] = ability_id
    return ability_data

@router.get("/shared-abilities", tags=["Shared Abilities"])
async def get_shared_abilities(master_id: Optional[str] = None):
    # No specific authorization check here, abilities might be public
    # Filter by master_id if provided
    return await db.get_shared_abilities(master_id)

@router.put("/shared-abilities/{ability_id}", tags=["Shared Abilities"])
async def update_shared_ability(ability_id: str, ability_data: dict):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.update_shared_ability(ability_id, ability_data)
    await manager.broadcast_shared_abilities()
    return {"success": True}

@router.delete("/shared-abilities/{ability_id}", tags=["Shared Abilities"])
async def delete_shared_ability(ability_id: str):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.delete_shared_ability(ability_id)
    await manager.broadcast_shared_abilities()
    return {"success": True} 