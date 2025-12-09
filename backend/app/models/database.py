import sqlite3
from datetime import datetime
import os

class Database:
    def __init__(self, db_path: str = "campus_assistant.db"):
        self.db_path = db_path
        self.init_db()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Documents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path TEXT NOT NULL,
                file_size INTEGER,
                file_type TEXT,
                chromadb_collection_id TEXT
            )
        ''')
        
        conn.commit()
        conn.close()

db = Database()
