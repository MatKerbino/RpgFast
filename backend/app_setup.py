import typing
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from .database import Database
from .websocket_manager import ConnectionManager

# --- Monkey Patch for typing.ForwardRef --- START ---
if hasattr(typing.ForwardRef, "_evaluate"):
    original_evaluate = typing.ForwardRef._evaluate
    # Keep the most recent working patch
    def patched_evaluate(self, globalns, localns, type_params, *, recursive_guard=None):
        if recursive_guard is None:
            recursive_guard = set()
        # Ensure recursive_guard is always passed as keyword
        return original_evaluate(self, globalns, localns, type_params, recursive_guard=recursive_guard)
    typing.ForwardRef._evaluate = patched_evaluate
# --- Monkey Patch for typing.ForwardRef --- END ---

# --- JSON Serializer for Datetime --- START ---
def datetime_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    # Consider adding handling for other types if needed
    raise TypeError (f"Type {type(obj)} not serializable")
# --- JSON Serializer for Datetime --- END ---

# --- FastAPI App Initialization --- START ---
app = FastAPI()
# --- FastAPI App Initialization --- END ---

# --- Database Connection --- START ---
db = Database()
# --- Database Connection --- END ---

# --- WebSocket Connection Manager --- START ---
manager = ConnectionManager() # manager now uses db from this module
# --- WebSocket Connection Manager --- END ---

# --- CORS Middleware Configuration --- START ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- CORS Middleware Configuration --- END ---

# --- Startup and Shutdown Events --- START ---
@app.on_event("startup")
async def startup_event():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await db.close()
# --- Startup and Shutdown Events --- END ---

# --- Master Code Constant --- START ---
MASTER_CODE = "master123"
# --- Master Code Constant --- END --- 