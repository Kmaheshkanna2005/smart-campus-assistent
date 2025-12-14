from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from typing import Optional

from app.models.database import (
    DATABASE,
    hash_password,
    verify_password,
    create_session_token,
    get_session_expiry
)

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/api/register")
async def register(req: RegisterRequest):
    """Register a new user"""
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        # Check if username exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (req.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create user
        password_hash = hash_password(req.password)
        created_at = datetime.now().isoformat()
        
        cursor.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
            (req.username, password_hash, created_at)
        )
        conn.commit()
        
        return {"message": "User registered successfully", "username": req.username}
    
    finally:
        conn.close()

@router.post("/api/login")
async def login(req: LoginRequest):
    """Login and create session"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        # Get user
        cursor.execute("SELECT id, password_hash FROM users WHERE username = ?", (req.username,))
        user = cursor.fetchone()
        
        if not user or not verify_password(req.password, user[1]):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        user_id = user[0]
        
        # Create session
        session_token = create_session_token()
        expires_at = get_session_expiry()
        
        cursor.execute(
            "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)",
            (user_id, session_token, expires_at)
        )
        conn.commit()
        
        return {
            "message": "Login successful",
            "session_token": session_token,
            "username": req.username
        }
    
    finally:
        conn.close()

@router.get("/api/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current logged-in user info"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_token = authorization.replace("Bearer ", "")
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        # Get session and check expiry
        cursor.execute("""
            SELECT s.user_id, s.expires_at, u.username 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_token = ?
        """, (session_token,))
        
        session = cursor.fetchone()
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_id, expires_at, username = session
        
        # Check if expired
        if datetime.fromisoformat(expires_at) < datetime.now():
            raise HTTPException(status_code=401, detail="Session expired")
        
        return {"user_id": user_id, "username": username}
    
    finally:
        conn.close()

@router.post("/api/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Logout and delete session"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_token = authorization.replace("Bearer ", "")
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM sessions WHERE session_token = ?", (session_token,))
        conn.commit()
        return {"message": "Logged out successfully"}
    
    finally:
        conn.close()
