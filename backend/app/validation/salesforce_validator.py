from app.integrations.mock_salesforce import SALESFORCE_DATA


class SalesforceValidator:
    """Validates extracted CSA fields against Salesforce deal data."""

    def validate(self, extracted_fields: dict[str, str]) -> list[dict]:
        mismatches = []
        field_mapping = {
            "Admin Fee": "admin_fee",
            "Services Included": "services",
            "Tax Classification": "tax_classification",
            "Employee Count": "employee_count",
            "Contract Term": "contract_term",
        }

        for csa_field, sf_field in field_mapping.items():
            csa_val = extracted_fields.get(csa_field, "")
            sf_val = SALESFORCE_DATA.get(sf_field, "")
            if csa_val and sf_val and str(csa_val).strip() != str(sf_val).strip():
                mismatches.append({
                    "field_name": csa_field,
                    "csa_value": csa_val,
                    "system_value": sf_val,
                    "system_source": "Salesforce",
                    "severity": "error" if csa_field in ("Admin Fee", "Tax Classification") else "warning",
                })

        return mismatches


salesforce_validator = SalesforceValidator()
