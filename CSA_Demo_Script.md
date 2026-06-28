# CSA Extraction — Demo Recording Script

**Duration:** ~5-6 minutes
**Flow:** Slides → ClientSpace Integration → Handoff Data → Upload with Schema Editor → Review Drawer (services as list, all PRD fields) → Approval → Case Creation → Lock/Unlock

---

## SLIDE 1: Current State Problem (30 sec)

**[Open Architecture Slide → Tab 1: Current State]**

> "Today, every new client CSA goes through 4 independent manual reviews — PM Manager, PM, PA Manager, and Payroll Analyst — each spending 30-40 minutes sifting through the same multi-page legal document for fee structure, services, SUTA coverage, and billing terms."
>
> "There's no Salesforce-to-ClientSpace integration, so Business Analysts manually re-enter deal data — frequently using placeholder values that create discrepancies discovered during onboarding meetings, not at deal close."

---

## SLIDE 2: Solution Architecture (20 sec)

**[Click Tab 2: Solution Architecture → show 4-block diagram]**

> "We're replacing this with a 4-step AI pipeline:"
>
> 1. **AI Extraction** — LlamaParse parses the PDF, AI Extraction Agent extracts structured fields following a configurable schema — fee structure, services, SUTA, WC codes, ownership, cyber policy.
> 2. **Cross-Validation** — LLM-driven field-to-field discrepancy check against the ClientSpace handoff page data.
> 3. **Human Review** — Extracted fields with clear linkage back to each section of the PDF. Approval gates, comments, mismatch flags.
> 4. **Downstream Sync** — On approval, auto-creates a ClientSpace case, assigns the Sales team, and syncs all extracted data.

*(Pause 3 seconds on the diagram)*

---

## SLIDE 3: ClientSpace Integration (15 sec)

**[Click Tab 3: ClientSpace Integration]**

> "This shows how handoff data flows from ClientSpace into our cross-validation. The handoff page is the source of truth — it contains what Sales committed to at deal close. We pull this data automatically and compare it field-by-field against what's in the signed CSA."

---

## SLIDE 4: Template Engine (15 sec)

**[Click Tab 4: Template Engine]**

> "The extraction schema is fully configurable. Here are the default fields — fee structure, services, SUTA, ownership, cyber policy — all the PRD-specified fields. And notice the '+' button: business users can add new fields at any time. Since extraction is LLM-driven, new fields just work — no code changes, no regex, zero configuration."

---

## SLIDE 5: Auto Case Creation (15 sec)

**[Click Tab 5: Auto Case Creation]**

> "When a reviewer approves, the system automatically creates a ClientSpace case, assigns PM and PA, generates mismatch resolution tasks, and sends notifications. The entire manual BA re-entry cycle is eliminated."

---

## SLIDE 6: End-to-End Flow (15 sec)

**[Click Tab 6: End-to-End Flow]**

> "This is the complete downstream picture. CSA Extraction pushes to ClientSpace — case creation, team assignment, tasks. Pre-Flight Validation pushes to PrismHR — WC codes, SUTA rates, deduction mappings. Two different downstream targets, connected by the CSA Schedule 2 data that flows from Initiative D into Initiative F as the source of truth."

---

## STEP 1: ClientSpace Clients + Handoff Data (30 sec)

**[Switch to app → Workspace → Onboarding → CSA Extraction → Clients]**

> "We start with clients synced from ClientSpace. Each card shows client name, ClientSpace ID, assigned PM and PA, and employee count."

**[Click on Acme Corp]**

> "Here's Acme Corp's detail view. Notice the tabs — PM Review, PA Review, All Fields, ClientSpace Validation, and Handoff Data."

**[Click Handoff Data tab]**

> "This is the source of truth screen — the data pulled directly from the ClientSpace handoff page. Every field shows its value, source attribution, and sync status. This makes crystal clear where cross-validation data comes from."

---

## STEP 2: Upload CSA with Schema Editor (20 sec)

**[Click Upload & Extract from sidebar]**

> "Before uploading, notice the 'Edit Schema' button — this opens our configurable template engine."

**[Click Edit Schema button]**

> "Here's the extraction schema. All PRD fields are here — fee structure, services, SUTA, ownership, cyber policy, tax rates. Each field can be toggled on or off. And at the bottom of any category, the '+' button lets you add a custom field."

**[Click '+' in a category, type 'Indemnification Cap', press Enter]**

> "I just added 'Indemnification Cap' as a custom field. Next upload will automatically extract this from the CSA — no code changes needed."

**[Click Save Schema, then close modal]**

**[Drop CSA PDF → watch redirect to dashboard]**

> "Now I drop the CSA. The system validates the file, uploads it, and starts extraction."

*(Wait for spinner → eye icon transition, ~10 sec)*

---

## STEP 3: Review Drawer — All PRD Fields + Services as List (60 sec)

**[Click Eye icon on the completed row]**

> "The extraction is complete. Let me open the review drawer."

### 3a. PRD Fields Visible

**[Show left panel — scroll through categories]**

> "All PRD-specified fields are here and correctly extracted: fee structure with Admin Fee at $125 PEPM, services rendered as a formatted list — not a raw text string — contract term, SUTA coverage, ownership structure as LLC, and cyber insurance."

### 3b. Services as List

**[Scroll to Services Included field]**

> "Notice Services Included is displayed as individual tags — Talent Acquisition, Payroll Administration, Benefits Administration, Employee Relations, Training & Development, Risk Management, Regulatory Compliance, Separation. Each service is clearly separated and readable."

### 3c. PDF Highlights with Correct Citations

**[Click 'Number of Employees' field → watch PDF highlight]**

> "When I click Number of Employees, the PDF highlights the exact text: 'Estimated Number of Covered Employees: 38' — pointing to the right location on page 1, not the company name."

**[Click 'Admin Fee' → PDF scrolls to page 10]**

> "$125 per covered employee per month — highlighted on the pricing sheet."

**[Click 'Cyber Insurance Fee' field]**

> "Cyber insurance at $60 per client FEIN per month — extracted from the fee schedule."

### 3d. ClientSpace Mismatch Flags

**[Scroll to fields with red flags]**

> "Red flags show automatic mismatches: admin fee CSA says $125 but ClientSpace has $120. SUTA coverage says CR% vs Standard. These are caught immediately — not weeks later."

---

## STEP 4: Approval & Auto Case Creation (30 sec)

**[Point to action buttons in drawer header]**

> "The reviewer has four actions: Save Draft, Approve, Re-run Extraction, or Reject."

**[Click Approve]**

> "Watch what happens — the button changes to 'Approved & Case Created', a toast notification confirms the case was created, and a green banner appears showing the details."

**[Point to case creation banner]**

> "Case CS-2026 auto-created in ClientSpace, assigned to Dana Whitfield as PM and Sam Cho as PA. 22 fields synced, onboarding tasks generated. This replaces the entire manual BA re-entry cycle — from upload to assigned case in minutes, not days."

---

## STEP 5: Lock / Unlock (10 sec)

**[Navigate to an approved CSA → click Eye icon → show locked state]**

> "Approved extractions are locked. Re-editing requires an explicit unlock with a warning — because changes will modify downstream ClientSpace entries."

---

## CLOSE (10 sec)

> "In summary: configurable extraction schema, handoff page as source of truth, services shown as clean lists, all PRD fields visible with correct PDF citations, and on approval — auto case creation with Sales assignment. Four independent manual reviews reduced to one AI-assisted validation step."

---

## Key Talking Points (if asked)

| Topic | Detail |
|-------|--------|
| **Extraction engine** | LlamaParse (PDF→Markdown) + AI Extraction Agent (LLM schema extraction) |
| **Fields extracted** | 35+ per CSA — fee structure, services, SUTA, WC codes, billing, ownership, cyber policy, tax |
| **Confidence scoring** | Per-field: >90% auto-populated, 80-90% flagged for review, <80% manual entry |
| **Cross-validation** | LLM-driven field-to-field check against ClientSpace handoff page data |
| **PDF highlights** | OCR bounding boxes → percentage-positioned yellow overlays with correct per-field citations |
| **Services rendering** | Comma-separated services displayed as formatted tag list, not raw string |
| **Template engine** | Configurable schema editor with + button for custom fields; LLM handles any new field automatically |
| **Handoff data** | Dedicated tab showing ClientSpace handoff page as source of truth with sync status |
| **Auto case creation** | On approval: case auto-created, PM+PA assigned, tasks generated, notifications sent |
| **Downstream sync** | Client record, onboarding case, BA review tasks, document attachment, collection triggers |
| **Audit trail** | Every extraction, edit, approval, case creation, and sync logged with actor + timestamp |
