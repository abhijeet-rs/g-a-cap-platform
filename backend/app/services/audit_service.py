import uuid
from datetime import datetime, timezone

from app.schemas.audit import AuditEntry


class AuditService:
    def __init__(self):
        self._entries: list[AuditEntry] = []

    def log(self, document_id: str, actor: str, action: str, details: str, metadata: dict | None = None) -> AuditEntry:
        entry = AuditEntry(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            document_id=document_id,
            timestamp=datetime.now(timezone.utc),
            actor=actor,
            action=action,
            details=details,
            metadata=metadata,
        )
        self._entries.append(entry)
        return entry

    def get_entries(self, document_id: str) -> list[AuditEntry]:
        return [e for e in self._entries if e.document_id == document_id]

    def get_all_entries(self) -> list[AuditEntry]:
        return list(self._entries)


audit_service = AuditService()
