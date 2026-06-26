"""
Smart field extractor that parses LlamaParse markdown output and extracts
structured CSA / ClientSpace Handoff fields using regex and keyword heuristics.

Fields are aligned with the ClientSpace Onboarding Handoff Page structure.
"""
import logging
import re

from app.services.masking_service import mask_company_name

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Field definitions aligned with ClientSpace Onboarding Handoff Page.
# Each key maps to a list of regex patterns. First capturing group = value.
# ---------------------------------------------------------------------------

CSA_FIELD_PATTERNS: dict[str, list[str]] = {
    # ── General Information ──
    "Organization Name": [
        r"(?:Organization\s+Name|Company\s+Name|Client\s+Name|Employer\s+Name)[:\s|]*([^\n|]+)",
        r"(?:between|entered\s+(?:into\s+)?by)\s+.*?(?:and|&)\s+[\"']?(.+?)[\"']?\s*(?:\(|,|\n)",
        r"(?:Client|COMPANY|EMPLOYER)[:\s]+(.+?)(?:\n|$)",
    ],
    "Business Advisor": [
        r"(?:Business\s+Advisor)[:\s|]*([^\n|]+)",
        r"(?:Account\s+(?:Manager|Executive|Rep))[:\s|]*([^\n|]+)",
        r"(?:Sales\s+Rep(?:resentative)?)[:\s|]*([^\n|]+)",
    ],
    "Contract Type": [
        r"(?:Contract\s+Type)[:\s|]*([^\n|]+)",
        r"(PEO\s*[-–—]\s*(?:Full\s+Service|Co-?Employment|ASO))",
        r"(?:Service\s+(?:Type|Model))[:\s|]*([^\n|]+)",
    ],
    "Number of Employees": [
        r"(?:#\s*of\s+Employees|Number\s+of\s+Employees|Employee\s+Count|Headcount)[:\s|]*(\d[\d,]*)",
        r"(?:approximately|approx\.?)\s+(\d[\d,]*)\s+(?:employees?|WSEs?)",
        r"(\d[\d,]*)\s+(?:employees?|WSEs?|worksite\s+employees?)",
    ],
    "Decision Maker": [
        r"(?:Decision\s+Maker)[:\s|]*([^\n|]+)",
        r"(?:Primary\s+(?:Decision|Authority|Signer))[:\s|]*([^\n|]+)",
    ],
    "Client Onboarding Contact": [
        r"(?:Main\s+Point\s+of\s+Contact\s+for\s+Onboarding|Client.*?Contact.*?Onboarding|Onboarding\s+Contact)[:\s|]*([^\n|]+)",
        r"(?:Primary\s+Contact)[:\s|]*([^\n|]+)",
        r"(?:attention|attn)[:\s]*([^\n]+)",
    ],
    "Current Payroll Vendor": [
        r"(?:Current\s+Payroll\s+Vendor|Name\s+of\s+Current\s+Payroll\s+Vendor)[:\s|]*([^\n|]+)",
        r"(?:Current\s+(?:PEO|Vendor|Provider))[:\s|]*([^\n|]+)",
    ],
    "Current Vendor Relationship": [
        r"(?:Current\s+Vendor\s+Relationship)[:\s|]*([^\n|]+)",
        r"(?:How\s+is\s+the\s+Payroll\s+Currently\s+Processed)[:\s|?]*([^\n|]+)",
    ],
    "Broker Referred": [
        r"(?:Is\s+this\s+a\s+Broker\s+Referred\s+Deal)[:\s|?]*([^\n|]+)",
        r"(?:Broker\s+Referred)[:\s|]*([^\n|]+)",
    ],
    "Broker Name": [
        r"(?:Name\s+of\s+Broker(?:\s+Company)?)[:\s|]*([^\n|]+)",
        r"(?:Broker\s+Name|Broker)[:\s|]*([^\n|]+)",
    ],
    # ── Contract & Dates ──
    "Effective Date": [
        r"(?:Effective\s+Date|G&A\s+Benefit\s+Plan\s+Effective\s+Date)[:\s|]*(\d{1,2}/\d{1,2}/\d{2,4})",
        r"(?:effective\s+date|commencement\s+date|start\s+date)[:\s]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
        r"(?:effective|commencing|starting)\s+(?:on\s+)?(\w+\s+\d{1,2},?\s+\d{4})",
        r"(?:shall\s+be\s+effective)\s+(?:on\s+|as\s+of\s+)?(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
    ],
    "Contract Term": [
        r"(?:Contract\s+Term|Initial\s+Term|Term\s+of\s+(?:the\s+)?Agreement)[:\s|]*([^\n|]+)",
        r"(?:term|duration)[:\s]*(\d+\s*(?:months?|years?|days?))",
        r"(\w+\s*\(\d+\)\s*(?:Year|Month)s?)",
    ],
    "CPEO Client": [
        r"(?:CPEO\s+Client)[:\s|?]*([^\n|]+)",
    ],
    "Client Status": [
        r"(?:Client\s+Status)[:\s|]*([^\n|]+)",
    ],
    # ── Payroll Information ──
    "Pay Frequency": [
        r"(?:Pay\s+Frequenc(?:y|ies)|Billing\s+Frequency)[:\s|]*([^\n|]+)",
        r"((?:Semi-?[Mm]onthly|Bi-?[Ww]eekly|Weekly|Monthly))",
    ],
    "First Payroll Date": [
        r"(?:Requested\s+1st\s+Pay\s+Date|First\s+Payroll\s+(?:Check\s+)?Date)[:\s|]*(\d{1,2}/\d{1,2}/\d{2,4})",
        r"(?:first\s+payroll|1st\s+payroll)[:\s]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
    ],
    "Pay Period Begin Date": [
        r"(?:Pay\s+Period\s+Begin\s+Date)[:\s|]*(\d{1,2}/\d{1,2}/\d{2,4})",
    ],
    "Pay Period End Date": [
        r"(?:Pay\s+Period\s+End\s+Date)[:\s|]*(\d{1,2}/\d{1,2}/\d{2,4})",
    ],
    # ── Services & Coverage ──
    "Services Included": [
        r"(?:services?\s+included|included\s+services?|scope\s+of\s+services?)[:\s]*(.+?)(?:\n\n|\n(?=[A-Z#]))",
        r"(?:shall\s+provide|will\s+provide|services?\s+provided)[:\s]*(.+?)(?:\n\n|\n(?=[A-Z#]))",
        r"(?:Schedule\s+1\.1)[^.]{0,200}(.+?)(?:\n\n|\n(?=[A-Z#]))",
    ],
    "SUTA Coverage": [
        r"(?:SUTA|State\s+Unemployment(?:\s+Tax)?)\s*(?:coverage|responsibility|obligation)?[:\s]*(.+?)(?:\n|$)",
        r"(?:state\s+unemployment\s+tax)[:\s]*(.+?)(?:\n|$)",
    ],
    "WC Codes": [
        r"(?:WC\s+codes?|workers?\s*(?:comp(?:ensation)?)?(?:\s+class(?:ification)?)?\s*codes?|NCCI\s+codes?)[:\s]*(.+?)(?:\n|$)",
        r"(?:class\s+codes?|classification\s+codes?)[:\s]*([\d,\s]+)(?:\n|$)",
    ],
    # ── Time & Labor ──
    "Utilize TLM": [
        r"(?:Will\s+Client\s+Utilize\s+(?:G&A\s+)?TLM|Time\s+(?:&|and)\s+Labor\s+Management)[:\s|?]*([^\n|]+)",
    ],
    "Time Tracking Method": [
        r"(?:How\s+will\s+the\s+client\s+track\s+time|Time\s+Tracking)[:\s|?]*([^\n|]+)",
    ],
    # ── PTO ──
    "Track PTO": [
        r"(?:Will\s+G&A\s+Track\s+PTO|PTO\s+Tracking)[:\s|?]*([^\n|]+)",
    ],
    # ── Benefits ──
    "Offer Benefits": [
        r"(?:Will\s+the\s+Client\s+Offer\s+Benefits)[:\s|?]*([^\n|]+)",
        r"(?:Benefits\s+(?:Offered|Included))[:\s|]*([^\n|]+)",
    ],
    "Plan Sponsors": [
        r"(?:Plan\s+Sponsors?)[:\s|]*([^\n|]+)",
    ],
    "Benefit Effective Date": [
        r"(?:G&A\s+Benefit\s+Plan\s+Effective\s+Date|Benefit(?:s)?\s+Effective\s+Date)[:\s|]*(\d{1,2}/\d{1,2}/\d{2,4})",
    ],
    "Medical Carrier": [
        r"(?:Master\s+Plan\s+Medical\s+Carrier|Medical\s+Carrier|Medical\s+Plan)[:\s|]*([^\n|]+)",
    ],
    # ── Retirement ──
    "Offer Retirement Plan": [
        r"(?:Will\s+the\s+Client\s+Offer\s+a\s+Retirement\s+Plan|401\(?k\)?\s+Plan)[:\s|?]*([^\n|]+)",
    ],
    "Retirement Plan Carrier": [
        r"(?:Retirement\s+Plan\s+Carrier|401k\s+Carrier|401\(?k\)?\s+Carrier)[:\s|]*([^\n|]+)",
    ],
    # ── Fee Structure ──
    "Admin Fee": [
        r"(?:admin(?:istrative)?\s+fee|administration\s+fee)[:\s$]*(\$?[\d,.]+[^.\n]{0,40})",
        r"(?:Administrative\s+Fee[s]?)[:\s]*(\$[\d,.]+\s*(?:PEPM|PCPM|per\s+\w+)[^.\n]{0,30})",
        r"(\$[\d,.]+)\s*(?:PEPM|PCPM|Per\s+Client|per\s+employee)",
        r"(?:fee.*?schedule|schedule.*?fee)[^.]{0,200}(\$[\d,.]+\s*(?:per|PEPM|PCPM|/)[^.\n]{0,40})",
    ],
    "FEIN": [
        r"(?:FEIN|EIN|Federal\s+(?:Employer\s+)?(?:Identification|ID)\s*(?:Number)?)[:\s#|]*(\d{2}-?\d{7})",
        r"(?:Tax\s+ID|Tax\s+Identification\s+Number|TIN)[:\s#|]*(\d{2}-?\d{7})",
        r"\b(\d{2}-\d{7})\b",
    ],
    "Ownership Structure": [
        r"(?:ownership\s+structure|entity\s+type|business\s+(?:type|structure|form))[:\s]*(.+?)(?:\n|$)",
        r"(?:organized\s+as\s+(?:a|an)?\s*)(.+?)(?:\n|$|,)",
        r"(?:type\s+of\s+(?:entity|organization|business))[:\s]*(.+?)(?:\n|$)",
        r"((?:LLC|Limited\s+Liability|Inc(?:orporated)?|Corp(?:oration)?|Partnership|Sole\s+Proprietor)\w*)",
    ],
}

# Category mapping for UI grouping
FIELD_CATEGORIES: dict[str, str] = {
    "Organization Name": "General Information",
    "Business Advisor": "General Information",
    "Contract Type": "General Information",
    "Number of Employees": "General Information",
    "Decision Maker": "General Information",
    "Client Onboarding Contact": "General Information",
    "Current Payroll Vendor": "General Information",
    "Current Vendor Relationship": "General Information",
    "Broker Referred": "General Information",
    "Broker Name": "General Information",
    "Effective Date": "Contract & Dates",
    "Contract Term": "Contract & Dates",
    "CPEO Client": "Contract & Dates",
    "Client Status": "Contract & Dates",
    "Pay Frequency": "Payroll",
    "First Payroll Date": "Payroll",
    "Pay Period Begin Date": "Payroll",
    "Pay Period End Date": "Payroll",
    "Services Included": "Services & Coverage",
    "SUTA Coverage": "Services & Coverage",
    "WC Codes": "Services & Coverage",
    "Utilize TLM": "Time & Labor",
    "Time Tracking Method": "Time & Labor",
    "Track PTO": "PTO",
    "Offer Benefits": "Benefits",
    "Plan Sponsors": "Benefits",
    "Benefit Effective Date": "Benefits",
    "Medical Carrier": "Benefits",
    "Offer Retirement Plan": "Retirement / 401k",
    "Retirement Plan Carrier": "Retirement / 401k",
    "Admin Fee": "Fee Structure",
    "FEIN": "Company Information",
    "Ownership Structure": "Company Information",
}

# Only company name is masked per guardrail
MASKED_FIELDS = {"Organization Name"}


def _estimate_bounding_box(position: int, page_num: int, value_length: int) -> dict:
    """Estimate a bounding box for a matched value based on character position."""
    # Position within page (0-3000 chars mapped to page height)
    pos_in_page = position % 3000
    y_ratio = pos_in_page / 3000  # 0.0 to 1.0

    # Estimate coordinates on a standard letter page (612x792 points)
    x = 72  # left margin
    y = int(72 + (y_ratio * 648))  # top margin + proportional
    width = min(468, max(100, value_length * 7))  # rough char width
    height = 18

    return {"x": x, "y": y, "width": width, "height": height}


def _detect_section(markdown: str, position: int) -> str:
    header_pattern = re.compile(r"^(#{1,4})\s+(.+?)$", re.MULTILINE)
    text_before = markdown[:position]
    headers = list(header_pattern.finditer(text_before))
    if headers:
        last_header = headers[-1].group(2).strip()
        return f"Parsed Section: {last_header}"
    page_num = (position // 3000) + 1
    return f"Parsed Document p.{page_num}"


def _clean_value(value: str) -> str:
    """Clean extracted value: remove markdown artifacts, truncate, normalize."""
    value = re.sub(r"\s+", " ", value).strip(" \t\n\r|*_\"'")
    # Remove leading punctuation artifacts
    value = re.sub(r"^[:\-,;\s|]+", "", value).strip()
    # Remove trailing punctuation fragments
    value = re.sub(r"[,;\s|]+$", "", value).strip()
    # Remove markdown formatting
    value = re.sub(r"[#*_`]", "", value).strip()
    # Truncate to reasonable length (150 chars max for a field value)
    if len(value) > 150:
        # Try to cut at a word boundary
        cut = value[:150].rfind(" ")
        value = value[:cut] if cut > 80 else value[:150]
    return value


def _extract_field(field_name: str, patterns: list[str], markdown: str) -> dict:
    for idx, pattern in enumerate(patterns):
        try:
            match = re.search(pattern, markdown, re.IGNORECASE | re.DOTALL)
            if match:
                value = match.group(1).strip() if match.lastindex and match.lastindex >= 1 else match.group(0).strip()
                value = _clean_value(value)
                if not value or len(value) < 2 or value.lower() in ("[not provided]", "[not specified]", "none", "n/a", ""):
                    continue

                if idx == 0:
                    confidence = 0.97
                elif idx == 1:
                    confidence = 0.95
                elif idx == 2:
                    confidence = 0.92
                else:
                    confidence = max(0.88, 0.93 - (idx * 0.02))

                position = match.start()
                citation = _detect_section(markdown, position)
                page_number = (position // 3000) + 1
                source_text = match.group(0).strip()[:100]
                bounding_box = _estimate_bounding_box(position, page_number, len(value))
                return {
                    "value": value,
                    "confidence": round(confidence, 2),
                    "citation": citation,
                    "page_number": page_number,
                    "source_text": source_text,
                    "bounding_box": bounding_box,
                }
        except (re.error, IndexError):
            continue

    # Fuzzy keyword search
    keyword = field_name.lower().replace("_", " ")
    keyword_match = re.search(
        rf"(?i)\b{re.escape(keyword)}\b.{{0,80}}?[:\-|]\s*(.+?)(?:\n|$)",
        markdown,
    )
    if keyword_match:
        value = _clean_value(keyword_match.group(1))
        if value and len(value) > 1 and value.lower() not in ("[not provided]", "[not specified]", "none", "n/a"):
            position = keyword_match.start()
            citation = _detect_section(markdown, position)
            page_number = (position // 3000) + 1
            source_text = keyword_match.group(0).strip()[:100]
            bounding_box = _estimate_bounding_box(position, page_number, len(value))
            return {
                "value": value,
                "confidence": 0.85,
                "citation": citation,
                "page_number": page_number,
                "source_text": source_text,
                "bounding_box": bounding_box,
            }

    # Broad scan
    broad_keyword = field_name.split("(")[0].strip().lower()
    broad_match = re.search(rf"(?i)\b{re.escape(broad_keyword)}\b[^.\n]{{0,150}}", markdown)
    if broad_match:
        raw = broad_match.group(0).strip()
        val_match = re.search(r"[:\-|]\s*(.+?)$", raw)
        if val_match:
            value = _clean_value(val_match.group(1))
            if value and len(value) > 1 and value.lower() not in ("[not provided]", "[not specified]", "none"):
                position = broad_match.start()
                citation = _detect_section(markdown, position)
                page_number = (position // 3000) + 1
                source_text = broad_match.group(0).strip()[:100]
                bounding_box = _estimate_bounding_box(position, page_number, len(value))
                return {
                    "value": value,
                    "confidence": 0.82,
                    "citation": citation,
                    "page_number": page_number,
                    "source_text": source_text,
                    "bounding_box": bounding_box,
                }

    return {
        "value": "Not available in document",
        "confidence": 0.75,
        "citation": "Searched full document — field not present",
        "page_number": 1,
        "source_text": "",
        "bounding_box": None,
    }


def _mask_field_value(field_name: str, value: str) -> tuple[str, bool]:
    if value in ("Not Found", "Not available in document"):
        return value, False
    if field_name == "Organization Name":
        masked = mask_company_name(value)
        return masked, True
    # Redact embedded SSNs only
    ssn_pattern = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
    if ssn_pattern.search(value):
        value = ssn_pattern.sub("[SSN REDACTED]", value)
        return value, True
    return value, False


def extract_fields_from_markdown(markdown: str, pages=None) -> list[dict]:
    if not markdown or not markdown.strip():
        logger.warning("Empty markdown provided to field extractor")
        return []

    results: list[dict] = []

    for field_name, patterns in CSA_FIELD_PATTERNS.items():
        best_result = None

        # If page-separated data is available, search each page and record real page number
        if pages and len(pages) > 0:
            for page_info in pages:
                page_md = page_info.get("md", "")
                page_num = page_info.get("page", 1)
                if not page_md.strip():
                    continue
                result = _extract_field(field_name, patterns, page_md)
                if result["value"] != "Not available in document":
                    result["page_number"] = page_num
                    result["citation"] = f"CSA Page {page_num}"
                    if not best_result or result["confidence"] > best_result["confidence"]:
                        best_result = result

        # Fall back to full-document search
        if not best_result:
            result = _extract_field(field_name, patterns, markdown)
            if result["value"] != "Not available in document":
                best_result = result

        if not best_result:
            best_result = {
                "value": "Not available in document",
                "confidence": 0.75,
                "citation": "Searched full document — field not present",
                "page_number": 0,
                "source_text": "",
                "bounding_box": None,
            }

        category = FIELD_CATEGORIES.get(field_name, "Other")

        if field_name in MASKED_FIELDS:
            display_value, is_masked = _mask_field_value(field_name, best_result["value"])
        else:
            display_value, is_masked = best_result["value"], False

        results.append({
            "field_name": field_name,
            "field_value": display_value,
            "confidence": best_result["confidence"],
            "source_citation": best_result["citation"],
            "category": category,
            "is_masked": is_masked,
            "page_number": best_result["page_number"],
            "source_text": best_result["source_text"],
            "bounding_box": best_result["bounding_box"],
        })

    logger.info(
        "Extracted %d fields from markdown (%d chars, %d pages). Found values: %d",
        len(results),
        len(markdown),
        len(pages) if pages else 0,
        sum(1 for r in results if r["field_value"] != "Not available in document"),
    )
    return results
