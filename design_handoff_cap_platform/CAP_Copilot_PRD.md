# G&A CAP Platform — Copilot PRD

> **For:** Engineering teammate building on top of the existing CAP tool prototype.
> **Scope:** The **Copilot** — a sidebar AI agent that interacts in natural language, pulls data from connected systems, updates the current CAP, and surfaces information on demand. **Cross-cutting:** used during both **New Business** and **Renewal** flows.
> **Depends on:** Foundation PRD (F1–F10, especially F2 connections/sync, F8 validation, F9 roles), New Business PRD (NB#), Renewal PRD (R#). Upgrades the prototype's existing scripted copilot to a real agent.
> **Status:** Build spec. Preliminary, iterate as the prototype evolves.

---

## 1. Context & purpose

The platform is data-rich (synced Prism master + client data, foundation config, the CAP model, extraction results, ClientSpace cases, DocuSign status) but an AM shouldn't have to navigate all of it manually. The **Copilot** is a persistent, context-aware sidebar agent that lets a user **ask, retrieve, explain, and act** in natural language — *"what's blocking handoff?"*, *"set the medical contribution to flat $500"*, *"what changed in the master rates since this CAP was built?"*, *"generate the booklet and route it for signature."*

It is the same agent across both origination flows; its behavior adapts to whether the active CAP is **new business** or a **renewal** (§11).

The existing prototype ships a **scripted** copilot (no live LLM). This PRD specifies the **real agent** — LLM orchestration with tool-calling over the platform's capabilities — while preserving a scripted/offline path so it remains demoable without a live tenant.

### Three things the Copilot does

| Mode | What it does | Examples |
|---|---|---|
| **Retrieve / surface** | Pulls and presents data from the CAP, foundation, and connected systems | "What's the BCBSTX PPO $500 rate?" · "Pull the latest headcount from Prism" · "Show me last year's contribution strategy" |
| **Explain / reason** | Explains fields, calculations, blockers, and differences | "Why is the employer portion $670?" · "What's blocking Ben Admin handoff?" · "What changed vs. last year?" |
| **Act / update** | Modifies the current CAP or triggers workflow, with confirmation | "Set strategy to Flat Dollar $500" · "Accept all carried-forward items" · "Re-baseline onto 2026 rates" · "Generate the Prism payload" |

---

## 2. Goals & non-goals

**Goals**

1. A natural-language sidebar usable throughout new-business and renewal CAP work.
2. **Grounded answers** sourced from the platform's real data, with citations — never fabricated.
3. **Cross-system retrieval** via the foundation's existing connections (no new sync logic, no new SoR).
4. **Safe writes** to the current CAP — every change previewed as a diff and confirmed before apply.
5. **Permission- and provenance-aware** — the agent can only do what the current user/role can, and respects synced/read-only fields.
6. **Fully auditable** — every agent action logged like any human action.

**Non-goals**

- Not a separate data store or system of record — it reads/writes through existing platform capabilities.
- Not a sync engine — cross-system data comes from F2 streams/connections.
- No autonomous, unconfirmed writes to finalized/signed CAPs.
- No bypassing of validation gates (F8) or role permissions (F9).

---

## 3. The Copilot at a glance

```
Copilot (sidebar, cross-cutting)
│
├── CP1  Sidebar & interaction model       persistent panel, conversational, actionable cards
├── CP2  Context awareness & grounding      knows active CAP / section / role; retrieves real data
├── CP3  Retrieve & surface (read tools)     CAP · foundation · Prism · ClientSpace · docs · DocuSign
├── CP4  Act & update (write tools)          edit CAP, run gates, generate booklet, route, handoff — with diff+confirm
├── CP5  Explain & reason                    fields, calculations, blockers, diffs
├── CP6  Suggested actions / proactive       context-aware prompt chips + nudges
└── CP7  Guardrails, permissions & audit      confirmation, RBAC, PII handling, logging, citations
```

---

## 4. Cross-cutting requirements

- **Grounded-or-silent.** Every factual answer is grounded in retrieved platform data and **cites the source record + version** (reusing the provenance/linkage-chip convention). If the data isn't available, the agent says so — it never guesses a rate, factor, or field value.
- **Diff-before-write.** Every mutation is shown as a **before→after preview** the user confirms; nothing is applied silently.
- **Permission parity (F9).** The agent's available actions are the intersection of platform capabilities and the **current user's role permissions**. It cannot edit synced/read-only (Prism) fields or do anything the user couldn't do manually.
- **Everything logged (F8/audit).** Agent reads and writes are recorded in the CAP activity/audit log with `kind: "ai"`, actor = user (agent-assisted), and before→after for writes.
- **Versioning-aware.** When surfacing or changing rate/factor-derived values, the agent respects the CAP's pinned foundation versions and flags drift (R4) rather than silently using live values.

---

## 5. CP1 — Sidebar & interaction model

**Purpose:** A persistent, conversational surface available throughout the CAP workspace.

**Requirements**
- **Sidebar panel** togglable from anywhere in the CAP workspace (new business + renewal), retaining conversation history for the session.
- **Conversational I/O:** natural-language input; responses combine prose with **actionable cards** (e.g. a proposed field change with Apply/Discard, a rate lookup result, a readiness summary with jump-links).
- **Multi-turn chaining:** the agent can sequence steps (retrieve → propose change → confirm → apply → confirm result) within one conversation.
- **Deep-links:** answers link to the relevant section/field/source record.
- **Inline diffs:** proposed writes render as before→after cards (§CP4).

**Acceptance criteria**
- The sidebar is available across both flows and persists conversation within a session.
- Responses can include actionable cards, not just text.

---

## 6. CP2 — Context awareness & grounding

**Purpose:** The agent always knows *which* CAP, section, and role it's operating in, and retrieves real data to ground responses.

**Requirements**
- **Context assembly** on each turn: active CAP id + state, current section/field focus, user role, flow type (new business / renewal), and the CAP's pinned foundation versions.
- **Retrieval over real data:** the agent grounds answers in the CAP model, foundation data (F3–F8), connected-system reads (CP3), and document-extraction results — not on training-data assumptions.
- **Citation:** surfaced facts carry a source reference (e.g. `Master Plan Library · BCBSTX 2026`, `Prism client record · synced 2h ago`, `uploaded census`).

**Acceptance criteria**
- Asking "what's the current headcount?" returns the value with its source and freshness.
- The agent's answers reflect the specific active CAP and role, not a generic response.

---

## 7. CP3 — Retrieve & surface (read tools)

**Purpose:** Let the agent pull data from across the platform and connected systems.

**Read tool catalog (each maps to an existing platform capability; no new sync):**
- **CAP model:** any field/section value, contribution math results, readiness state.
- **Foundation (F3–F8):** master plan + carrier rate lookups (versioned), pricing-stack factors, parameters/fees, vocab, validation rules.
- **Prism (via F2 streams):** client-record fields (factors, effective date, WSE count, classes), current rates. Reads only — through the foundation's synced data.
- **ClientSpace (via F2):** case status, commissions, benefits-page state.
- **Documents:** extraction results + confidence (NB2 / R3).
- **DocuSign (via F2):** envelope/signature status.
- **Cross-CAP:** prior-year CAP, similar clients (for context).

**Example queries**
- "What's the BCBSTX PPO $500 family rate this year?" → F3 lookup, cites version.
- "Pull the latest census headcount from Prism." → F2 client-record read, cites freshness.
- "What did this client choose last year?" → prior-year CAP read.
- "What's the renewal increase?" → Prism record / diff (renewal).

**Acceptance criteria**
- The agent can answer each example with a real, cited value.
- Reads route through foundation connections, never a separate data path.

---

## 8. CP4 — Act & update the CAP (write tools)

**Purpose:** Let the agent make changes and drive workflow — always confirmed.

**Write tool catalog (each gated by role + diff-confirm):**
- **Field edits:** set/clear a field, confirm an extracted value, fill a flagged gap.
- **Contribution modeling:** set strategy (Variable/Base/Flat/Rolldown), set EE%/Dep%/flat-$, apply a % across plans — with live recompute preview.
- **Diff resolution:** accept/reject a proposed delta (R3), bulk-approve carried-forward items (R5).
- **Drift reconciliation:** "bring up to date" — re-baseline onto current foundation versions (R4), shown as a reviewable diff.
- **Readiness:** run the validation check (F8), summarize blockers.
- **Documents:** generate/preview the booklet (NB7/R7).
- **Workflow:** route booklet for signature (NB8/R8), generate the Prism handoff/update payload (NB9/R9), advance status (within role permissions).

**Behavior**
- Every write produces a **before→after preview card**; the user clicks **Apply** (or **Discard**). Nothing mutates without confirmation.
- Batchable changes show a combined preview ("3 fields will change").
- Applied changes are logged (`kind: "ai"`) and update the readiness rail/diff immediately.
- The agent **cannot** edit synced/read-only fields or write to a signed/locked CAP.

**Acceptance criteria**
- "Set medical strategy to Flat Dollar $500" produces a recompute preview and applies only on confirm.
- "Accept all carried-forward items" (renewal) previews the batch and applies on confirm.
- Attempting to edit a Prism-synced field is refused with an explanation.

---

## 9. CP5 — Explain & reason

**Purpose:** Turn the platform's deterministic logic into plain-language explanations.

**Requirements**
- **Explain a value:** "Why is the employer portion $670.69?" → walk the math: carrier base × risk factor → billed → contribution strategy split, citing the factor versions used.
- **Explain blockers:** "What's blocking handoff?" → list unmet F8 gates + the fix for each, with jump-links.
- **Explain differences:** "What changed vs. last year?" (renewal) → summarize the R5 diff, separating client-driven vs. master-data-driven changes.
- **Explain fields:** definitions/business meaning of a field on request.

**Acceptance criteria**
- A "why is this number X" query returns a correct, step-by-step, cited explanation.
- "What's blocking handoff?" enumerates the real unmet gates with fixes.

---

## 10. CP6 — Suggested actions & proactive prompts

**Purpose:** Reduce blank-box friction and nudge the next best action.

**Requirements**
- **Context-aware prompt chips** that change by flow/section/state (e.g. on a fresh new-business CAP: "Confirm extracted fields," "Show what's missing"; on a renewal: "Summarize what changed," "Bring up to date," "Confirm renewal increase").
- **Proactive nudges** tied to state (non-intrusive): e.g. "3 open-market rates still need confirmation before handoff," "2026 rates are available — review drift."
- Suggestions are **actionable** (one click runs the corresponding CP3/CP4/CP5 action, still with confirmation for writes).

**Acceptance criteria**
- The prompt chips differ appropriately between a new-business CAP and a renewal.
- A nudge reflects the real current state of the active CAP.

---

## 11. New business vs. renewal behaviors

The agent is one capability with flow-adaptive behavior:

| Aspect | New Business | Renewal |
|---|---|---|
| Default focus | Confirm extractions, fill gaps, model contribution | Summarize changes, reconcile drift, confirm renewal increase |
| Signature read | First-time selections | Annual re-sign vs. prior year |
| Key proactive nudge | "N extracted fields need confirmation" | "Pinned to 2025 data — review N drift changes" |
| Write specialties | Bulk-confirm extracted fields (NB2/NB3) | Bulk-approve carried-forward; re-baseline (R4/R5) |
| Handoff payload | Prism **create** (NB9) | Prism **update** (R9) |

**Acceptance criteria**
- The agent detects flow type and adapts its defaults, nudges, and handoff operation accordingly.

---

## 12. CP7 — Guardrails, permissions & audit

**Purpose:** Make the agent safe and trustworthy in a PHI/PII/SOX context.

**Requirements**
- **Confirmation on all writes** (CP4); no silent mutation; explicit refusal + reason when an action isn't permitted.
- **RBAC (F9):** action set = capabilities ∩ user-role permissions; cannot exceed the user's own rights; cannot edit synced/read-only fields; cannot modify signed/locked artifacts.
- **PII/PHI minimization:** send structured references and the minimum necessary fields to the LLM, not raw census/SSN dumps; redact/limit sensitive payloads per the program's data-governance rules. Document what is and isn't sent to the model.
- **Grounding/anti-hallucination:** factual claims must be backed by a retrieval result; if unavailable, the agent states it can't find the data rather than inventing it.
- **Full audit:** every read (optional, for sensitive data) and every write logged with actor, timestamp, tool, inputs, before→after, and confirmation event.
- **Source transparency:** every surfaced fact and proposed change shows where it came from and (for rates/factors) which version.

**Acceptance criteria**
- An action beyond the user's role is refused with a clear reason and logged.
- A factual answer without supporting data returns an honest "not found," not a fabricated value.
- Every applied write appears in the CAP audit log as agent-assisted.

---

## 13. Architecture notes

- **LLM orchestration with tool-calling.** The agent exposes the CP3 (read) and CP4 (write) catalogs as typed tools; the model plans and calls them; the platform executes against real capabilities. Writes return a preview the UI renders for confirmation before commit.
- **Retrieval/grounding** over the CAP model + foundation data + connected-system reads; assemble a compact, role-scoped context per turn (CP2). Avoid dumping full datasets into the prompt — fetch on demand via read tools.
- **Connected-systems access** is exclusively through the foundation's F2 connections/streams — the agent has no independent integration or store.
- **Scripted/offline mode preserved.** Keep a deterministic path (upgrading the prototype's `copilotScript`) so the Copilot demos on simulated data without a live LLM/tenant; the real agent and scripted mode share the same tool catalog and UI.
- **Token/cost discipline** (per the program's cost goals): on-demand retrieval, compact context, cache stable foundation lookups, prefer structured references over raw documents.

---

## 14. Data model (entities to introduce/extend)

- **CopilotSession** — { id, userId, role, capId, flowType, messages[] }
- **CopilotMessage** — { role: user|agent, content, toolCalls[], citations[], proposedChanges[] }
- **ToolCall** — { tool, inputs, result|previewDiff, status, ts }
- **ProposedChange** — { capId, field(s), before, after, status: pending|applied|discarded, confirmedBy }
- **AuditEvent** (extend) — `kind: "ai"`; capture tool, inputs, before→after, confirmation.

The Copilot reuses existing entities (Cap, foundation records, DiffRow, ProposedDelta, ReadinessItem, PrismHandoff) via its tools rather than duplicating them.

---

## 15. Build sequencing (suggested milestones)

**Milestone 1 — Grounded read + explain (demo-critical)**
- CP1 sidebar + CP2 context/grounding.
- CP3 read tools over CAP + foundation (rates, factors, readiness) with citations.
- CP5 explain (value math, blockers).

**Milestone 2 — Safe writes**
- CP4 write tools with diff-confirm: field edits, contribution modeling, run readiness, generate booklet.
- CP7 guardrails: RBAC, audit logging, confirmation.

**Milestone 3 — Cross-system + flow-adaptive**
- CP3 extend to Prism/ClientSpace/DocuSign reads; CP4 extend to route-for-signature + Prism payload.
- CP6 suggested prompts + proactive nudges; §11 new-business vs. renewal adaptation.
- PII minimization pass + token/cost tuning.

---

*G&A CAP Platform — Copilot PRD · Build spec for the existing CAP prototype · Preliminary.*
