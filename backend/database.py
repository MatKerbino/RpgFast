import os
import asyncpg
from dotenv import load_dotenv
from pathlib import Path

# Explicitly define the path to the .env file relative to this file's directory
env_path = Path(__file__).resolve().parent / '.env'
print(f"--- Looking for .env file at: {env_path} ---")
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"--- Attempting to use DATABASE_URL: {DATABASE_URL} ---")

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(DATABASE_URL)
        await self.create_tables()

    async def close(self):
        if self.pool:
            await self.pool.close()

    async def create_tables(self):
        async with self.pool.acquire() as conn:
            # Tabela de usuários
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    nickname TEXT NOT NULL,
                    is_master BOOLEAN NOT NULL DEFAULT FALSE,
                    character_id TEXT UNIQUE,
                    master_code TEXT,
                    health_points INTEGER NOT NULL DEFAULT 10,
                    max_health_points INTEGER NOT NULL DEFAULT 10,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de mensagens
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    nickname TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    is_dice_roll BOOLEAN DEFAULT FALSE,
                    dice_type TEXT,
                    dice_result INTEGER
                )
            ''')

            # Tabela de resultados de dados
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS dice_results (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    result INTEGER NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de atributos
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS attributes (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    strength INTEGER NOT NULL DEFAULT 10,
                    dexterity INTEGER NOT NULL DEFAULT 10,
                    constitution INTEGER NOT NULL DEFAULT 10,
                    intelligence INTEGER NOT NULL DEFAULT 10,
                    wisdom INTEGER NOT NULL DEFAULT 10,
                    charisma INTEGER NOT NULL DEFAULT 10
                )
            ''')

            # Tabela de perícias
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS skills (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    value INTEGER NOT NULL DEFAULT 0,
                    proficient BOOLEAN NOT NULL DEFAULT FALSE
                )
            ''')

            # Tabela de habilidades
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS abilities (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT,
                    cost TEXT,
                    range TEXT,
                    duration TEXT,
                    effect TEXT,
                    is_public BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de inventário
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS inventory (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    type TEXT,
                    rarity TEXT,
                    value TEXT,
                    weight TEXT,
                    effect TEXT
                )
            ''')

            # Tabela de moedas
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS currency (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    bronze INTEGER NOT NULL DEFAULT 0,
                    silver INTEGER NOT NULL DEFAULT 0,
                    gold INTEGER NOT NULL DEFAULT 0
                )
            ''')

            # Tabela de NPCs
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS npcs (
                    id TEXT PRIMARY KEY,
                    master_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    nickname TEXT NOT NULL,
                    health_points INTEGER NOT NULL DEFAULT 10,
                    max_health_points INTEGER NOT NULL DEFAULT 10,
                    show_health_bar BOOLEAN NOT NULL DEFAULT TRUE,
                    health_bar_color TEXT DEFAULT 'green',
                    show_in_chat BOOLEAN NOT NULL DEFAULT FALSE,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de atributos de NPCs
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS npc_attributes (
                    id SERIAL PRIMARY KEY,
                    npc_id TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
                    strength INTEGER NOT NULL DEFAULT 10,
                    dexterity INTEGER NOT NULL DEFAULT 10,
                    constitution INTEGER NOT NULL DEFAULT 10,
                    intelligence INTEGER NOT NULL DEFAULT 10,
                    wisdom INTEGER NOT NULL DEFAULT 10,
                    charisma INTEGER NOT NULL DEFAULT 10
                )
            ''')

            # Tabela de perícias de NPCs
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS npc_skills (
                    id SERIAL PRIMARY KEY,
                    npc_id TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    value INTEGER NOT NULL DEFAULT 0,
                    proficient BOOLEAN NOT NULL DEFAULT FALSE
                )
            ''')

            # Tabela de habilidades de NPCs
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS npc_abilities (
                    id TEXT PRIMARY KEY,
                    npc_id TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL
                )
            ''')

            # Tabela de inventário de NPCs
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS npc_inventory (
                    id TEXT PRIMARY KEY,
                    npc_id TEXT NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1
                )
            ''')

            # Tabela de itens compartilhados
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS shared_items (
                    id TEXT PRIMARY KEY,
                    master_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT,
                    rarity TEXT,
                    value TEXT,
                    weight TEXT,
                    effect TEXT,
                    is_public BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de habilidades compartilhadas
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS shared_abilities (
                    id TEXT PRIMARY KEY,
                    master_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    type TEXT,
                    cost TEXT,
                    range TEXT,
                    duration TEXT,
                    effect TEXT,
                    is_public BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Tabela de notas do mestre
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS master_notes (
                    id TEXT PRIMARY KEY,
                    master_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            ''')

    # Métodos para usuários
    async def create_user(self, user_id, nickname, is_master, character_id=None, master_code=None):
        async with self.pool.acquire() as conn:
            # Use master_code only if the user is a master
            code_to_insert = master_code if is_master else None
            await conn.execute(
                'INSERT INTO users (id, nickname, is_master, character_id, master_code) VALUES ($1, $2, $3, $4, $5)',
                user_id, nickname, is_master, character_id, code_to_insert
            )
            
            # Criar atributos padrão
            await conn.execute(
                'INSERT INTO attributes (user_id) VALUES ($1)',
                user_id
            )
            
            # Criar moedas padrão
            await conn.execute(
                'INSERT INTO currency (user_id) VALUES ($1)',
                user_id
            )
            
            # Criar perícias padrão
            skills = [
                "Atletismo", "Acrobacia", "Furtividade", "Arcanismo",
                "História", "Natureza", "Percepção", "Persuasão"
            ]
            
            for skill in skills:
                await conn.execute(
                    'INSERT INTO skills (user_id, name) VALUES ($1, $2)',
                    user_id, skill
                )

    async def get_users(self):
        """Fetches all users and NPCs marked as 'showInChat=True'"""
        async with self.pool.acquire() as conn:
            # Fetch users
            users_query = 'SELECT * FROM users'
            users_records = await conn.fetch(users_query)

            # Fetch NPCs marked as visible
            npcs_query = 'SELECT * FROM npcs WHERE show_in_chat = TRUE'
            npcs_records = await conn.fetch(npcs_query)

            result = [] # Combined list

            # Process users
            for user in users_records:
                # Obter resultados de dados
                dice_results = await conn.fetch(
                    # Limit dice results fetched per user for performance
                    'SELECT result FROM dice_results WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 3',
                    user['id']
                )

                user_data = dict(user)
                user_data['diceResults'] = [r['result'] for r in dice_results]
                user_data['isMaster'] = user_data.pop('is_master', False)
                user_data['healthPoints'] = user_data.get('health_points', 10) # Use get to avoid popping non-existent keys sometimes
                user_data['maxHealthPoints'] = user_data.get('max_health_points', 10)
                user_data['characterId'] = user_data.pop('character_id', None)
                user_data['createdAt'] = user_data.pop('created_at')
                user_data['isNpc'] = False # Explicitly mark as not NPC

                result.append(user_data)

            # Process visible NPCs
            for npc in npcs_records:
                npc_data = dict(npc)
                npc_data['isNpc'] = True
                npc_data['isMaster'] = False # NPCs are not masters
                npc_data['healthPoints'] = npc_data.pop('health_points', 10)
                npc_data['maxHealthPoints'] = npc_data.pop('max_health_points', 10)
                npc_data['showHealthBar'] = npc_data.pop('show_health_bar', True)
                npc_data['healthBarColor'] = npc_data.pop('health_bar_color', 'green')
                npc_data['showInChat'] = npc_data.pop('show_in_chat', True) # Should be true here
                npc_data['masterId'] = npc_data.pop('master_id', None) # Keep masterId if needed frontend
                npc_data['diceResults'] = [] # NPCs don't have dice history in this structure
                # Add other fields if needed by CharacterCard, ensure consistency

                result.append(npc_data)

            return result

    async def get_user(self, user_id):
        async with self.pool.acquire() as conn:
            user = await conn.fetchrow('SELECT * FROM users WHERE id = $1', user_id)
            
            if not user:
                return None
                
            # Obter resultados de dados
            dice_results = await conn.fetch(
                'SELECT result FROM dice_results WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 3',
                user_id
            )
            
            user_data = dict(user)
            user_data['diceResults'] = [r['result'] for r in dice_results]
            user_data['isMaster'] = user_data.pop('is_master', False)
            user_data['healthPoints'] = user_data.pop('health_points', 10)
            user_data['maxHealthPoints'] = user_data.pop('max_health_points', 10)
            user_data['characterId'] = user_data.pop('character_id', None)
            user_data['createdAt'] = user_data.pop('created_at')
            
            return user_data

    async def get_character_by_id(self, character_id):
        async with self.pool.acquire() as conn:
            user = await conn.fetchrow('SELECT * FROM users WHERE character_id = $1', character_id)
            
            if not user:
                return None
                
            # Obter o personagem
            character = await self.get_character(user['id'])
            
            return character

    async def update_user_nickname(self, user_id, nickname):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'UPDATE users SET nickname = $1 WHERE id = $2',
                nickname, user_id
            )

    async def update_user_health(self, user_id, health_points):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'UPDATE users SET health_points = $1 WHERE id = $2',
                health_points, user_id
            )

    async def update_user_max_health(self, user_id, max_health_points):
        """Atualiza os pontos de vida máximos de um usuário."""
        async with self.pool.acquire() as conn:
            await conn.execute(
                'UPDATE users SET max_health_points = $1 WHERE id = $2',
                max_health_points, user_id
            )

    # Métodos para mensagens
    async def create_message(self, message_id, user_id, nickname, content, is_dice_roll=False, dice_type=None, dice_result=None):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO messages (id, user_id, nickname, content, is_dice_roll, dice_type, dice_result) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                message_id, user_id, nickname, content, is_dice_roll, dice_type, dice_result
            )

    async def get_messages(self, limit=100):
        async with self.pool.acquire() as conn:
            messages = await conn.fetch(
                'SELECT * FROM messages ORDER BY timestamp ASC LIMIT $1',
                limit
            )
            
            result = []
            for message in messages:
                message_data = dict(message)
                message_data['userId'] = message_data.pop('user_id')
                message_data['isDiceRoll'] = message_data.pop('is_dice_roll')
                message_data['diceType'] = message_data.pop('dice_type')
                message_data['diceResult'] = message_data.pop('dice_result')
                result.append(message_data)
                
            return result

    # Métodos para resultados de dados
    async def add_dice_result(self, user_id, result):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO dice_results (user_id, result) VALUES ($1, $2)',
                user_id, result
            )

    # Métodos para personagens
    async def get_character(self, user_id):
        async with self.pool.acquire() as conn:
            # Obter atributos
            attributes_row = await conn.fetchrow(
                'SELECT * FROM attributes WHERE user_id = $1',
                user_id
            )
            
            if not attributes_row:
                return None
                
            attributes = {
                'strength': attributes_row['strength'],
                'dexterity': attributes_row['dexterity'],
                'constitution': attributes_row['constitution'],
                'intelligence': attributes_row['intelligence'],
                'wisdom': attributes_row['wisdom'],
                'charisma': attributes_row['charisma']
            }
            
            # Obter perícias
            skills_rows = await conn.fetch(
                'SELECT * FROM skills WHERE user_id = $1',
                user_id
            )
            
            skills = []
            for skill in skills_rows:
                skills.append({
                    'name': skill['name'],
                    'value': skill['value'],
                    'proficient': skill['proficient']
                })
            
            # Obter habilidades
            abilities_rows = await conn.fetch(
                'SELECT * FROM abilities WHERE user_id = $1',
                user_id
            )
            
            abilities = []
            for ability in abilities_rows:
                abilities.append({
                    'id': ability['id'],
                    'name': ability['name'],
                    'description': ability['description']
                })
            
            # Obter inventário
            inventory_rows = await conn.fetch(
                'SELECT * FROM inventory WHERE user_id = $1',
                user_id
            )
            
            inventory = []
            for item in inventory_rows:
                inventory.append({
                    'id': item['id'],
                    'name': item['name'],
                    'description': item['description'],
                    'quantity': item['quantity']
                })
            
            # Obter moedas
            currency_row = await conn.fetchrow(
                'SELECT * FROM currency WHERE user_id = $1',
                user_id
            )
            
            currency = {
                'bronze': currency_row['bronze'],
                'silver': currency_row['silver'],
                'gold': currency_row['gold']
            }
            
            # Obter ID do personagem
            user_row = await conn.fetchrow(
                'SELECT character_id FROM users WHERE id = $1',
                user_id
            )
            
            character_id = user_row['character_id'] if user_row else None
            
            return {
                'userId': user_id,
                'characterId': character_id,
                'attributes': attributes,
                'skills': skills,
                'abilities': abilities,
                'inventory': inventory,
                'currency': currency
            }

    async def update_character_attributes(self, user_id, attributes):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                UPDATE attributes 
                SET strength = $1, dexterity = $2, constitution = $3, 
                    intelligence = $4, wisdom = $5, charisma = $6
                WHERE user_id = $7
                ''',
                attributes['strength'], attributes['dexterity'], attributes['constitution'],
                attributes['intelligence'], attributes['wisdom'], attributes['charisma'],
                user_id
            )

    async def update_character_skills(self, user_id, skills):
        async with self.pool.acquire() as conn:
            # Primeiro, excluir todas as perícias existentes
            await conn.execute('DELETE FROM skills WHERE user_id = $1', user_id)
            
            # Depois, inserir as novas perícias
            for skill in skills:
                await conn.execute(
                    'INSERT INTO skills (user_id, name, value, proficient) VALUES ($1, $2, $3, $4)',
                    user_id, skill['name'], skill['value'], skill['proficient']
                )

    async def update_character_abilities(self, user_id, abilities):
        async with self.pool.acquire() as conn:
            # Primeiro, excluir todas as habilidades existentes
            await conn.execute('DELETE FROM abilities WHERE user_id = $1', user_id)
            
            # Depois, inserir as novas habilidades
            for ability in abilities:
                await conn.execute(
                    'INSERT INTO abilities (id, user_id, name, description) VALUES ($1, $2, $3, $4)',
                    ability['id'], user_id, ability['name'], ability['description']
                )

    async def update_character_inventory(self, user_id, inventory):
        async with self.pool.acquire() as conn:
            # Primeiro, excluir todos os itens existentes
            await conn.execute('DELETE FROM inventory WHERE user_id = $1', user_id)
            
            # Depois, inserir os novos itens
            for item in inventory:
                await conn.execute(
                    'INSERT INTO inventory (id, user_id, name, description, quantity) VALUES ($1, $2, $3, $4, $5)',
                    item['id'], user_id, item['name'], item['description'], item['quantity']
                )

    async def update_character_currency(self, user_id, currency):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'UPDATE currency SET bronze = $1, silver = $2, gold = $3 WHERE user_id = $4',
                currency['bronze'], currency['silver'], currency['gold'], user_id
            )

    # Métodos para NPCs
    async def create_npc(self, npc_id, master_id, npc_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                INSERT INTO npcs (
                    id, master_id, nickname, health_points, max_health_points, 
                    show_health_bar, health_bar_color, show_in_chat, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ''',
                npc_id, master_id, npc_data['nickname'], npc_data['healthPoints'], npc_data['maxHealthPoints'],
                npc_data.get('showHealthBar', True), npc_data.get('healthBarColor', 'green'), 
                npc_data.get('showInChat', False), npc_data.get('notes', '')
            )
            
            # Inserir atributos
            if 'attributes' in npc_data:
                attrs = npc_data['attributes']
                await conn.execute(
                    '''
                    INSERT INTO npc_attributes (
                        npc_id, strength, dexterity, constitution, intelligence, wisdom, charisma
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ''',
                    npc_id, attrs.get('strength', 10), attrs.get('dexterity', 10), attrs.get('constitution', 10),
                    attrs.get('intelligence', 10), attrs.get('wisdom', 10), attrs.get('charisma', 10)
                )
            
            # Inserir perícias
            if 'skills' in npc_data:
                for skill in npc_data['skills']:
                    await conn.execute(
                        'INSERT INTO npc_skills (npc_id, name, value, proficient) VALUES ($1, $2, $3, $4)',
                        npc_id, skill['name'], skill['value'], skill['proficient']
                    )
            
            # Inserir habilidades
            if 'abilities' in npc_data:
                for ability in npc_data['abilities']:
                    await conn.execute(
                        'INSERT INTO npc_abilities (id, npc_id, name, description) VALUES ($1, $2, $3, $4)',
                        ability['id'], npc_id, ability['name'], ability['description']
                    )
            
            # Inserir inventário
            if 'inventory' in npc_data:
                for item in npc_data['inventory']:
                    await conn.execute(
                        'INSERT INTO npc_inventory (id, npc_id, name, description, quantity) VALUES ($1, $2, $3, $4, $5)',
                        item['id'], npc_id, item['name'], item['description'], item['quantity']
                    )

    async def get_npcs(self, master_id):
        async with self.pool.acquire() as conn:
            npcs = await conn.fetch('SELECT * FROM npcs WHERE master_id = $1', master_id)
            result = []
            
            for npc in npcs:
                npc_data = dict(npc)
                npc_data['isNpc'] = True
                npc_data['healthPoints'] = npc_data.pop('health_points')
                npc_data['maxHealthPoints'] = npc_data.pop('max_health_points')
                npc_data['showHealthBar'] = npc_data.pop('show_health_bar')
                npc_data['healthBarColor'] = npc_data.pop('health_bar_color')
                npc_data['showInChat'] = npc_data.pop('show_in_chat')
                npc_data['masterId'] = npc_data.pop('master_id')
                npc_data['diceResults'] = []
                
                # Obter atributos
                attrs = await conn.fetchrow('SELECT * FROM npc_attributes WHERE npc_id = $1', npc['id'])
                if attrs:
                    npc_data['attributes'] = {
                        'strength': attrs['strength'],
                        'dexterity': attrs['dexterity'],
                        'constitution': attrs['constitution'],
                        'intelligence': attrs['intelligence'],
                        'wisdom': attrs['wisdom'],
                        'charisma': attrs['charisma']
                    }
                
                # Obter perícias
                skills = await conn.fetch('SELECT * FROM npc_skills WHERE npc_id = $1', npc['id'])
                npc_data['skills'] = [
                    {'name': s['name'], 'value': s['value'], 'proficient': s['proficient']}
                    for s in skills
                ]
                
                # Obter habilidades
                abilities = await conn.fetch('SELECT * FROM npc_abilities WHERE npc_id = $1', npc['id'])
                npc_data['abilities'] = [
                    {'id': a['id'], 'name': a['name'], 'description': a['description']}
                    for a in abilities
                ]
                
                # Obter inventário
                inventory = await conn.fetch('SELECT * FROM npc_inventory WHERE npc_id = $1', npc['id'])
                npc_data['inventory'] = [
                    {'id': i['id'], 'name': i['name'], 'description': i['description'], 'quantity': i['quantity']}
                    for i in inventory
                ]
                
                result.append(npc_data)
                
            return result

    async def update_npc(self, npc_id, npc_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                UPDATE npcs 
                SET nickname = $1, health_points = $2, max_health_points = $3,
                    show_health_bar = $4, health_bar_color = $5, show_in_chat = $6, notes = $7
                WHERE id = $8
                ''',
                npc_data['nickname'], npc_data['healthPoints'], npc_data['maxHealthPoints'],
                npc_data.get('showHealthBar', True), npc_data.get('healthBarColor', 'green'),
                npc_data.get('showInChat', False), npc_data.get('notes', ''),
                npc_id
            )
            
            # Atualizar atributos
            if 'attributes' in npc_data:
                attrs = npc_data['attributes']
                await conn.execute(
                    '''
                    UPDATE npc_attributes 
                    SET strength = $1, dexterity = $2, constitution = $3,
                        intelligence = $4, wisdom = $5, charisma = $6
                    WHERE npc_id = $7
                    ''',
                    attrs.get('strength', 10), attrs.get('dexterity', 10), attrs.get('constitution', 10),
                    attrs.get('intelligence', 10), attrs.get('wisdom', 10), attrs.get('charisma', 10),
                    npc_id
                )
            
            # Atualizar perícias
            if 'skills' in npc_data:
                await conn.execute('DELETE FROM npc_skills WHERE npc_id = $1', npc_id)
                for skill in npc_data['skills']:
                    await conn.execute(
                        'INSERT INTO npc_skills (npc_id, name, value, proficient) VALUES ($1, $2, $3, $4)',
                        npc_id, skill['name'], skill['value'], skill['proficient']
                    )
            
            # Atualizar habilidades
            if 'abilities' in npc_data:
                await conn.execute('DELETE FROM npc_abilities WHERE npc_id = $1', npc_id)
                for ability in npc_data['abilities']:
                    await conn.execute(
                        'INSERT INTO npc_abilities (id, npc_id, name, description) VALUES ($1, $2, $3, $4)',
                        ability['id'], npc_id, ability['name'], ability['description']
                    )
            
            # Atualizar inventário
            if 'inventory' in npc_data:
                await conn.execute('DELETE FROM npc_inventory WHERE npc_id = $1', npc_id)
                for item in npc_data['inventory']:
                    await conn.execute(
                        'INSERT INTO npc_inventory (id, npc_id, name, description, quantity) VALUES ($1, $2, $3, $4, $5)',
                        item['id'], npc_id, item['name'], item['description'], item['quantity']
                    )

    async def delete_npc(self, npc_id):
        async with self.pool.acquire() as conn:
            # O ON DELETE CASCADE nas foreign keys deve cuidar das tabelas relacionadas (npc_attributes, etc.)
            result = await conn.execute('DELETE FROM npcs WHERE id = $1', npc_id)
            # O execute retorna uma string como 'DELETE 1' ou 'DELETE 0'
            deleted_count = int(result.split(' ')[1])
            return deleted_count > 0 # Retorna True se deletou 1 linha, False caso contrário

    # Métodos para itens compartilhados
    async def create_shared_item(self, item_id, master_id, item_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                INSERT INTO shared_items (
                    id, master_id, name, description, type, rarity, 
                    value, weight, effect, is_public
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ''',
                item_id, master_id, item_data['name'], item_data['description'],
                item_data.get('type', ''), item_data.get('rarity', ''),
                item_data.get('value', ''), item_data.get('weight', ''),
                item_data.get('effect', ''), item_data.get('isPublic', False)
            )

    async def get_shared_items(self, master_id=None):
        async with self.pool.acquire() as conn:
            if master_id:
                items = await conn.fetch('SELECT * FROM shared_items WHERE master_id = $1', master_id)
            else:
                items = await conn.fetch('SELECT * FROM shared_items')
                
            result = []
            for item in items:
                item_data = dict(item)
                item_data['masterId'] = item_data.pop('master_id')
                item_data['isPublic'] = item_data.pop('is_public')
                item_data['createdAt'] = item_data.pop('created_at').isoformat()
                result.append(item_data)
                
            return result

    async def update_shared_item(self, item_id, item_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                UPDATE shared_items 
                SET name = $1, description = $2, type = $3, rarity = $4,
                    value = $5, weight = $6, effect = $7, is_public = $8
                WHERE id = $9
                ''',
                item_data['name'], item_data['description'],
                item_data.get('type', ''), item_data.get('rarity', ''),
                item_data.get('value', ''), item_data.get('weight', ''),
                item_data.get('effect', ''), item_data.get('isPublic', False),
                item_id
            )

    async def delete_shared_item(self, item_id):
        async with self.pool.acquire() as conn:
            await conn.execute('DELETE FROM shared_items WHERE id = $1', item_id)

    # Métodos para habilidades compartilhadas
    async def create_shared_ability(self, ability_id, master_id, ability_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                INSERT INTO shared_abilities (
                    id, master_id, name, description, type, cost, 
                    range, duration, effect, is_public
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ''',
                ability_id, master_id, ability_data['name'], ability_data['description'],
                ability_data.get('type', ''), ability_data.get('cost', ''),
                ability_data.get('range', ''), ability_data.get('duration', ''),
                ability_data.get('effect', ''), ability_data.get('isPublic', False)
            )

    async def get_shared_abilities(self, master_id=None):
        async with self.pool.acquire() as conn:
            if master_id:
                abilities = await conn.fetch('SELECT * FROM shared_abilities WHERE master_id = $1', master_id)
            else:
                abilities = await conn.fetch('SELECT * FROM shared_abilities')
                
            result = []
            for ability in abilities:
                ability_data = dict(ability)
                ability_data['masterId'] = ability_data.pop('master_id')
                ability_data['isPublic'] = ability_data.pop('is_public')
                ability_data['createdAt'] = ability_data.pop('created_at').isoformat()
                result.append(ability_data)
                
            return result

    async def update_shared_ability(self, ability_id, ability_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                UPDATE shared_abilities 
                SET name = $1, description = $2, type = $3, cost = $4,
                    range = $5, duration = $6, effect = $7, is_public = $8
                WHERE id = $9
                ''',
                ability_data['name'], ability_data['description'],
                ability_data.get('type', ''), ability_data.get('cost', ''),
                ability_data.get('range', ''), ability_data.get('duration', ''),
                ability_data.get('effect', ''), ability_data.get('isPublic', False),
                ability_id
            )

    async def delete_shared_ability(self, ability_id):
        async with self.pool.acquire() as conn:
            await conn.execute('DELETE FROM shared_abilities WHERE id = $1', ability_id)

    # Métodos para notas do mestre
    async def create_master_note(self, note_id, master_id, note_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO master_notes (id, master_id, title, content, category) VALUES ($1, $2, $3, $4, $5)',
                note_id, master_id, note_data['title'], note_data['content'], note_data['category']
            )

    async def get_master_notes(self, master_id):
        async with self.pool.acquire() as conn:
            notes = await conn.fetch('SELECT * FROM master_notes WHERE master_id = $1', master_id)
            
            result = []
            for note in notes:
                note_data = dict(note)
                note_data['masterId'] = note_data.pop('master_id')
                note_data['createdAt'] = note_data.pop('created_at').isoformat()
                result.append(note_data)
                
            return result

    async def update_master_note(self, note_id, note_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'UPDATE master_notes SET title = $1, content = $2, category = $3 WHERE id = $4',
                note_data['title'], note_data['content'], note_data['category'], note_id
            )

    async def delete_master_note(self, note_id):
        async with self.pool.acquire() as conn:
            await conn.execute('DELETE FROM master_notes WHERE id = $1', note_id)

    # Métodos para adicionar itens/habilidades a personagens
    async def add_item_to_character(self, user_id, item_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO inventory (id, user_id, name, description, quantity) VALUES ($1, $2, $3, $4, $5)',
                item_data['id'], user_id, item_data['name'], item_data['description'], item_data.get('quantity', 1)
            )

    async def add_ability_to_character(self, user_id, ability_data):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO abilities (id, user_id, name, description) VALUES ($1, $2, $3, $4)',
                ability_data['id'], user_id, ability_data['name'], ability_data['description']
            )

    # --- Método para deletar usuário --- START ---
    async def delete_user(self, user_id):
        """Deleta um usuário e todos os seus dados relacionados (personagem, etc.)"""
        async with self.pool.acquire() as conn:
            # O ON DELETE CASCADE nas foreign keys deve cuidar das tabelas relacionadas
            # como attributes, skills, abilities, inventory, currency, messages, dice_results.
            # Se não houver CASCADE, você precisaria deletar manualmente dessas tabelas primeiro.
            result = await conn.execute(
                'DELETE FROM users WHERE id = $1',
                user_id
            )
            # O execute retorna uma string como 'DELETE 1' ou 'DELETE 0'
            deleted_count = int(result.split(' ')[1])
            return deleted_count > 0 # Retorna True se deletou 1 linha, False caso contrário
    # --- Método para deletar usuário --- END ---
