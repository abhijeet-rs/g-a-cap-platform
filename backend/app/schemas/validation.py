from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class ValidationMismatch(BaseModel):
    field_name: str
    csa_value: str
    system_value: str
    system_source: Literal["Salesforce", "ClientSpace", "PrismHR"]
    mismatch_type: Literal["value_difference", "missing_in_system", "missing_in_csa", "format_mismatch"]
    severity: Literal["error", "warning", "info"]
    resolution: Optional[str] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None


class ValidationResult(BaseModel):
    document_id: str
    total_fields_validated: int
    mismatches_found: int
    mismatches: list[ValidationMismatch]
    validation_time_seconds: float
    validated_at: datetime
