import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.clientspace import (
    ClientCreateRequest, ClientCreateResponse,
    CaseCreateRequest, CaseCreateResponse,
    TaskCreateRequest, TaskCreateResponse,
    DocumentUploadRequest, CaseStatusUpdate,
    ActivityLogRequest, ReferenceData,
)

router = APIRouter(prefix="/mock/clientspace", tags=["ClientSpace Mock"])


@router.get("/reference-data", response_model=ReferenceData)
async def get_reference_data():
    return ReferenceData(
        service_codes=[
            {"code": "PY-001", "name": "Payroll Processing"},
            {"code": "TX-001", "name": "Tax Filing"},
            {"code": "TA-001", "name": "Time & Attendance"},
            {"code": "HR-001", "name": "HR Advisory"},
            {"code": "WC-001", "name": "Workers Comp Admin"},
            {"code": "BA-001", "name": "Benefits Administration"},
            {"code": "CB-001", "name": "COBRA Administration"},
            {"code": "RK-001", "name": "401k Administration"},
        ],
        suta_types=["Full Coverage", "Standard Coverage", "Client-Managed", "Split Coverage"],
        wc_code_ranges=["8810 - Clerical", "8742 - Sales", "5191 - Office Machine Install", "8832 - Restaurant", "9015 - Building Operations"],
        case_statuses=["pending", "in_progress", "review", "approved", "closed"],
        priorities=["low", "medium", "high", "critical"],
        case_types=["onboarding", "renewal", "amendment", "termination"],
    )


@router.post("/clients", response_model=ClientCreateResponse)
async def create_client(req: ClientCreateRequest):
    return ClientCreateResponse(
        client_id=f"CLI-{uuid.uuid4().hex[:8].upper()}",
        status="created",
        created_at=datetime.now(timezone.utc),
    )


@router.post("/cases", response_model=CaseCreateResponse)
async def create_case(req: CaseCreateRequest):
    return CaseCreateResponse(
        case_id=f"CS-2026-{uuid.uuid4().hex[:4].upper()}",
        client_id=req.client_id,
        status="open",
        created_at=datetime.now(timezone.utc),
    )


@router.post("/tasks", response_model=TaskCreateResponse)
async def create_task(req: TaskCreateRequest):
    return TaskCreateResponse(
        task_id=f"TSK-{uuid.uuid4().hex[:6].upper()}",
        case_id=req.case_id,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )


@router.post("/documents")
async def upload_document(req: DocumentUploadRequest):
    return {
        "document_id": f"DOC-{uuid.uuid4().hex[:6].upper()}",
        "case_id": req.case_id,
        "document_name": req.document_name,
        "status": "attached",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }


@router.patch("/cases/{case_id}/status")
async def update_case_status(case_id: str, update: CaseStatusUpdate):
    return {
        "case_id": case_id,
        "previous_status": "in_progress",
        "new_status": update.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/activities")
async def log_activity(req: ActivityLogRequest):
    return {
        "activity_id": f"ACT-{uuid.uuid4().hex[:6].upper()}",
        "case_id": req.case_id,
        "activity_type": req.activity_type,
        "actor": req.actor,
        "logged_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/cases/{case_id}")
async def get_case(case_id: str):
    return {
        "case_id": case_id,
        "client_id": "CLI-3A8F2B1C",
        "client_name": "Acme Corp",
        "case_type": "onboarding",
        "status": "in_progress",
        "title": "New Client Onboarding - Acme Corp",
        "assigned_to": "Dana Whitfield",
        "priority": "high",
        "created_at": "2026-07-15T12:33:00Z",
        "tasks": [
            {"task_id": "TSK-001", "title": "Review CSA extraction results", "status": "completed", "assigned_to": "Sam Cho"},
            {"task_id": "TSK-002", "title": "Resolve SUTA coverage mismatch", "status": "in_progress", "assigned_to": "Sam Cho"},
            {"task_id": "TSK-003", "title": "Verify Tax Classification with Sales", "status": "pending", "assigned_to": "Marcus Reyes"},
            {"task_id": "TSK-004", "title": "Configure PrismHR billing rules", "status": "pending", "assigned_to": "Lena Ortiz"},
            {"task_id": "TSK-005", "title": "Schedule client kickoff meeting", "status": "pending", "assigned_to": "Dana Whitfield"},
        ],
        "documents": [
            {"doc_id": "DOC-CSA01", "name": "Acme_Corp_CSA_2026.pdf", "type": "csa_original"},
            {"doc_id": "DOC-EXT01", "name": "Extraction_Summary_Acme.pdf", "type": "extraction_report"},
        ],
    }
