# app/api/document_crud.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List
import json
import re  # Add this import for regex operations

from app.models import Document as DocumentModel, Clause as ClauseModel
from app.database import SessionLocal
from app.schemas import (
    Document as DocumentSchema,
    DocumentCreate,
    Clause as ClauseSchema,
    ClauseCreate,
    DocumentUploadResponse
)

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------
# Upload Document with File
# ---------------------------
# IMPORTANT: This endpoint expects a multipart/form-data request with the following fields:
# - filename: string (required) - The name of the file
# - file: UploadFile (required) - The actual file content
# - clauses_data: string (optional) - JSON string containing pre-extracted clauses
#
# Client-side JavaScript example:
# const formData = new FormData();
# formData.append("filename", file.name);
# formData.append("file", file);
# // Optional: formData.append("clauses_data", JSON.stringify(clauses));
# 
# fetch("/api/documents/upload", {
#   method: "POST",
#   body: formData,
# });
@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    filename: str = Form(...),
    file: UploadFile = File(...),
    clauses_data: str = Form(None),
    db: Session = Depends(get_db)
):
    print(f"Received file upload: {filename}, clauses_data: {clauses_data}")  # Logging incoming data
    try:
        # Read file content for clause extraction
        file_content = await file.read()
        
        # Reset file pointer for potential re-reading
        await file.seek(0)

        # Create document record
        db_doc = DocumentModel(filename=filename)
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        # Extract clauses from the uploaded file
        extracted_clauses = []
        try:
            # Use the clause extraction logic
            import tempfile
            import fitz  # PyMuPDF
            
            # Save uploaded PDF to a temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_content)
                tmp_path = tmp.name
            
            # Extract text from PDF using PyMuPDF
            doc = fitz.open(tmp_path)
            text = "\n".join(page.get_text() for page in doc)
            doc.close()
            
            # Simple clause extraction logic
            lines = [line.strip() for line in text.splitlines()]
            filtered = []
            seen = set()
            ignore_patterns = [
                r"^Page \d+$",
                r"^Signed by:.*",
                r"^Date:.*",
                r"^\s*Confidential\s*$",
                r"^\s*Exhibit\s+[A-Z]+\s*$",
                r"^\s*Table of Contents\s*$",
                r"^\s*\d+\s*$",  # page numbers
            ]
            
            for line in lines:
                if len(line) < 10:
                    continue
                if line.isupper():
                    continue
                if any(re.match(pat, line, re.IGNORECASE) for pat in ignore_patterns):
                    continue
                if line in seen:
                    continue
                seen.add(line)
                filtered.append(line)
            
            # Group lines into clauses
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
            
            if not clauses:
                clauses = filtered
            
            # Remove clauses that are just headers/footers or too short
            extracted_clauses = [c for c in clauses if len(c) > 20 and not c.isupper()]
            
        except Exception as e:
            print(f"Clause extraction failed: {str(e)}")
            extracted_clauses = []

        # Process clauses if provided or use extracted clauses
        clauses_count = 0
        clauses_to_process = []
        
        if clauses_data:
            try:
                clauses_to_process = json.loads(clauses_data)
            except json.JSONDecodeError:
                clauses_to_process = extracted_clauses
        else:
            clauses_to_process = extracted_clauses

        # Save clauses to database
        for clause_data in clauses_to_process:
            if isinstance(clause_data, dict):
                # Already processed clause with metadata
                db_clause = ClauseModel(
                    text=clause_data.get('text', ''),
                    risk=clause_data.get('risk'),
                    category=clause_data.get('category'),
                    reason=clause_data.get('reason'),
                    explanation=clause_data.get('explanation'),
                    document_id=db_doc.id
                )
            else:
                # Raw clause text
                db_clause = ClauseModel(
                    text=clause_data,
                    document_id=db_doc.id
                )
            db.add(db_clause)
            clauses_count += 1
        
        db.commit()

        print(f"File uploaded successfully with {clauses_count} clauses")  # Logging successful upload
        return DocumentUploadResponse(
            id=db_doc.id,
            filename=filename,
            upload_time=db_doc.upload_time,
            message="Document uploaded successfully",
            clauses_count=clauses_count,
            clauses=extracted_clauses  # Return extracted clauses for frontend
        )

    except Exception as e:
        db.rollback()
        print(f"Upload error: {str(e)}")  # Logging error
        raise HTTPException(status_code=500, detail="An error occurred while processing the document upload.")


# ---------------------------
# Create Document with JSON
# ---------------------------
@router.post("/documents/", response_model=DocumentSchema)
def create_document(doc: DocumentCreate, db: Session = Depends(get_db)):
    db_doc = DocumentModel(filename=doc.filename)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    for clause in doc.clauses:
        db_clause = ClauseModel(
            text=clause.text,
            risk=clause.risk,
            category=clause.category,
            reason=clause.reason,
            explanation=clause.explanation,
            document_id=db_doc.id
        )
        db.add(db_clause)

    db.commit()
    db.refresh(db_doc)
    return db_doc


# ---------------------------
# List Documents
# ---------------------------
@router.get("/documents/", response_model=List[DocumentSchema])
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db)
):
    return db.query(DocumentModel).offset(skip).limit(limit).all()


# ---------------------------
# Get Clauses for a Document
# ---------------------------
@router.get("/documents/{doc_id}/clauses/", response_model=List[ClauseSchema])
def get_clauses_for_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.clauses