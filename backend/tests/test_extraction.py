from app.pipeline.post_processor import post_processor
from app.eval.field_accuracy import field_accuracy_evaluator
from app.eval.completeness import completeness_scorer


def test_normalize_currency():
    assert post_processor.normalize_currency("$45.00") == "$45.00"
    assert post_processor.normalize_currency("$1,234.56") == "$1234.56"


def test_exact_match():
    assert field_accuracy_evaluator.exact_match("$45.00", "$45.00") is True
    assert field_accuracy_evaluator.exact_match("$45.00", "$42.00") is False


def test_semantic_match():
    assert field_accuracy_evaluator.semantic_match("$45.00/employee/month", "$45.00/ee/mo") is True


def test_completeness():
    fields = [
        "Company Name", "FEIN", "Effective Date", "Contract Term",
        "Admin Fee", "Per-Employee Fee", "Services Included",
        "SUTA Coverage", "WC Codes", "Billing Frequency",
        "Payment Terms", "State Registrations", "Employee Count",
        "Tax Classification", "Signature Date",
    ]
    result = completeness_scorer.score(fields)
    assert result["required_completeness"] == 1.0
    assert result["passes_threshold"] is True
