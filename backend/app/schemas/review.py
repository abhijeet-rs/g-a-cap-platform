from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class ApproveRequest(BaseModel):
    reviewer_name: str
    reviewer_email: str
    notes: Optional[str] = None


class RejectRequest(BaseModel):
    reviewer_name: str
    reason: str
    fields_to_correct: list[str]


class ReviewResponse(BaseModel):
    document_id: str
    action: Literal["approved", "rejected"]
    status: str
    timestamp: datetime
    reviewer: str


class HandoffPayload(BaseModel):
    document_id: str
    client_data: dict
    onboarding_case_id: str
    tasks_created: int
    documents_attached: int
    handoff_timestamp: datetime
    clientspace_sync_status: str
