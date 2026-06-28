class HallucinationDetector:
    """Detects potential hallucinations in extracted fields."""

    KNOWN_SUSPICIOUS_PATTERNS = [
        "N/A",
        "not specified",
        "unknown",
        "to be determined",
        "TBD",
    ]

    def check_field(self, field_name: str, field_value: str, source_text: str, confidence: float) -> dict:
        is_suspicious = False
        reasons: list[str] = []

        if confidence < 0.60:
            is_suspicious = True
            reasons.append(f"Very low confidence ({confidence:.2f})")

        for pattern in self.KNOWN_SUSPICIOUS_PATTERNS:
            if pattern.lower() in field_value.lower():
                is_suspicious = True
                reasons.append(f"Contains suspicious pattern: '{pattern}'")

        if source_text and field_value.lower() not in source_text.lower():
            if confidence < 0.80:
                is_suspicious = True
                reasons.append("Value not found in cited source text with low confidence")

        return {
            "field_name": field_name,
            "field_value": field_value,
            "is_suspicious": is_suspicious,
            "confidence": confidence,
            "reasons": reasons,
            "recommendation": "flag_for_review" if is_suspicious else "accept",
        }

    def check_batch(self, fields: list[dict], source_text: str = "") -> dict:
        results = []
        for field in fields:
            result = self.check_field(
                field.get("field_name", ""),
                field.get("field_value", ""),
                source_text,
                field.get("confidence", 0.0),
            )
            results.append(result)

        suspicious_count = sum(1 for r in results if r["is_suspicious"])
        return {
            "total_fields": len(results),
            "suspicious_count": suspicious_count,
            "hallucination_rate": suspicious_count / len(results) if results else 0,
            "field_results": results,
        }


hallucination_detector = HallucinationDetector()
