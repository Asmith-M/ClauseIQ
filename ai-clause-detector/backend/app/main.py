from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from .api import deps
from .api import clause_extraction
from .api import ai_analysis
from .api import document_crud
from .api import full_analysis
from .api import document_report

from .middleware import CORSMiddlewareWithCOOP

app = FastAPI()

# Load environment variables from .env in development
load_dotenv()

# Read allowed origins from environment (comma-separated). Defaults to localhost Vite dev port and the deployed Vercel app.
raw_allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,https://clause-iq.vercel.app"
)
# Build list and filter out empty values
allow_origins = [o.strip() for o in raw_allowed_origins.split(",") if o.strip()]

# If you intentionally want to allow all origins in a non-credentialed context, set ALLOWED_ORIGINS="*" (not recommended with credentials).
if allow_origins == ["*"]:
    allow_origins = ["*"]
# Custom exception handler for UnicodeDecodeError
@app.exception_handler(UnicodeDecodeError)
async def unicode_decode_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid data format. Please ensure the data is properly encoded."},
    )

# Custom exception handler for RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    # Convert any bytes in error details to strings to avoid JSON serialization issues
    errors = []
    for error in exc.errors():
        error_copy = {}
        # Handle any bytes data that might be in the error details
        for key, value in error.items():
            if isinstance(value, bytes):
                try:
                    error_copy[key] = value.decode('utf-8', errors='replace')
                except:
                    error_copy[key] = "[binary data]"
            else:
                error_copy[key] = value
        errors.append(error_copy)
    
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

# Add CORS middleware to allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)

# Add COOP and COEP headers middleware
app.add_middleware(CORSMiddlewareWithCOOP)

# Register routers
app.include_router(deps.router, prefix="/api")
app.include_router(clause_extraction.router, prefix="/api")
app.include_router(ai_analysis.router, prefix="/api")
app.include_router(document_crud.router, prefix="/api")  # merged upload + CRUD
app.include_router(full_analysis.router, prefix="/api")
app.include_router(document_report.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.get("/health")
def health_check():
    """Health check endpoint for connectivity testing"""
    return {"status": "healthy", "service": "clause-iq-backend"}
