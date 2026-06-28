'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUserInfo } from '@/stores/authStore';

/* ------------------------------------------------------------------ */
/*  Workspace launcher — the "OS" home. After login the user lands     */
/*  here and browses the platform top-down:                            */
/*                                                                     */
/*    Workspaces  →  Sales | Operations                                */
/*    Operations  →  Benefits · Onboarding · Client Success · Payroll  */
/*    Function    →  the AI workspaces (one per PRD initiative)        */
/*                                                                     */
/*  Operations → Benefits → "Benefits CAP Builder" loads the live app  */
/*  (/dashboard). Everything else is scoped from the four 06/15 PRDs.  */
/* ------------------------------------------------------------------ */

type AppStatus = 'active' | 'delivered' | 'soon';

interface WorkspaceApp {
  name: string;
  desc: string;
  painPoint?: string;
  icon: string; // Font Awesome class (without the fa-solid prefix)
  status: AppStatus;
  href?: string;
}

interface FunctionArea {
  key: string;
  name: string;
  tagline: string;
  summary: string;
  icon: string;
  accent: string;
  accentBg: string;
  apps: WorkspaceApp[];
}

interface Domain {
  key: 'sales' | 'operations';
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  accentBg: string;
  apps?: WorkspaceApp[]; // leaf domain (Sales)
  functions?: FunctionArea[]; // grouped domain (Operations)
}

/* ── Sales: lives outside this demo, shown for completeness ───────── */
const SALES: Domain = {
  key: 'sales',
  name: 'Sales',
  tagline: 'G&A Beneficial',
  description: 'Source, quote, and win new benefits business — prospecting, underwriting, and proposals.',
  icon: 'fa-chart-line',
  accent: '#0074B8',
  accentBg: '#E7F1FA',
  apps: [
    { name: 'Prospecting Agent', desc: 'Lead qualification, research, and outreach.', icon: 'fa-magnifying-glass-chart', status: 'delivered' },
    { name: 'Proposal Agent', desc: 'Underwriting comparison and proposal assembly.', icon: 'fa-file-signature', status: 'delivered' },
    { name: 'Pipeline & Forecast', desc: 'Deal pipeline, stages, and revenue forecast.', icon: 'fa-chart-simple', status: 'soon' },
  ],
};

/* ── Operations: four business functions, one per PRD ─────────────── */
const OPS_FUNCTIONS: FunctionArea[] = [
  {
    key: 'benefits',
    name: 'Benefits',
    tagline: 'Quote · Renew · Administer',
    summary: 'From CAP build and underwriting to enrollment, audits, and reconciliation across G&A Beneficial and Ben Admin.',
    icon: 'fa-heart-pulse',
    accent: '#C60C30',
    accentBg: '#FDECEF',
    apps: [
      { name: 'Benefits CAP Builder', desc: 'Generates & validates Client Approved Plans, builds booklets, routes e-sign, and writes back to Prism.', painPoint: 'Excel CAP takes 2–4 hrs/client — the #1 cause of Ben Admin setup blocking.', icon: 'fa-file-signature', status: 'active', href: '/dashboard' },
      { name: 'Underwriting Assistant', desc: 'Extracts plan data from PDFs, SBCs & invoices to pre-populate quotes and gate incomplete submissions.', painPoint: '20–30 min of manual doc scrubbing per case; 80–90% of submissions arrive incomplete.', icon: 'fa-magnifying-glass-chart', status: 'soon' },
      { name: 'Carrier Enrollment Bot', desc: 'Reads Prism enrollment data and auto-enters it into open-market carrier portals, retaining specialist audit.', painPoint: '13–17 min of field-by-field portal transcription per enrollment, creating coverage-gap risk.', icon: 'fa-right-left', status: 'soon' },
      { name: 'WSE Service Copilot', desc: 'Automates case creation, self-service deflection, and AI after-call summaries for routine inquiries.', painPoint: 'Specialists spend 35% of time on low-complexity inquiries with no self-service path.', icon: 'fa-headset', status: 'soon' },
      { name: 'Deduction Audit Agent', desc: 'Consolidates Prism reports and CAP rates into one variance report, auto-flagging exceptions.', painPoint: 'Monthly reviews pull 4+ Prism reports into fragile Excel VLOOKUPs — 23% of specialist time.', icon: 'fa-scale-balanced', status: 'soon' },
      { name: 'Reconciliation Engine', desc: 'Stabilizes Beacon to auto-reconcile payroll deductions against carrier invoices, employee by employee.', painPoint: 'Recon specialists spend 97% of time reconciling; an unreliable Beacon forces error-prone Excel.', icon: 'fa-money-check-dollar', status: 'soon' },
    ],
  },
  {
    key: 'onboarding',
    name: 'Onboarding',
    tagline: 'Faster Time-to-Payroll',
    summary: 'Agents and automations that compress onboarding from CSA signing to first payroll for PMs and Payroll Analysts.',
    icon: 'fa-rocket',
    accent: '#0074B8',
    accentBg: '#E7F1FA',
    apps: [
      { name: 'CSA Extraction Agent', desc: 'Extracts structured fields from CSA PDFs on upload and flags discrepancies against ClientSpace.', painPoint: 'The CSA PDF is independently reviewed four times — the clearest documented redundancy.', icon: 'fa-file-contract', status: 'soon' },
      { name: 'Mock Payroll Pre-Flight', desc: 'Validates PrismHR config completeness before init, outputting a pass/fail report with fixes.', painPoint: 'WC/SUTA errors surface only when mock payroll fails — a recurring calculate-fail-fix loop.', icon: 'fa-clipboard-check', status: 'soon' },
      { name: 'Data Collection Escalator', desc: 'Enforces hard data deadlines with automated escalating reminders to compress the top bottleneck.', painPoint: 'Client data collection is the primary bottleneck (15–20 days) with no enforced SLA.', icon: 'fa-bell', status: 'soon' },
      { name: 'PM Workflow Automator', desc: 'Auto-syncs case status across ClientSpace, PrismHR & Master List and triggers follow-ups.', painPoint: 'Project management is the #1 PM time sink (37%), dominated by triple-entry tracking.', icon: 'fa-diagram-project', status: 'soon' },
      { name: 'Client Comms Copilot', desc: 'Drafts replies, routes non-payroll questions, and compiles weekly status from live data.', painPoint: 'Client comms consume 15% of PM and 10% of PA time on routine inquiries.', icon: 'fa-comments', status: 'soon' },
      { name: 'WorkSight Integration Hub', desc: 'Migrates GuideCX to WorkSight–ClientSpace with webhook document routing and overdue reminders.', painPoint: 'GuideCX→G:Drive→ClientSpace routing is 5,600–8,400 manual document actions a year.', icon: 'fa-arrows-turn-to-dots', status: 'soon' },
    ],
  },
  {
    key: 'client-success',
    name: 'Client Success',
    tagline: 'Retain · Serve · Grow',
    summary: 'Agents that unify client data, automate escalations and case notes, and predict churn across 4,900 accounts.',
    icon: 'fa-handshake-angle',
    accent: '#5A45C7',
    accentBg: '#ECE9FA',
    apps: [
      { name: 'Client 360 Dashboard', desc: 'Aggregates services, case history, NPS, escalations & an AI health score into one screen.', painPoint: 'CSMs navigate five systems for 15–30 min before every touchpoint.', icon: 'fa-gauge-high', status: 'soon' },
      { name: 'Escalation Routing Agent', desc: 'Auto-notifies case owners, starts SLA timers, and escalates up the chain on non-response.', painPoint: '“One of the biggest forms of waste is waiting” — manual Teams chasing is the top time sink.', icon: 'fa-bell', status: 'soon' },
      { name: 'Case Notes Copilot', desc: 'Generates structured case notes after each interaction and flags aged cases.', painPoint: 'Manual documentation takes 10–20 min per case; stale notes never say what to do next.', icon: 'fa-pen-to-square', status: 'soon' },
      { name: 'Inbound CX Agent', desc: 'Auto-creates cases on pickup, drafts AI call summaries, and powers WorkSight knowledge search.', painPoint: 'Broken TalkDesk integration forces manual lookup; poor KB search drives longer handle times.', icon: 'fa-headset', status: 'soon' },
      { name: 'Churn Propensity Model', desc: 'ML scoring per-account churn risk from NPS, cases, escalations & tenure for proactive retention.', painPoint: 'No early warning for at-risk accounts; $18.2M in controllable revenue lost in 2025.', icon: 'fa-chart-line', status: 'soon' },
    ],
  },
  {
    key: 'payroll',
    name: 'Payroll',
    tagline: 'Faster · On-Time Payroll',
    summary: 'Agents that automate Treasury wires, time-file imports, check shipping, and client service to hit posting targets.',
    icon: 'fa-money-bill-transfer',
    accent: '#B0690A',
    accentBg: '#FBF0DD',
    apps: [
      { name: 'Reverse Wire Copilot', desc: 'Auto-triggers Treasury reverse wires from Prism finalization with status sync and payroll auto-release.', painPoint: 'A 2–7 hr manual Treasury email cycle makes 30–35% of payrolls miss the posting target.', icon: 'fa-money-bill-transfer', status: 'soon' },
      { name: 'Time File Normalizer', desc: 'Intelligent parser mapping any client spreadsheet to a Prism-compatible structure with validation.', painPoint: '20–30% of clients submit incompatible files; brittle IT macros break on any column change.', icon: 'fa-file-import', status: 'soon' },
      { name: 'Shipping Case Builder', desc: 'Prism posting auto-creates ClientSpacePRO shipping cases with files attached and PSR fields filled.', painPoint: '8-step manual case creation runs 10–15 min, 18,000–30,000 times a year.', icon: 'fa-box-archive', status: 'soon' },
      { name: 'Label & Tracking Agent', desc: 'Auto-generates carrier labels, retrieves tracking numbers, and pushes delivery-delay alerts.', painPoint: 'Manual labels and next-morning status review consume 100% of Payroll Assistant capacity.', icon: 'fa-truck-fast', status: 'soon' },
      { name: 'CS Triage Assistant', desc: 'AI intake classifies inquiries, pre-pulls WorkSight & Prism data, and drafts routine responses.', painPoint: 'Every CS inquiry starts from a blank slate across siloed systems — 18% of specialist capacity.', icon: 'fa-headset', status: 'soon' },
    ],
  },
];

const OPERATIONS: Domain = {
  key: 'operations',
  name: 'Operations',
  tagline: 'Benefits · Onboarding · Client Success · Payroll',
  description: 'Run service delivery end to end. Four business functions, each with its own suite of AI workspaces drawn from the field-level workflow.',
  icon: 'fa-gears',
  accent: '#C60C30',
  accentBg: '#FDECEF',
  functions: OPS_FUNCTIONS,
};

const DOMAINS: Domain[] = [SALES, OPERATIONS];

const statusMeta: Record<AppStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Open', fg: '#1A7A4A', bg: '#E4F2EA' },
  delivered: { label: 'Delivered', fg: '#0074B8', bg: '#E7F1FA' },
  soon: { label: 'Coming soon', fg: '#98A1A8', bg: '#F1F3F5' },
};

/* Flattened index of every workspace — powers global search. */
interface FlatTile {
  app: WorkspaceApp;
  crumb: string;
  accent: string;
  accentBg: string;
}
const ALL_TILES: FlatTile[] = [
  ...(SALES.apps ?? []).map((app) => ({ app, crumb: 'Sales', accent: SALES.accent, accentBg: SALES.accentBg })),
  ...OPS_FUNCTIONS.flatMap((f) => f.apps.map((app) => ({ app, crumb: `Operations · ${f.name}`, accent: f.accent, accentBg: f.accentBg }))),
];
const TOTAL_WORKSPACES = ALL_TILES.length;
const TOTAL_FUNCTIONS = 1 /* Sales */ + OPS_FUNCTIONS.length;

export default function WorkspaceLauncher() {
  const router = useRouter();
  const screen = useAuthStore((s) => s.screen);
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);
  const { userName, userRole, userShort, userColor } = useUserInfo();

  const [domainKey, setDomainKey] = useState<Domain['key'] | null>(null);
  const [functionKey, setFunctionKey] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Auth guard — bounce back to login if the session isn't authenticated.
  useEffect(() => {
    if (screen === 'login') router.push('/');
  }, [screen, router]);

  const q = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return ALL_TILES.filter(({ app, crumb }) =>
      [app.name, app.desc, app.painPoint ?? '', crumb].join(' ').toLowerCase().includes(q),
    );
  }, [q]);

  if (screen === 'login') return null;

  const firstName = userName.split(' ')[0];
  const domain = DOMAINS.find((d) => d.key === domainKey) ?? null;
  const activeFunction = domain?.functions?.find((f) => f.key === functionKey) ?? null;

  // Accent used to theme the current view.
  const viewAccent = activeFunction?.accent ?? domain?.accent ?? '#0074B8';

  const goRoot = () => { setDomainKey(null); setFunctionKey(null); setNote(null); };
  const goDomain = (key: Domain['key']) => { setDomainKey(key); setFunctionKey(null); setNote(null); };

  const openApp = (app: WorkspaceApp) => {
    if (app.status === 'active' && app.href) {
      router.push(app.href);
      return;
    }
    setNote(
      app.status === 'delivered'
        ? `${app.name} is already live — it runs in the Sales workspace (outside this demo).`
        : `${app.name} is on the G&A Compass roadmap. This demo brings the Benefits CAP Builder to life first.`,
    );
    setTimeout(() => setNote(null), 3600);
  };

  /* ── Shared workspace (app) tile ──────────────────────────────── */
  const Tile = ({ app, accent, accentBg, crumb }: { app: WorkspaceApp; accent: string; accentBg: string; crumb?: string }) => {
    const sm = statusMeta[app.status];
    const isActive = app.status === 'active';
    const id = (crumb ? `${crumb}:` : '') + app.name;
    const isHover = hovered === id;
    return (
      <button
        onClick={() => openApp(app)}
        onMouseEnter={() => setHovered(id)}
        onMouseLeave={() => setHovered(null)}
        style={{
          textAlign: 'left', font: 'inherit',
          cursor: isActive ? 'pointer' : 'default',
          background: '#fff',
          border: `1px solid ${isHover ? accent : '#E4E8ED'}`,
          borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden',
          boxShadow: isHover ? '0 12px 28px rgba(16,32,45,.10)' : '0 1px 2px rgba(16,32,45,.04)',
          transform: isHover ? 'translateY(-2px)' : 'none',
          transition: 'all .16s ease',
          opacity: app.status === 'soon' && !isHover ? 0.92 : 1,
          display: 'flex', flexDirection: 'column', gap: 10, minHeight: 132,
        }}
      >
        {/* Accent rail */}
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isActive ? accent : 'transparent' }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, background: isActive ? accentBg : '#F1F3F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`fa-solid ${app.icon}`} style={{ fontSize: 17, color: isActive ? accent : '#98A1A8' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>{app.name}</span>
              <span style={{
                fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 9999, padding: '2px 8px',
                color: sm.fg, background: sm.bg,
              }}>{sm.label}</span>
            </div>
            {crumb && (
              <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8', fontWeight: 600, letterSpacing: 0.2, marginBottom: 4 }}>{crumb}</div>
            )}
            <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>{app.desc}</p>
          </div>
        </div>
        {app.painPoint && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginTop: 'auto', paddingTop: 2 }}>
            <i className="fa-solid fa-bolt" style={{ fontSize: 10, color: '#B0690A', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--type-caption)', color: '#64707A', lineHeight: 1.45 }}>{app.painPoint}</span>
          </div>
        )}
        {isActive && (
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: accent }}>Launch app &rarr;</span>
        )}
      </button>
    );
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #F6F8FA 0%, #FFFFFF 55%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", color: '#1B2D3D',
    }}>
      {/* ── Launcher top bar ── */}
      <div style={{
        height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E4E8ED',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#13212C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 'var(--type-badge)', color: '#fff', letterSpacing: -0.3,
          }}>G&A</div>
          <div>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.1 }}>G&A Compass</div>
            <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8', letterSpacing: 0.3 }}>Enterprise Workspace</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D', lineHeight: 1.2 }}>{userName}</div>
            <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8' }}>{userRole}{email ? ` · ${email}` : ''}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--type-badge)', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{userShort}</div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid #E4E8ED',
              background: '#fff', color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 28px 64px' }}>

          {/* Hero + breadcrumb + search */}
          <div style={{ marginBottom: 26 }}>
            <div style={{
              fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '0.06em',
              fontWeight: 700, color: '#98A1A8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <button
                onClick={goRoot}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: domain ? '#0074B8' : '#98A1A8', fontWeight: 700, font: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >Workspaces</button>
              {domain && (
                <>
                  <span style={{ color: '#CBD2D9' }}>/</span>
                  {activeFunction ? (
                    <button
                      onClick={() => goDomain(domain.key)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#0074B8', fontWeight: 700, font: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >{domain.name}</button>
                  ) : (
                    <span style={{ color: '#5B6770' }}>{domain.name}</span>
                  )}
                </>
              )}
              {activeFunction && (
                <>
                  <span style={{ color: '#CBD2D9' }}>/</span>
                  <span style={{ color: '#5B6770' }}>{activeFunction.name}</span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 'var(--type-display)', fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>
                  {activeFunction ? activeFunction.name : domain ? domain.name : `Welcome back, ${firstName}`}
                </h1>
                <p style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 8, marginBottom: 0, maxWidth: 660, lineHeight: 1.55 }}>
                  {activeFunction
                    ? activeFunction.summary
                    : domain
                      ? domain.description
                      : 'G&A Compass unifies Sales and Operations on one AI platform. Browse a workspace, or search every agent across the business.'}
                </p>
              </div>
              {!domain && (
                <div style={{ display: 'flex', gap: 22, flexShrink: 0 }}>
                  {[{ v: TOTAL_WORKSPACES, l: 'AI workspaces' }, { v: TOTAL_FUNCTIONS, l: 'Business functions' }].map((s) => (
                    <div key={s.l} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, letterSpacing: -0.5, color: '#13212C' }}>{s.v}</div>
                      <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginTop: 22, maxWidth: 460 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#98A1A8' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search every workspace — CAP, payroll, churn, enrollment…"
                style={{
                  width: '100%', height: 42, borderRadius: 10, border: '1px solid #E4E8ED',
                  background: '#fff', padding: '0 14px 0 38px', fontSize: 'var(--type-body-sm)', color: '#1B2D3D',
                  outline: 'none', boxShadow: '0 1px 2px rgba(16,32,45,.04)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0074B8'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E4E8ED'; }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#98A1A8', fontSize: 13, padding: 4 }}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>

          {/* ── SEARCH RESULTS ── */}
          {q ? (
            <>
              <div style={{ fontSize: 'var(--type-body-sm)', color: '#64707A', marginBottom: 14, fontWeight: 500 }}>
                {searchResults.length} workspace{searchResults.length === 1 ? '' : 's'} matching “{query.trim()}”
              </div>
              {searchResults.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
                  {searchResults.map((t) => (
                    <Tile key={`${t.crumb}:${t.app.name}`} app={t.app} accent={t.accent} accentBg={t.accentBg} crumb={t.crumb} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#98A1A8', fontSize: 'var(--type-body-sm)' }}>
                  No workspaces match that search. Try “renewal”, “shipping”, or “escalation”.
                </div>
              )}
            </>
          ) : !domain ? (
            /* ── DOMAIN VIEW: Sales | Operations ── */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {DOMAINS.map((d) => {
                const isHover = hovered === d.key;
                const chips = d.functions ? d.functions.map((f) => f.name) : (d.apps ?? []).map((a) => a.name);
                const count = d.functions
                  ? d.functions.reduce((n, f) => n + f.apps.length, 0)
                  : (d.apps ?? []).length;
                return (
                  <button
                    key={d.key}
                    onClick={() => goDomain(d.key)}
                    onMouseEnter={() => setHovered(d.key)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      textAlign: 'left', cursor: 'pointer', font: 'inherit',
                      background: '#fff', border: `1px solid ${isHover ? d.accent : '#E4E8ED'}`,
                      borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
                      boxShadow: isHover ? '0 14px 36px rgba(16,32,45,.12)' : '0 1px 2px rgba(16,32,45,.04)',
                      transform: isHover ? 'translateY(-3px)' : 'none',
                      transition: 'all .18s ease',
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}
                  >
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: d.accent, opacity: isHover ? 1 : 0.5, transition: 'opacity .18s' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: 14, background: d.accentBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <i className={`fa-solid ${d.icon}`} style={{ fontSize: 23, color: d.accent }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>{d.name}</div>
                        <div style={{ fontSize: 'var(--type-body-sm)', color: '#98A1A8', fontWeight: 600 }}>{d.tagline}</div>
                      </div>
                      <span style={{
                        fontSize: 'var(--type-badge)', fontWeight: 700, color: d.accent, background: d.accentBg,
                        borderRadius: 9999, padding: '4px 10px', whiteSpace: 'nowrap',
                      }}>{count} workspaces</span>
                    </div>
                    <p style={{ fontSize: 'var(--type-body)', color: '#374151', margin: 0, lineHeight: 1.5 }}>{d.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6, gap: 12 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {chips.slice(0, 4).map((c) => (
                          <span key={c} style={{
                            fontSize: 'var(--type-badge)', fontWeight: 600, color: '#374151',
                            background: '#F5F7FA', border: '1px solid #EEF1F4', borderRadius: 9999, padding: '2px 9px',
                          }}>{c}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: d.accent, whiteSpace: 'nowrap' }}>
                        {d.functions ? 'Explore' : 'Open'} &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : domain.functions && !activeFunction ? (
            /* ── FUNCTION VIEW: Operations → 4 business functions ── */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
                {domain.functions.map((f) => {
                  const isHover = hovered === f.key;
                  const liveCount = f.apps.filter((a) => a.status === 'active').length;
                  return (
                    <button
                      key={f.key}
                      onClick={() => { setFunctionKey(f.key); setNote(null); }}
                      onMouseEnter={() => setHovered(f.key)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        textAlign: 'left', cursor: 'pointer', font: 'inherit',
                        background: '#fff', border: `1px solid ${isHover ? f.accent : '#E4E8ED'}`,
                        borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden',
                        boxShadow: isHover ? '0 12px 30px rgba(16,32,45,.11)' : '0 1px 2px rgba(16,32,45,.04)',
                        transform: isHover ? 'translateY(-2px)' : 'none',
                        transition: 'all .18s ease',
                        display: 'flex', flexDirection: 'column', gap: 12,
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.accent, opacity: isHover ? 1 : 0.55, transition: 'opacity .18s' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 13, background: f.accentBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <i className={`fa-solid ${f.icon}`} style={{ fontSize: 20, color: f.accent }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>{f.name}</div>
                          <div style={{ fontSize: 'var(--type-badge)', color: f.accent, fontWeight: 700, letterSpacing: 0.2 }}>{f.tagline}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>{f.summary}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
                        <span style={{ fontSize: 'var(--type-badge)', color: '#98A1A8', fontWeight: 600 }}>
                          {f.apps.length} workspaces{liveCount ? ` · ${liveCount} live` : ''}
                        </span>
                        <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: f.accent }}>Open &rarr;</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goRoot}
                style={{
                  marginTop: 24, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #E4E8ED',
                  background: '#fff', color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                &larr; Back to workspaces
              </button>
            </>
          ) : (
            /* ── APP VIEW: workspaces within Sales, or within a function ── */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
                {(activeFunction ? activeFunction.apps : domain.apps ?? []).map((app) => (
                  <Tile
                    key={app.name}
                    app={app}
                    accent={viewAccent}
                    accentBg={activeFunction?.accentBg ?? domain.accentBg}
                  />
                ))}
              </div>

              {note && (
                <div style={{
                  marginTop: 18, padding: '12px 16px', borderRadius: 10,
                  background: '#F0F7FF', border: '1px solid #D7E7F5',
                  fontSize: 'var(--type-body-sm)', color: '#0074B8', fontWeight: 500,
                }}>
                  {note}
                </div>
              )}

              <button
                onClick={() => (activeFunction ? goDomain(domain.key) : goRoot())}
                style={{
                  marginTop: 24, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #E4E8ED',
                  background: '#fff', color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                &larr; Back to {activeFunction ? domain.name : 'workspaces'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
