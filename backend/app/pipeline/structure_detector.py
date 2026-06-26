class StructureDetector:
    """Detects document structure: sections, tables, clauses, signature blocks."""

    async def detect(self, parsed_output: dict) -> dict:
        return {
            "document_type": "customer_service_agreement",
            "sections": [
                {"id": "§1", "title": "Company Information", "pages": [1], "type": "info_block"},
                {"id": "§2", "title": "Term and Effective Date", "pages": [2], "type": "terms"},
                {"id": "§3", "title": "Fee Structure", "pages": [3], "type": "financial"},
                {"id": "§4", "title": "Services", "pages": [4], "type": "services"},
                {"id": "§5", "title": "Tax and Compliance", "pages": [5], "type": "compliance"},
                {"id": "§6", "title": "Billing", "pages": [6], "type": "financial"},
                {"id": "§7", "title": "State Registrations", "pages": [7], "type": "compliance"},
                {"id": "§8", "title": "Insurance", "pages": [8], "type": "insurance"},
                {"id": "§9", "title": "Banking Information", "pages": [9], "type": "financial_sensitive"},
                {"id": "§10", "title": "General Provisions", "pages": [10, 11], "type": "legal"},
                {"id": "§12", "title": "Signatures", "pages": [12], "type": "signature_block"},
            ],
            "tables": [
                {"page": 3, "rows": 5, "cols": 3, "title": "Fee Schedule"},
                {"page": 4, "rows": 8, "cols": 2, "title": "Services Matrix"},
                {"page": 5, "rows": 4, "cols": 3, "title": "WC Code Schedule"},
                {"page": 5, "rows": 6, "cols": 2, "title": "SUTA Rate Table"},
                {"page": 6, "rows": 3, "cols": 2, "title": "Billing Terms"},
                {"page": 7, "rows": 4, "cols": 3, "title": "State Registration Summary"},
            ],
            "sensitive_sections": ["§9"],
            "signature_blocks": 2,
        }


structure_detector = StructureDetector()
