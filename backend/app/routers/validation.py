from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.validation import ValidationMismatch, ValidationResult

router = APIRouter(prefix="/csa", tags=["Validation"])

MOCK_MISMATCHES: list[dict] = [
    {
        "field_name": "Admin Fee",
        "csa_value": "$45.00/employee/month",
        "system_value": "$42.00/employee/month",
        "system_source": "Salesforce",
        "mismatch_type": "value_difference",
        "severity": "error",
    },
    {
        "field_name": "SUTA Coverage",
        "csa_value": "Full Coverage - All States",
        "system_value": "Standard Coverage",
        "system_source": "ClientSpace",
        "mismatch_type": "value_difference",
        "severity": "error",
    },
    {
        "field_name": "Effective Date",
        "csa_value": "08/01/2026",
        "system_value": "07/01/2026",
        "system_source": "ClientSpace",
        "mismatch_type": "value_difference",
        "severity": "error",
    },
    {
        "field_name": "Services Included",
        "csa_value": "Payroll Processing, Tax Filing, Time & Attendance, HR Advisory, Workers Comp Admin",
        "system_value": "Payroll Processing, Tax Filing, HR Advisory, Workers Comp Admin",
        "system_source": "Salesforce",
        "mismatch_type": "missing_in_system",
        "severity": "warning",
    },
    {
        "field_name": "Employee Count",
        "csa_value": "127",
        "system_value": "124",
        "system_source": "PrismHR",
        "mismatch_type": "value_difference",
        "severity": "warning",
    },
    {
        "field_name": "Billing Frequency",
        "csa_value": "Semi-monthly",
        "system_value": "Bi-weekly",
        "system_source": "ClientSpace",
        "mismatch_type": "value_difference",
        "severity": "warning",
    },
    {
        "field_name": "Tax Classification",
        "csa_value": "S-Corporation",
        "system_value": "LLC",
        "system_source": "Salesforce",
        "mismatch_type": "value_difference",
        "severity": "error",
    },
]


@router.post("/{doc_id}/validate", response_model=ValidationResult)
async def run_validation(doc_id: str):
    mismatches = [ValidationMismatch(**m) for m in MOCK_MISMATCHES]
    return ValidationResult(
        document_id=doc_id,
        total_fields_validated=22,
        mismatches_found=len(mismatches),
        mismatches=mismatches,
        validation_time_seconds=3.8,
        validated_at=datetime.now(timezone.utc),
    )


@router.get("/{doc_id}/mismatches", response_model=ValidationResult)
async def get_mismatches(doc_id: str):
    mismatches = [ValidationMismatch(**m) for m in MOCK_MISMATCHES]
    return ValidationResult(
        document_id=doc_id,
        total_fields_validated=22,
        mismatches_found=len(mismatches),
        mismatches=mismatches,
        validation_time_seconds=3.8,
        validated_at=datetime(2026, 7, 15, 10, 32, 18, tzinfo=timezone.utc),
    )
