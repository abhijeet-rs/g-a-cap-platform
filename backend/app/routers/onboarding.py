from fastapi import APIRouter

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/dashboard")
async def get_dashboard():
    return {
        "metrics": {
            "active_extractions": 3,
            "pending_validation": 2,
            "approved_this_week": 8,
            "avg_confidence": 94.2,
            "total_documents": 47,
            "mismatches_resolved": 31,
        },
        "recent_extractions": [
            {"doc_id": "doc-001", "client_alias": "Acme Corp", "status": "complete", "confidence": 0.94, "extracted_at": "2026-07-15T10:32:14Z", "reviewer": "Sam Cho", "fields_extracted": 22},
            {"doc_id": "doc-002", "client_alias": "TechStart LLC", "status": "validating", "confidence": 0.89, "extracted_at": "2026-07-15T09:15:00Z", "reviewer": "Lena Ortiz", "fields_extracted": 20},
            {"doc_id": "doc-003", "client_alias": "Summit Services Inc", "status": "in_review", "confidence": 0.91, "extracted_at": "2026-07-14T16:45:00Z", "reviewer": "Sam Cho", "fields_extracted": 21},
            {"doc_id": "doc-004", "client_alias": "Meridian Group", "status": "approved", "confidence": 0.96, "extracted_at": "2026-07-14T11:20:00Z", "reviewer": "Priya Nair", "fields_extracted": 22},
            {"doc_id": "doc-005", "client_alias": "Pinnacle Staffing", "status": "approved", "confidence": 0.93, "extracted_at": "2026-07-13T14:30:00Z", "reviewer": "Sam Cho", "fields_extracted": 19},
        ],
    }
