from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .api import deps
from .api import clause_extraction
from .api import ai_analysis
from .api import document_crud
from .api import full_analysis
from .api import document_report

from .middleware import CORSMiddlewareWithCOOP

app = FastAPI()

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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
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