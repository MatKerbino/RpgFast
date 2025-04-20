from fastapi import WebSocket, WebSocketDisconnect
import json
import uuid
import random
import logging

# Import necessary components from app_setup
from .app_setup import db, manager, datetime_serializer

logger = logging.getLogger(__name__)

async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)

    try:
        # Send initial data to the client
        user = await db.get_user(user_id)
        if not user:
            # If user doesn't exist (e.g., invalid ID), close connection
            await websocket.close(code=1000)
            await manager.disconnect(user_id) # Ensure manager knows
            return

        # Send initial state
        users = await db.get_users()
        await websocket.send_text(json.dumps({"type": "users", "data": users}, default=datetime_serializer))

        messages = await db.get_messages()
        await websocket.send_text(json.dumps({"type": "messages", "data": messages}, default=datetime_serializer))

        character = await db.get_character(user_id)
        if character:
            await websocket.send_text(json.dumps({"type": "character", "data": character}, default=datetime_serializer))

        shared_items = await db.get_shared_items()
        await websocket.send_text(json.dumps({"type": "shared_items", "data": shared_items}, default=datetime_serializer))

        shared_abilities = await db.get_shared_abilities()
        await websocket.send_text(json.dumps({"type": "shared_abilities", "data": shared_abilities}, default=datetime_serializer))

        if user.get("isMaster"):
            npcs = await db.get_npcs(user_id)
            await websocket.send_text(json.dumps({"type": "npcs", "data": npcs}, default=datetime_serializer))

        # Process messages from the client
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data) # Use json.loads as per previous changes

            # --- Message Handling Logic --- START ---
            message_type = message_data.get("type")
            current_user = await db.get_user(user_id) # Re-fetch user in case of role change?
            if not current_user:
                break # Should not happen if initial check passed, but safety first

            if message_type == "message":
                message_id = str(uuid.uuid4())
                content = message_data.get("content", "")
                await db.create_message(message_id, user_id, current_user["nickname"], content)
                await manager.broadcast_messages()

            elif message_type == "dice_roll":
                dice_type = message_data.get("diceType", "d20")
                character_id = message_data.get("characterId") # ID of character rolling (could be user or NPC)
                custom_value = message_data.get("customValue")

                max_value_map = {"d4": 4, "d6": 6, "d8": 8, "d10": 10, "d12": 12, "d20": 20}
                max_value = max_value_map.get(dice_type, 20) # Default d20
                if dice_type == "custom" and isinstance(custom_value, int) and custom_value > 0:
                    max_value = custom_value

                result = random.randint(1, max_value)

                roller_id = user_id
                roller_nickname = current_user["nickname"]

                # If the roll is for a different character (NPC or another player, initiated by master)
                if character_id and character_id != user_id and current_user.get("isMaster"):
                    target_char = await db.get_user(character_id) # Check if it's a player
                    if target_char:
                        roller_nickname = target_char["nickname"]
                        roller_id = character_id
                    else:
                        npcs = await db.get_npcs(user_id) # Check if it's an NPC belonging to the master
                        npc_found = next((npc for npc in npcs if npc["id"] == character_id), None)
                        if npc_found:
                            roller_nickname = npc_found["nickname"]
                            # roller_id remains the master's user_id for NPC rolls? Or use npc_id?
                            # Decide how to store/attribute NPC rolls. Storing with master_id for now.
                            roller_id = user_id # Or character_id if NPCs should have own dice history

                await db.add_dice_result(roller_id, result) # Add to roller's history

                message_id = str(uuid.uuid4())
                content = f"{roller_nickname} rolou {dice_type}: {result}"
                await db.create_message(message_id, user_id, roller_nickname, content, True, dice_type, result)

                await manager.broadcast_messages()
                await manager.broadcast_users() # Update dice history display

            elif message_type == "update_character" and isinstance(message_data.get("data"), dict):
                # Allow users to update their own character via websocket
                character_data = message_data["data"]
                logger.info(f"WebSocket: Updating character {user_id}")

                # Call specific update functions based on received data
                try:
                    if "attributes" in character_data:
                        await db.update_character_attributes(user_id, character_data["attributes"])
                    if "skills" in character_data:
                        await db.update_character_skills(user_id, character_data["skills"])
                    if "abilities" in character_data:
                        await db.update_character_abilities(user_id, character_data["abilities"])
                    if "inventory" in character_data:
                        await db.update_character_inventory(user_id, character_data["inventory"])
                    if "currency" in character_data:
                        await db.update_character_currency(user_id, character_data["currency"])

                    # Send updated character back to the specific client
                    updated_character = await db.get_character(user_id)
                    if updated_character:
                        await websocket.send_text(json.dumps({"type": "character", "data": updated_character}, default=datetime_serializer))
                    else:
                         logger.warning(f"WebSocket: Character {user_id} not found after update attempt.")
                except Exception as e:
                    logger.error(f"WebSocket: Error updating character {user_id}: {e}", exc_info=True)
                    # Optionally send an error message back to the client
                    # await websocket.send_text(json.dumps({"type": "error", "message": "Failed to update character data."}))

            elif message_type == "update_health" and current_user.get("isMaster"):
                target_id = message_data.get("userId")
                health_points = message_data.get("healthPoints")
                if target_id is not None and isinstance(health_points, int):
                    await db.update_user_health(target_id, health_points)
                    await manager.broadcast_users()

            # --- Master-only actions --- START ---
            elif current_user.get("isMaster"):
                if message_type == "add_shared_item" and message_data.get("item"):
                    item_data = message_data["item"]
                    item_id = item_data.get("id", f"item-{uuid.uuid4()}") # Allow frontend generated ID or create new
                    await db.create_shared_item(item_id, user_id, item_data)
                    await manager.broadcast_shared_items()

                elif message_type == "update_shared_item" and message_data.get("item"):
                    item_data = message_data["item"]
                    item_id = item_data.get("id")
                    if item_id:
                        await db.update_shared_item(item_id, item_data)
                        await manager.broadcast_shared_items()

                elif message_type == "delete_shared_item" and message_data.get("itemId"):
                    item_id = message_data["itemId"]
                    await db.delete_shared_item(item_id)
                    await manager.broadcast_shared_items()

                elif message_type == "add_shared_ability" and message_data.get("ability"):
                    ability_data = message_data["ability"]
                    ability_id = ability_data.get("id", f"ability-{uuid.uuid4()}")
                    await db.create_shared_ability(ability_id, user_id, ability_data)
                    await manager.broadcast_shared_abilities()

                elif message_type == "update_shared_ability" and message_data.get("ability"):
                    ability_data = message_data["ability"]
                    ability_id = ability_data.get("id")
                    if ability_id:
                        await db.update_shared_ability(ability_id, ability_data)
                        await manager.broadcast_shared_abilities()

                elif message_type == "delete_shared_ability" and message_data.get("abilityId"):
                    ability_id = message_data["abilityId"]
                    await db.delete_shared_ability(ability_id)
                    await manager.broadcast_shared_abilities()

                elif message_type == "add_item_to_character" and message_data.get("userId") and message_data.get("item"):
                    target_id = message_data["userId"]
                    item_data = message_data["item"]
                    await db.add_item_to_character(target_id, item_data)
                    # Notify target client
                    target_character = await db.get_character(target_id)
                    if target_character:
                        await manager.send_personal_message(
                            json.dumps({"type": "character", "data": target_character}, default=datetime_serializer),
                            target_id
                        )

                elif message_type == "add_ability_to_character" and message_data.get("userId") and message_data.get("ability"):
                    target_id = message_data["userId"]
                    ability_data = message_data["ability"]
                    await db.add_ability_to_character(target_id, ability_data)
                    # Notify target client
                    target_character = await db.get_character(target_id)
                    if target_character:
                        await manager.send_personal_message(
                            json.dumps({"type": "character", "data": target_character}, default=datetime_serializer),
                            target_id
                        )
            # --- Master-only actions --- END ---
            # --- Message Handling Logic --- END ---

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user: {user_id}")
        await manager.disconnect(user_id)
        await manager.broadcast_users() # Notify others about the disconnection

    except Exception as e:
        # Log the error for debugging
        print(f"WebSocket error for user {user_id}: {e}")
        # Attempt to close the connection gracefully
        try:
            await websocket.close(code=1011) # Internal Error
        except Exception as close_e:
            print(f"Error closing websocket for user {user_id}: {close_e}")
        # Ensure manager knows the connection is gone
        await manager.disconnect(user_id)
        await manager.broadcast_users() # Notify others 