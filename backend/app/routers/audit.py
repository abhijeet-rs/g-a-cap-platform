from datetime import datetime, timezone, timedelta

from fastapi import APIRouter

from app.schemas.audit import AuditEntry, AuditTrailResponse

router = APIRouter(prefix="/csa", tags=["Audit"])

BASE_TIME = datetime(2026, 7, 15, 10, 30, 0, tzinfo=timezone.utc)


def _mock_entries(doc_id: str) -> list[AuditEntry]:
    return [
        AuditEntry(id="aud-001", document_id=doc_id, timestamp=BASE_TIME, actor="Dana Whitfield", action="csa_uploaded", details="CSA document uploaded: AcmeCorp_CSA_2026.pdf (2.4 MB)"),
        AuditEntry(id="aud-002", document_id=doc_id, timestamp=BASE_TIME + timedelta(seconds=5), actor="System", action="parsing_started", details="Document parsing initiated — LlamaParse OCR engine"),
        AuditEntry(id="aud-003", document_id=doc_id, timestamp=BASE_TIME + timedelta(seconds=45), actor="System", action="parsing_complete", details="Parsing complete — 12 pages processed, 6 tables detected"),
        AuditEntry(id="aud-004", document_id=doc_id, timestamp=BASE_TIME + timedelta(seconds=50), actor="System", action="extraction_started", details="Entity extraction initiated — 22 target fields"),
        AuditEntry(id="aud-005", document_id=doc_id, timestamp=BASE_TIME + timedelta(minutes=2, seconds=14), actor="System", action="extraction_complete", details="AI extraction completed — 22 fields extracted, avg confidence 0.93"),
        AuditEntry(id="aud-006", document_id=doc_id, timestamp=BASE_TIME + timedelta(minutes=2, seconds=18), actor="System", action="validation_started", details="Cross-validation initiated against Salesforce, ClientSpace, PrismHR"),
        AuditEntry(id="aud-007", document_id=doc_id, timestamp=BASE_TIME + timedelta(minutes=2, seconds=22), actor="System", action="validation_complete", details="Cross-validation complete — 7 mismatches found (4 errors, 3 warnings)"),
        AuditEntry(id="aud-008", document_id=doc_id, timestamp=BASE_TIME + timedelta(hours=1, minutes=15), actor="Sam Cho", action="mismatch_resolved", details="Admin Fee mismatch resolved: accepted CSA value ($45.00/ee/mo) over Salesforce ($42.00/ee/mo)", metadata={"field": "Admin Fee", "resolution": "accept_csa"}),
        AuditEntry(id="aud-009", document_id=doc_id, timestamp=BASE_TIME + timedelta(hours=1, minutes=18), actor="Sam Cho", action="mismatch_flagged", details="SUTA Coverage flagged for BA review — CSA says 'Full Coverage', ClientSpace says 'Standard'", metadata={"field": "SUTA Coverage", "resolution": "flag_for_review"}),
        AuditEntry(id="aud-010", document_id=doc_id, timestamp=BASE_TIME + timedelta(hours=2, minutes=30), actor="Priya Nair", action="extraction_approved", details="Extraction approved — all critical fields validated, 5 mismatches resolved"),
        AuditEntry(id="aud-011", document_id=doc_id, timestamp=BASE_TIME + timedelta(hours=2, minutes=31), actor="System", action="clientspace_sync_started", details="ClientSpace sync initiated — creating client record and onboarding case"),
        AuditEntry(id="aud-012", document_id=doc_id, timestamp=BASE_TIME + timedelta(hours=2, minutes=33), actor="System", action="clientspace_sync_complete", details="ClientSpace sync complete — Case #CS-2026-0847 created, 5 tasks assigned, 2 documents attached"),
    ]


@router.get("/{doc_id}/audit", response_model=AuditTrailResponse)
async def get_audit_trail(doc_id: str):
    entries = _mock_entries(doc_id)
    return AuditTrailResponse(
        document_id=doc_id,
        entries=entries,
        total_entries=len(entries),
    )
