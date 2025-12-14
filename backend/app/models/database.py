import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta

DATABASE = "campus_assistant.db"

class Database:
    def __init__(self):
        self.conn = None
        self.init_db()
    
    def init_db(self):
        """Initialize the documents table"""
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                upload_date TEXT NOT NULL,
                user_id INTEGER
            )
        ''')
        conn.commit()
        conn.close()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(DATABASE)

# Create a singleton instance
db = Database()

# ============ AUTH FUNCTIONS (NEW) ============

def init_auth_db():
    """Create users and sessions tables if they don't exist"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def create_session_token() -> str:
    """Generate a secure random session token"""
    return secrets.token_urlsafe(32)

def get_session_expiry() -> str:
    """Return expiry time (7 days from now)"""
    expiry = datetime.now() + timedelta(days=7)
    return expiry.isoformat()
