from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class CSAUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str = "queued"
    uploaded_at: datetime
    file_size_bytes: int


class CSAStatus(BaseModel):
    document_id: str
    status: Literal["queued", "parsing", "extracting", "validating", "complete", "failed"]
    progress_pct: int = Field(ge=0, le=100)
    current_step: str
    steps_completed: int
    total_steps: int = 6
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class ExtractedField(BaseModel):
    field_name: str
    field_value: str
    confidence: float = Field(ge=0.0, le=1.0)
    source_citation: str
    category: str
    requires_review: bool = False
    is_masked: bool = False
    page_number: int = 1
    source_text: str = ""
    bounding_box: Optional[BoundingBox] = None


class CSAExtractionResult(BaseModel):
    document_id: str
    status: str
    extracted_fields: list[ExtractedField]
    total_fields: int
    avg_confidence: float
    extraction_time_seconds: float
    extracted_at: datetime
