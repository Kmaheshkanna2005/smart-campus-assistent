import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./chroma_db")
    UPLOADS_PATH: str = os.getenv("UPLOADS_PATH", "./uploads")
    
    # Groq model settings
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    
    # Chunking settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

settings = Settings()
