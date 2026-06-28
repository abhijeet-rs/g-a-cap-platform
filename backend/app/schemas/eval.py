from pydantic import BaseModel


class FieldEvalScore(BaseModel):
    field_name: str
    exact_match: bool
    semantic_match: bool
    confidence_predicted: float
    confidence_actual: float


class EvalResult(BaseModel):
    document_id: str
    field_precision: float
    field_recall: float
    exact_match_rate: float
    semantic_match_rate: float
    table_cell_accuracy: float
    required_field_completeness: float
    avg_confidence_reliability: float
    human_correction_rate: float
    field_scores: list[FieldEvalScore]
    eval_summary: str
