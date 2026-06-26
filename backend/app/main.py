import logging
import os

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db, insert_document, list_documents
from app.routers import csa, validation, review, audit, eval as eval_router, clientspace, onboarding

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


SEED_DOCUMENTS = [
    {"id": "CSA-2026-0847", "client_name": "Acme Corp", "filename": "CSA-2026-0847.pdf", "uploaded_by": "Dana Whitfield", "upload_date": "2026-06-24", "extraction_status": "needs_review", "validation_status": "completed", "cross_val_status": "mismatches_found", "confidence": 0.94, "assigned_reviewer": "Sam Cho", "persona": "ba", "field_count": 22, "mismatch_count": 4},
    {"id": "CSA-2026-0851", "client_name": "TechStart LLC", "filename": "CSA-2026-0851.pdf", "uploaded_by": "Marcus Reyes", "upload_date": "2026-06-25", "extraction_status": "needs_review", "validation_status": "not_started", "cross_val_status": "pending", "confidence": 0.89, "assigned_reviewer": "Lena Ortiz", "persona": "pm", "field_count": 20, "mismatch_count": 2},
    {"id": "CSA-2026-0839", "client_name": "Summit Services Inc", "filename": "CSA-2026-0839.pdf", "uploaded_by": "Lena Ortiz", "upload_date": "2026-06-22", "extraction_status": "approved", "validation_status": "completed", "cross_val_status": "passed", "confidence": 0.97, "assigned_reviewer": "Priya Nair", "persona": "ops", "field_count": 22, "mismatch_count": 0},
    {"id": "CSA-2026-0842", "client_name": "Greenfield Partners", "filename": "CSA-2026-0842.pdf", "uploaded_by": "Sam Cho", "upload_date": "2026-06-21", "extraction_status": "approved", "validation_status": "completed", "cross_val_status": "passed", "confidence": 0.92, "assigned_reviewer": "Sam Cho", "persona": "ba", "field_count": 21, "mismatch_count": 1},
    {"id": "CSA-2026-0845", "client_name": "Horizon Manufacturing", "filename": "CSA-2026-0845.pdf", "uploaded_by": "Dana Whitfield", "upload_date": "2026-06-23", "extraction_status": "flagged", "validation_status": "needs_review", "cross_val_status": "mismatches_found", "confidence": 0.71, "assigned_reviewer": "Dana Whitfield", "persona": "pm", "field_count": 18, "mismatch_count": 6},
    {"id": "CSA-2026-0850", "client_name": "BrightPath Solutions", "filename": "CSA-2026-0850.pdf", "uploaded_by": "Priya Nair", "upload_date": "2026-06-20", "extraction_status": "approved", "validation_status": "completed", "cross_val_status": "passed", "confidence": 0.96, "assigned_reviewer": "Priya Nair", "persona": "reviewer", "field_count": 22, "mismatch_count": 0},
    {"id": "CSA-2026-0848", "client_name": "Atlas Logistics", "filename": "CSA-2026-0848.pdf", "uploaded_by": "Marcus Reyes", "upload_date": "2026-06-25", "extraction_status": "needs_review", "validation_status": "not_started", "cross_val_status": "pending", "confidence": 0.87, "assigned_reviewer": "Sam Cho", "persona": "pm", "field_count": 19, "mismatch_count": 3},
    {"id": "CSA-2026-0844", "client_name": "Pinnacle Staffing", "filename": "CSA-2026-0844.pdf", "uploaded_by": "Sam Cho", "upload_date": "2026-06-19", "extraction_status": "approved", "validation_status": "completed", "cross_val_status": "passed", "confidence": 0.95, "assigned_reviewer": "Sam Cho", "persona": "ba", "field_count": 22, "mismatch_count": 0},
]


def _seed_if_empty() -> None:
    """Insert seed documents only when the table is empty."""
    from datetime import datetime, timezone

    existing = list_documents()
    if existing:
        logger.info("Database already has %d documents; skipping seed.", len(existing))
        return

    now_iso = datetime.now(timezone.utc).isoformat()
    for doc in SEED_DOCUMENTS:
        doc_copy = {**doc, "last_modified": now_iso}
        insert_document(doc_copy)
    logger.info("Seeded %d initial CSA documents.", len(SEED_DOCUMENTS))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("Upload directory ready: %s", settings.UPLOAD_DIR)
    logger.info("LlamaParse API key configured: %s", "Yes" if settings.LLAMAPARSE_API_KEY else "No")

    # Initialize SQLite database and seed if empty
    init_db()
    logger.info("SQLite database initialized.")
    _seed_if_empty()

    yield
    # Shutdown: nothing to clean up


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Assisted CSA Extraction & Cross-Validation API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(csa.router, prefix=settings.API_PREFIX)
app.include_router(validation.router, prefix=settings.API_PREFIX)
app.include_router(review.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(eval_router.router, prefix=settings.API_PREFIX)
app.include_router(clientspace.router, prefix=settings.API_PREFIX)
app.include_router(onboarding.router, prefix=settings.API_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME, "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "csa": "/api/csa",
            "csa_upload_and_extract": "/api/csa/upload-and-extract",
            "validation": "/api/csa/{doc_id}/validate",
            "review": "/api/csa/{doc_id}/approve",
            "audit": "/api/csa/{doc_id}/audit",
            "eval": "/api/csa/{doc_id}/eval",
            "clientspace": "/api/mock/clientspace",
            "onboarding": "/api/onboarding",
        },
    }
