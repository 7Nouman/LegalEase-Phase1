from __future__ import annotations

import os
import io
import uuid
from typing import List, Dict, Any

import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from vertex_helper import VertexClient
from utils import split_into_clauses, simple_retrieve_context


class SummarizeRequest(BaseModel):
    doc_id: str


class ClausesRequest(BaseModel):
    doc_id: str


class QARequest(BaseModel):
    doc_id: str
    question: str


app = FastAPI(title="LegalEase AI", version="0.1.0")


_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
if _origins_env.strip() == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed_origins = [origin.strip() for origin in _origins_env.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# In-memory document store for prototype
DOC_STORE: Dict[str, str] = {}

vertex_client = VertexClient()


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "service": "LegalEase AI"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages_text: List[str] = []
            for page in pdf.pages:
                text = page.extract_text() or ""
                pages_text.append(text)
            full_text = "\n\n".join(pages_text).strip()
    except Exception as exc:  # noqa: BLE001 (prototype)
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {exc}")

    if not full_text:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF")

    doc_id = str(uuid.uuid4())
    DOC_STORE[doc_id] = full_text
    return {"doc_id": doc_id, "text_length": len(full_text)}


@app.post("/summarize")
async def summarize(req: SummarizeRequest) -> Dict[str, Any]:
    text = DOC_STORE.get(req.doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document not found")

    prompt = (
        "Summarize this legal document in simple English: "
        "1-liner + 3 bullets.\n\n" + text
    )
    result = await vertex_client.generate_text(prompt)

    return {"summary": result}


@app.post("/clauses")
async def clauses(req: ClausesRequest) -> Dict[str, Any]:
    text = DOC_STORE.get(req.doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = split_into_clauses(text)
    explanations = []
    for clause in chunks:
        prompt = (
            "Explain this clause in plain English. Mark 🟢 Safe / 🟡 Caution / 🔴 Risky "
            "and explain why.\n\nClause:\n" + clause
        )
        result = await vertex_client.generate_text(prompt)
        explanations.append({"clause": clause, "analysis": result})

    return {"clauses": explanations}


@app.post("/qa")
async def qa(req: QARequest) -> Dict[str, Any]:
    text = DOC_STORE.get(req.doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Document not found")

    context = simple_retrieve_context(text, req.question)
    prompt = (
        "Given this excerpt, answer clearly. If unsure, say ‘Consult a lawyer.’\n\n"
        f"Excerpt:\n{context}\n\nQuestion: {req.question}\nAnswer:"
    )
    result = await vertex_client.generate_text(prompt)
    return {"answer": result, "context": context}


