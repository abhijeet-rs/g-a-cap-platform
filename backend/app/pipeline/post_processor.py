import re


class PostProcessor:
    """Normalizes, formats, and deduplicates extracted fields."""

    def normalize_currency(self, value: str) -> str:
        match = re.search(r"[\$]?([\d,]+\.?\d*)", value)
        if match:
            amount = match.group(1).replace(",", "")
            return f"${float(amount):.2f}"
        return value

    def normalize_date(self, value: str) -> str:
        patterns = [
            (r"(\d{1,2})/(\d{1,2})/(\d{4})", r"\1/\2/\3"),
            (r"(\w+)\s+(\d{1,2}),?\s+(\d{4})", None),
        ]
        for pattern, replacement in patterns:
            match = re.match(pattern, value)
            if match:
                if replacement:
                    return re.sub(pattern, replacement, value)
                return value
        return value

    def normalize_percentage(self, value: str) -> str:
        match = re.search(r"([\d.]+)\s*%?", value)
        if match:
            return f"{float(match.group(1))}%"
        return value

    def deduplicate_fields(self, fields: list[dict]) -> list[dict]:
        seen: dict[str, dict] = {}
        for field in fields:
            name = field["field_name"]
            if name not in seen or field.get("confidence", 0) > seen[name].get("confidence", 0):
                seen[name] = field
        return list(seen.values())

    def process(self, fields: list[dict]) -> list[dict]:
        processed = []
        for field in fields:
            f = dict(field)
            category = f.get("category", "")
            if category == "Fee Structure" and "$" in f.get("field_value", ""):
                f["field_value"] = self.normalize_currency(f["field_value"])
            if "date" in f.get("field_name", "").lower():
                f["field_value"] = self.normalize_date(f["field_value"])
            processed.append(f)
        return self.deduplicate_fields(processed)


post_processor = PostProcessor()
