from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from langchain.schema import Document
import os
import shutil
import sqlite3
from datetime import datetime
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from app.models.database import db, DATABASE
from app.config import settings

router = APIRouter()

# Helper function to get user from session token
def get_user_from_token(authorization: Optional[str]) -> int:
    """Extract user_id from session token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_token = authorization.replace("Bearer ", "")
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT s.user_id, s.expires_at
            FROM sessions s
            WHERE s.session_token = ?
        """, (session_token,))
        
        session = cursor.fetchone()
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_id, expires_at = session
        
        # Check if expired
        if datetime.fromisoformat(expires_at) < datetime.now():
            raise HTTPException(status_code=401, detail="Session expired")
        
        return user_id
    
    finally:
        conn.close()

# Pydantic models for request/response
class QueryRequest(BaseModel):
    question: str
    use_wikipedia: bool = False

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

class SummarizeRequest(BaseModel):
    document_id: int

class QuizRequest(BaseModel):
    document_id: int
    num_questions: int = 5

# Upload endpoint - NOW REQUIRES AUTH
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """Upload and process document (requires authentication)"""
    # Get user_id from session
    user_id = get_user_from_token(authorization)
    
    file_path = None
    try:
        # Validate file type
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["pdf", "docx", "pptx"]:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Save file
        file_path = os.path.join(settings.UPLOADS_PATH, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        # Extract text
        text = DocumentProcessor.process_document(file_path, file_extension)
        
        # Add to vector store using the CORRECT method
        chunks_created = embedding_service.add_document_to_vectordb(
            text=text,
            filename=file.filename
        )
        
        # Save to database WITH user_id
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (filename, file_path, file_size, file_type, upload_date, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            file.filename,
            file_path,
            file_size,
            file_extension,
            datetime.now().isoformat(),
            user_id  # LINK TO USER
        ))
        conn.commit()
        doc_id = cursor.lastrowid
        conn.close()
        
        return {
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "filename": file.filename,
            "chunks": chunks_created
        }
    
    except Exception as e:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

# Get documents - FILTER BY USER
@router.get("/documents")
async def get_documents(authorization: Optional[str] = Header(None)):
    """Get all documents for logged-in user"""
    user_id = get_user_from_token(authorization)
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Only get documents for this user
    cursor.execute("""
        SELECT id, filename, file_size, file_type, upload_date
        FROM documents
        WHERE user_id = ?
        ORDER BY upload_date DESC
    """, (user_id,))
    
    documents = []
    for row in cursor.fetchall():
        documents.append({
            "id": row[0],
            "filename": row[1],
            "file_size": row[2],
            "file_type": row[3],
            "upload_date": row[4]
        })
    
    conn.close()
    return {"documents": documents}

# Question answering - INTELLIGENT COMBINATION
@router.post("/query", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    authorization: Optional[str] = Header(None)
):
    """Answer questions from documents (requires authentication)"""
    user_id = get_user_from_token(authorization)
    
    try:
        # Always search documents first
        results = embedding_service.search_documents(request.question, k=5)
        
        # Check if we found relevant content in documents
        if results and len(results) > 0:
            # We have document content
            context = "\n\n".join([doc.page_content for doc in results])
            sources = list(set([doc.metadata.get("source", "Unknown") for doc in results]))
            
            # If Wikipedia checkbox is enabled, enhance with Wikipedia
            if request.use_wikipedia:
                try:
                    wiki_info = llm_service.get_wikipedia_answer(request.question)
                    
                    # Only add Wikipedia if it's not an error message
                    if not wiki_info.startswith("I couldn't") and not wiki_info.startswith("Error"):
                        # Combine document context with Wikipedia
                        combined_context = f"""Document Content:
{context}

Additional Wikipedia Information:
{wiki_info}"""
                        
                        answer = llm_service.generate_answer(request.question, combined_context)
                        sources.append("Wikipedia")
                        
                        return QueryResponse(answer=answer, sources=sources)
                except:
                    # If Wikipedia fails, just use document context
                    pass
            
            # Generate answer from documents only
            answer = llm_service.generate_answer(request.question, context)
            return QueryResponse(answer=answer, sources=sources)
        
        else:
            # No documents found, use Wikipedia if enabled
            if request.use_wikipedia:
                answer = llm_service.get_wikipedia_answer(request.question)
                return QueryResponse(answer=answer, sources=["Wikipedia"])
            else:
                return QueryResponse(
                    answer="I couldn't find relevant information in your documents. Try enabling Wikipedia for general knowledge.",
                    sources=[]
                )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Summarize document
@router.post("/summarize")
async def summarize_document(
    request: SummarizeRequest,
    authorization: Optional[str] = Header(None)
):
    """Summarize a document (requires authentication)"""
    user_id = get_user_from_token(authorization)
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Check document belongs to user
    cursor.execute("""
        SELECT file_path FROM documents
        WHERE id = ? AND user_id = ?
    """, (request.document_id, user_id))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    
    file_path = result[0]
    
    try:
        # Extract text
        file_extension = file_path.split(".")[-1].lower()
        text = DocumentProcessor.process_document(file_path, file_extension)
        
        # Generate summary
        summary = llm_service.generate_summary(text)
        
        return {"summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate quiz
@router.post("/generate-quiz")
async def generate_quiz(
    request: QuizRequest,
    authorization: Optional[str] = Header(None)
):
    """Generate quiz from document (requires authentication)"""
    user_id = get_user_from_token(authorization)
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Check document belongs to user
    cursor.execute("""
        SELECT file_path FROM documents
        WHERE id = ? AND user_id = ?
    """, (request.document_id, user_id))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    
    file_path = result[0]
    
    try:
        # Extract text
        file_extension = file_path.split(".")[-1].lower()
        text = DocumentProcessor.process_document(file_path, file_extension)
        
        # Generate quiz
        quiz = llm_service.generate_quiz(text, request.num_questions)
        
        return {"quiz": quiz}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete document
@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    authorization: Optional[str] = Header(None)
):
    """Delete a document (requires authentication)"""
    user_id = get_user_from_token(authorization)
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Check document belongs to user
    cursor.execute("""
        SELECT file_path FROM documents
        WHERE id = ? AND user_id = ?
    """, (document_id, user_id))
    
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    
    file_path = result[0]
    
    # Delete from database
    cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    conn.commit()
    conn.close()
    
    # Delete file
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return {"message": "Document deleted successfully"}
