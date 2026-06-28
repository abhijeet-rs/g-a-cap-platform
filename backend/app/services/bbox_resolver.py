"""
Bounding box resolver using Tesseract OCR word-level positions.
Equivalent to SP_RESOLVE_CHUNK_BOUNDING_BOXES_PY with DOCUMENT_WORDS.

Pipeline:
  1. PyMuPDF renders each page as image (300 DPI)
  2. Tesseract OCR extracts every word with exact bounding box
  3. 3-tier cascade matches extracted field values to word positions:
     - Tier 1 (LINE): substring match against concatenated line text
     - Tier 2 (WORD-run): anchor via key tokens, extend to adjacent words
     - Tier 3 (Loose-line): count content-word hits per visual line
"""
import io
import json
import logging
import re

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

logger = logging.getLogger(__name__)

# Config — mirrors production SP_RESOLVE_CHUNK_BOUNDING_BOXES_PY
MIN_LINE_LEN = 3
LINE_OVERLAP_THRESHOLD = 0.5
MIN_RUN_WORDS = 3
MIN_CONTENT_TOKEN_LEN = 3
MIN_LINE_CONTENT_HITS = 2


def _ocr_page(doc, page_idx: int) -> list:
    """OCR a single page and return word-level bounding boxes as normalized 0-1 fractions."""
    page = doc[page_idx]
    pix = page.get_pixmap(dpi=300)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    img_w, img_h = img.size

    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

    words = []
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        if not text:
            continue
        words.append({
            "text": text,
            "left": data['left'][i] / img_w,
            "top": data['top'][i] / img_h,
            "width": data['width'][i] / img_w,
            "height": data['height'][i] / img_h,
            "line_num": data['line_num'][i],
            "block_num": data['block_num'][i],
        })
    return words


def _group_by_line(words: list) -> list:
    """Group words into visual lines based on Tesseract line_num + block_num."""
    lines = {}
    for w in words:
        key = (w['block_num'], w['line_num'])
        if key not in lines:
            lines[key] = []
        lines[key].append(w)

    result = []
    for key in sorted(lines.keys()):
        line_words = sorted(lines[key], key=lambda w: w['left'])
        line_text = " ".join(w['text'] for w in line_words)
        # Union bounding box for the line
        left = min(w['left'] for w in line_words)
        top = min(w['top'] for w in line_words)
        right = max(w['left'] + w['width'] for w in line_words)
        bottom = max(w['top'] + w['height'] for w in line_words)
        result.append({
            "text": line_text,
            "words": line_words,
            "left": left, "top": top,
            "width": right - left, "height": bottom - top,
        })
    return result


def _normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', text.lower().strip())


def _tokenize(text: str) -> set:
    return set(re.findall(r'[a-z0-9$%.,/:;()-]+', text.lower()))


def _tier1_line_match(lines: list, search_text: str) -> list:
    """LINE pass — precise substring match only. No fuzzy overlap."""
    search_norm = _normalize(search_text)
    if len(search_norm) < MIN_LINE_LEN:
        return []

    results = []
    for line in lines:
        line_norm = _normalize(line['text'])
        if len(line_norm) < MIN_LINE_LEN:
            continue

        # Only match if the search value appears as a substring in the line
        # Do NOT match if the line is a substring of the search (too loose)
        if search_norm in line_norm:
            results.append(line)

    return results


def _tier2_word_run(lines: list, search_text: str) -> list:
    """WORD-run pass — find contiguous runs of matching content words (>=3 chars)."""
    content_tokens = {t for t in _tokenize(search_text) if len(t) >= MIN_CONTENT_TOKEN_LEN}
    if len(content_tokens) < 2:
        return []

    results = []
    for line in lines:
        run_words = []
        for w in line['words']:
            w_lower = w['text'].lower().strip('.,;:()[]{}"\'-')
            if len(w_lower) >= MIN_CONTENT_TOKEN_LEN and w_lower in content_tokens:
                run_words.append(w)

        # Require at least MIN_RUN_WORDS matching content words
        if len(run_words) >= MIN_RUN_WORDS:
            left = min(w['left'] for w in run_words)
            top = min(w['top'] for w in run_words)
            right = max(w['left'] + w['width'] for w in run_words)
            bottom = max(w['top'] + w['height'] for w in run_words)
            results.append({
                "text": " ".join(w['text'] for w in run_words),
                "left": left, "top": top,
                "width": right - left, "height": bottom - top,
            })

    return results


def _tier3_loose_line(lines: list, search_text: str) -> list:
    """Loose-line pass — lines with enough UNIQUE content-word hits (>=4 chars)."""
    content_tokens = {t for t in _tokenize(search_text) if len(t) >= 4}
    if len(content_tokens) < 2:
        return []

    results = []
    for line in lines:
        line_tokens = _tokenize(line['text'])
        hits = len(content_tokens & line_tokens)
        # Require at least 3 content-word hits to avoid false positives
        if hits >= 3:
            results.append(line)

    return results


def _to_bbox_pct(match: dict) -> dict:
    """Convert 0-1 normalized coords to percentage bbox."""
    return {
        "x": round(match['left'] * 100, 1),
        "y": round(match['top'] * 100, 1),
        "width": round(max(match['width'] * 100, 8.0), 1),
        "height": round(max(match['height'] * 100, 1.2), 1),
    }


def resolve_bounding_boxes(pages_data, fields: list, pdf_path: str = None) -> list:
    """
    Main resolver — OCR each relevant page, then run 3-tier cascade for each field.
    """
    if not pdf_path:
        # Try to find PDF path from fields
        logger.warning("No PDF path for Tesseract OCR, using Claude location fallback")
        return _fallback_location(fields)

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        logger.error("Cannot open PDF: %s", e)
        return _fallback_location(fields)

    total_pages = len(doc)

    # OCR all relevant pages (cache)
    page_words: dict[int, list] = {}
    page_lines: dict[int, list] = {}
    needed_pages = set()
    for f in fields:
        pg = f.get("page_number", 0)
        if pg > 0 and pg <= total_pages and f.get("field_value") != "Not available in document":
            needed_pages.add(pg)

    logger.info("OCR'ing %d pages with Tesseract...", len(needed_pages))
    for pg in sorted(needed_pages):
        try:
            words = _ocr_page(doc, pg - 1)
            page_words[pg] = words
            page_lines[pg] = _group_by_line(words)
            logger.info("  Page %d: %d words, %d lines", pg, len(words), len(page_lines[pg]))
        except Exception as e:
            logger.warning("  Page %d OCR failed: %s", pg, e)

    doc.close()

    # Resolve each field
    resolved = 0
    updated = []

    for f in fields:
        if f.get("field_value") == "Not available in document":
            updated.append(f)
            continue

        pg = f.get("page_number", 0)
        val = f.get("field_value", "")
        src = f.get("source_text", "")

        if pg not in page_lines or not val:
            updated.append(f)
            continue

        lines = page_lines[pg]

        # 3-tier cascade — use field VALUE as primary search (most specific)
        # Only fall back to source_text for Tier 2/3 if value is short
        matches = _tier1_line_match(lines, val)
        tier = "LINE"

        if not matches and src:
            # Try source_text for Tier 1 (it may contain the exact line from the PDF)
            matches = _tier1_line_match(lines, src)

        if not matches:
            matches = _tier2_word_run(lines, val)
            tier = "WORD"

        if not matches:
            matches = _tier3_loose_line(lines, val)
            tier = "LOOSE"

        if matches:
            # Pick the best match (shortest = most specific)
            best = min(matches, key=lambda m: m['height'])
            f["bounding_box"] = _to_bbox_pct(best)
            resolved += 1
            logger.debug("  %s [%s] pg=%d → (%s)", f["field_name"], tier, pg, f["bounding_box"])

        updated.append(f)

    total_found = sum(1 for f in updated if f.get("field_value") != "Not available in document")
    logger.info("Tesseract bbox resolved: %d/%d fields", resolved, total_found)

    return updated


def _fallback_location(fields: list) -> list:
    """Use Claude's location.vertical_pct when Tesseract is unavailable."""
    for f in fields:
        if f.get("field_value") == "Not available in document":
            continue
        loc = f.get("location")
        if isinstance(loc, dict):
            v = float(loc.get("vertical_pct", 50))
            f["bounding_box"] = {
                "x": 8.0,
                "y": max(2, min(93, v - 1.5)),
                "width": 84.0,
                "height": 3.0,
            }
    return fields
