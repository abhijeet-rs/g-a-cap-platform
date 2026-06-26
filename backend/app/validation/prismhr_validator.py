from app.integrations.mock_prismhr import PRISMHR_DATA


class PrismHRValidator:
    """Validates extracted CSA fields against PrismHR configuration data."""

    def validate(self, extracted_fields: dict[str, str]) -> list[dict]:
        mismatches = []
        field_mapping = {
            "Employee Count": "employee_count",
            "WC Codes": "wc_codes",
        }

        for csa_field, prism_field in field_mapping.items():
            csa_val = extracted_fields.get(csa_field, "")
            prism_val = PRISMHR_DATA.get(prism_field, "")
            if csa_val and prism_val and str(csa_val).strip() != str(prism_val).strip():
                mismatches.append({
                    "field_name": csa_field,
                    "csa_value": csa_val,
                    "system_value": prism_val,
                    "system_source": "PrismHR",
                    "severity": "warning",
                })

        return mismatches


prismhr_validator = PrismHRValidator()
