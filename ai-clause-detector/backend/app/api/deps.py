# deps.py
# Dependency injection utilities for FastAPI routes

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
import spacy
import tempfile

router = APIRouter()

# Load spaCy model (English)
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    nlp = None

@router.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save uploaded PDF to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Extract text from PDF using PyMuPDF
    try:
        doc = fitz.open(tmp_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

    # Use spaCy to split text into clauses (sentences)
    if not nlp:
        raise HTTPException(status_code=500, detail="spaCy model not loaded.")
    doc_spacy = nlp(text)
    clauses = [sent.text.strip() for sent in doc_spacy.sents if sent.text.strip()]

    return JSONResponse(content={"clauses": clauses})
