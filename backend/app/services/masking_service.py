import re
import hashlib

ALIAS_MAP = {
    "real_company_1": "Acme Corp",
    "real_company_2": "TechStart LLC",
    "real_company_3": "Summit Services Inc",
    "real_company_4": "Meridian Group",
    "real_company_5": "Pinnacle Staffing",
    "real_company_6": "Horizon Industries",
    "real_company_7": "Atlas Partners",
    "real_company_8": "Vertex Solutions",
}

AVAILABLE_ALIASES = [
    "Acme Corp", "TechStart LLC", "Summit Services Inc",
    "Meridian Group", "Pinnacle Staffing", "Horizon Industries",
    "Atlas Partners", "Vertex Solutions", "Bridgepoint Co",
    "Crestline Holdings", "Oakmont Enterprises", "Silverline Services",
]

_alias_counter = 0


def mask_company_name(real_name: str) -> str:
    if real_name in ALIAS_MAP:
        return ALIAS_MAP[real_name]
    global _alias_counter
    alias = AVAILABLE_ALIASES[_alias_counter % len(AVAILABLE_ALIASES)]
    ALIAS_MAP[real_name] = alias
    _alias_counter += 1
    return alias


def mask_ssn(ssn: str) -> str:
    digits = re.sub(r"[^0-9]", "", ssn)
    if len(digits) >= 4:
        return f"XXX-XX-{digits[-4:]}"
    return "XXX-XX-XXXX"


def mask_fein(fein: str) -> str:
    digits = re.sub(r"[^0-9]", "", fein)
    if len(digits) >= 4:
        return f"XX-XXX{digits[-4:]}"
    return "XX-XXXXXXX"


def mask_bank_account(account: str) -> str:
    return "[REDACTED]"


def mask_phone(phone: str) -> str:
    digits = re.sub(r"[^0-9]", "", phone)
    if len(digits) >= 4:
        return f"(XXX) XXX-{digits[-4:]}"
    return "(XXX) XXX-XXXX"


def mask_email(email: str) -> str:
    parts = email.split("@")
    if len(parts) == 2:
        name = parts[0]
        masked_name = name[0] + "***" if len(name) > 0 else "***"
        return f"{masked_name}@{parts[1]}"
    return "[MASKED]"


def mask_address(address: str) -> str:
    parts = [p.strip() for p in address.split(",")]
    if len(parts) >= 2:
        return f"[REDACTED], {parts[-2].strip() if len(parts) >= 3 else parts[-1].strip()}"
    return "[REDACTED]"


def mask_value(field_name: str, value: str) -> str:
    field_lower = field_name.lower()
    if "company" in field_lower or "client" in field_lower or "name" in field_lower:
        return mask_company_name(value)
    if "ssn" in field_lower or "social" in field_lower:
        return mask_ssn(value)
    if "fein" in field_lower or "ein" in field_lower:
        return mask_fein(value)
    if "bank" in field_lower or "account" in field_lower or "routing" in field_lower:
        return mask_bank_account(value)
    if "phone" in field_lower:
        return mask_phone(value)
    if "email" in field_lower:
        return mask_email(value)
    if "address" in field_lower:
        return mask_address(value)
    return value


def generate_idempotency_key(document_id: str, field_set: str, timestamp_bucket: str) -> str:
    raw = f"{document_id}:{field_set}:{timestamp_bucket}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]
