from difflib import SequenceMatcher


class FieldAccuracyEvaluator:
    """Evaluates extraction accuracy at the field level."""

    def exact_match(self, predicted: str, ground_truth: str) -> bool:
        return predicted.strip() == ground_truth.strip()

    def semantic_match(self, predicted: str, ground_truth: str, threshold: float = 0.85) -> bool:
        if self.exact_match(predicted, ground_truth):
            return True
        pred_norm = self._normalize(predicted)
        gt_norm = self._normalize(ground_truth)
        similarity = SequenceMatcher(None, pred_norm, gt_norm).ratio()
        return similarity >= threshold

    def _normalize(self, value: str) -> str:
        v = value.lower().strip()
        v = v.replace("$", "").replace(",", "").replace("/", " per ")
        v = v.replace("per employee per month", "pepm").replace("/ee/mo", "pepm")
        v = v.replace("/employee/month", "pepm")
        return v

    def evaluate_batch(self, predictions: dict[str, str], ground_truth: dict[str, str]) -> dict:
        total = len(ground_truth)
        exact_matches = 0
        semantic_matches = 0
        missing = 0

        for field, gt_val in ground_truth.items():
            pred_val = predictions.get(field)
            if pred_val is None:
                missing += 1
                continue
            if self.exact_match(pred_val, gt_val):
                exact_matches += 1
                semantic_matches += 1
            elif self.semantic_match(pred_val, gt_val):
                semantic_matches += 1

        return {
            "total_fields": total,
            "exact_match_rate": exact_matches / total if total else 0,
            "semantic_match_rate": semantic_matches / total if total else 0,
            "missing_rate": missing / total if total else 0,
            "precision": semantic_matches / len(predictions) if predictions else 0,
            "recall": semantic_matches / total if total else 0,
        }


field_accuracy_evaluator = FieldAccuracyEvaluator()
