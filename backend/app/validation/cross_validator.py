from app.validation.salesforce_validator import salesforce_validator
from app.validation.clientspace_validator import clientspace_validator
from app.validation.prismhr_validator import prismhr_validator


class CrossValidator:
    """Orchestrates validation across all source systems."""

    def __init__(self):
        self.validators = [
            salesforce_validator,
            clientspace_validator,
            prismhr_validator,
        ]

    def validate_all(self, extracted_fields: dict[str, str]) -> list[dict]:
        all_mismatches = []
        for validator in self.validators:
            mismatches = validator.validate(extracted_fields)
            all_mismatches.extend(mismatches)
        return all_mismatches

    def get_validation_summary(self, mismatches: list[dict]) -> dict:
        errors = sum(1 for m in mismatches if m.get("severity") == "error")
        warnings = sum(1 for m in mismatches if m.get("severity") == "warning")
        sources = set(m.get("system_source", "") for m in mismatches)
        return {
            "total_mismatches": len(mismatches),
            "errors": errors,
            "warnings": warnings,
            "systems_with_issues": list(sources),
            "requires_human_review": errors > 0,
        }


cross_validator = CrossValidator()
