import os
from dotenv import load_dotenv

load_dotenv()

# Get absolute path to backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    CHROMA_DB_PATH: str = os.path.join(BASE_DIR, "chroma_db")
    UPLOADS_PATH: str = os.path.join(BASE_DIR, "uploads")

    # Groq model settings
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Chunking settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOADS_PATH, exist_ok=True)

# Debug print (remove after testing)
print(f"✓ Uploads path: {settings.UPLOADS_PATH}")
