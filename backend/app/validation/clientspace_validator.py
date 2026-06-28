from app.integrations.mock_clientspace import CLIENTSPACE_DATA


class ClientSpaceValidator:
    """Validates extracted CSA fields against ClientSpace handoff data."""

    def validate(self, extracted_fields: dict[str, str]) -> list[dict]:
        mismatches = []
        field_mapping = {
            "SUTA Coverage": "suta_coverage",
            "Effective Date": "effective_date",
            "Billing Frequency": "billing_frequency",
            "Company Name": "client_name",
        }

        for csa_field, cs_field in field_mapping.items():
            csa_val = extracted_fields.get(csa_field, "")
            cs_val = CLIENTSPACE_DATA.get(cs_field, "")
            if csa_val and cs_val and str(csa_val).strip() != str(cs_val).strip():
                mismatches.append({
                    "field_name": csa_field,
                    "csa_value": csa_val,
                    "system_value": cs_val,
                    "system_source": "ClientSpace",
                    "severity": "error" if csa_field in ("SUTA Coverage", "Effective Date") else "warning",
                })

        return mismatches


clientspace_validator = ClientSpaceValidator()
