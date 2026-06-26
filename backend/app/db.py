"""
SQLite persistence for CSA extraction history.

Uses Python's built-in sqlite3 module — no ORM or extra dependencies.
DB file: backend/csa_extractions.db
"""

import os
import sqlite3
import threading
from datetime import datetime, timezone

_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "csa_extractions.db")

_local = threading.local()


def _get_conn() -> sqlite3.Connection:
    """Return a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL;")
    return _local.conn


def init_db() -> None:
    """Create the csa_documents table if it does not exist."""
    conn = _get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS csa_documents (
            id                  TEXT PRIMARY KEY,
            client_name         TEXT NOT NULL DEFAULT 'Unknown',
            filename            TEXT NOT NULL,
            file_size_bytes     INTEGER DEFAULT 0,
            uploaded_by         TEXT NOT NULL DEFAULT 'Current User',
            upload_date         TEXT NOT NULL,
            extraction_status   TEXT NOT NULL DEFAULT 'processing',
            validation_status   TEXT NOT NULL DEFAULT 'not_started',
            cross_val_status    TEXT NOT NULL DEFAULT 'pending',
            confidence          REAL DEFAULT 0.0,
            last_modified       TEXT NOT NULL,
            assigned_reviewer   TEXT DEFAULT 'Unassigned',
            persona             TEXT DEFAULT 'pm',
            field_count         INTEGER DEFAULT 0,
            mismatch_count      INTEGER DEFAULT 0,
            extracted_fields_json TEXT,
            parsed_markdown     TEXT
        );
        """
    )
    conn.commit()


def insert_document(doc: dict) -> None:
    """Insert a new CSA document row.  *doc* must contain at least ``id`` and ``filename``."""
    conn = _get_conn()
    now_iso = datetime.now(timezone.utc).isoformat()
    conn.execute(
        """
        INSERT OR IGNORE INTO csa_documents
            (id, client_name, filename, file_size_bytes, uploaded_by,
             upload_date, extraction_status, validation_status, cross_val_status,
             confidence, last_modified, assigned_reviewer, persona,
             field_count, mismatch_count, extracted_fields_json, parsed_markdown)
        VALUES
            (:id, :client_name, :filename, :file_size_bytes, :uploaded_by,
             :upload_date, :extraction_status, :validation_status, :cross_val_status,
             :confidence, :last_modified, :assigned_reviewer, :persona,
             :field_count, :mismatch_count, :extracted_fields_json, :parsed_markdown)
        """,
        {
            "id": doc["id"],
            "client_name": doc.get("client_name", "Unknown"),
            "filename": doc["filename"],
            "file_size_bytes": doc.get("file_size_bytes", 0),
            "uploaded_by": doc.get("uploaded_by", "Current User"),
            "upload_date": doc.get("upload_date", now_iso[:10]),
            "extraction_status": doc.get("extraction_status", "processing"),
            "validation_status": doc.get("validation_status", "not_started"),
            "cross_val_status": doc.get("cross_val_status", "pending"),
            "confidence": doc.get("confidence", 0.0),
            "last_modified": doc.get("last_modified", now_iso),
            "assigned_reviewer": doc.get("assigned_reviewer", "Unassigned"),
            "persona": doc.get("persona", "pm"),
            "field_count": doc.get("field_count", 0),
            "mismatch_count": doc.get("mismatch_count", 0),
            "extracted_fields_json": doc.get("extracted_fields_json"),
            "parsed_markdown": doc.get("parsed_markdown"),
        },
    )
    conn.commit()


def update_document(doc_id: str, updates: dict) -> None:
    """Update specific columns for a document."""
    if not updates:
        return
    conn = _get_conn()
    # Always bump last_modified
    if "last_modified" not in updates:
        updates["last_modified"] = datetime.now(timezone.utc).isoformat()
    set_clause = ", ".join(f"{col} = :{col}" for col in updates)
    params = {**updates, "id": doc_id}
    conn.execute(
        f"UPDATE csa_documents SET {set_clause} WHERE id = :id",  # noqa: S608
        params,
    )
    conn.commit()


def get_document(doc_id: str):
    """Return a single document as a dict, or None if not found."""
    conn = _get_conn()
    row = conn.execute(
        "SELECT * FROM csa_documents WHERE id = :id", {"id": doc_id}
    ).fetchone()
    if row is None:
        return None
    return dict(row)


def list_documents() -> list[dict]:
    """Return all documents ordered by upload_date DESC."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM csa_documents ORDER BY upload_date DESC"
    ).fetchall()
    return [dict(r) for r in rows]


def delete_document(doc_id: str) -> None:
    """Delete a document by id."""
    conn = _get_conn()
    conn.execute("DELETE FROM csa_documents WHERE id = :id", {"id": doc_id})
    conn.commit()
