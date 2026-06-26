from app.config import settings


class ConfidenceService:
    def classify_confidence(self, score: float) -> str:
        if score >= settings.CONFIDENCE_AUTO_APPROVE:
            return "auto_approve"
        elif score >= settings.CONFIDENCE_REVIEW_THRESHOLD:
            return "review_required"
        elif score >= settings.CONFIDENCE_REJECT_THRESHOLD:
            return "low_confidence"
        else:
            return "potential_hallucination"

    def requires_review(self, score: float) -> bool:
        return score < settings.CONFIDENCE_AUTO_APPROVE

    def should_reject(self, score: float) -> bool:
        return score < settings.CONFIDENCE_REJECT_THRESHOLD

    def get_confidence_color(self, score: float) -> str:
        if score >= 0.90:
            return "#2A8F60"
        elif score >= 0.75:
            return "#FF9E1B"
        else:
            return "#C60C30"

    def calibrate_confidence(self, predicted: float, actual: float) -> float:
        return abs(predicted - actual)

    def aggregate_confidence(self, scores: list[float]) -> dict:
        if not scores:
            return {"avg": 0, "min": 0, "max": 0, "count": 0}
        return {
            "avg": round(sum(scores) / len(scores), 4),
            "min": round(min(scores), 4),
            "max": round(max(scores), 4),
            "count": len(scores),
            "above_threshold": sum(1 for s in scores if s >= settings.CONFIDENCE_AUTO_APPROVE),
            "needs_review": sum(1 for s in scores if settings.CONFIDENCE_REJECT_THRESHOLD <= s < settings.CONFIDENCE_AUTO_APPROVE),
            "below_threshold": sum(1 for s in scores if s < settings.CONFIDENCE_REJECT_THRESHOLD),
        }


confidence_service = ConfidenceService()
