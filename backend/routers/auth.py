from fastapi import APIRouter, HTTPException
from typing import Optional
import uuid
import logging # Import logging

# Import necessary components from app_setup
from ..app_setup import db, MASTER_CODE

router = APIRouter()
logger = logging.getLogger(__name__) # Setup logger

@router.post("/login", tags=["Authentication"])
async def login(nickname: str, master_code: Optional[str] = None, character_id: Optional[str] = None):
    logger.info(f"Login attempt: nickname={nickname}, master_code={'***' if master_code else None}, character_id={character_id}")
    if not nickname:
        logger.warning("Login failed: Nickname is required.")
        raise HTTPException(status_code=400, detail="Nickname is required")

    is_master = master_code == MASTER_CODE

    if is_master:
        logger.info("Master login attempt detected.")
        users = await db.get_users()
        existing_master = next((u for u in users if u.get("isMaster")), None)

        if existing_master:
            logger.info(f"Existing master found: {existing_master['id']}. Allowing re-login.")
            user = await db.get_user(existing_master['id'])
            if not user:
                 logger.error(f"Failed to fetch existing master user: {existing_master['id']}")
                 raise HTTPException(status_code=404, detail="Failed to fetch existing master user")
            logger.info(f"Returning success for existing master: {user['id']}")
            return {"user": user, "success": True}
        else:
            logger.info("No existing master found. Creating a new one.")
            user_id = str(uuid.uuid4())
            await db.create_user(user_id, nickname, is_master)
            user = await db.get_user(user_id)
            if not user:
                 logger.error(f"Failed to create or fetch new master user: {user_id}")
                 raise HTTPException(status_code=500, detail="Failed to create master user")
            logger.info(f"Returning success for new master: {user['id']}")
            return {"user": user, "success": True}
    else:
        logger.info("Player login attempt detected.")
        if not character_id or len(character_id) != 3 or not character_id.isdigit():
             logger.warning(f"Login failed: Invalid character_id: {character_id}")
             raise HTTPException(status_code=400, detail="Character ID must be 3 digits")

        existing_character_user = await db.get_character_by_id(character_id)

        if existing_character_user:
            user_id = existing_character_user["userId"]
            logger.info(f"Existing player character found: user_id={user_id}, char_id={character_id}")
            current_user = await db.get_user(user_id)
            if current_user and current_user['nickname'] != nickname:
                 logger.info(f"Updating nickname for user {user_id} to {nickname}")
                 await db.update_user_nickname(user_id, nickname)
            user = await db.get_user(user_id) # Re-fetch potentially updated user data
            if not user:
                logger.error(f"Failed to fetch existing player user: {user_id}")
                raise HTTPException(status_code=404, detail="Failed to fetch existing user")
            logger.info(f"Returning success for existing player: {user['id']}")
            return {"user": user, "success": True}
        else:
            logger.info(f"No existing character found for ID {character_id}. Creating new player character.")
            user_id = str(uuid.uuid4())
            await db.create_user(user_id, nickname, False, character_id)
            user = await db.get_user(user_id)
            if not user:
                logger.error(f"Failed to create or fetch new player user: {user_id}")
                raise HTTPException(status_code=500, detail="Failed to create new character user")
            logger.info(f"Returning success for new player: {user['id']}")
            return {"user": user, "success": True} 