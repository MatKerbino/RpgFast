from fastapi import WebSocket
from typing import Dict
import json
from datetime import datetime

# Import db instance (assuming it will be available from app_setup)
# We will adjust imports later if needed
# from .app_setup import db

class ConnectionManager:
    def __init__(self):
        # Import db here to avoid circular dependency if db needs manager
        from .app_setup import db
        self.db = db
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            # Optional: Update user status or perform cleanup in DB if needed

    async def send_personal_message(self, message: str, user_id: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except Exception as e:
                print(f"Error sending personal message to {user_id}: {e}")
                # Consider disconnecting if send fails consistently
                # await self.disconnect(user_id)

    async def broadcast(self, message: str):
        # Broadcast genérico - usar com cuidado se a mensagem contiver dados sensíveis
        user_ids = list(self.active_connections.keys())
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

    # --- Broadcasts Específicos com Serialização e Filtragem ---

    async def broadcast_users(self):
        """Envia a lista de usuários atualizada para cada cliente conectado,
           filtrando o characterId se necessário."""
        from .app_setup import datetime_serializer # Importar serializer
        import logging # Importar logging
        logger = logging.getLogger(__name__)

        try:
            raw_users = await self.db.get_users()
            connected_user_ids = list(self.active_connections.keys()) # Copiar chaves
            logger.debug(f"Broadcasting users update to {len(connected_user_ids)} clients.")

            # Cache master status to avoid multiple DB calls per user
            recipient_statuses = {}
            for uid in connected_user_ids:
                recipient_user = await self.db.get_user(uid)
                if recipient_user:
                    recipient_statuses[uid] = recipient_user.get("isMaster", False)
                else:
                    logger.warning(f"Recipient user {uid} not found in DB during broadcast_users.")

            for user_id, websocket in self.active_connections.items():
                is_recipient_master = recipient_statuses.get(user_id, False)
                users_for_client = []

                for user_data in raw_users:
                    if not isinstance(user_data, dict):
                         logger.warning(f"Skipping non-dict user_data item: {type(user_data)}")
                         continue
                    user_copy = user_data.copy()

                    # Ocultar ID de outros personagens se o destinatário não for mestre
                    if not is_recipient_master and user_copy.get('id') != user_id:
                        user_copy.pop('characterId', None)

                    # Garantir que createdAt seja serializável
                    if 'createdAt' in user_copy and isinstance(user_copy['createdAt'], datetime):
                         user_copy['createdAt'] = user_copy['createdAt'].isoformat()
                    # Pop non-serializable fields if needed (like raw datetime)
                    user_copy.pop('created_at', None) # Remove if already serialized or problematic

                    users_for_client.append(user_copy)

                message = json.dumps({"type": "users", "data": users_for_client}, default=datetime_serializer)
                await self.send_personal_message(message, user_id)

        except Exception as e:
            logger.error(f"Error during broadcast_users: {e}", exc_info=True)
            # Consider a general error broadcast or logging more details

    async def broadcast_messages(self):
        from .app_setup import datetime_serializer
        messages = await self.db.get_messages()
        await self.broadcast(json.dumps({"type": "messages", "data": messages}, default=datetime_serializer))

    async def broadcast_shared_items(self):
        from .app_setup import datetime_serializer
        items = await self.db.get_shared_items()
        await self.broadcast(json.dumps({"type": "shared_items", "data": items}, default=datetime_serializer))

    async def broadcast_shared_abilities(self):
        from .app_setup import datetime_serializer
        abilities = await self.db.get_shared_abilities()
        await self.broadcast(json.dumps({"type": "shared_abilities", "data": abilities}, default=datetime_serializer))

    async def broadcast_npcs(self, master_id: str):
        """Envia a lista atualizada de NPCs especificamente para o mestre conectado."""
        from .app_setup import datetime_serializer # Importar serializer
        import logging
        logger = logging.getLogger(__name__)

        websocket = self.active_connections.get(master_id)
        if not websocket:
            logger.warning(f"Attempted to broadcast NPCs to disconnected master: {master_id}")
            return

        try:
            npcs_list = await self.db.get_npcs(master_id)
            # Ensure createdAt is serialized if present in npc data
            serialized_npcs = []
            for npc in npcs_list:
                npc_copy = npc.copy()
                if 'createdAt' in npc_copy and isinstance(npc_copy['createdAt'], datetime):
                     npc_copy['createdAt'] = npc_copy['createdAt'].isoformat()
                # Remove original potentially non-serializable field if necessary
                npc_copy.pop('created_at', None)
                serialized_npcs.append(npc_copy)

            message = json.dumps({"type": "npcs", "data": serialized_npcs}, default=datetime_serializer)
            await self.send_personal_message(message, master_id)
            logger.debug(f"Sent NPC update to master {master_id}")
        except Exception as e:
            logger.error(f"Error broadcasting NPCs to master {master_id}: {e}", exc_info=True) 