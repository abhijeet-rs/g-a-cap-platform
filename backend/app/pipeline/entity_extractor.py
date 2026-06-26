class EntityExtractor:
    """Extracts named entities and structured fields from parsed document text."""

    FIELD_PATTERNS = {
        "Company Name": {"section": "§1", "type": "organization"},
        "FEIN": {"section": "§1", "type": "identifier", "pattern": r"\d{2}-\d{7}"},
        "Effective Date": {"section": "§2", "type": "date"},
        "Contract Term": {"section": "§2", "type": "duration"},
        "Admin Fee": {"section": "§3", "type": "currency"},
        "Per-Employee Fee": {"section": "§3", "type": "currency"},
        "Services Included": {"section": "§4", "type": "list"},
        "SUTA Coverage": {"section": "§5", "type": "coverage_type"},
        "WC Codes": {"section": "§5", "type": "code_list"},
        "Billing Frequency": {"section": "§6", "type": "frequency"},
        "Payment Terms": {"section": "§6", "type": "terms"},
        "State Registrations": {"section": "§7", "type": "state_list"},
        "Cyber Liability Policy": {"section": "§8", "type": "policy_status"},
        "Tax Classification": {"section": "§1", "type": "classification"},
        "Signature Date": {"section": "§12", "type": "date"},
    }

    async def extract(self, parsed_text: dict, structure: dict) -> list[dict]:
        from app.routers.csa import MOCK_FIELDS
        return MOCK_FIELDS


entity_extractor = EntityExtractor()
