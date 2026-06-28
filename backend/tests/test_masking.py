from app.services.masking_service import mask_ssn, mask_fein, mask_bank_account, mask_email, mask_value


def test_mask_ssn():
    assert mask_ssn("123-45-6789") == "XXX-XX-6789"
    assert mask_ssn("987654321") == "XXX-XX-4321"


def test_mask_fein():
    assert mask_fein("12-3454521") == "XX-XXX4521"


def test_mask_bank_account():
    assert mask_bank_account("123456789012") == "[REDACTED]"


def test_mask_email():
    result = mask_email("john.doe@company.com")
    assert "@company.com" in result
    assert "john.doe" not in result


def test_mask_value_dispatches():
    assert mask_value("SSN", "123-45-6789") == "XXX-XX-6789"
    assert mask_value("Banking Info", "12345") == "[REDACTED]"
