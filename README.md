## LegalEase AI

Modern prototype that simplifies legal documents.

### Tech Stack
- Frontend: React (Vite) + Tailwind CSS, framer-motion, lightweight shadcn-style UI components
- Backend: FastAPI (Python)
- AI: Google Cloud Vertex AI (Gemini/PaLM)
- PDF Parsing: pdfplumber

### Quick Start

Prerequisites:
- Node 18+
- Python 3.10+
- Google Cloud project with Vertex AI API enabled (optional for mock mode)

#### Backend
```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate  # On Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Optional: set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON key
# $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\key.json"

uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Environment
- Backend uses Application Default Credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON or authenticate via `gcloud auth application-default login`.
- A `.env.example` is provided in `backend/`.

### Features
- Upload a PDF → extract text with pdfplumber
- Summarize: 1-liner + 3 bullets
- Clauses: plain-English explanations + risk tags (🟢/🟡/🔴)
- Chat: ask questions about the uploaded document

### Notes
- If credentials are not configured or Vertex AI is unreachable, the backend returns safe mock responses so you can demo the UI.
- In-memory store is used for uploaded document text (prototype only).


