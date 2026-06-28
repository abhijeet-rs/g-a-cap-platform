from datetime import datetime, timezone

from app.schemas.validation import ValidationMismatch, ValidationResult
from app.integrations.mock_salesforce import SALESFORCE_DATA
from app.integrations.mock_clientspace import CLIENTSPACE_DATA
from app.integrations.mock_prismhr import PRISMHR_DATA


class ValidationService:
    def validate_extraction(self, document_id: str, extracted_fields: dict[str, str]) -> ValidationResult:
        mismatches: list[ValidationMismatch] = []

        sf_checks = [
            ("Admin Fee", "admin_fee", "Salesforce"),
            ("Services Included", "services", "Salesforce"),
            ("Tax Classification", "tax_classification", "Salesforce"),
        ]
        for field_name, sf_key, source in sf_checks:
            csa_val = extracted_fields.get(field_name, "")
            sf_val = SALESFORCE_DATA.get(sf_key, "")
            if csa_val and sf_val and csa_val != sf_val:
                severity = "error" if field_name in ("Admin Fee", "Tax Classification") else "warning"
                mismatches.append(ValidationMismatch(
                    field_name=field_name,
                    csa_value=csa_val,
                    system_value=sf_val,
                    system_source="Salesforce",
                    mismatch_type="value_difference",
                    severity=severity,
                ))

        cs_checks = [
            ("SUTA Coverage", "suta_coverage", "ClientSpace"),
            ("Effective Date", "effective_date", "ClientSpace"),
            ("Billing Frequency", "billing_frequency", "ClientSpace"),
        ]
        for field_name, cs_key, source in cs_checks:
            csa_val = extracted_fields.get(field_name, "")
            cs_val = CLIENTSPACE_DATA.get(cs_key, "")
            if csa_val and cs_val and csa_val != cs_val:
                severity = "error" if field_name in ("SUTA Coverage", "Effective Date") else "warning"
                mismatches.append(ValidationMismatch(
                    field_name=field_name,
                    csa_value=csa_val,
                    system_value=cs_val,
                    system_source="ClientSpace",
                    mismatch_type="value_difference",
                    severity=severity,
                ))

        prism_checks = [("Employee Count", "employee_count", "PrismHR")]
        for field_name, pk, source in prism_checks:
            csa_val = extracted_fields.get(field_name, "")
            p_val = PRISMHR_DATA.get(pk, "")
            if csa_val and p_val and csa_val != p_val:
                mismatches.append(ValidationMismatch(
                    field_name=field_name,
                    csa_value=csa_val,
                    system_value=p_val,
                    system_source="PrismHR",
                    mismatch_type="value_difference",
                    severity="warning",
                ))

        return ValidationResult(
            document_id=document_id,
            total_fields_validated=len(extracted_fields),
            mismatches_found=len(mismatches),
            mismatches=mismatches,
            validation_time_seconds=3.8,
            validated_at=datetime.now(timezone.utc),
        )


validation_service = ValidationService()
