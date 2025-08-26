# ClauseIQ Backend ⚙️

**FastAPI-powered Legal Document Processing Engine**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.45.0-003B57?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

The ClauseIQ backend is a high-performance FastAPI application that handles PDF processing, clause extraction, AI analysis, and data persistence for legal document analysis.

## ✨ Features

### 📄 Document Processing
- **PDF Text Extraction**: Robust PDF parsing using PyMuPDF
- **Clause Detection**: Rule-based extraction with legal keyword recognition
- **File Validation**: Secure PDF upload handling with size limits
- **Temporary File Management**: Proper cleanup of uploaded files

### 🤖 AI Integration
- **OpenRouter API**: Integration with Mistral 3.2-24B Instruct model
- **Risk Assessment**: Automatic classification (Low/Medium/High) for legal clauses
- **Category Detection**: Intelligent categorization of legal terms
- **Plain-English Explanations**: AI-generated explanations for non-lawyers
- **Multi-Chunk Processing**: Handling of large clauses with text chunking

### 💾 Data Management
- **SQLite Database**: Lightweight relational database for persistence
- **SQLAlchemy ORM**: Modern database abstraction and management
- **Document Storage**: Persistent storage of analyzed documents
- **Clause History**: Complete history of extracted clauses and analyses

### 🔧 API Endpoints
- **RESTful Design**: Clean, consistent API design patterns
- **OpenAPI Documentation**: Automatic API documentation at `/docs`
- **CORS Support**: Proper cross-origin resource sharing configuration
- **Error Handling**: Comprehensive error responses and validation

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/                 # API route handlers
│   │   ├── ai_analysis.py   # AI clause analysis endpoints
│   │   ├── clause_extraction.py # PDF clause extraction
│   │   ├── document_crud.py # Document CRUD operations
│   │   ├── document_report.py # Document reporting
│   │   ├── full_analysis.py # Complete analysis pipeline
│   │   └── deps.py          # Dependency injections
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic schemas for validation
│   ├── database.py         # Database connection setup
│   ├── config.py           # Application configuration
│   ├── utils.py            # Utility functions and AI helpers
│   ├── middleware.py       # Custom middleware
│   ├── init_db.py          # Database initialization
│   └── main.py            # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── clauseiq.db            # SQLite database (auto-generated)
└── .env                   # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenRouter API account ([Sign up here](https://openrouter.ai/))

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "OPENROUTER_API_KEY=your_api_key_here" > .env

# Initialize database
python -m app.init_db

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Application: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

## 📡 API Reference

### Document Management

#### Upload PDF Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Body:
- filename: string (required)
- file: PDF file (required)
- clauses_data: string (optional, JSON)
```

#### List Documents
```http
GET /api/documents/
```

#### Get Document Clauses
```http
GET /api/documents/{document_id}/clauses
```

### Clause Analysis

#### Extract Clauses from PDF
```http
POST /api/extract-clauses/
Content-Type: multipart/form-data

Body:
- file: PDF file
```

#### Analyze Clause with AI
```http
POST /api/analyze-clause/
Content-Type: application/json

Body:
{
  "clause": "string"
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=sqlite:///./clauseiq.db
```

### Database Configuration
- **SQLite**: Default database for development and production
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations (optional for future use)

### AI Configuration
- **OpenRouter API**: Mistral 3.2-24B Instruct model
- **Temperature**: 0 (deterministic responses)
- **Max Tokens**: Model default with chunking for large texts

## 🛡️ Security Features

### Input Validation
- Pydantic schemas for all request/response models
- File type validation for PDF uploads
- Size limits on file uploads (10MB)

### Error Handling
- Comprehensive exception handling
- Detailed error messages for debugging
- Proper HTTP status codes

### CORS Configuration
- Configured for frontend development server
- Secure cross-origin requests
- Proper headers for API security

## 🧪 Development

### Adding New Endpoints
1. Create new module in `app/api/` directory
2. Define Pydantic schemas in `app/schemas.py`
3. Add router to `app/main.py`
4. Update API documentation with proper docstrings

### Database Operations
- Use SQLAlchemy ORM for all database interactions
- Follow proper session management patterns
- Implement proper error handling and rollbacks

### Testing
```bash
# Run tests (when implemented)
python -m pytest

# Test specific endpoint
curl -X POST http://localhost:8000/api/extract-clauses/ -F "file=@document.pdf"
```

## 📦 Deployment

### Production Setup
```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment variables
export OPENROUTER_API_KEY=your_production_key
export DATABASE_URL=sqlite:///./clauseiq.db

# Start production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deployment Platforms
- **Traditional VPS**: Ubuntu/Debian with systemd service
- **Docker**: Containerized deployment
- **Platform-as-a-Service**: Heroku, Railway, DigitalOcean App Platform

## 📊 Performance

### Optimization Features
- **Async/Await**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections
- **Caching**: Potential for Redis integration
- **Chunk Processing**: Efficient handling of large documents

### Monitoring
- Built-in FastAPI metrics
- Logging for debugging and performance tracking
- Health check endpoints

## 🤝 Contributing

When contributing to the backend:
1. Follow PEP 8 style guidelines
2. Use type hints throughout the codebase
3. Write comprehensive docstrings
4. Test all endpoints thoroughly
5. Update API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI Team** for the excellent web framework
- **OpenRouter** for AI model access and API services
- **PyMuPDF** for robust PDF text extraction
- **SQLAlchemy** for database ORM functionality

---

**ClauseIQ Backend** - Powerful processing for legal document intelligence. ⚖️⚙️
