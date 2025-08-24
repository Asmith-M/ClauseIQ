# app/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ClauseBase(BaseModel):
    text: str
    risk: Optional[str] = None
    category: Optional[str] = None
    reason: Optional[str] = None
    explanation: Optional[str] = None

class ClauseCreate(ClauseBase):
    pass

class Clause(ClauseBase):
    id: int
    document_id: int

    class Config:
        orm_mode = True

class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    clauses: List[ClauseCreate] = []

class Document(DocumentBase):
    id: int
    upload_time: datetime
    clauses: List[Clause] = []

    class Config:
        orm_mode = True

class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    upload_time: datetime
    message: str
    clauses_count: int
    clauses: List[str] = []  # Add this line to include extracted clauses
