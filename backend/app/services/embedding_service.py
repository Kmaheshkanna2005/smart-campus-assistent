from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
import chromadb
from chromadb.config import Settings
from typing import List
import os
from app.config import settings

class EmbeddingService:
    """Handle embeddings and vector database operations"""
    
    def __init__(self):
        # Initialize embedding model
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )
        
        # Initialize ChromaDB client
        self.chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks"""
        chunks = self.text_splitter.split_text(text)
        return chunks
    
    def add_document_to_vectordb(
        self, 
        text: str, 
        filename: str,
        collection_name: str = "course_materials"
    ):
        """Add document chunks to ChromaDB"""
        # Chunk the text
        chunks = self.chunk_text(text)
        
        # Create metadata for each chunk
        metadatas = [
            {"source": filename, "chunk_index": i} 
            for i in range(len(chunks))
        ]
        
        # Create or get collection
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            metadatas=metadatas,
            collection_name=collection_name,
            persist_directory=settings.CHROMA_DB_PATH
        )
        
        return len(chunks)
    
    def search_documents(
        self, 
        query: str, 
        k: int = 3,
        collection_name: str = "course_materials"
    ):
        """Search for relevant document chunks"""
        vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=settings.CHROMA_DB_PATH
        )
        
        results = vectorstore.similarity_search(query, k=k)
        return results

embedding_service = EmbeddingService()
