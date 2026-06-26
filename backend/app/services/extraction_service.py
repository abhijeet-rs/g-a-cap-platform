import asyncio
from datetime import datetime, timezone
from typing import Optional

from app.schemas.csa import CSAStatus, ExtractedField


PIPELINE_STEPS = [
    ("Document Received", 0),
    ("Parsing & OCR", 15),
    ("Structure Detection", 35),
    ("Entity Extraction", 65),
    ("Post-Processing", 85),
    ("Complete", 100),
]


class ExtractionService:
    def __init__(self):
        self._jobs: dict[str, dict] = {}

    async def start_extraction(self, document_id: str, filename: str) -> CSAStatus:
        self._jobs[document_id] = {
            "status": "parsing",
            "step_index": 1,
            "started_at": datetime.now(timezone.utc),
        }
        return CSAStatus(
            document_id=document_id,
            status="parsing",
            progress_pct=PIPELINE_STEPS[1][1],
            current_step=PIPELINE_STEPS[1][0],
            steps_completed=1,
            total_steps=6,
            started_at=self._jobs[document_id]["started_at"],
        )

    def get_status(self, document_id: str) -> CSAStatus:
        job = self._jobs.get(document_id)
        if not job:
            return CSAStatus(
                document_id=document_id,
                status="complete",
                progress_pct=100,
                current_step="Complete",
                steps_completed=6,
                total_steps=6,
            )

        idx = min(job.get("step_index", 5), 5)
        step_name, progress = PIPELINE_STEPS[idx]
        status_map = {0: "queued", 1: "parsing", 2: "parsing", 3: "extracting", 4: "extracting", 5: "complete"}

        return CSAStatus(
            document_id=document_id,
            status=status_map[idx],
            progress_pct=progress,
            current_step=step_name,
            steps_completed=idx,
            total_steps=6,
            started_at=job.get("started_at"),
            completed_at=datetime.now(timezone.utc) if idx == 5 else None,
        )

    async def advance_step(self, document_id: str):
        if document_id in self._jobs:
            self._jobs[document_id]["step_index"] = min(
                self._jobs[document_id].get("step_index", 0) + 1, 5
            )


extraction_service = ExtractionService()
