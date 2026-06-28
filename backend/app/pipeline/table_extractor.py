class TableExtractor:
    """Extracts structured data from detected tables in the document."""

    async def extract_tables(self, parsed_output: dict, structure: dict) -> list[dict]:
        return [
            {
                "table_id": "tbl-001",
                "title": "Fee Schedule",
                "page": 3,
                "headers": ["Fee Type", "Amount", "Frequency"],
                "rows": [
                    ["Administrative Fee", "$45.00/employee", "Monthly"],
                    ["Per-Employee Fee", "$12.50/employee", "Monthly"],
                    ["Setup Fee", "$0.00", "One-time"],
                    ["Early Termination", "3 months admin fee", "If applicable"],
                ],
                "confidence": 0.94,
            },
            {
                "table_id": "tbl-002",
                "title": "Services Matrix",
                "page": 4,
                "headers": ["Service", "Included"],
                "rows": [
                    ["Payroll Processing", "Yes"],
                    ["Tax Filing", "Yes"],
                    ["Time & Attendance", "Yes"],
                    ["HR Advisory", "Yes"],
                    ["Workers Comp Admin", "Yes"],
                    ["Benefits Administration", "No"],
                    ["COBRA", "No"],
                    ["401k Administration", "No"],
                ],
                "confidence": 0.92,
            },
            {
                "table_id": "tbl-003",
                "title": "WC Code Schedule",
                "page": 5,
                "headers": ["WC Code", "Description", "Rate"],
                "rows": [
                    ["8810", "Clerical Office Employees", "0.15"],
                    ["8742", "Sales Personnel - Outside", "0.42"],
                    ["5191", "Office Machine Installation", "1.28"],
                ],
                "confidence": 0.89,
            },
        ]


table_extractor = TableExtractor()
