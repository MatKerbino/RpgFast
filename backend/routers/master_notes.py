from fastapi import APIRouter, HTTPException
import uuid

# Import necessary components from app_setup
from ..app_setup import db

router = APIRouter()

@router.post("/master-notes", tags=["Master Notes"])
async def create_master_note(master_id: str, note_data: dict):
    # Check if the user is the master
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create notes")

    note_id = f"note-{uuid.uuid4()}"
    await db.create_master_note(note_id, master_id, note_data)

    # Return the created note data
    note_data["id"] = note_id
    return note_data

@router.get("/master-notes/{master_id}", tags=["Master Notes"])
async def get_master_notes(master_id: str):
    # Check if the user is the master
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can view notes")

    return await db.get_master_notes(master_id)

@router.put("/master-notes/{note_id}", tags=["Master Notes"])
async def update_master_note(note_id: str, note_data: dict):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.update_master_note(note_id, note_data)
    return {"success": True}

@router.delete("/master-notes/{note_id}", tags=["Master Notes"])
async def delete_master_note(note_id: str):
    # Optional: Add validation to check if the requesting user is the master owner
    await db.delete_master_note(note_id)
    return {"success": True} 