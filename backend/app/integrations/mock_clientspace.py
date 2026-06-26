CLIENTSPACE_DATA = {
    "client_id": "CS-CLI-4521",
    "client_name": "Acme Corp",
    "fein": "XX-XXX4521",
    "effective_date": "07/01/2026",
    "admin_fee": "$42.00/employee/month",
    "suta_coverage": "Standard Coverage",
    "billing_frequency": "Bi-weekly",
    "services": ["Payroll Processing", "Tax Filing", "HR Advisory", "Workers Comp Admin"],
    "state_registrations": ["TX", "CA", "FL", "NY"],
    "employee_count": "127",
    "tax_classification": "S-Corporation",
    "handoff_status": "pending_review",
    "ba_entered": True,
    "ba_name": "Sam Cho",
    "ba_entry_date": "07/11/2026",
    "notes": "Standard onboarding. Client prefers semi-monthly payroll.",
}

CLIENTSPACE_HANDOFF_FIELDS = {
    "required_fields": [
        "client_name", "fein", "effective_date", "admin_fee",
        "services", "suta_coverage", "billing_frequency",
        "state_registrations", "employee_count", "tax_classification",
    ],
    "optional_fields": [
        "cyber_policy", "ownership_structure", "payment_terms",
        "primary_contact", "secondary_contact",
    ],
}
