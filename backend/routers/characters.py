from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any
import random
import string
import uuid

# Import necessary components from app_setup
from ..app_setup import db, manager

router = APIRouter()

# --- Função auxiliar para gerar ID único ---
async def generate_unique_character_id():
    """Gera um ID de personagem de 3 dígitos único."""
    while True:
        # Gera um ID de 3 dígitos (000-999)
        char_id = "".join(random.choices(string.digits, k=3))
        existing = await db.get_character_by_id(char_id)
        if not existing:
            return char_id

@router.post("/master/characters", tags=["Master Actions", "Users & Characters"])
async def master_create_character(master_id: str = Body(...), nickname: str = Body(...), character_id: str = Body(...)):
    """Endpoint para o mestre criar um novo personagem jogador."""
    # 1. Verificar se quem requisita é o mestre
    master_user = await db.get_user(master_id)
    if not master_user or not master_user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only the master can create characters this way.")

    if not nickname:
        raise HTTPException(status_code=400, detail="Nickname is required for the new character.")

    # 3. Criar o novo usuário/personagem
    new_user_id = str(uuid.uuid4())
    await db.create_user(new_user_id, nickname, is_master=False, character_id=character_id)

    # 4. Buscar os dados do usuário recém-criado
    new_user_data = await db.get_user(new_user_id)
    if not new_user_data:
        raise HTTPException(status_code=500, detail="Failed to retrieve newly created character.")

    # 5. Broadcast da lista de usuários atualizada (será filtrado no manager)
    await manager.broadcast_users()

    # 6. Retornar os dados do novo personagem
    # Incluindo o character_id aqui, pois a resposta é para o mestre
    return {"user": new_user_data, "success": True}

@router.delete("/master/characters/{character_id}", tags=["Master Actions", "Users & Characters"])
async def master_delete_character(character_id: str):
    """Endpoint para o mestre deletar um personagem jogador."""
    
    # Encontrar o usuário pelo character_id
    target_user_data = await db.get_character_by_id(character_id)
    if not target_user_data:
        raise HTTPException(status_code=404, detail=f"Character with ID {character_id} not found.")

    # Obter o user_id do personagem a ser deletado
    user_id_to_delete = target_user_data.get("userId")
    if not user_id_to_delete:
         raise HTTPException(status_code=500, detail=f"Could not determine user ID for character {character_id}.")

    # Deletar o usuário (assumindo que a função delete_user existe no db)
    deleted = await db.delete_user(user_id_to_delete)
    if not deleted:
        # Pode acontecer se o usuário foi deletado entre a verificação e a exclusão,
        # ou se houve um erro na exclusão.
        raise HTTPException(status_code=500, detail=f"Failed to delete user {user_id_to_delete}.")

    # Broadcast da lista de usuários atualizada
    await manager.broadcast_users()

    # Retornar sucesso
    return {"success": True}

@router.get("/users", tags=["Users & Characters"])
async def get_users():
    return await db.get_users()

@router.get("/character/{user_id}", tags=["Users & Characters"])
async def get_character(user_id: str):
    character = await db.get_character(user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@router.put("/character/{user_id}", tags=["Users & Characters"])
async def update_character(user_id: str, character: dict):
    existing_character = await db.get_character(user_id)
    if not existing_character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Use specific update functions from db for clarity/atomicity if available
    # Otherwise, update selectively as before
    if "attributes" in character:
        await db.update_character_attributes(user_id, character["attributes"])
    if "skills" in character:
        await db.update_character_skills(user_id, character["skills"])
    if "abilities" in character:
        await db.update_character_abilities(user_id, character["abilities"])
    if "inventory" in character:
        await db.update_character_inventory(user_id, character["inventory"])
    if "currency" in character:
        await db.update_character_currency(user_id, character["currency"])

    updated_character = await db.get_character(user_id)
    # Optional: Broadcast character update via websocket if needed
    return updated_character

@router.put("/character/{user_id}/health", tags=["Users & Characters"])
async def update_health(user_id: str, health_points: int):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.update_user_health(user_id, health_points)
    await manager.broadcast_users()  # Notify all clients about the change
    return {"success": True}

@router.post("/character/{user_id}/items", tags=["Users & Characters"])
async def add_item_to_character(user_id: str, item_data: dict):
    # Optional: Check if user exists
    await db.add_item_to_character(user_id, item_data)
    # Optional: Notify specific user via websocket about inventory change
    return {"success": True}

@router.post("/character/{user_id}/abilities", tags=["Users & Characters"])
async def add_ability_to_character(user_id: str, ability_data: dict):
    # Optional: Check if user exists
    await db.add_ability_to_character(user_id, ability_data)
    # Optional: Notify specific user via websocket about ability change
    return {"success": True} 