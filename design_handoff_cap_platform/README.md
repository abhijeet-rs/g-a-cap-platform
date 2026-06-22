# Handoff: G&A CAP Cloud Platform

## Overview
The CAP (Client Approved Plan) Cloud Platform replaces a 29-sheet Excel workbook used by G&A Partners to manage benefits plans for ~130K WSEs across ~1,320 annual setups. It's an orchestration layer sitting on top of PrismHR, integrated with ClientSpace, WorkSight, and DocuSign.

**North Star:** Renewal CAP auto-populated → validated → booklet generated → e-signed → structured data downstream — zero re-entry.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase** using:

- **Next.js** (App Router)
- **React 18+** / **TypeScript**
- **Tailwind CSS** (utility-first styling)
- **Zustand** (state management)
- **Vite** (build tool, or Next.js built-in)

Use the prototype as the pixel-perfect reference for layout, color, spacing, and interaction — implement using the stack above with proper component architecture.

## Fidelity
**High-fidelity (hifi)** — These are pixel-perfect mockups with final colors, typography, spacing, and interactions. The developer should recreate the UI faithfully using Tailwind utilities and the design tokens listed below.

---

## Tech Stack & Project Structure

```
cap-studio/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── page.tsx                  # Login page
│   ├── (auth)/                   # Authenticated layout group
│   │   ├── layout.tsx            # App shell (sidebar + topbar + content)
│   │   ├── dashboard/page.tsx
│   │   ├── new-business/page.tsx
│   │   ├── renewal/[clientId]/page.tsx
│   │   ├── esign/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── admin/page.tsx
│   │   └── architecture/page.tsx
├── components/
│   ├── ui/                       # Primitives (Button, Badge, Input, Card, etc.)
│   ├── layout/                   # Shell, Sidebar, Topbar, CopilotPanel
│   ├── dashboard/                # MetricTile, ClientTable, RenewalRadar
│   ├── new-business/             # IntakeForm, ExtractionTable, AssemblySection, RateCard, ValidationGroup
│   ├── renewal/                  # DriftBanner, DiffTable, DiffRow
│   ├── esign/                    # SignerChain, EnvelopeContents
│   ├── admin/                    # AdminSubTabs, ConnectionCard, PlanCatalog, PricingStack...
│   ├── copilot/                  # CopilotSidebar, MessageBubble, PromptChips, ActionCard
│   └── shared/                   # ProvenanceChip, SyncOverlay, Toast, StatusBadge
├── stores/
│   ├── authStore.ts              # Auth state + role
│   ├── capStore.ts               # Active CAP data, plans, rates
│   ├── clientStore.ts            # Client list, filters, search
│   ├── newBusinessStore.ts       # NB wizard state (step, uploads, extraction, assembly)
│   ├── renewalStore.ts           # Renewal diff decisions, drift state
│   ├── esignStore.ts             # Envelope state, signers
│   ├── adminStore.ts             # Active admin sub-tab
│   ├── copilotStore.ts           # Messages, input, open/closed
│   ├── syncStore.ts              # Sync overlay state
│   └── uiStore.ts                # Toast, drawer, general UI
├── lib/
│   ├── api/                      # API client stubs (Prism, ClientSpace, DocuSign, WorkSight)
│   ├── constants/                # Clients data, plans data, role mappings
│   ├── utils/                    # fmt(), rate calculations, validation engine
│   └── types/                    # TypeScript interfaces
├── public/
│   └── fonts/                    # IBM Plex Sans, IBM Plex Mono
└── tailwind.config.ts
```

---

## Screens / Views

### 1. Login (`/`)

**Purpose:** Authenticate with role-based persona selection.

**Layout:** Full viewport, 2-column grid (`grid-cols-[1.1fr_1fr]`).
- **Left panel:** Dark gradient background (`#16242F` → `#0E1A23` → `#0B141B`), decorative radial gradient circles, logo, headline, description, 4 stat counters, footer.
- **Right panel:** White background, centered form (max-w-400px).

**Components:**
- Logo: 40×40px rounded-lg, `bg-[#C60C30]`, white "CT" text 16px/700
- Headline: 34px/600, white, letter-spacing -1px
- Stat counters: 4 items in flex row, 24px/600 white values, 10px/400 labels
- Email input: h-44px, border `#DCE2E8`, rounded-[9px], bg `#FBFCFD`
- Password input: same styling, type=password
- Submit button: h-46px, `bg-[#C60C30]`, white text 14px/600, rounded-[9px], shadow
- Persona hint box: bg `#F7F9FB`, border `#EEF1F4`, rounded-lg, 2-column grid of emails

**Interactions:**
- On submit: 900ms loading spinner, then redirect to `/dashboard`
- Email determines role: `am@` → AM, `ae@` → AE, `coordinator@` → Coord, `analyst@` → Analyst, `manager@` → GAB, `admin@` → Admin
- Loading state: spinner (border animation) + "Authenticating…" text

---

### 2. App Shell (authenticated layout)

**Purpose:** Persistent sidebar + topbar wrapping all authenticated pages.

**Layout:** Full viewport flex row.
- **Sidebar:** 232px fixed width, `bg-[#13212C]`, flex column
- **Main:** flex-1, flex column (topbar + scrollable content)

**Sidebar structure:**
- Header: Logo (32×32px) + "CAP Platform" / "G&A Partners"
- Nav sections: grouped by "WORKSPACE" and "ADMINISTRATION"
  - Section label: 8px/700, uppercase, `color: rgba(255,255,255,.25)`, letter-spacing 1.2px
  - Nav items: 12px font, rounded-[7px], 7px 10px padding
    - Active: `bg-[rgba(198,12,48,.15)]`, white text, font-weight 600
    - Inactive: `color: rgba(255,255,255,.55)`, font-weight 400
    - Hover: `bg-[rgba(255,255,255,.06)]`
    - Badge: 9px/600, `color: #C60C30`, `bg-[rgba(198,12,48,.15)]`, rounded-[4px]
- User card: bottom, bg `rgba(255,255,255,.05)`, rounded-lg
  - Avatar: 30×30px rounded-[7px], role color background, white initials
  - Name: white 11px/600
  - Role: `rgba(255,255,255,.35)` 9px
  - Logout button: ⏻ icon

**Topbar:** h-54px, white bg, bottom border `#E4E8ED`
- Left: Crumb (10px, `#98A1A8`) + Page title (14px/600)
- Right: "New Business CAP" button (red), "Renewal CAP" button (outline), "Copilot" button (purple)

**Role-based nav visibility:**

| Nav Item | AM | AE | Coord | Analyst | GAB | Admin |
|---|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| New Business | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Renewals | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| E-Signature | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin Console | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Architecture | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

### 3. Dashboard (`/dashboard`)

**Purpose:** Client book overview, renewal radar, quick actions.

**Layout:** max-w-1280px, padding 20px 24px
- **Metric tiles:** 4-column grid, gap-10px
- **Main content:** 2-column grid (`1fr 300px`), gap-14px

**Metric Tiles (4):**
- Card: white bg, border `#E4E8ED`, rounded-[10px], padding 14px 16px
- Label: 9px/600, uppercase, `#64707A`, letter-spacing .5px
- Icon: 26×26px rounded-[6px], colored bg, centered icon
- Value: 26px/600, letter-spacing -1px
- Sub: 10px, `#98A1A8`

| Tile | Value | Icon bg | Icon fg |
|---|---|---|---|
| Active CAPs | 11 | `#FDECEF` | `#C60C30` |
| In Review | 3 | `#E7F1FA` | `#0074B8` |
| Awaiting Signature | 3 | `#FBF0DD` | `#B0690A` |
| Published | 2 | `#E4F2EA` | `#1A7A4A` |

**Client Table:**
- White card, rounded-[10px], overflow hidden
- Header: search input + filter buttons row
- Filter buttons: h-26px, 10px/600, rounded-[6px]
  - Active: `bg-[#13212C]`, white text
  - Inactive: white bg, border `#E4E8ED`
- Column headers: 9px/600, uppercase, `#98A1A8`, bg `#FAFBFC`
- Grid: `minmax(140px,2fr) 56px 48px 100px 110px 82px 100px`
- Row hover: `bg-[#FBFCFD]`
- Status badge: inline-flex, h-20px, rounded-[5px], colored bg + dot + text
- Action button: h-26px, 10px/600, border `#E4E8ED`, hover → red border

**Renewal Radar (R1):**
- White card, rounded-[10px]
- Header: "Renewal Radar" + "Prism · synced" badge
- Each row: date column (day/month) + client name + urgency + WSE count
- Urgent items (≤21 days): red date text
- Click → opens renewal screen for that client

**Quick Actions:** 3 buttons (New Business, Start Renewal, Ask Copilot)

---

### 4. New Business Flow (`/new-business`) — NB1-NB9

**Purpose:** 6-step wizard for building a new client CAP from documents.

**Layout:** max-w-1080px, centered. Sticky footer with Back/Continue buttons.

**Step Indicator:**
- Horizontal flex, 6 steps
- Each: 24×24px circle + label + connecting bar
- Active: red circle (`#C60C30`), white number, bold label
- Complete: green circle (`#1A7A4A`), white ✓
- Upcoming: gray circle (`#EDF0F3`), gray number
- Bar: 2px height, green if complete, gray if upcoming

#### Step 1: Intake & Upload (NB1)

**Layout:** 2-column grid (seed info + doc checklist), then upload drop zone.

**Seed Information card:**
- 4 inputs: Company Name, Plan Year, Est. EE Count, Effective Month, Primary Carrier (select)
- Input style: h-34px, border `#DCE2E8`, rounded-[7px], font-size 12px

**Document Checklist:**
- 5 rows: Census, Carrier Invoice(s), SBCs, UW Output, Prior Booklet
- Each: status icon (18×18 circle) + name + "Unlocks: ..." + status label

**Upload Drop Zone:**
- Dashed border (2px, `#DCE2E8`), rounded-[10px], centered text
- Hover: border → `#0074B8`, bg → `#FBFDFF`
- Click simulates upload of 5 documents

#### Step 2: AI Extraction (NB2)

**Layout:** 3 metric tiles + extraction table.

**Metric tiles:** Extracted (green) / Low Confidence (amber) / Missing (red)
- Full-width colored bg, centered value + label

**Extraction table:**
- Columns: Field, Extracted Value, Confidence (progress bar), Source (badge)
- Confidence bar: 5px height, colored fill (green/amber/red)
- Source badges: "Upload" (amber), "Invoice" (amber), "Census" (amber), "Needs input" (red)
- Missing rows: red tinted background `#FEF6F7`

#### Step 3: Pre-filled Assembly (NB3)

**Layout:** Provenance legend + readiness banner + assembly section cards.

**Provenance Legend:** 4 chips in flex row
- From library: `#E7F1FA` bg, `#0074B8` text, blue dot
- From upload · confirm: `#FBF0DD` bg, `#B0690A` text, amber dot
- Underwriting: `#ECE9FA` bg, `#5A45C7` text, purple dot
- Needs input: `#FDECEF` bg, `#C60C30` text, red dot

**Readiness Banner:** amber bg `#FBF0DD`, rounded-[10px], "N items need attention"

**Assembly Sections:** White cards, each with:
- Header: section title (uppercase red) + source badge + field count
- Body: 3-column grid of fields
- Each field: label with provenance dot + value box with colored border/bg based on source

#### Step 4: Plan Design & Rates (NB4)

**Layout:** Rate formula card + contribution strategy selector + plan cards + ACA check.

**Rate Formula Card:**
- White bg, left-border 4px `#0074B8`
- Formula: `Billed = Base × Bucket × AF × (1 + Comm) × RF` in mono font
- Parameter values in flex row

**Contribution Strategy:** 4-button toggle (Variable / Base Plan / Flat Dollar / Rolldown)
- Active: `bg-[#13212C]`, white text
- Description text changes per selection

**Plan Rate Cards:** Per plan
- Header: plan type badge (Master/Open Mkt) + carrier/plan name + ER% input
- Tier rows: grid `60px 1fr 90px 90px 100px`
- PPD column: blue text, bold

**ACA Affordability:** F5 badge + result (green ✓ Affordable or red ✕)

#### Step 5: Readiness & Validation (NB5)

**Layout:** Readiness summary banner + validation group cards.

**Readiness Banner:** colored bg (red if errors, green if pass)
- Icon, label, sublabel, pass count

**Validation Groups:** 3 cards (Completeness, Source-Data, Cross-Field)
- Each group: header + list of check items
- Check item: icon (✓ green / ✕ red / ! amber) + label + error message in mono
- Error format: "Dental EE rate $29.00 ≠ Guardian TX 2026 table $27.50"

#### Step 6: Preview & Submit (NB6)

**Layout:** Workflow status bar + summary card + booklet button.

**Workflow Bar:** 5 steps (AM Submits → Coordinator QC → Client Sign-off → Prism Write-back → Configured)
- Active step: red circle, bold label
- Future: gray

**Summary Card:**
- Header: company name + plan details + annual ER estimate
- Plan rows: type badge + plan name + ER% + PPD

**Submit Action:** Triggers sync overlay (5-step ClientSpace creation flow)

---

### 5. Renewal Flow (`/renewal/[clientId]`) — R1-R9

**Purpose:** Year-over-year renewal diff with drift detection.

**Layout:** max-w-1080px

**R4 Data-Currency Banner:**
- Amber bg `#FBF0DD`, border `#F0DDB5`
- "Based on 2025 data, N newer changes available"
- "Bring up to date →" button triggers rebase sync overlay

**Renewal Header:**
- Client name, Prism ID, tier, WSE count
- Rate change badge (+5.3%)
- Resolved counter (N/M)

**Diff Legend:** Two chips (Client-driven = red, Master-data drift = blue)
+ "Accept all carried-forward" button

**Diff Table:**
- Columns: Field, Prior, New, Δ (%), Type, Decision
- Grid: `minmax(0,1.5fr) 90px 90px 70px 70px 150px`
- Type badge: "Client" (red) or "Master" (blue)
- Decision: Accept/Flag buttons per row
  - Accepted: green bg, white text
  - Flagged: red bg, white text
  - Undecided: white bg, gray border
- Unchanged rows: "Carried forward" text

**Approve button:** triggers 4-step sync overlay

---

### 6. E-Signature (`/esign`) — NB8/R8

**Purpose:** DocuSign envelope management.

**Layout:** max-w-920px, 2-column grid (`1.3fr 1fr`)

**Signing Order:** 3 signers (AM → Client → AE)
- Each: status circle + role + name + status label
- Signed: green bg/text ✓
- Awaiting: amber …
- Pending: gray ·

**Envelope Contents:** 3 PDFs (CAP Summary, Booklet, ER Confirmation)

**Action Panel:** 3 states:
1. Not sent → "Send Envelope →" (red button, triggers 5-step sync)
2. Pending → "Simulate Client Signature" (amber outline button)
3. All signed → "Publish to Downstream · NB9 →" (purple button, triggers 6-step sync)

---

### 7. Documents (`/documents`) — NB7/R7

**Purpose:** Generated booklets and signed contracts.

**Layout:** max-w-1080px, 2-column grid, gap-8px

**Document Cards:** Per signed/published/approved client
- Left: PDF icon (32×40px, dark gradient bg)
- Center: document name + Prism ID + tier (mono font)
- Right: status badge

---

### 8. Admin Console (`/admin`) — F1-F10

**Purpose:** Foundation data management.

**Layout:** max-w-1200px. Sub-tab bar + content area.

**Sub-tabs:** 9 buttons (F2 Connections through F10 UW Intake)
- Active: `bg-[#13212C]`, white text
- Inactive: white bg, border `#E4E8ED`

**Content per tab:** (see prototype for detailed content of each)

| Tab | Key Components |
|---|---|
| F2 Connections | 5 integration cards (Prism, ClientSpace, WorkSight, DocuSign, Carrier UW) with status badges |
| F3 Master Plans | Plan catalog card + 4 metric tiles + carrier grid |
| F4 Pricing Stack | Formula card + bucket/AF/commission/RF grid |
| F5 Parameters | ACA threshold, deduction options, fee schedule, version history |
| F6 Vocabularies | Centralized dropdown lists description |
| F7 Templates | 4 template cards (ER Confirmation, EE SRA, Booklet, Prism Payload) |
| F8 Validation | Typed rule library description |
| F9 Roles | Permission legend + headcount metrics |
| F10 UW Intake | Upload + AI extraction description |

---

### 9. Architecture (`/architecture`)

**Purpose:** Reference documentation for stakeholders.

**Layout:** max-w-1100px. 4-tab bar (dark bg) + content area.

**Tabs:**
1. **User Journey:** 10-step flow with API calls (grid layout per step: number + description + API detail)
2. **System Architecture:** 4 integration cards
3. **Data Governance:** PHI/PII/Financial/Config classification cards + RBAC + retention policies
4. **Components:** 8 solution component cards

---

### 10. Copilot Sidebar (CP1-CP7)

**Purpose:** Context-aware AI assistant panel.

**Layout:** 380px fixed width, absolute positioned right side of main area, z-100. Slide-in animation.

**Structure:**
- Header: purple gradient icon (28×28), "CAP Copilot", close button
- Messages area: scrollable flex column
  - System message: purple gradient bg `#F8F6FE`, title + body + action buttons
  - User message: dark bg `#13212C`, right-aligned, rounded-[10px 10px 2px 10px]
  - Agent message: gray bg `#F7F9FB`, left-aligned, with citation chip
- Prompt chips: flex wrap of small purple pills at bottom
- Input: text input + purple gradient send button (36×36)

**Context-aware chips:**
- New Business: "What's missing?", "Explain rate formula", "Model Flat $500"
- Dashboard/Renewal: "What's blocking handoff?", "Summarize changes", "Bring up to date"

---

### 11. Sync Overlay

**Purpose:** Animated API call sequence for major actions.

**Layout:** Fixed fullscreen backdrop (blur 3px) + centered white card (500px)

**Structure:**
- Title with spinner (active) or green ✓ (done)
- Step list: each with status icon + label + API name (mono)
  - Done: green ✓, green text, `bg-[#F8FAF9]`
  - Active: blue spinner, blue text, `bg-[#EBF4FB]`
  - Pending: gray dot, gray text, transparent bg

**Trigger points:**

| Action | Steps | Duration |
|---|---|---|
| NB Submit | 5 steps (Validation → ClientSpace × 3 → Status update) | ~2600ms |
| Renewal Approve | 4 steps (Lock → Recalc → ClientSpace → DocuSign) | ~2200ms |
| Send Envelope | 5 steps (PDF × 2 → Envelope → Recipients → Send) | ~3000ms |
| Publish Downstream | 6 steps (Prism → Deductions → WorkSight → ClientSpace → S3 → EDI) | ~3700ms |
| Rebase Data | 4 steps (Rates → Pricing → Recalc → ACA) | ~2100ms |
| Generate Booklet | 4 steps (Extract → Render → Localize → S3) | ~2400ms |

### 12. Toast

**Purpose:** Transient success/warning notifications.

**Layout:** Fixed bottom-center, z-200, auto-dismiss 2600ms
- Dark bg `#13212C`, white text, rounded-[9px], shadow
- Status circle: green ✓ (ok) or amber ! (warn)
- Slide-up animation

---

## Interactions & Behavior

### Navigation
- Sidebar nav items → route changes (Next.js App Router)
- Role-based: items not permitted for current role are not rendered
- Active state: red-tinted bg in sidebar

### Login Flow
1. Enter email (determines role from `roleMap`)
2. Click "Sign in with SAML SSO →"
3. 900ms loading state (spinner in button)
4. Redirect to `/dashboard` with role set in auth store

### New Business Wizard
- Linear 6-step flow with step indicator
- Back on Step 1 → return to dashboard
- Each step validates before continuing
- Step 1 requires company name
- Upload action simulates 5 file uploads
- Step 6 submit triggers sync overlay → redirects to dashboard

### Renewal Diff
- Accept/Flag buttons toggle per-row decisions
- "Accept all" bulk-approves all changed rows
- "Bring up to date" triggers rebase sync, sets drift count to 0
- Approve triggers sync → dashboard redirect

### E-Signature 3-State Flow
1. Not sent → Send (5-step sync) → sets `envelopeSent: true`
2. Pending → Simulate sign → updates signer[1] to signed, signer[2] to pending
3. All signed → Publish (6-step sync) → dashboard (requires `publish` permission)

### Copilot
- Toggle open/close from topbar or quick actions
- First open: welcome message with 2 action buttons
- User types or clicks chip → user message appears → 800ms delay → agent response
- Scripted responses for: blocking/handoff, rate/formula/931, contribution/strategy

### Sync Overlay
- Steps animate sequentially: active → done, next → active
- Each step has configurable ms delay
- After all done: 600ms pause → overlay closes → callback fires

---

## State Management (Zustand Stores)

### `authStore.ts`
```typescript
interface AuthState {
  screen: 'login' | 'app';
  role: 'am' | 'ae' | 'coord' | 'analyst' | 'gab' | 'admin';
  email: string;
  password: string;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  can: (perm: Permission) => boolean;
}

type Permission = 'create' | 'edit' | 'approve' | 'publish' | 'admin' | 'esign';

const permissionMatrix: Record<Role, Record<Permission, boolean>> = {
  am:      { create: true,  edit: true,  approve: false, publish: false, admin: false, esign: true },
  ae:      { create: true,  edit: true,  approve: true,  publish: false, admin: false, esign: true },
  coord:   { create: false, edit: false, approve: false, publish: false, admin: false, esign: false },
  analyst: { create: false, edit: false, approve: false, publish: false, admin: false, esign: false },
  gab:     { create: true,  edit: true,  approve: true,  publish: true,  admin: false, esign: true },
  admin:   { create: true,  edit: true,  approve: true,  publish: true,  admin: true,  esign: true },
};
```

### `clientStore.ts`
```typescript
interface Client {
  id: string;
  name: string;
  prism: string;       // "GA-2908"
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  wse: number;
  owner: string;
  status: 'draft' | 'in_review' | 'approved' | 'signed' | 'published';
  eff: string;         // "2025-07-01"
  urgDays: number;
  renewDay: string;
  renewMon: string;
}

interface ClientState {
  clients: Client[];
  search: string;
  statusFilter: string;
  setSearch: (v: string) => void;
  setFilter: (v: string) => void;
  filteredClients: () => Client[];
}
```

### `capStore.ts`
```typescript
interface Plan {
  id: string;
  type: 'Medical' | 'Dental' | 'Vision' | 'Accident';
  carrier: string;
  plan: string;
  planType: 'MP' | 'OM';   // Master Plan vs Open Market
  erPct: number;
  tiers: { tier: 'EO' | 'ES' | 'EC' | 'EF'; base: number }[];
}

interface CAPState {
  plans: Plan[];
  updateErPct: (planId: string, val: number) => void;
  getCalculatedRate: (plan: Plan, tierIdx: number, uwParams: UWParams) => number;
}

interface UWParams {
  bucket: number;   // e.g. 0.975
  af: number;       // e.g. 1.013
  comm: number;     // e.g. 0.03
  rf: number;       // e.g. 1.043
}

// Rate formula: Billed = Base × Bucket × AF × (1 + Comm) × RF
// Only applies to Medical Master Plans. Open Market = direct entry.
```

### `newBusinessStore.ts`
```typescript
interface NewBusinessState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  company: string;
  planYear: string;
  eeCount: string;
  effMonth: string;
  carrier: string;
  uploaded: boolean;
  contribStrategy: 'variable' | 'basePlan' | 'flatDollar' | 'rolldown';
  error: string | null;
  next: () => void;
  prev: () => void;
  goStep: (n: number) => void;
  uploadDocs: () => void;
}
```

### `renewalStore.ts`
```typescript
interface RenewalState {
  selectedClient: string | null;
  diffDecisions: Record<string, 'accept' | 'reject'>;
  driftCount: number;
  setDiff: (key: string, val: 'accept' | 'reject') => void;
  acceptAll: () => void;
  bringUpToDate: () => void;
}
```

### `esignStore.ts`
```typescript
interface Signer {
  role: string;
  name: string;
  org: string;
  status: 'signed' | 'pending' | 'waiting';
  when: string;
}

interface ESignState {
  envelopeSent: boolean;
  signers: Signer[];
  sendEnvelope: () => void;
  simulateClientSign: () => void;
  publish: () => void;
}
```

### `copilotStore.ts`
```typescript
interface CopilotMessage {
  id: number;
  role: 'system' | 'user' | 'agent';
  title?: string;
  body: string;
  actions?: { label: string; run: () => void }[];
  citation?: string;
}

interface CopilotState {
  open: boolean;
  input: string;
  messages: CopilotMessage[];
  toggle: () => void;
  setInput: (v: string) => void;
  send: () => void;
  ask: (query: string) => void;
}
```

### `syncStore.ts`
```typescript
interface SyncStep {
  label: string;
  api: string;
  ms: number;
  status: 'pending' | 'active' | 'done';
}

interface SyncState {
  title: string | null;
  steps: SyncStep[];
  done: boolean;
  show: (title: string, steps: Omit<SyncStep,'status'>[], onDone: () => void) => void;
}
```

---

## Design Tokens

### Colors

**Brand:**
| Token | Hex | Usage |
|---|---|---|
| `red-600` | `#C60C30` | Primary brand, CTAs, active states, errors |
| `red-700` | `#A50A28` | Hover on red buttons |
| `blue-600` | `#0074B8` | Info, links, Prism badge, data-flow |
| `green-600` | `#1A7A4A` | Success, published, approved, passed |
| `amber-600` | `#B0690A` | Warnings, pending, drift |
| `purple-600` | `#5A45C7` | Copilot, DocuSign, underwriting |
| `purple-400` | `#8B5CF6` | Copilot gradient end |

**Neutrals:**
| Token | Hex | Usage |
|---|---|---|
| `slate-900` | `#1B2D3D` | Primary text |
| `slate-700` | `#3B4A57` | Secondary text |
| `slate-600` | `#5B6770` | Tertiary text |
| `slate-500` | `#64707A` | Labels, descriptions |
| `slate-400` | `#98A1A8` | Muted text, timestamps |
| `slate-300` | `#C0C8D0` | Disabled, separators |
| `border` | `#E4E8ED` | Card borders |
| `border-light` | `#EEF1F4` | Row separators |
| `border-input` | `#DCE2E8` | Input borders |
| `bg-page` | `#F5F7FA` | Page background |
| `bg-subtle` | `#FAFBFC` | Table headers, muted bg |
| `bg-input` | `#FBFCFD` | Input backgrounds |

**Sidebar:**
| Token | Hex | Usage |
|---|---|---|
| `sidebar-bg` | `#13212C` | Sidebar background |
| `sidebar-active` | `rgba(198,12,48,.15)` | Active nav item bg |
| `sidebar-text` | `rgba(255,255,255,.55)` | Inactive nav text |
| `sidebar-hover` | `rgba(255,255,255,.06)` | Nav item hover |
| `sidebar-divider` | `rgba(255,255,255,.07)` | Section borders |

**Status backgrounds:**
| Status | Background | Foreground |
|---|---|---|
| Draft | `#EDF0F3` | `#5B6770` |
| In Review | `#E7F1FA` | `#0074B8` |
| Approved | `#FBF0DD` | `#B0690A` |
| Signed | `#ECE9FA` | `#5A45C7` |
| Published | `#E4F2EA` | `#1A7A4A` |

### Typography

**Font families:**
- Primary: `'IBM Plex Sans', system-ui, sans-serif`
- Monospace: `'IBM Plex Mono', monospace`

**Scale:**

| Usage | Size | Weight | Tracking |
|---|---|---|---|
| Page title | 14px | 600 | -0.2px |
| Section title | 15-16px | 600 | — |
| Card title | 12-13px | 600-700 | — |
| Body text | 11-12px | 400-500 | — |
| Label (uppercase) | 9-10px | 600-700 | 0.5-1.2px |
| Tiny label | 8px | 600 | — |
| Metric value | 22-26px | 600-700 | -0.5 to -1px |
| Mono values | 11-12px | 400-600 | — |
| Login headline | 34px | 600 | -1px |

### Spacing

Based on 2px increments:
- `1` = 2px, `2` = 4px, `3` = 6px, `4` = 8px, `5` = 10px, `6` = 12px, `7` = 14px, `8` = 16px, `9` = 18px, `10` = 20px, `12` = 24px, `14` = 28px, `16` = 32px, `18` = 36px, `24` = 48px

### Border Radius
| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 3-4px | Tiny badges |
| `rounded` | 5-6px | Status badges, filter buttons |
| `rounded-md` | 7px | Nav items, inputs, small buttons |
| `rounded-lg` | 8-9px | Buttons, cards |
| `rounded-xl` | 10px | Main cards, panels |
| `rounded-2xl` | 12-14px | Modals, overlays |
| `rounded-full` | 50% | Avatars, status dots |

### Shadows
| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,.08)` | Cards |
| `shadow-btn` | `0 3px 10px rgba(198,12,48,.2)` | Red CTA buttons |
| `shadow-btn-red` | `0 4px 14px rgba(198,12,48,.28)` | Login button |
| `shadow-overlay` | `0 20px 60px rgba(16,32,45,.3)` | Modals, sync overlay |
| `shadow-drawer` | `-8px 0 30px rgba(16,32,45,.08)` | Copilot sidebar |
| `shadow-drawer-deep` | `-12px 0 40px rgba(16,32,45,.22)` | Detail drawer |

### Animations
| Name | Duration | Easing | Properties |
|---|---|---|---|
| `spin` | 0.7s | linear | `transform: rotate(360deg)` — infinite |
| `slideIn` | 0.22s | `cubic-bezier(.4,0,.2,1)` | `transform: translateX(100% → 0)` |
| `fadeIn` | 0.15-0.2s | ease | `opacity: 0 → 1` |
| `toastAnim` | 0.2s | ease | `opacity + translateY(12px → 0)` |

---

## Data Constants

### Role Mapping
```typescript
const roleMap: Record<string, Role> = {
  'am@gapartners.com': 'am',
  'ae@gapartners.com': 'ae',
  'coordinator@gapartners.com': 'coord',
  'analyst@gapartners.com': 'analyst',
  'manager@gapartners.com': 'gab',
  'admin@gapartners.com': 'admin',
};

const roleInfo: Record<Role, { name: string; short: string; person: string; color: string }> = {
  am:      { name: 'Account Manager',     short: 'AM', person: 'Dana Whitfield', color: '#C60C30' },
  ae:      { name: 'Account Executive',   short: 'AE', person: 'Marcus Reyes',   color: '#0074B8' },
  coord:   { name: 'Benefits Coordinator',short: 'BC', person: 'Lena Ortiz',     color: '#5B6770' },
  analyst: { name: 'Benefits Analyst',    short: 'BA', person: 'Sam Cho',        color: '#5B6770' },
  gab:     { name: 'GAB Manager',         short: 'GM', person: 'Priya Nair',     color: '#1A7A4A' },
  admin:   { name: 'System Admin',        short: 'SA', person: 'Root Admin',     color: '#5A45C7' },
};
```

### Status Metadata
```typescript
const statusMeta: Record<Status, { label: string; bg: string; fg: string }> = {
  draft:     { label: 'Draft',     bg: '#EDF0F3', fg: '#5B6770' },
  in_review: { label: 'In Review', bg: '#E7F1FA', fg: '#0074B8' },
  approved:  { label: 'Approved',  bg: '#FBF0DD', fg: '#B0690A' },
  signed:    { label: 'Signed',    bg: '#ECE9FA', fg: '#5A45C7' },
  published: { label: 'Published', bg: '#E4F2EA', fg: '#1A7A4A' },
};
```

### Client Seed Data (11 clients)
See `lib/constants/clients.ts` — full list with Prism IDs, tiers, WSE counts, owners, statuses, effective dates.

### Plan Seed Data (4 plans)
See `lib/constants/plans.ts` — Medical PPO $500, HDHP $3300, Dental, Vision with base rates per tier.

---

## API Integration Stubs

For the prototype, all API calls are simulated with delays. In production, these map to real endpoints:

### PrismHR (F2)
```typescript
// Read
BenefitService.getClientBenefitPlans(clientId)
BenefitService.getClientBenefitPlanSetupDetails(clientId)
BenefitService.getFlexPlans(clientId)
ClientMasterService.getClient(clientId)
PayrollService.getDeductionRegister(clientId)

// Write
BenefitService.createBenefitPlanSetup(payload)
DeductionService.setDeductions(payload)
```

### ClientSpace
```typescript
ClientSpacePRO.getClientProfile(clientId)
ClientSpacePRO.createCase(capPayload)
ClientSpacePRO.attachPayload(caseId, payload)
ClientSpacePRO.notifyReviewer(caseId)
ClientSpacePRO.updateCase(caseId, status)
ClientSpacePRO.approveCase(caseId)
```

### DocuSign
```typescript
DocuSign.createEnvelope(documents, signers)
DocuSign.addRecipients(envelopeId, recipients)
DocuSign.send(envelopeId)
DocuSign.getEnvelopeStatus(envelopeId)
// Webhook: envelope.completed → update CAP status
```

### WorkSight
```typescript
WorkSight.pushPlanConfig(clientId, planData)
```

---

## Files in this Package

| File | Description |
|---|---|
| `README.md` | This document |
| `CAP Cloud Tool v3.dc.html` | Interactive prototype — open in browser, all screens functional |
| `PRD_Checklist.md` | Full PRD compliance checklist (all 5 PRD documents) |
| `00_CAP_Platform_Overview_and_Context.md` | PRD: Overview & context |
| `CAP_Platform_Foundation_PRD.md` | PRD: Foundation / Admin Console (F1-F10) |
| `CAP_NewBusiness_Buildout_PRD.md` | PRD: New Business flow (NB1-NB9) |
| `CAP_Renewal_Buildout_PRD.md` | PRD: Renewal flow (R1-R9) |
| `CAP_Copilot_PRD.md` | PRD: Copilot (CP1-CP7) |
