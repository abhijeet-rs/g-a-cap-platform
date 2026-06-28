REQUIRED_CSA_FIELDS = [
    "Company Name", "FEIN", "Effective Date", "Contract Term",
    "Admin Fee", "Per-Employee Fee", "Services Included",
    "SUTA Coverage", "WC Codes", "Billing Frequency",
    "Payment Terms", "State Registrations", "Employee Count",
    "Tax Classification", "Signature Date",
]

OPTIONAL_CSA_FIELDS = [
    "DBA", "Gross Margin Target", "Services Excluded",
    "Ownership Structure", "Primary Contact", "Cyber Liability Policy",
    "Banking Information",
]


class CompletenessScorer:
    """Evaluates whether all required fields were extracted."""

    def score(self, extracted_field_names: list[str]) -> dict:
        extracted_set = set(extracted_field_names)

        required_found = [f for f in REQUIRED_CSA_FIELDS if f in extracted_set]
        required_missing = [f for f in REQUIRED_CSA_FIELDS if f not in extracted_set]

        optional_found = [f for f in OPTIONAL_CSA_FIELDS if f in extracted_set]
        optional_missing = [f for f in OPTIONAL_CSA_FIELDS if f not in extracted_set]

        required_pct = len(required_found) / len(REQUIRED_CSA_FIELDS) if REQUIRED_CSA_FIELDS else 0
        total_pct = (len(required_found) + len(optional_found)) / (len(REQUIRED_CSA_FIELDS) + len(OPTIONAL_CSA_FIELDS))

        return {
            "required_completeness": round(required_pct, 4),
            "total_completeness": round(total_pct, 4),
            "required_found": len(required_found),
            "required_total": len(REQUIRED_CSA_FIELDS),
            "required_missing": required_missing,
            "optional_found": len(optional_found),
            "optional_total": len(OPTIONAL_CSA_FIELDS),
            "optional_missing": optional_missing,
            "passes_threshold": required_pct >= 0.95,
        }


completeness_scorer = CompletenessScorer()
