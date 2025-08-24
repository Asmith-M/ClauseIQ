from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)
    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")

class Clause(Base):
    __tablename__ = "clauses"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    risk = Column(String, nullable=True)
    category = Column(String, nullable=True)
    reason = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    document = relationship("Document", back_populates="clauses")
