class OCRParser:
    """Parses PDF documents using OCR. In production, delegates to LlamaParse or Azure DI."""

    async def parse(self, file_path: str) -> dict:
        return {
            "total_pages": 12,
            "text_blocks": [
                {"page": 1, "type": "header", "content": "CUSTOMER SERVICE AGREEMENT"},
                {"page": 1, "type": "paragraph", "content": "This Customer Service Agreement ('Agreement') is entered into..."},
                {"page": 2, "type": "section_header", "content": "SECTION 2: TERM AND EFFECTIVE DATE"},
                {"page": 2, "type": "paragraph", "content": "This Agreement shall become effective on August 1, 2026..."},
                {"page": 3, "type": "section_header", "content": "SECTION 3: FEE STRUCTURE"},
                {"page": 3, "type": "table", "content": "Administrative Fee: $45.00 per employee per month"},
                {"page": 4, "type": "section_header", "content": "SECTION 4: SERVICES"},
                {"page": 4, "type": "list", "content": "Payroll Processing, Tax Filing, Time & Attendance..."},
                {"page": 5, "type": "section_header", "content": "SECTION 5: TAX AND COMPLIANCE"},
                {"page": 5, "type": "paragraph", "content": "SUTA Coverage: Full Coverage - All States"},
                {"page": 6, "type": "section_header", "content": "SECTION 6: BILLING"},
                {"page": 9, "type": "section_header", "content": "SECTION 9: BANKING INFORMATION"},
                {"page": 12, "type": "signature_block", "content": "Signed on July 15, 2026"},
            ],
            "tables_detected": 6,
            "confidence": 0.96,
        }


ocr_parser = OCRParser()
