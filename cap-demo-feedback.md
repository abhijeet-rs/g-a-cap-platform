# CAP platform demo — simplifying the narrative for CEO

Wed, 24 Jun 26

### 

- Demo contained strong, deep technical work but the narrative arc was unclear to the CEO audience
  - Reviewer was honest: “I was lost” despite acknowledging the quality of the underlying build
  - Too much depth too early: the demo dived into module internals before establishing the high-level story
- Parallel drawn to the sales module: same issue occurred there, but the team successfully simplified the message afterward
  - Goal now is to do the same for the CAP platform before the CEO call
- Key framing fix: open the demo by positioning CAP as part of the broader end-to-end AI platform
  - Sales module already delivered; CAP is the operations module, continuing the same narrative thread
- Recommended structure: lead with a 20-second overview of all four modules, then deep-dive into each
  - This gives the CEO a mental map before any detail lands
- Ben Admin write-back piece was the most confusing section
  - Not immediately clear which module it belonged to or why it was shown at that point in the flow
  - Agreed to reframe it as Module 4 (write-back and system sync) with clearer positioning

### Four-Module Structure for the Demo

- Module 1: Data repository and foundation
  - Master plans, carrier rates, pricing stacks, vocabulary templates, calculation engines for risk factors
  - Foundational data is shared across all CAPs; currently copy-pasted from a template, needs to be centralized
  - Client-specific data sits alongside: renewal radar showing upcoming renewals, prior-year cap details
  - Open question: whether master plan and rate data is sourced directly from Prism HR via API or held natively in the platform
    - Agreed to keep language flexible (“data exists in different places that can be tapped”) to stay safe for the CEO conversation
    - Prism HR is the downstream system of record for payroll and benefits deductions, so data will ultimately live there regardless
- Module 2: CAP generation (new business and renewal)
  - For new business: AIM enters seed information, uploads CSA; AI extracts fields with confidence scores
  - For renewals: prior-year cap pre-filled from Prism; platform detects version drift (e.g. carrier rates moving from 2025 to 2026) and syncs with one click
  - Year-over-year diff shown clearly (e.g. 5.3% medical increase); account manager reviews and accepts changes
  - AI assembly populates client-related fields, plan codes, and proposed rates; human-in-the-loop validates at every step
  - Copilot available to explain rate formulas and summarize changes made during the session
- Module 3: Benefits booklet generation and client sign-off
  - Once CAP is validated, generate the booklet and route to client for signature via DocuSign
  - E-signature capability built in; envelope sent and client signature simulated in the demo
  - Renewal flow mirrors new business flow; can be noted with a horizontal callout in the demo rather than a full re-walkthrough
- Module 4: Write-back and system sync (the “closing the loop” module)
  - On client approval, two parallel syncs occur:
    - Client Space: becomes the system of record for all client documentation and contract details
    - Prism: updated rates, plans, enrollments written back via API using a four-step orchestration (validate, configure plans, enroll employees, verify)
  - Key reframe for the CEO: the tool becomes the interface for Prism setup, replacing manual field entry in the Prism UI
    - Benefits admin logs in, sees approved CAP ready, and executes write-back programmatically rather than manually
  - Every API call is audited; comments and change requests supported before final push

### Next Steps

- **Restructure and re-record the demo around the four-module narrative** (Harshil)
  - Sync with offshore team as soon as they are online; deliver updated demo by late evening today ahead of the CEO call tomorrow morning.
- **Add platform continuity framing to the demo opening** (Harshil)
  - Open by positioning CAP as the operations module within the broader end-to-end AI platform, following the already-delivered sales module.

---