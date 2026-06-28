import hashlib
from datetime import datetime, timezone


def generate_key(document_id: str, operation: str, timestamp_bucket: str | None = None) -> str:
    if timestamp_bucket is None:
        now = datetime.now(timezone.utc)
        timestamp_bucket = now.strftime("%Y-%m-%d-%H")

    raw = f"{document_id}:{operation}:{timestamp_bucket}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


class IdempotencyStore:
    """In-memory idempotency store for demo. Production would use Redis or DB."""

    def __init__(self):
        self._keys: dict[str, dict] = {}

    def check(self, key: str) -> dict | None:
        return self._keys.get(key)

    def store(self, key: str, result: dict):
        self._keys[key] = result

    def has(self, key: str) -> bool:
        return key in self._keys


idempotency_store = IdempotencyStore()
