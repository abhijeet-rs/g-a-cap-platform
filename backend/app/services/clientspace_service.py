import uuid
import hashlib
from datetime import datetime, timezone
from typing import Optional

from app.services.audit_service import audit_service
from app.services.masking_service import generate_idempotency_key


class ClientSpaceAdapter:
    def __init__(self):
        self._synced_records: dict[str, dict] = {}
        self._sync_status: dict[str, str] = {}

    def get_sync_status(self, document_id: str) -> str:
        return self._sync_status.get(document_id, "pending")

    def set_sync_status(self, document_id: str, status: str):
        valid_statuses = {"pending", "ready", "syncing", "synced", "failed", "needs_review"}
        if status not in valid_statuses:
            raise ValueError(f"Invalid sync status: {status}. Valid: {valid_statuses}")
        self._sync_status[document_id] = status

    async def create_client_record(self, document_id: str, client_data: dict) -> dict:
        idem_key = generate_idempotency_key(document_id, "client_create", "2026-07")

        if idem_key in self._synced_records:
            return self._synced_records[idem_key]

        self.set_sync_status(document_id, "syncing")

        client_id = f"CLI-{uuid.uuid4().hex[:8].upper()}"
        result = {
            "client_id": client_id,
            "idempotency_key": idem_key,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        self._synced_records[idem_key] = result
        audit_service.log(document_id, "System", "clientspace_client_created",
                         f"ClientSpace client record created: {client_id}",
                         {"client_id": client_id, "idem_key": idem_key})

        return result

    async def create_onboarding_case(self, document_id: str, client_id: str, case_data: dict) -> dict:
        idem_key = generate_idempotency_key(document_id, "case_create", "2026-07")

        case_id = f"CS-2026-{uuid.uuid4().hex[:4].upper()}"
        result = {
            "case_id": case_id,
            "client_id": client_id,
            "status": "open",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        audit_service.log(document_id, "System", "clientspace_case_created",
                         f"Onboarding case created: {case_id}",
                         {"case_id": case_id, "client_id": client_id})

        return result

    async def create_review_tasks(self, document_id: str, case_id: str, mismatches: list[dict]) -> list[dict]:
        tasks = []
        for i, mismatch in enumerate(mismatches):
            task_id = f"TSK-{uuid.uuid4().hex[:6].upper()}"
            task = {
                "task_id": task_id,
                "case_id": case_id,
                "title": f"Review mismatch: {mismatch.get('field_name', 'Unknown')}",
                "status": "pending",
                "priority": "high" if mismatch.get("severity") == "error" else "medium",
            }
            tasks.append(task)

        audit_service.log(document_id, "System", "clientspace_tasks_created",
                         f"{len(tasks)} review tasks created for case {case_id}")

        return tasks

    async def sync_extraction(self, document_id: str, extraction_data: dict) -> dict:
        self.set_sync_status(document_id, "syncing")

        client_result = await self.create_client_record(document_id, extraction_data)
        case_result = await self.create_onboarding_case(
            document_id, client_result["client_id"],
            {"title": f"Onboarding - {extraction_data.get('client_name', 'Unknown')}"}
        )

        self.set_sync_status(document_id, "synced")

        audit_service.log(document_id, "System", "clientspace_sync_complete",
                         f"Full sync complete: client={client_result['client_id']}, case={case_result['case_id']}")

        return {
            "document_id": document_id,
            "sync_status": "synced",
            "client_id": client_result["client_id"],
            "case_id": case_result["case_id"],
            "synced_at": datetime.now(timezone.utc).isoformat(),
        }


clientspace_adapter = ClientSpaceAdapter()
