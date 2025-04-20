from fastapi import APIRouter, HTTPException
from typing import Optional
import uuid

# Import necessary components from app_setup
from ..app_setup import db, manager

router = APIRouter()

@router.post("/shared-items", tags=["Shared Items"])
async def create_shared_item(master_id: str, item_data: dict):
    # Check if the user is the master
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create shared items")

    item_id = f"item-{uuid.uuid4()}"
    await db.create_shared_item(item_id, master_id, item_data)

    # Broadcast the update to all clients
    await manager.broadcast_shared_items()

    # Return the created item data (consider returning the full item from db)
    item_data["id"] = item_id
    return item_data

@router.get("/shared-items", tags=["Shared Items"])
async def get_shared_items(master_id: Optional[str] = None):
    # No specific authorization check here, items might be public
    # Filter by master_id if provided
    return await db.get_shared_items(master_id)

@router.put("/shared-items/{item_id}", tags=["Shared Items"])
async def update_shared_item(item_id: str, item_data: dict):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.update_shared_item(item_id, item_data)
    await manager.broadcast_shared_items()
    return {"success": True}

@router.delete("/shared-items/{item_id}", tags=["Shared Items"])
async def delete_shared_item(item_id: str):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.delete_shared_item(item_id)
    await manager.broadcast_shared_items()
    return {"success": True} 