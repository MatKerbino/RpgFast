import typing
from pydantic import BaseModel

if hasattr(typing.ForwardRef, "_evaluate"):
    original_evaluate = typing.ForwardRef._evaluate
    def patched_evaluate(self, globalns, localns, type_params, *, recursive_guard=None):
        if recursive_guard is None:
            recursive_guard = set()
        return original_evaluate(self, globalns, localns, type_params, recursive_guard=recursive_guard)
    typing.ForwardRef._evaluate = patched_evaluate

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Any
import json
import uuid
import asyncio
from datetime import datetime
import random
from .database import Database
import uvicorn

# Import the FastAPI app instance created in app_setup
from .app_setup import app

# Import routers
from .routers import auth, characters, npcs, shared_items, shared_abilities, master_notes

# Import WebSocket endpoint handler
from .websocket_handler import websocket_endpoint

# Add Pydantic model for login request body
class LoginRequest(BaseModel):
    nickname: str
    master_code: Optional[str] = None
    character_id: Optional[str] = None

def datetime_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError (f"Type {type(obj)} not serializable")

# Configuração CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique a origem exata
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Código mestre para DM
MASTER_CODE = "master123"

# Conexão com o banco de dados
db = Database()

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)
    
    async def broadcast_users(self):
        users = await db.get_users()
        await self.broadcast(json.dumps({"type": "users", "data": users}, default=datetime_serializer))
    
    async def broadcast_messages(self):
        messages = await db.get_messages()
        await self.broadcast(json.dumps({"type": "messages", "data": messages}, default=datetime_serializer))
    
    async def broadcast_shared_items(self):
        items = await db.get_shared_items()
        await self.broadcast(json.dumps({"type": "shared_items", "data": items}, default=datetime_serializer))
    
    async def broadcast_shared_abilities(self):
        abilities = await db.get_shared_abilities()
        await self.broadcast(json.dumps({"type": "shared_abilities", "data": abilities}, default=datetime_serializer))

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await db.close()

# Rotas da API
@app.post("/api/login")
async def login(request_data: LoginRequest = Body(...)):
    # Access data from the request_data model
    nickname = request_data.nickname
    master_code = request_data.master_code
    character_id = request_data.character_id

    if not nickname:
        return {"success": False, "error": "Nickname is required"}

    # Verificar se é um login de mestre
    is_master = master_code == MASTER_CODE

    if is_master:
        # Verificar se já existe um mestre
        users = await db.get_users()
        for user in users:
            if user.get("isMaster", True):
                return {"success": True, "user": user}

        # Criar novo usuário mestre
        user_id = str(uuid.uuid4())
        await db.create_user(user_id, nickname, is_master)

        # Obter o usuário criado
        user = await db.get_user(user_id)

        return {"user": user, "success": True}
    else:
        # Login de jogador com ID de personagem
        if not character_id or len(character_id) != 3:
            return {"success": False, "error": "Character ID must be 3 digits"}

        # Verificar se o personagem existe
        existing_character = await db.get_character_by_id(character_id)

        if existing_character:
            # Personagem existe, atualizar nickname se necessário
            user_id = existing_character["userId"]
            await db.update_user_nickname(user_id, nickname)

            # Obter o usuário atualizado
            user = await db.get_user(user_id)

            return {"user": user, "success": True}
        else:
            return {"success": False, "error":"Jogador não encontrado."}

@app.get("/api/users")
async def get_users():
    return await db.get_users()

@app.get("/api/messages")
async def get_messages():
    return await db.get_messages()

@app.get("/api/character/{user_id}")
async def get_character(user_id: str):
    character = await db.get_character(user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@app.put("/api/character/{user_id}")
async def update_character(user_id: str, character: dict):
    # Verificar se o personagem existe
    existing_character = await db.get_character(user_id)
    if not existing_character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Atualizar atributos
    if "attributes" in character:
        await db.update_character_attributes(user_id, character["attributes"])
    
    # Atualizar perícias
    if "skills" in character:
        await db.update_character_skills(user_id, character["skills"])
    
    # Atualizar habilidades
    if "abilities" in character:
        await db.update_character_abilities(user_id, character["abilities"])
    
    # Atualizar inventário
    if "inventory" in character:
        await db.update_character_inventory(user_id, character["inventory"])
    
    # Atualizar moedas
    if "currency" in character:
        await db.update_character_currency(user_id, character["currency"])
    
    # Retornar o personagem atualizado
    return await db.get_character(user_id)

@app.put("/api/character/{user_id}/health")
async def update_health(user_id: str, health_points: int):
    # Verificar se o usuário existe
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Atualizar pontos de vida
    await db.update_user_health(user_id, health_points)
    
    # Atualizar lista de usuários para todos
    await manager.broadcast_users()
    
    return {"success": True}

@app.post("/api/npcs")
async def create_npc(master_id: str, npc_data: dict):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create NPCs")
    
    # Criar NPC
    npc_id = f"npc-{uuid.uuid4()}"
    await db.create_npc(npc_id, master_id, npc_data)
    
    # Retornar NPCs do mestre
    return await db.get_npcs(master_id)

@app.get("/api/npcs/{master_id}")
async def get_npcs(master_id: str):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can view NPCs")
    
    # Retornar NPCs do mestre
    return await db.get_npcs(master_id)

@app.put("/api/npcs/{npc_id}")
async def update_npc(npc_id: str, npc_data: dict):
    # Atualizar NPC
    await db.update_npc(npc_id, npc_data)
    
    return {"success": True}

@app.delete("/api/npcs/{npc_id}")
async def delete_npc(npc_id: str):
    # Excluir NPC
    await db.delete_npc(npc_id)
    
    return {"success": True}

@app.post("/api/shared-items")
async def create_shared_item(master_id: str, item_data: dict):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create shared items")
    
    # Criar item compartilhado
    item_id = f"item-{uuid.uuid4()}"
    await db.create_shared_item(item_id, master_id, item_data)
    
    # Atualizar itens compartilhados para todos
    await manager.broadcast_shared_items()
    
    # Retornar o item criado
    item_data["id"] = item_id
    return item_data

@app.get("/api/shared-items")
async def get_shared_items(master_id: Optional[str] = None):
    return await db.get_shared_items(master_id)

@app.put("/api/shared-items/{item_id}")
async def update_shared_item(item_id: str, item_data: dict):
    # Atualizar item compartilhado
    await db.update_shared_item(item_id, item_data)
    
    # Atualizar itens compartilhados para todos
    await manager.broadcast_shared_items()
    
    return {"success": True}

@app.delete("/api/shared-items/{item_id}")
async def delete_shared_item(item_id: str):
    # Excluir item compartilhado
    await db.delete_shared_item(item_id)
    
    # Atualizar itens compartilhados para todos
    await manager.broadcast_shared_items()
    
    return {"success": True}

@app.post("/api/shared-abilities")
async def create_shared_ability(master_id: str, ability_data: dict):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create shared abilities")
    
    # Criar habilidade compartilhada
    ability_id = f"ability-{uuid.uuid4()}"
    await db.create_shared_ability(ability_id, master_id, ability_data)
    
    # Atualizar habilidades compartilhadas para todos
    await manager.broadcast_shared_abilities()
    
    # Retornar a habilidade criada
    ability_data["id"] = ability_id
    return ability_data

@app.get("/api/shared-abilities")
async def get_shared_abilities(master_id: Optional[str] = None):
    return await db.get_shared_abilities(master_id)

@app.put("/api/shared-abilities/{ability_id}")
async def update_shared_ability(ability_id: str, ability_data: dict):
    # Atualizar habilidade compartilhada
    await db.update_shared_ability(ability_id, ability_data)
    
    # Atualizar habilidades compartilhadas para todos
    await manager.broadcast_shared_abilities()
    
    return {"success": True}

@app.delete("/api/shared-abilities/{ability_id}")
async def delete_shared_ability(ability_id: str):
    # Excluir habilidade compartilhada
    await db.delete_shared_ability(ability_id)
    
    # Atualizar habilidades compartilhadas para todos
    await manager.broadcast_shared_abilities()
    
    return {"success": True}

@app.post("/api/master-notes")
async def create_master_note(master_id: str, note_data: dict):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can create notes")
    
    # Criar nota
    note_id = f"note-{uuid.uuid4()}"
    await db.create_master_note(note_id, master_id, note_data)
    
    # Retornar a nota criada
    note_data["id"] = note_id
    return note_data

@app.get("/api/master-notes/{master_id}")
async def get_master_notes(master_id: str):
    # Verificar se o usuário é mestre
    user = await db.get_user(master_id)
    if not user or not user.get("isMaster"):
        raise HTTPException(status_code=403, detail="Only masters can view notes")
    
    # Retornar notas do mestre
    return await db.get_master_notes(master_id)

@app.put("/api/master-notes/{note_id}")
async def update_master_note(note_id: str, note_data: dict):
    # Atualizar nota
    await db.update_master_note(note_id, note_data)
    
    return {"success": True}

@app.delete("/api/master-notes/{note_id}")
async def delete_master_note(note_id: str):
    # Excluir nota
    await db.delete_master_note(note_id)
    
    return {"success": True}

@app.post("/api/character/{user_id}/items")
async def add_item_to_character(user_id: str, item_data: dict):
    # Adicionar item ao personagem
    await db.add_item_to_character(user_id, item_data)
    
    return {"success": True}

@app.post("/api/character/{user_id}/abilities")
async def add_ability_to_character(user_id: str, ability_data: dict):
    # Adicionar habilidade ao personagem
    await db.add_ability_to_character(user_id, ability_data)
    
    return {"success": True}

# --- Include Routers --- 
# The prefix ensures all routes from a router start with /api
app.include_router(auth.router, prefix="/api")
app.include_router(characters.router, prefix="/api")
app.include_router(npcs.router, prefix="/api")
app.include_router(shared_items.router, prefix="/api")
app.include_router(shared_abilities.router, prefix="/api")
app.include_router(master_notes.router, prefix="/api")

# --- Define WebSocket Route --- 
# This uses the handler function imported from websocket_handler.py
@app.websocket("/ws/{user_id}")
async def ws_endpoint(websocket: WebSocket, user_id: str):
    await websocket_endpoint(websocket, user_id)

# --- Optional Root Endpoint --- 
@app.get("/")
async def read_root():
    return {"message": "Welcome to the RpgFast API"}

# --- Run with Uvicorn --- 
# This block allows running the app directly using `python -m backend.main` 
# or letting uvicorn find it (e.g., `uvicorn backend.main:app`)
if __name__ == "__main__":
    # Use reload=True for development; remove or set to False for production
    # Important: Use the module path string "backend.main:app" for uvicorn.run
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
