"""
Script to pre-load NCERT textbooks into ChromaDB
Place NCERT PDF files in backend/ncert_books/ folder before running
"""

import os
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import embedding_service
from app.models.database import db

def preload_ncert_books():
    """Pre-load NCERT textbooks from ncert_books folder"""
    
    # Create ncert_books folder if it doesn't exist
    ncert_folder = "./ncert_books"
    if not os.path.exists(ncert_folder):
        os.makedirs(ncert_folder)
        print(f"Created {ncert_folder} folder")
        print("Please download NCERT PDFs and place them in this folder, then run this script again.")
        return
    
    # Get all PDF files
    pdf_files = [f for f in os.listdir(ncert_folder) if f.endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in ncert_books folder")
        print(f"Please download NCERT PDFs from https://ncert.nic.in/textbook.php")
        print(f"and place them in {ncert_folder} folder")
        return
    
    print(f"Found {len(pdf_files)} NCERT textbooks to process")
    print("-" * 50)
    
    for idx, filename in enumerate(pdf_files, 1):
        try:
            print(f"\n[{idx}/{len(pdf_files)}] Processing: {filename}")
            
            file_path = os.path.join(ncert_folder, filename)
            file_size = os.path.getsize(file_path)
            
            # Check if already in database
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM documents WHERE filename = ?', (filename,))
            existing = cursor.fetchone()
            
            if existing:
                print(f"  ⏭️  Already processed, skipping...")
                conn.close()
                continue
            
            # Extract text from PDF
            print(f"  📄 Extracting text...")
            text = DocumentProcessor.extract_text_from_pdf(file_path)
            
            # Add to vector database
            print(f"  🔢 Creating embeddings...")
            num_chunks = embedding_service.add_document_to_vectordb(
                text, 
                f"NCERT - {filename}",
                collection_name="course_materials"
            )
            
            # Save to SQLite
            cursor.execute('''
                INSERT INTO documents (filename, file_path, file_size, file_type, chromadb_collection_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (f"NCERT - {filename}", file_path, file_size, "pdf", "ncert"))
            conn.commit()
            conn.close()
            
            print(f"  ✅ Successfully processed! Created {num_chunks} chunks")
            
        except Exception as e:
            print(f"  ❌ Error processing {filename}: {str(e)}")
            continue
    
    print("\n" + "=" * 50)
    print("NCERT pre-loading complete!")
    print("=" * 50)

if __name__ == "__main__":
    print("=" * 50)
    print("NCERT Textbooks Pre-loader")
    print("=" * 50)
    preload_ncert_books()
