PRISMHR_DATA = {
    "client_code": "ACME2026",
    "employee_count": "124",
    "wc_codes": "8810, 8742, 5191",
    "pay_groups": [
        {"name": "Semi-Monthly Salaried", "frequency": "semi-monthly", "active_employees": 89},
        {"name": "Bi-Weekly Hourly", "frequency": "bi-weekly", "active_employees": 35},
    ],
    "suta_rates": {
        "TX": 0.0231,
        "CA": 0.0340,
        "FL": 0.0270,
        "NY": 0.0425,
    },
    "billing_rules": [
        {"rule_id": "BR-001", "type": "admin_fee", "amount": 45.00, "frequency": "per_employee_per_month"},
        {"rule_id": "BR-002", "type": "per_employee", "amount": 12.50, "frequency": "per_employee_per_month"},
    ],
    "deduction_codes": [
        {"code": "MED-01", "description": "Medical Premium - Employee", "type": "pre-tax"},
        {"code": "DEN-01", "description": "Dental Premium - Employee", "type": "pre-tax"},
        {"code": "VIS-01", "description": "Vision Premium - Employee", "type": "pre-tax"},
        {"code": "401K-01", "description": "401k Employee Contribution", "type": "pre-tax"},
    ],
    "locations": [
        {"state": "TX", "city": "Houston", "active": True},
        {"state": "CA", "city": "Los Angeles", "active": True},
        {"state": "FL", "city": "Miami", "active": True},
        {"state": "NY", "city": "New York", "active": True},
    ],
}
