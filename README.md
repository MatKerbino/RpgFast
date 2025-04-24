# RpgFast

Um aplicativo web de RPG em tempo real, construído para explorar e entender o conceito de WebSockets.  
Frontend em Next.js + React e backend em FastAPI, com comunicação bidirecional em tempo real para chat, status de personagens, rolagem de dados e muito mais.

---

## 📖 Visão Geral

- **Objetivo principal:** Projeto de aprendizagem para entender WebSockets e comunicação em tempo real.
- Permite ao **Mestre** e **Jogadores** interagirem em tempo real:
  - Chat com rolagem de dados.
  - Controle de pontos de vida.
  - Itens e habilidades compartilhados.
  - Criação e edição de NPCs.
  - Anotações do Mestre.

---

## ✨ Funcionalidades

- Autenticação de Mestre e Jogador (ID de 3 dígitos).
- Chat em tempo real via WebSocket.
- Rolagem de dados (d4, d6, d8, d10, d12, d20 e custom).
- Controle de saúde de personagens (broadcast para todos).
- Gerenciamento de NPCs (CRUD).
- Itens e habilidades compartilhadas entre jogadores.
- Anotações do Mestre (Persistência em banco).
- Exibição dinâmica de dados usando React e Axios.

---

## 🛠 Tech Stack

- **Backend**  
  - Python 3.10+  
  - FastAPI  
  - Uvicorn  
  - asyncpg / PostgreSQL  
  - Pydantic  
  - WebSockets (via FastAPI)  

- **Frontend**  
  - Next.js (App Router)  
  - React + Hooks  
  - Axios  
  - Tailwind CSS  
  - WebSocket nativo no navegador  

---

## 📂 Estrutura de Pastas

```
RpgFast/
├── backend/
│   ├── main.py            # App FastAPI + rotas REST & WebSocket
│   ├── app_setup.py       # Inicialização do app, CORS, DB e manager
│   ├── database.py        # CRUD no PostgreSQL
│   ├── websocket_handler.py
│   ├── websocket_manager.py
│   ├── routers/           # Rotas separadas por domínio (auth, npcs, shared-*, etc)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/           # Páginas Next.js (login, game, master/characters, etc)
    │   ├── lib/context.jsx# Context API com Axios + WebSocket
    │   └── components/    # UI components (modals, chat, character-card...)
    ├── .env               # API_URL e WS_URL
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Pré-requisitos

- Node.js 18+ e npm/yarn  
- Python 3.10+  
- PostgreSQL rodando localmente (ou em container)

---

## 🔧 Instalação e Execução

### 1. Backend

1. Entrar na pasta `backend/`  
2. Criar ambiente virtual e instalar dependências:
   ```bash
   python -m venv .venv
   source .venv/bin/activate    # ou `.venv\Scripts\activate` no Windows
   pip install -r requirements.txt
   ```
3. Criar arquivo `.env`:
   ```ini
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/rpgfast
   ```
4. Executar migrations ou criar tabelas (se aplicável):
   ```bash
   # (Implemente sua lógica de criação de tabelas aqui)
   ```
5. Iniciar o servidor:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend

1. Entrar na pasta `frontend/`
2. Instalar dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```
3. Criar arquivo `.env`:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```
4. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
5. Abrir no navegador: `http://localhost:3000`

---

## 🔄 Comunicação em Tempo Real (WebSockets)

- O frontend abre uma conexão WebSocket em `ws://<WS_URL>/ws/{userId}`.
- O backend gerencia conexões via `ConnectionManager`, armazenando sockets ativos por `user_id`.
- Eventos em tempo real:
  - **users**: Atualiza lista de usuários.
  - **messages**: Recebe novas mensagens e resultados de dados.
  - **shared_items**, **shared_abilities**, **npcs**, **character**.
- Permite fluxo bidirecional, sem polling, garantindo responsividade imediata.

---

## 🤝 Contribuição

1. Fork no GitHub  
2. Criar branch feature:  
   ```bash
   git checkout -b feature/nome-da-sua-feature
   ```
3. Code, commit, push  
4. Abrir Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo [LICENSE](LICENSE) para detalhes.  

---

> **Nota:**  
> Este projeto teve foco didático em WebSockets e comunicação em tempo real. Use-o como base para seus próprios estudos ou jogos de RPG online!
