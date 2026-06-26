# CSA Extraction — Demo Recording Script

**Duration:** ~3-4 minutes
**Flow:** Slides → ClientSpace Clients → Upload CSA → Review Drawer → Approval → Lock/Unlock

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
> 1. **AI Extraction** — LlamaParse parses the PDF, Claude Haiku extracts structured fields following a defined schema — fee structure, included and optional services, SUTA state coverage, billing exceptions, IRS classification.
> 2. **Cross-Validation** — LLM-driven field-to-field discrepancy check against the ClientSpace handoff page data.
> 3. **Human Review** — Extracted fields with clear linkage back to each section of the PDF. Approval gates, comments, mismatch flags.
> 4. **Downstream Sync** — On approval, data flows directly to ClientSpace — client record, onboarding case, tasks, document collection triggers.

*(Pause 3 seconds on the diagram)*

---

## STEP 1: ClientSpace Clients (20 sec)

**[Switch to app → Workspace → Onboarding → CSA Extraction]**

> "We start with clients synced from ClientSpace. Each card shows the client name, ClientSpace ID, assigned PM and PA, onboarding stage, and employee count."

**[Hover over Acme Corp card]**

> "I'll click on Acme Corp — notice the PM is Dana Whitfield and the PA is Sam Cho. Each role sees only their relevant fields during review."

---

## STEP 2: Upload CSA (15 sec)

**[Click Upload & Extract from sidebar]**

> "I drop the signed CSA PDF here. The system validates the file — checks PDF integrity, rejects corrupted or password-protected documents — then redirects me to the extractions dashboard."

**[Drop CSA PDF → watch redirect to dashboard]**

> "The new entry appears immediately with a processing indicator showing the filename. LlamaParse is parsing the PDF page-by-page, then Claude Haiku extracts 35+ structured fields with confidence scores."

*(Wait for spinner → eye icon transition, ~10 sec)*

---

## STEP 3: Review Drawer — Fields + PDF (60 sec)

**[Click Eye icon on the completed row]**

> "The extraction is complete. I click the eye icon to open the review drawer."

### 3a. Extracted Fields (Left Panel)

**[Show left panel — scroll through categories]**

> "On the left — every extracted field is grouped by category: General Information, Contract Terms, Fee Structure, Services, Tax & Compliance, Benefits, Retirement."
>
> "Each field shows its extracted value, a confidence score, and a page pointer — 'Pg 1', 'Pg 10' — that links directly back to the source location in the PDF."

### 3b. PDF Highlights (Right Panel)

**[Click 'Effective Date' field → watch PDF scroll to page 1 with yellow highlight]**

> "When I click a field — or its page pointer — the PDF on the right scrolls to the exact page and highlights the source text in yellow, directly inside the document. This is the clear citation linkage."

**[Click 'Admin Fee' field → watch PDF scroll to page 10]**

> "$125 per covered employee per month — highlighted right on the pricing sheet, page 10."

**[Click 'WC Codes' field]**

> "WC codes CT 5606, CT 9012, CT 9083 — pulled from the workers' compensation schedule."

### 3c. ClientSpace Mismatch Flags

**[Scroll to fields with red flags]**

> "Notice the red flags — these are automatic ClientSpace mismatches. The admin fee in the CSA says $125 PEPM, but ClientSpace has $120. SUTA coverage says Client Rate CR%, but ClientSpace has Standard. Effective date says July 1st, ClientSpace says August 1st."
>
> "These discrepancies are caught immediately on extraction — before onboarding begins — replacing the manual discovery that used to happen weeks later in meetings."

### 3d. Review Notes

**[Scroll to bottom — show Review Notes textarea]**

> "One global review notes field for the entire extraction — the reviewer can add corrections, flag items for BA review, or note anything that needs discussion."

---

## STEP 4: Approval & Downstream Sync (20 sec)

**[Point to action buttons in drawer header]**

> "The reviewer has four actions: Save Draft to continue later, Approve to trigger downstream sync, Re-run Extraction if the results need improvement, or Reject for manual processing."

**[Click Approve]**

> "On approval, the system automatically:"
> - Creates or updates the ClientSpace client record
> - Opens an onboarding case with PM and PA assigned
> - Creates mismatch resolution tasks for the BA
> - Attaches the original CSA document and extraction summary
> - Triggers automated data collection requests to the client contact
>
> "This replaces the entire manual BA re-entry cycle. Extracted CSA data flows directly to ClientSpace with a full audit trail."

---

## STEP 5: Lock / Unlock (10 sec)

**[Navigate to an approved CSA → click Eye icon → show locked state]**

> "Approved extractions are locked. The action buttons are replaced with an 'Approved & Synced to ClientSpace' indicator. Re-editing requires an explicit unlock with a warning — because changes will modify downstream ClientSpace entries including client records, cases, and task assignments."

---

## CLOSE (10 sec)

> "In summary — we upload a CSA, AI extracts 35+ fields with confidence scores, cross-validates every field against ClientSpace handoff data, flags mismatches with red indicators, highlights source text directly inside the PDF, and on approval syncs everything to ClientSpace."
>
> "Four independent manual reviews reduced to one focused validation step."

---

## Key Talking Points (if asked)

| Topic | Detail |
|-------|--------|
| **Extraction engine** | LlamaParse (PDF→Markdown) + Claude Haiku (LLM schema extraction) |
| **Fields extracted** | 35+ per CSA — fee structure, services, SUTA, WC codes, billing, IRS classification, dates, contacts |
| **Confidence scoring** | Per-field: >90% auto-populated, 80-90% flagged for review, <80% manual entry |
| **Cross-validation** | LLM-driven field-to-field check: `csa.admin_fee ↔ cs.fee_structure`, `csa.suta_coverage ↔ cs.suta_type`, etc. |
| **PDF highlights** | Tesseract OCR word-level bounding boxes → percentage-positioned yellow overlays with mixBlendMode: multiply |
| **PM vs PA views** | PM sees scope, services, dates, contacts; PA sees fees, SUTA, WC, billing, tax classification |
| **Masking** | Real customer names replaced with aliases in demo UI — only Organization Name is masked |
| **Downstream sync** | Client record, onboarding case, BA review tasks, document attachment, collection triggers |
| **Audit trail** | Every extraction, edit, approval, and sync logged with actor + timestamp |
