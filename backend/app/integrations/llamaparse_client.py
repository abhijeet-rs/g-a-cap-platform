"""
LlamaParse PDF extraction client using the raw HTTP API.
Compatible with Python 3.9+ (avoids the SDK which requires 3.10+).
"""
import asyncio
import logging
import time

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

LLAMAPARSE_UPLOAD_URL = "https://api.cloud.llamaindex.ai/api/parsing/upload"
LLAMAPARSE_JOB_URL = "https://api.cloud.llamaindex.ai/api/parsing/job/{job_id}"
LLAMAPARSE_RESULT_URL = "https://api.cloud.llamaindex.ai/api/parsing/job/{job_id}/result/json"


class LlamaParseClient:
    def __init__(self):
        self.api_key = settings.LLAMAPARSE_API_KEY
        self._last_pages: list[dict] = []
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

    async def parse_pdf(self, file_content: bytes, filename: str = "document.pdf") -> str:
        try:
            logger.info("Starting LlamaParse upload for %s (%d bytes)", filename, len(file_content))

            async with httpx.AsyncClient(timeout=httpx.Timeout(300.0, connect=30.0)) as client:
                # Step 1: Upload the file
                upload_resp = await client.post(
                    LLAMAPARSE_UPLOAD_URL,
                    headers=self.headers,
                    files={"file": (filename, file_content, "application/pdf")},
                    data={
                        "parsing_instruction": (
                            "Extract all structured fields, tables, and sections from this Customer Service Agreement. "
                            "Pay special attention to: company names, FEINs, effective dates, contract terms, "
                            "fee structures, services included/excluded, SUTA coverage, WC codes, billing details, "
                            "payment terms, state registrations, and signature blocks. "
                            "Preserve table formatting and section headers."
                        ),
                    },
                )
                upload_resp.raise_for_status()
                upload_data = upload_resp.json()
                job_id = upload_data.get("id")

                if not job_id:
                    logger.error("LlamaParse upload returned no job ID: %s", upload_data)
                    return ""

                logger.info("LlamaParse job created: %s", job_id)

                # Step 2: Poll for completion
                max_polls = 120
                poll_interval = 3
                for i in range(max_polls):
                    await asyncio.sleep(poll_interval)

                    status_resp = await client.get(
                        LLAMAPARSE_JOB_URL.format(job_id=job_id),
                        headers=self.headers,
                    )
                    status_resp.raise_for_status()
                    status_data = status_resp.json()
                    status = status_data.get("status", "PENDING")

                    if status == "SUCCESS":
                        logger.info("LlamaParse job %s completed after %d polls", job_id, i + 1)
                        break
                    elif status in ("ERROR", "FAILED"):
                        logger.error("LlamaParse job %s failed: %s", job_id, status_data)
                        return ""
                    else:
                        if i % 5 == 0:
                            logger.info("LlamaParse job %s status: %s (poll %d)", job_id, status, i + 1)
                else:
                    logger.error("LlamaParse job %s timed out after %d polls", job_id, max_polls)
                    return ""

                # Step 3: Get the result
                result_resp = await client.get(
                    LLAMAPARSE_RESULT_URL.format(job_id=job_id),
                    headers=self.headers,
                )
                result_resp.raise_for_status()
                result_data = result_resp.json()

                pages = result_data.get("pages", [])

                # Store page-separated data with items + bounding boxes
                self._last_pages = []
                for i, p in enumerate(pages):
                    items_with_bbox = []
                    for item in p.get("items", []):
                        bbox = item.get("bBox")
                        if bbox and item.get("value"):
                            items_with_bbox.append({
                                "text": str(item.get("value", ""))[:200],
                                "type": item.get("type", "text"),
                                "bbox": {
                                    "x": bbox.get("x", 0),
                                    "y": bbox.get("y", 0),
                                    "w": bbox.get("w", 0),
                                    "h": bbox.get("h", 0),
                                },
                            })
                    self._last_pages.append({
                        "page": p.get("page", i + 1),
                        "md": p.get("md", ""),
                        "width": p.get("width", 612),
                        "height": p.get("height", 792),
                        "items": items_with_bbox,
                    })

                # Build full markdown from pages
                markdown = "\n\n".join(p.get("md", "") for p in pages) if pages else result_data.get("markdown", "")

                logger.info("LlamaParse result for %s: %d chars markdown, %d pages", filename, len(markdown), len(self._last_pages))
                return markdown

        except httpx.HTTPStatusError as e:
            logger.error("LlamaParse HTTP error: %s %s", e.response.status_code, e.response.text[:500])
            return ""
        except Exception as e:
            logger.error("LlamaParse extraction failed for %s: %s", filename, str(e), exc_info=True)
            return ""


llamaparse_client = LlamaParseClient()
