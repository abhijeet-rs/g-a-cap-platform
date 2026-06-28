from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class ClientCreateRequest(BaseModel):
    client_name: str
    fein: str
    effective_date: str
    admin_fee: float
    services: list[str]
    suta_coverage: str
    term_months: int
    state_registrations: list[str] = []
    employee_count: int = 0


class ClientCreateResponse(BaseModel):
    client_id: str
    status: str = "created"
    created_at: datetime


class CaseCreateRequest(BaseModel):
    client_id: str
    case_type: str = "onboarding"
    title: str
    description: str
    assigned_to: str
    priority: Literal["low", "medium", "high", "critical"] = "high"


class CaseCreateResponse(BaseModel):
    case_id: str
    client_id: str
    status: str = "open"
    created_at: datetime


class TaskCreateRequest(BaseModel):
    case_id: str
    title: str
    assigned_to: str
    due_date: str
    priority: Literal["low", "medium", "high"] = "medium"
    description: Optional[str] = None


class TaskCreateResponse(BaseModel):
    task_id: str
    case_id: str
    status: str = "pending"
    created_at: datetime


class DocumentUploadRequest(BaseModel):
    case_id: str
    document_name: str
    document_type: str
    file_size_bytes: int


class CaseStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "review", "approved", "closed"]


class ActivityLogRequest(BaseModel):
    case_id: str
    activity_type: str
    description: str
    actor: str


class ReferenceData(BaseModel):
    service_codes: list[dict]
    suta_types: list[str]
    wc_code_ranges: list[str]
    case_statuses: list[str]
    priorities: list[str]
    case_types: list[str]
