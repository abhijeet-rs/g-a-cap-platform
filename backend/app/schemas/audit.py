from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditEntry(BaseModel):
    id: str
    document_id: str
    timestamp: datetime
    actor: str
    action: str
    details: str
    metadata: Optional[dict] = None


class AuditTrailResponse(BaseModel):
    document_id: str
    entries: list[AuditEntry]
    total_entries: int
