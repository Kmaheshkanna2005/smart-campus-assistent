from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
from langchain.schema import Document
import os
import shutil
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from app.models.database import db
from app.config import settings

router = APIRouter()

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

# Upload endpoint
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process document"""
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
        
        # Add to vector database
        num_chunks = embedding_service.add_document_to_vectordb(text, file.filename)
        
        # Save to SQLite
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO documents (filename, file_path, file_size, file_type)
            VALUES (?, ?, ?, ?)
        ''', (file.filename, file_path, file_size, file_extension))
        conn.commit()
        doc_id = cursor.lastrowid
        conn.close()
        
        return {
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "filename": file.filename,
            "chunks_created": num_chunks
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Query endpoint
@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Ask questions about uploaded documents"""
    try:
        from app.services.wikipedia_service import wikipedia_service
        
        # Search for relevant chunks in documents
        results = embedding_service.search_documents(request.question, k=3)
        
        context = results
        sources = []
        
        # If no documents found or Wikipedia is enabled
        if not results or request.use_wikipedia:
            # Try Wikipedia
            wiki_summary = wikipedia_service.search_wikipedia(request.question)
            
            if wiki_summary:
                # Create a mock document object for Wikipedia content
                wiki_doc = Document(
                    page_content=wiki_summary,
                    metadata={"source": "Wikipedia"}
                )
                context = results + [wiki_doc] if results else [wiki_doc]
                sources.append("Wikipedia")
        
        if not context:
            raise HTTPException(status_code=404, detail="No relevant information found")
        
        # Generate answer
        answer = llm_service.generate_answer(request.question, context)
        
        # Extract document sources
        doc_sources = list(set([doc.metadata.get("source", "Unknown") for doc in results]))
        sources.extend(doc_sources)
        
        return QueryResponse(answer=answer, sources=sources)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Summarize endpoint
@router.post("/summarize")
async def summarize_document(request: SummarizeRequest):
    """Summarize a document"""
    try:
        # Get document from database
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT file_path, file_type FROM documents WHERE id = ?', (request.document_id,))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path, file_type = result
        
        # Extract text
        text = DocumentProcessor.process_document(file_path, file_type)
        
        # Generate summary
        summary = llm_service.summarize_document(text)
        
        return {"summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Quiz generation endpoint
@router.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """Generate quiz from document"""
    try:
        # Get document from database
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT file_path, file_type FROM documents WHERE id = ?', (request.document_id,))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path, file_type = result
        
        # Extract text
        text = DocumentProcessor.process_document(file_path, file_type)
        
        # Generate quiz
        quiz = llm_service.generate_quiz(text, request.num_questions)
        
        return {"quiz": quiz}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all documents
@router.get("/documents")
async def get_documents():
    """Get list of uploaded documents"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, filename, upload_date, file_size, file_type FROM documents')
        docs = cursor.fetchall()
        conn.close()
        
        documents = [
            {
                "id": doc[0],
                "filename": doc[1],
                "upload_date": doc[2],
                "file_size": doc[3],
                "file_type": doc[4]
            }
            for doc in docs
        ]
        
        return {"documents": documents}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete document endpoint
@router.delete("/documents/{document_id}")
async def delete_document(document_id: int):
    """Delete a document"""
    try:
        # Get document from database
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT file_path FROM documents WHERE id = ?', (document_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = result[0]
        
        # Delete file from filesystem
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        cursor.execute('DELETE FROM documents WHERE id = ?', (document_id,))
        conn.commit()
        conn.close()
        
        return {"message": "Document deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
