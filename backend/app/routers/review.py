from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.review import ApproveRequest, RejectRequest, ReviewResponse, HandoffPayload

router = APIRouter(prefix="/csa", tags=["Review"])


@router.post("/{doc_id}/approve", response_model=ReviewResponse)
async def approve_extraction(doc_id: str, req: ApproveRequest):
    return ReviewResponse(
        document_id=doc_id,
        action="approved",
        status="approved_pending_sync",
        timestamp=datetime.now(timezone.utc),
        reviewer=req.reviewer_name,
    )


@router.post("/{doc_id}/reject", response_model=ReviewResponse)
async def reject_extraction(doc_id: str, req: RejectRequest):
    return ReviewResponse(
        document_id=doc_id,
        action="rejected",
        status="correction_required",
        timestamp=datetime.now(timezone.utc),
        reviewer=req.reviewer_name,
    )


@router.post("/{doc_id}/handoff", response_model=HandoffPayload)
async def generate_handoff(doc_id: str):
    return HandoffPayload(
        document_id=doc_id,
        client_data={
            "client_name": "Acme Corp",
            "fein": "XX-XXX4521",
            "effective_date": "08/01/2026",
            "admin_fee": 45.00,
            "services": ["Payroll Processing", "Tax Filing", "Time & Attendance", "HR Advisory", "Workers Comp Admin"],
            "suta_coverage": "Full Coverage - All States",
            "wc_codes": ["8810", "8742", "5191"],
            "employee_count": 127,
            "state_registrations": ["TX", "CA", "FL", "NY"],
            "term_months": 36,
            "billing_frequency": "Semi-monthly",
            "payment_terms": "Net 30",
        },
        onboarding_case_id="CS-2026-0847",
        tasks_created=5,
        documents_attached=2,
        handoff_timestamp=datetime.now(timezone.utc),
        clientspace_sync_status="synced",
    )
