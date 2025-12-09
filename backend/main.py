from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.routes import router
import os

# Load environment variables
load_dotenv()

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="Smart Campus Assistant API",
    description="AI-powered assistant for students",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api", tags=["Smart Campus Assistant"])

@app.get("/")
async def root():
    return {
        "message": "Smart Campus Assistant API",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
