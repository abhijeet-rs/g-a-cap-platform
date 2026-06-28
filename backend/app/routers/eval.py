from fastapi import APIRouter

from app.schemas.eval import FieldEvalScore, EvalResult

router = APIRouter(prefix="/csa", tags=["Evaluation"])

MOCK_FIELD_SCORES = [
    FieldEvalScore(field_name="Company Name", exact_match=True, semantic_match=True, confidence_predicted=0.99, confidence_actual=1.0),
    FieldEvalScore(field_name="FEIN", exact_match=True, semantic_match=True, confidence_predicted=0.98, confidence_actual=1.0),
    FieldEvalScore(field_name="Effective Date", exact_match=True, semantic_match=True, confidence_predicted=0.99, confidence_actual=1.0),
    FieldEvalScore(field_name="Contract Term", exact_match=True, semantic_match=True, confidence_predicted=0.96, confidence_actual=1.0),
    FieldEvalScore(field_name="Admin Fee", exact_match=False, semantic_match=True, confidence_predicted=0.94, confidence_actual=0.95),
    FieldEvalScore(field_name="Per-Employee Fee", exact_match=True, semantic_match=True, confidence_predicted=0.93, confidence_actual=0.96),
    FieldEvalScore(field_name="Gross Margin Target", exact_match=True, semantic_match=True, confidence_predicted=0.91, confidence_actual=0.90),
    FieldEvalScore(field_name="Services Included", exact_match=False, semantic_match=True, confidence_predicted=0.88, confidence_actual=0.85),
    FieldEvalScore(field_name="Services Excluded", exact_match=True, semantic_match=True, confidence_predicted=0.86, confidence_actual=0.88),
    FieldEvalScore(field_name="SUTA Coverage", exact_match=True, semantic_match=True, confidence_predicted=0.92, confidence_actual=0.94),
    FieldEvalScore(field_name="WC Codes", exact_match=True, semantic_match=True, confidence_predicted=0.89, confidence_actual=0.91),
    FieldEvalScore(field_name="Billing Frequency", exact_match=True, semantic_match=True, confidence_predicted=0.95, confidence_actual=0.97),
    FieldEvalScore(field_name="Payment Terms", exact_match=True, semantic_match=True, confidence_predicted=0.97, confidence_actual=0.98),
    FieldEvalScore(field_name="Ownership Structure", exact_match=True, semantic_match=True, confidence_predicted=0.85, confidence_actual=0.82),
    FieldEvalScore(field_name="State Registrations", exact_match=True, semantic_match=True, confidence_predicted=0.91, confidence_actual=0.93),
    FieldEvalScore(field_name="Employee Count", exact_match=True, semantic_match=True, confidence_predicted=0.94, confidence_actual=0.96),
    FieldEvalScore(field_name="Cyber Liability Policy", exact_match=False, semantic_match=True, confidence_predicted=0.82, confidence_actual=0.78),
    FieldEvalScore(field_name="Tax Classification", exact_match=True, semantic_match=True, confidence_predicted=0.93, confidence_actual=0.95),
    FieldEvalScore(field_name="Signature Date", exact_match=True, semantic_match=True, confidence_predicted=0.99, confidence_actual=1.0),
]


@router.get("/{doc_id}/eval", response_model=EvalResult)
async def get_eval_scores(doc_id: str):
    exact = sum(1 for s in MOCK_FIELD_SCORES if s.exact_match) / len(MOCK_FIELD_SCORES)
    semantic = sum(1 for s in MOCK_FIELD_SCORES if s.semantic_match) / len(MOCK_FIELD_SCORES)

    return EvalResult(
        document_id=doc_id,
        field_precision=0.964,
        field_recall=0.982,
        exact_match_rate=round(exact, 3),
        semantic_match_rate=round(semantic, 3),
        table_cell_accuracy=0.912,
        required_field_completeness=1.0,
        avg_confidence_reliability=0.873,
        human_correction_rate=0.045,
        field_scores=MOCK_FIELD_SCORES,
        eval_summary="Extraction quality exceeds production thresholds. 3 fields required semantic matching due to formatting differences. Confidence calibration shows 0.873 correlation with actual accuracy — within acceptable range for production deployment.",
    )
