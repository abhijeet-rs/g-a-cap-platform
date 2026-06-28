from app.validation.cross_validator import cross_validator


def test_cross_validation_finds_mismatches():
    extracted = {
        "Admin Fee": "$45.00/employee/month",
        "SUTA Coverage": "Full Coverage - All States",
        "Effective Date": "08/01/2026",
        "Employee Count": "127",
        "Tax Classification": "S-Corporation",
        "Services Included": "Payroll Processing, Tax Filing, Time & Attendance, HR Advisory, Workers Comp Admin",
        "Billing Frequency": "Semi-monthly",
    }
    mismatches = cross_validator.validate_all(extracted)
    assert len(mismatches) > 0
    field_names = [m["field_name"] for m in mismatches]
    assert "Admin Fee" in field_names
    assert "SUTA Coverage" in field_names


def test_validation_summary():
    mismatches = [
        {"field_name": "A", "severity": "error", "system_source": "Salesforce"},
        {"field_name": "B", "severity": "warning", "system_source": "ClientSpace"},
        {"field_name": "C", "severity": "error", "system_source": "Salesforce"},
    ]
    summary = cross_validator.get_validation_summary(mismatches)
    assert summary["total_mismatches"] == 3
    assert summary["errors"] == 2
    assert summary["warnings"] == 1
    assert summary["requires_human_review"] is True
