# Smart Campus Assistant

Smart Campus Assistant is an AI‑powered web application that helps students upload course materials and instantly get answers, summaries, and quizzes from their own notes. It is built as a full‑stack app with a React PWA frontend and a FastAPI + Python backend using a Retrieval‑Augmented Generation (RAG) pipeline.

***

## Features

- Upload course materials in **PDF, DOCX, PPTX** formats  
- View and manage all uploaded documents in a **Documents** tab  
- Ask natural‑language questions in a **Q&A** tab and get answers grounded in your notes  
- Generate **summaries** of selected documents  
- Create **practice quizzes** (MCQs) from uploaded materials  
- Modern **React UI** with tabbed navigation and responsive layout  
- **PWA support**: installable on desktop/mobile, app‑like experience  

***

## Tech Stack

**Frontend**

- React (Create React App)
- JavaScript, HTML, CSS
- `axios` for HTTP requests
- `react-dropzone` for drag‑and‑drop file upload
- PWA features via `manifest.json` and a service worker

**Backend**

- Python 3
- FastAPI
- Uvicorn (ASGI server)
- SQLite for document metadata
- ChromaDB as vector store
- LangChain, `langchain-community`, `langchain-groq`, `langchain-huggingface`
- Sentence‑Transformers (HuggingFace embeddings)
- Groq LLMs (e.g., Llama‑based models)
- PyPDF2 / `python-docx` / `python-pptx` for document parsing
- `wikipedia` package for external knowledge
- `python-dotenv`, `pydantic` for settings
- `python-multipart` for file uploads

***

## Project Structure

```text
smart-campus-assistant/
├── backend/
│   ├── main.py
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── services/
│   │   │   ├── document_processor.py
│   │   │   ├── embedding_service.py
│   │   │   ├── llm_service.py
│   │   │   └── wikipedia_service.py
│   │   └── db/
│   │       └── models.py
│   ├── uploads/
│   └── requirements.txt
└── frontend/
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── service-worker.js (optional/custom)
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── components/
    │       ├── FileUpload.jsx
    │       ├── DocumentList.jsx
    │       ├── QuestionAnswer.jsx
    │       ├── Summarize.jsx
    │       └── Quiz.jsx
    └── package.json
```

(Names can be adjusted to match your actual repo; keep structure description consistent.)

***

## Backend Setup (FastAPI)

1. **Create and activate virtual environment**

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

Typical `requirements.txt` (adjust if yours differs):

```txt
fastapi
uvicorn[standard]

langchain
langchain-community
langchain-groq
langchain-huggingface
chromadb
sentence-transformers
groq

PyPDF2
python-docx
python-pptx
wikipedia

pydantic
python-multipart
python-dotenv
```

3. **Environment variables**

Create a `.env` file in the `backend` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL=llama3-70b-8192   # example; match what you use
```

4. **Run backend locally**

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.  
Docs: `http://127.0.0.1:8000/docs`

***

## Backend API Overview

All routes are prefixed with `/api`.

- `POST /api/upload`  
  - Body: multipart file (`file`)  
  - Flow:
    - Save file under `uploads/`
    - Extract text using PyPDF2 / DOCX / PPTX parser
    - Chunk text and create embeddings with Sentence‑Transformers
    - Store vectors + metadata in ChromaDB
    - Insert document metadata (id, path, size, type, upload_date) in SQLite  
  - Response: `{ document_id, chunks_created }`

- `GET /api/documents`  
  - Returns list of uploaded documents.

- `DELETE /api/documents/{id}`  
  - Deletes file, metadata, and vectors (depending on implementation).

- `POST /api/query`  
  - Body: `{ "question": string, "use_wikipedia": bool }`  
  - Flow:
    - Query ChromaDB for top‑k relevant chunks
    - Optionally add a Wikipedia snippet
    - Call Groq LLM via LangChain with RAG prompt
  - Response: `{ "answer": string, "sources": [string, ...] }`

- `POST /api/summarize`  
  - Body: `{ "document_id": int }`  
  - Returns a concise summary of the document using Groq LLM.

- `POST /api/generate-quiz`  
  - Body: `{ "document_id": int, "num_questions": int }`  
  - Returns quiz text (questions, options, correct answers).

***

## Frontend Setup (React PWA)

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Run in development mode**

```bash
npm start
```

- App opens at `http://localhost:3000`
- Backend URL in code is `http://127.0.0.1:8000` (adjust if needed)

3. **Production build (for PWA testing or deployment)**

```bash
npm run build
```

You can test the built app locally:

```bash
npx serve -s build
```

Then open the served URL and install as PWA from the browser.

***

## PWA Configuration

- `public/manifest.json` defines:
  - `name`, `short_name`
  - `start_url` (usually `/`)
  - `display: "standalone"`
  - `theme_color`, `background_color`
  - PWA icons (e.g., 192×192 and 512×512)

- Service worker:
  - Either use CRA’s default or a custom `service-worker.js`
  - Caches app shell for faster reloads and basic offline view of UI

***

## Typical Local Development Workflow

1. Start backend:

```bash
cd backend
uvicorn main:app --reload
```

2. Start frontend:

```bash
cd frontend
npm start
```

3. Use the app at `http://localhost:3000`:
   - Upload PDFs/DOCX/PPTX
   - View them under **Documents**
   - Ask questions in **Q&A**
   - Generate summaries in **Summarize**
   - Generate quizzes in **Quiz**

***

## Possible Enhancements

- User authentication and per‑user document spaces  
- Rate limiting and API key management  
- Better error handling and retry logic for LLM calls  
- UI improvements (history, bookmarks, dark mode)  
- Analytics on document usage and question patterns  

You can copy‑paste this README into `README.md` and tweak wording or section titles to match your exact folder names and versions.
