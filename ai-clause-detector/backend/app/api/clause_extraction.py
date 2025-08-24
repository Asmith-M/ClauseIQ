# clause_extraction.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
import tempfile
import re

router = APIRouter()

LEGAL_KEYWORDS = [
    r"WHEREAS", r"NOW THEREFORE", r"IT IS AGREED", r"FURTHERMORE", r"IN WITNESS WHEREOF"
]

# Simple rule-based clause splitter (case-insensitive)
CLAUSE_SPLIT_REGEX = re.compile(
    r"(?<=\.)\s+|\n+|" + "|".join(LEGAL_KEYWORDS),
    re.IGNORECASE
)

@router.post("/extract-clauses/")
async def extract_clauses(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    # Save uploaded PDF to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    print(f"Loading file from: {tmp_path}")  # Logging file path
    # Extract text from PDF using PyMuPDF
    try:
        doc = fitz.open(tmp_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

    # Split text into lines
    lines = [line.strip() for line in text.splitlines()]
    print(f"Extracted raw text: {text[:200]}")  # Logging extracted text

    # Filtering rules (improved for legal docs)
    filtered = []
    seen = set()
    ignore_patterns = [
        re.compile(r"^Page \d+$", re.IGNORECASE),
        re.compile(r"^Signed by:.*", re.IGNORECASE),
        re.compile(r"^Date:.*", re.IGNORECASE),
        re.compile(r"^\s*Confidential\s*$", re.IGNORECASE),
        re.compile(r"^\s*Exhibit\s+[A-Z]+\s*$", re.IGNORECASE),
        re.compile(r"^\s*Table of Contents\s*$", re.IGNORECASE),
        re.compile(r"^\s*\d+\s*$"),  # page numbers
    ]
    for line in lines:
        if len(line) < 10:
            continue
        if line.isupper():
            continue
        if any(pat.match(line) for pat in ignore_patterns):
            continue
        if line in seen:
            continue
        seen.add(line)
        filtered.append(line)

    # Improved: Group lines into clauses by double newlines or legal keywords
    clauses = []
    current = []
    for line in filtered:
        if line == "" or any(kw.lower() in line.lower() for kw in ["whereas", "now therefore", "it is agreed", "furthermore", "in witness whereof"]):
            if current:
                clause = " ".join(current).strip()
                if clause:
                    clauses.append(clause)
                current = []
        else:
            current.append(line)
    if current:
        clause = " ".join(current).strip()
        if clause:
            clauses.append(clause)

    # Fallback: If no paragraphs found, use filtered lines
    if not clauses:
        clauses = filtered

    # Remove clauses that are just headers/footers or too short
    clauses = [c for c in clauses if len(c) > 20 and not c.isupper()]

    return JSONResponse(content={"clauses": clauses})
