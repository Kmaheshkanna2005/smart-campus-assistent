import os
from typing import List
from PyPDF2 import PdfReader
from docx import Document
from pptx import Presentation

class DocumentProcessor:
    """Process different document types and extract text"""
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from Word document"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_pptx(file_path: str) -> str:
        """Extract text from PowerPoint"""
        try:
            prs = Presentation(file_path)
            text = ""
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting PPTX: {str(e)}")
    
    @staticmethod
    def process_document(file_path: str, file_type: str) -> str:
        """Process document based on file type"""
        if file_type == "pdf":
            return DocumentProcessor.extract_text_from_pdf(file_path)
        elif file_type == "docx":
            return DocumentProcessor.extract_text_from_docx(file_path)
        elif file_type == "pptx":
            return DocumentProcessor.extract_text_from_pptx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
