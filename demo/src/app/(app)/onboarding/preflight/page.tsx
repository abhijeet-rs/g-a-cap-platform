'use client';

import { useState, useEffect, useCallback } from 'react';

/* ================================================================
   Pre-Flight Validation — Enterprise-Grade Landing Page
   Validates PrismHR configuration against CSA Schedule 2 and
   ClientSpace data before payroll initialization.
   All data is hardcoded for the POC demo.
   ================================================================ */

/* ---------- Types ---------- */
type Severity = 'critical' | 'warning' | 'pass';
type CheckStatus = 'pass' | 'fail';
type RunPhase = 'idle' | 'fetching' | 'running' | 'done';
type PushPhase = 'idle' | 'pushing' | 'done';

interface WCIssue { employee: string; currentWC: string; expectedWC: string; status: string; }
interface DeductionIssue { code: string; description: string; status: string; }

interface ValidationCheck {
  id: number;
  name: string;
  status: CheckStatus;
  severity: Severity;
  oneLiner: string;
  sourceBadge: string;
  detail: string;
  issueTable?: WCIssue[] | DeductionIssue[];
  issueTableType?: 'wc' | 'deduction';
  remediationSteps: string[];
}

/* ---------- Fix tracking types ---------- */
interface Fixes {
  wc_martinez?: string;
  wc_chen?: string;
  wc_patel?: string;
  suta_ct_rate?: string;
  suta_ct_type?: string;
  deduction_401k?: string;
}

const WC_CODE_OPTIONS = ['CT 5606', 'CT 9012', 'CT 9083'];
const GL_ACCOUNT_OPTIONS = ['401K-Employee-Main', '401K-Employee-Roth', 'Retirement-General'];

interface ClientOption {
  id: string;
  name: string;
  employeeCount: number;
  states: string;
  csaEffective: string;
  assignedPA: string;
  csaExtractedDate: string;
  csaFieldsExtracted: number;
}

/* ---------- Connector data ---------- */
const CONNECTORS = [
  {
    name: 'PrismHR',
    status: 'Connected',
    desc: 'Employee roster, WC codes, SUTA rates, billing rules, deduction codes, pay groups',
    color: '#C60C30',
    icon: 'fa-server',
    apis: [
      'GET /api/v1/employees — Employee roster & WC assignments',
      'GET /api/v1/employees/{id}/work-comp — Per-employee WC code',
      'GET /api/v1/suta-rates — SUTA rate table by state',
      'GET /api/v1/suta-rates/{state}/bill-rate — Bill rate for state',
      'GET /api/v1/billing-rules — Billing rule configuration',
      'GET /api/v1/pay-groups — Pay group & schedule alignment',
      'GET /api/v1/deduction-codes — Deduction code → GL mapping',
      'GET /api/v1/tax-jurisdictions — State tax registrations',
      'PUT /api/v1/employees/{id}/wc-code — Write-back WC code',
      'PUT /api/v1/suta-rates/{state} — Write-back SUTA rate',
      'PUT /api/v1/deduction-codes/{code} — Write-back GL mapping',
      'POST /api/v1/payroll/mock-run — Trigger mock payroll run',
    ],
    pushApis: [
      'PUT /api/v1/employees/{id}/wc-code — Correct WC assignment',
      'PUT /api/v1/suta-rates/{state} — Set SUTA rate + type',
      'PUT /api/v1/deduction-codes/{code}/gl-account — Link GL account',
      'PUT /api/v1/billing-rules/{ruleId} — Update billing config',
      'POST /api/v1/payroll/mock-run — Initialize mock payroll',
    ],
  },
  {
    name: 'CSA Schedule 2',
    status: 'Connected',
    desc: 'Expected WC codes, fee structure, SUTA coverage type — contractual source of truth',
    color: '#0088CE',
    icon: 'fa-file-contract',
    badge: 'Source of Truth',
    apis: [
      'Internal — CSA Extraction output (Initiative D)',
      'Fields: wc_codes, admin_fee, suta_coverage_type',
      'Fields: implementation_fee, cyber_insurance, services',
      'Extracted via LlamaParse + AI Extraction Agent pipeline',
      'Confidence scoring per field (>90% auto, 80-90% review)',
    ],
  },
  {
    name: 'ClientSpace',
    status: 'Connected',
    desc: 'Client records, handoff page, state registrations, onboarding cases, employee locations',
    color: '#2A8F60',
    icon: 'fa-building',
    apis: [
      'GET /api/v1/clients/{id} — Client record + metadata',
      'GET /api/v1/clients/{id}/handoff — Onboarding handoff page',
      'GET /api/v1/clients/{id}/registrations — State registrations',
      'GET /api/v1/clients/{id}/employees — Employee location data',
      'GET /api/v1/cases — Onboarding cases list',
      'POST /api/v1/cases — Create onboarding case',
      'PUT /api/v1/cases/{id}/status — Update case status',
      'POST /api/v1/cases/{id}/tasks — Create remediation task',
      'POST /api/v1/cases/{id}/documents — Attach document',
    ],
    pushApis: [
      'POST /api/v1/cases — Auto-create onboarding case',
      'POST /api/v1/cases/{id}/tasks — Create remediation tasks',
      'PUT /api/v1/clients/{id}/fields — Update client fields',
    ],
  },
  {
    name: 'Informer',
    status: 'Connected',
    desc: 'SUTA state rate tables, bill rate history, pre-approval status',
    color: '#FF9E1B',
    icon: 'fa-chart-bar',
    apis: [
      'GET /api/informer/suta-bill-rates — State rate tables',
      'GET /api/informer/suta-bill-rates/{state} — State-specific rate',
      'GET /api/informer/bill-rate-history — Historical rates',
      'GET /api/informer/pre-approved-states — Pre-approved SUTA list',
    ],
  },
];

/* ---------- Clients ---------- */
const CLIENTS: ClientOption[] = [
  {
    id: 'cli-1', name: 'Acme Corp', employeeCount: 38, states: 'CT',
    csaEffective: '07/01/2026', assignedPA: 'Sarah Mitchell',
    csaExtractedDate: 'June 25, 2026', csaFieldsExtracted: 35,
  },
  {
    id: 'cli-2', name: 'TechStart LLC', employeeCount: 110, states: 'IL',
    csaEffective: '08/01/2026', assignedPA: 'David Nguyen',
    csaExtractedDate: 'June 24, 2026', csaFieldsExtracted: 41,
  },
  {
    id: 'cli-3', name: 'Summit Services Inc', employeeCount: 45, states: 'TX',
    csaEffective: '06/01/2026', assignedPA: 'Karen Lopez',
    csaExtractedDate: 'June 23, 2026', csaFieldsExtracted: 38,
  },
];

/* ---------- Validation checks (for Acme Corp) ---------- */
const MOCK_CHECKS: ValidationCheck[] = [
  {
    id: 1,
    name: 'WC Code Validation',
    status: 'fail',
    severity: 'critical',
    oneLiner: '3 employees have WC codes not matching CSA Schedule 2',
    sourceBadge: 'PrismHR x CSA',
    detail: 'Checked: 38 employees against CSA Schedule 2 WC codes (CT 5606, CT 9012, CT 9083)',
    issueTableType: 'wc',
    issueTable: [
      { employee: 'J. Martinez', currentWC: '8810', expectedWC: 'CT 5606', status: 'Mismatch' },
      { employee: 'R. Chen', currentWC: '8742', expectedWC: 'CT 9012', status: 'Mismatch' },
      { employee: 'S. Patel', currentWC: '(none)', expectedWC: 'CT 9083', status: 'Missing' },
    ] as WCIssue[],
    remediationSteps: [
      'Update J. Martinez WC code from 8810 to CT 5606 in PrismHR',
      'Update R. Chen WC code from 8742 to CT 9012 in PrismHR',
      'Assign WC code CT 9083 to S. Patel in PrismHR',
    ],
  },
  {
    id: 2,
    name: 'SUTA Rate Coverage',
    status: 'fail',
    severity: 'warning',
    oneLiner: 'No SUTA rate entered for CT (38 employees)',
    sourceBadge: 'PrismHR',
    detail: 'Checked: SUTA rates for all states with active employees. States with employees: CT (38 employees). CSA specifies: CR% (Client Rate) -- requires client-specific rate entry.',
    remediationSteps: [
      'Enter SUTA rate for Connecticut in PrismHR',
      'Rate type: Client Rate (CR%) per CSA Schedule 2',
      'If non-standard rate: escalate to executive approval (1 week SLA)',
    ],
  },
  {
    id: 3,
    name: 'Billing Rules',
    status: 'pass',
    severity: 'pass',
    oneLiner: 'All billing rules match CSA fee structure',
    sourceBadge: 'PrismHR x CSA',
    detail: 'Checked: PrismHR billing configuration vs CSA fee structure. PEPM Fee: $125.00 -- Matches CSA Schedule 2. Implementation Fee: $1,500.00 -- Matches CSA. Off-cycle Fee: $10.00/check -- Matches CSA.',
    remediationSteps: [],
  },
  {
    id: 4,
    name: 'Pay Group Alignment',
    status: 'pass',
    severity: 'pass',
    oneLiner: 'Pay group frequency aligns with CSA billing',
    sourceBadge: 'PrismHR x CSA',
    detail: 'Checked: Pay group frequency alignment. Pay Group: "Semi-Monthly Salaried" -- 38 employees. CSA Billing: Per payroll period basis. Alignment: Consistent.',
    remediationSteps: [],
  },
  {
    id: 5,
    name: 'Deduction Code Validation',
    status: 'fail',
    severity: 'warning',
    oneLiner: '1 deduction code references unconfigured account',
    sourceBadge: 'PrismHR',
    detail: 'Checked: All active deduction codes reference valid accounts',
    issueTableType: 'deduction',
    issueTable: [
      { code: 'MED-01', description: 'Medical Premium - Employee', status: 'Valid' },
      { code: 'DEN-01', description: 'Dental Premium - Employee', status: 'Valid' },
      { code: '401K-EE', description: '401k Employee Contribution', status: 'No Account' },
    ] as DeductionIssue[],
    remediationSteps: [
      'Configure 401(k) employee contribution account in PrismHR',
      'Link deduction code 401K-EE to the new account',
      'Verify with Benefits team that 401(k) plan is active for this client',
    ],
  },
];

/* ---------- Color helpers ---------- */
const SEV_COLORS: Record<Severity, { fg: string; bg: string; border: string; label: string }> = {
  critical: { fg: '#8a000a', bg: '#FDECEA', border: '#f5c0c7', label: 'Critical' },
  warning: { fg: '#5c3c00', bg: '#FEF9EE', border: '#f0d9a8', label: 'Warning' },
  pass: { fg: '#1a5c38', bg: '#E9F5EF', border: '#b3dfc8', label: 'Pass' },
};

const STATUS_ICON: Record<CheckStatus, { icon: string; color: string }> = {
  pass: { icon: 'fa-circle-check', color: '#2A8F60' },
  fail: { icon: 'fa-circle-xmark', color: '#C60C30' },
};

/* ================================================================
   COMPONENT
   ================================================================ */
export default function PreFlightPage() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [phase, setPhase] = useState<RunPhase>('idle');
  const [expandedChecks, setExpandedChecks] = useState<Set<number>>(new Set());
  const [progressIndex, setProgressIndex] = useState(-1);
  const [checkResults, setCheckResults] = useState<Map<number, 'checking' | 'done'>>(new Map());

  /* --- Inline fix state --- */
  const [fixes, setFixes] = useState<Fixes>({});
  const [pushPhase, setPushPhase] = useState<PushPhase>('idle');
  const [pushStep, setPushStep] = useState(-1);
  const [allPassed, setAllPassed] = useState(false);
  const [showApiFor, setShowApiFor] = useState<string | null>(null);

  const client = CLIENTS.find((c) => c.id === selectedClient);

  /* --- Derived counts (respect allPassed mode + inline fixes) --- */
  const isCheck1Fixed = !!(fixes.wc_martinez && fixes.wc_chen && fixes.wc_patel);
  const isCheck2Fixed = !!(fixes.suta_ct_rate);
  const isCheck5Fixed = !!(fixes.deduction_401k);

  const effectiveChecks = allPassed
    ? MOCK_CHECKS.map((c) => ({ ...c, status: 'pass' as CheckStatus, severity: 'pass' as Severity }))
    : MOCK_CHECKS.map((c) => {
        if (c.id === 1 && isCheck1Fixed) return { ...c, status: 'pass' as CheckStatus, severity: 'pass' as Severity };
        if (c.id === 2 && isCheck2Fixed) return { ...c, status: 'pass' as CheckStatus, severity: 'pass' as Severity };
        if (c.id === 5 && isCheck5Fixed) return { ...c, status: 'pass' as CheckStatus, severity: 'pass' as Severity };
        return c;
      });

  const passCount = effectiveChecks.filter((c) => c.status === 'pass').length;
  const criticalCount = effectiveChecks.filter((c) => c.status !== 'pass' && c.severity === 'critical').length;
  const warningCount = effectiveChecks.filter((c) => c.status !== 'pass' && c.severity === 'warning').length;

  /* --- Compute which fixes are filled --- */
  const fixEntries: { key: string; label: string }[] = [];
  if (fixes.wc_martinez) fixEntries.push({ key: 'wc_martinez', label: `WC Code: J. Martinez -> ${fixes.wc_martinez}` });
  if (fixes.wc_chen) fixEntries.push({ key: 'wc_chen', label: `WC Code: R. Chen -> ${fixes.wc_chen}` });
  if (fixes.wc_patel) fixEntries.push({ key: 'wc_patel', label: `WC Code: S. Patel -> ${fixes.wc_patel}` });
  if (fixes.suta_ct_rate) fixEntries.push({ key: 'suta_ct_rate', label: `SUTA Rate: CT -> ${fixes.suta_ct_rate} (${fixes.suta_ct_type === 'standard' ? 'Standard Rate — Pre-Approved' : 'Client Rate — Exec Review Required'})` });
  if (fixes.deduction_401k) fixEntries.push({ key: 'deduction_401k', label: `401K-EE -> GL: ${fixes.deduction_401k}` });

  const totalIssues = 5; // 3 WC + 1 SUTA + 1 deduction
  const fixedCount = fixEntries.length;
  const hasAnyFix = fixedCount > 0;

  /* --- Helper to update a fix --- */
  const setFix = useCallback((key: keyof Fixes, value: string) => {
    setFixes((prev) => ({ ...prev, [key]: value }));
  }, []);

  /* --- Push simulation --- */
  const startPush = useCallback(() => {
    setPushPhase('pushing');
    setPushStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < fixEntries.length) {
        setPushStep(step);
      } else if (step === fixEntries.length) {
        setPushStep(step);
      } else {
        clearInterval(interval);
        setPushPhase('done');
      }
    }, 600);
  }, [fixEntries.length]);

  /* --- Re-run after push --- */
  const reRunAfterPush = useCallback(() => {
    setPhase('running');
    setExpandedChecks(new Set());
    setProgressIndex(-1);
    setCheckResults(new Map());
    setAllPassed(true);
  }, []);

  const toggleCheck = useCallback((id: number) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [fetchStep, setFetchStep] = useState(-1);
  const FETCH_SOURCES = [
    { label: 'Connecting to PrismHR API...', detail: 'Employee roster, WC codes, SUTA rates, billing rules, pay groups', icon: 'fa-server', color: '#C60C30', api: 'GET /api/v1/employees, /api/v1/suta-rates, /api/v1/billing-rules' },
    { label: 'Loading CSA Schedule 2 data...', detail: 'Source of truth — expected WC codes, fee structure, SUTA coverage type', icon: 'fa-file-contract', color: '#0088CE', api: 'CSA Extraction pipeline output (Initiative D)' },
    { label: 'Syncing ClientSpace records...', detail: 'State registrations, employee locations, contract terms', icon: 'fa-building', color: '#2A8F60', api: 'GET /api/clientspace/registrations' },
    { label: 'Pulling Informer SUTA data...', detail: 'State rate tables, SUTA bill rate history for executive review', icon: 'fa-chart-bar', color: '#FF9E1B', api: 'GET /api/informer/suta-bill-rates' },
  ];

  const runPreFlight = useCallback(() => {
    setPhase('fetching');
    setExpandedChecks(new Set());
    setProgressIndex(-1);
    setCheckResults(new Map());
    setFixes({});
    setPushPhase('idle');
    setPushStep(-1);
    setAllPassed(false);
    setFetchStep(0);
  }, []);

  /* Data fetching animation */
  useEffect(() => {
    if (phase !== 'fetching') return;
    if (fetchStep >= FETCH_SOURCES.length) {
      setPhase('running');
      return;
    }
    const timer = setTimeout(() => setFetchStep((s) => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [phase, fetchStep]);

  /* Sequential check animation */
  useEffect(() => {
    if (phase !== 'running') return;

    const checks = allPassed
      ? MOCK_CHECKS.map((c) => ({ ...c, status: 'pass' as CheckStatus, severity: 'pass' as Severity }))
      : MOCK_CHECKS;
    const totalChecks = checks.length;
    let current = -1;

    const interval = setInterval(() => {
      current += 1;
      if (current < totalChecks) {
        setProgressIndex(current);
        setCheckResults((prev) => {
          const next = new Map(prev);
          if (current > 0) next.set(checks[current - 1].id, 'done');
          next.set(checks[current].id, 'checking');
          return next;
        });
      } else if (current === totalChecks) {
        setCheckResults((prev) => {
          const next = new Map(prev);
          next.set(checks[totalChecks - 1].id, 'done');
          return next;
        });
        setProgressIndex(totalChecks);
      } else {
        clearInterval(interval);
        setPhase('done');
      }
    }, 550);

    return () => clearInterval(interval);
  }, [phase, allPassed]);

  /* ---------- Shared inline style fragments ---------- */
  const cardBase: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #E2E8ED',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <div style={{ padding: '24px 24px 64px', maxWidth: 1080, margin: '0 auto' }}>

      {/* ==================== PAGE HEADER ==================== */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <i className="fa-solid fa-plane-departure" style={{ fontSize: 22, color: '#2A8F60' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#23394A', margin: 0, letterSpacing: '-0.3px' }}>
            Payroll Pre-Flight Validation
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#6B6F70', margin: 0 }}>
          Run configuration checks before payroll initialization to eliminate the calculate-fail-fix cycle
        </p>
      </div>

      {/* ==================== SOURCE CONNECTORS ==================== */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: '#C60C30' }}>
            Data Sources &amp; Integration
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6F70', background: '#F5F7F9', borderRadius: 9999, padding: '2px 8px', border: '1px solid #E2E8ED' }}>
            <i className="fa-solid fa-eye" style={{ fontSize: 8, marginRight: 4 }} />
            Click eye icon for API details
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          {CONNECTORS.map((c) => {
            const isApiOpen = showApiFor === c.name;
            return (
            <div key={c.name} style={{ ...cardBase, padding: '14px 16px', borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', background: c.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  }}>
                    <i className={`fa-solid ${c.icon}`} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#23394A' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setShowApiFor(isApiOpen ? null : c.name)}
                    title="View API endpoints"
                    style={{
                      width: 22, height: 22, borderRadius: 6, border: `1px solid ${isApiOpen ? c.color : '#E2E8ED'}`,
                      background: isApiOpen ? `${c.color}15` : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={`fa-solid ${isApiOpen ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 9, color: isApiOpen ? c.color : '#98A1A8' }} />
                  </button>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#1a5c38', background: '#E9F5EF',
                    borderRadius: 9999, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 7 }} />
                  </span>
                </div>
              </div>
              {'badge' in c && c.badge && (
                <div style={{
                  fontSize: 10, fontWeight: 800, color: '#0088CE', background: '#EBF4FB',
                  border: '1px solid #b8d9ef', borderRadius: 4, padding: '2px 8px',
                  textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                  display: 'inline-block', marginBottom: 6,
                }}>
                  <i className="fa-solid fa-star" style={{ fontSize: 8, marginRight: 4 }} />
                  {c.badge}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#6B6F70', lineHeight: 1.5 }}>{c.desc}</div>
              {isApiOpen && (
                <div style={{
                  marginTop: 8, padding: '8px 10px', borderRadius: 6,
                  background: '#1e293b', border: '1px solid #334155',
                  fontFamily: 'ui-monospace, monospace', fontSize: 10,
                  lineHeight: 1.8, color: '#94a3b8',
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: '#60a5fa', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 2, fontFamily: 'inherit' }}>READ APIs</div>
                  {c.apis.filter(a => a.startsWith('GET') || (!a.startsWith('PUT') && !a.startsWith('POST'))).map((api, i) => {
                    const isGet = api.startsWith('GET');
                    return (
                      <div key={`r-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                        {isGet && <span style={{ color: '#4ade80', fontWeight: 700, minWidth: 32 }}>GET</span>}
                        {!isGet && <span style={{ color: '#60a5fa', fontWeight: 700, minWidth: 32 }}>&bull;</span>}
                        <span style={{ color: '#e2e8f0' }}>{api.replace(/^(GET|PUT|POST)\s+/, '')}</span>
                      </div>
                    );
                  })}
                  {c.apis.some(a => a.startsWith('PUT') || a.startsWith('POST')) && (
                    <>
                      <div style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: 6, marginBottom: 2, fontFamily: 'inherit' }}>WRITE APIs (Push to {c.name})</div>
                      {c.apis.filter(a => a.startsWith('PUT') || a.startsWith('POST')).map((api, i) => {
                        const method = api.startsWith('PUT') ? 'PUT' : 'POST';
                        return (
                          <div key={`w-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                            <span style={{ color: method === 'PUT' ? '#f59e0b' : '#c084fc', fontWeight: 700, minWidth: 32 }}>{method}</span>
                            <span style={{ color: '#e2e8f0' }}>{api.replace(/^(GET|PUT|POST)\s+/, '')}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* ==================== CLIENT SELECTOR ==================== */}
      <div style={{ ...cardBase, padding: 20, marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#23394A', marginBottom: 8 }}>
          <i className="fa-solid fa-building" style={{ marginRight: 6, color: '#6B6F70', fontSize: 12 }} />
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => { setSelectedClient(e.target.value); setPhase('idle'); setExpandedChecks(new Set()); }}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 8,
            border: '1px solid #E2E8ED', background: '#FAFBFC',
            fontSize: 14, color: '#23394A', cursor: 'pointer', outline: 'none', appearance: 'auto' as const,
          }}
        >
          <option value="">-- Choose a client --</option>
          {CLIENTS.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.employeeCount} employees, {c.states})</option>
          ))}
        </select>

        {/* Client summary card */}
        {client && (
          <div style={{
            marginTop: 14, padding: '14px 16px', background: '#F5F7F9', borderRadius: 10,
            border: '1px solid #E2E8ED',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#23394A' }}>{client.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1a4f72', background: '#EBF4FB', borderRadius: 9999, padding: '2px 10px' }}>
                <i className="fa-solid fa-users" style={{ marginRight: 4, fontSize: 9 }} />
                {client.employeeCount} employees
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1a5c38', background: '#E9F5EF', borderRadius: 9999, padding: '2px 10px' }}>
                <i className="fa-solid fa-map-marker-alt" style={{ marginRight: 4, fontSize: 9 }} />
                {client.states}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5c3c00', background: '#FEF9EE', borderRadius: 9999, padding: '2px 10px' }}>
                <i className="fa-solid fa-calendar" style={{ marginRight: 4, fontSize: 9 }} />
                Effective {client.csaEffective}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#37526a', background: '#EDF1F5', borderRadius: 9999, padding: '2px 10px' }}>
                <i className="fa-solid fa-user" style={{ marginRight: 4, fontSize: 9 }} />
                PA: {client.assignedPA}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#6B6F70' }}>
              <i className="fa-solid fa-file-lines" style={{ marginRight: 4, color: '#0088CE', fontSize: 11 }} />
              Last CSA extraction: {client.csaExtractedDate} &mdash; {client.csaFieldsExtracted} fields extracted
            </div>
          </div>
        )}
      </div>

      {/* ==================== RUN BUTTON ==================== */}
      {selectedClient && phase === 'idle' && (
        <button
          onClick={runPreFlight}
          style={{
            width: '100%', padding: '16px 24px', borderRadius: 10,
            background: '#2A8F60', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 24, transition: 'background 0.15s ease',
            boxShadow: '0 2px 8px rgba(42,143,96,0.25)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#237A52')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2A8F60')}
        >
          <i className="fa-solid fa-plane-departure" style={{ fontSize: 15 }} />
          Run Pre-Flight Validation
        </button>
      )}

      {/* ==================== DATA FETCHING PHASE ==================== */}
      {phase === 'fetching' && (
        <div style={{ ...cardBase, padding: '24px 28px', marginBottom: 24, borderTop: '4px solid #0074B8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 22, height: 22, border: '2.5px solid #0074B8', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#23394A' }}>
              Fetching configuration data from source systems...
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FETCH_SOURCES.map((src, idx) => {
              const isDone = fetchStep > idx;
              const isActive = fetchStep === idx;
              return (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8,
                  background: isDone ? '#F0F7FF' : isActive ? '#FAFBFC' : 'transparent',
                  border: isDone || isActive ? '1px solid #D0E3F1' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}>
                  {isDone ? (
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: '#2A8F60' }} />
                  ) : isActive ? (
                    <div style={{ width: 16, height: 16, border: '2px solid #0074B8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#D0D5DD', marginLeft: 4, marginRight: 4 }} />
                  )}
                  <i className={`fa-solid ${src.icon}`} style={{ fontSize: 13, color: isDone || isActive ? src.color : '#98A1A8' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isDone || isActive ? '#23394A' : '#98A1A8' }}>{src.label}</div>
                    <div style={{ fontSize: 10, color: isDone ? '#6B6F70' : '#C0C8D0', marginTop: 1 }}>{src.detail}</div>
                    {(isDone || isActive) && (
                      <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#98A1A8', marginTop: 2 }}>
                        <i className="fa-solid fa-plug" style={{ fontSize: 7, marginRight: 3 }} />{src.api}
                      </div>
                    )}
                  </div>
                  {isDone && <span style={{ fontSize: 9, fontWeight: 700, color: '#2A8F60', background: '#E9F5EF', padding: '2px 8px', borderRadius: 4 }}>Loaded</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PROGRESS ANIMATION ==================== */}
      {phase === 'running' && (
        <div style={{ ...cardBase, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 22, height: 22, border: '2.5px solid #2A8F60', borderTopColor: 'transparent',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#23394A' }}>
              Running pre-flight validation for {client?.name}...
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {effectiveChecks.map((check) => {
              const result = checkResults.get(check.id);
              const isDone = result === 'done';
              const isChecking = result === 'checking';
              return (
                <div key={check.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: isDone ? (check.status === 'pass' ? '#E9F5EF' : check.severity === 'critical' ? '#FDECEA' : '#FEF9EE') : isChecking ? '#F5F7F9' : 'transparent',
                  border: isDone || isChecking ? '1px solid #E2E8ED' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}>
                  {isDone ? (
                    <i className={`fa-solid ${check.status === 'pass' ? 'fa-circle-check' : 'fa-circle-xmark'}`}
                      style={{ fontSize: 14, color: check.status === 'pass' ? '#2A8F60' : check.severity === 'critical' ? '#C60C30' : '#FF9E1B' }} />
                  ) : isChecking ? (
                    <div style={{
                      width: 14, height: 14, border: '2px solid #0088CE', borderTopColor: 'transparent',
                      borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                    }} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E2E8ED' }} />
                  )}
                  <span style={{
                    fontSize: 13, fontWeight: isDone || isChecking ? 600 : 400,
                    color: isDone ? '#23394A' : isChecking ? '#0088CE' : '#6B6F70',
                  }}>
                    {check.name}
                  </span>
                  {isChecking && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#0074B8', marginLeft: 4 }}>
                      ← {check.sourceBadge}
                    </span>
                  )}
                  {isDone && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, marginLeft: 'auto',
                      color: check.status === 'pass' ? '#1a5c38' : SEV_COLORS[check.severity].fg,
                      background: check.status === 'pass' ? '#E9F5EF' : SEV_COLORS[check.severity].bg,
                      padding: '2px 8px', borderRadius: 9999,
                    }}>
                      {check.status === 'pass' ? 'PASS' : check.severity === 'critical' ? 'CRITICAL' : 'WARNING'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== VALIDATION REPORT ==================== */}
      {phase === 'done' && (
        <>
          {/* Success banner (after re-run with all passes) */}
          {allPassed && (
            <div style={{
              background: '#E9F5EF', border: '2px solid #2A8F60', borderRadius: 10,
              padding: '14px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 18, color: '#2A8F60' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a5c38' }}>
                Pre-flight validation passed &mdash; ready to initialize mock payroll in PrismHR
              </span>
            </div>
          )}

          {/* Summary bar */}
          <div style={{
            background: allPassed ? '#1a5c38' : '#8a000a', borderRadius: 10, padding: '14px 20px',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const,
          }}>
            <i className={`fa-solid ${allPassed ? 'fa-plane-departure' : 'fa-plane-slash'}`} style={{ fontSize: 16, color: allPassed ? '#b3dfc8' : '#ff8095' }} />
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {passCount} of {MOCK_CHECKS.length} checks passed
                </span>
                <span style={{ color: allPassed ? '#b3dfc8' : '#ff8095' }}>|</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: allPassed ? '#b3dfc8' : '#ff8095' }}>
                  {criticalCount} blocker{criticalCount !== 1 ? 's' : ''}
                </span>
                <span style={{ color: allPassed ? '#b3dfc8' : '#ff8095' }}>|</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: allPassed ? '#b3dfc8' : '#FFD79A' }}>
                  {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, color: '#fff',
              background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 14px',
              letterSpacing: '0.5px', textTransform: 'uppercase' as const,
            }}>
              Overall: {allPassed ? 'PASS' : 'FAIL'}
            </span>
          </div>

          {/* Source of truth — explicit data provenance */}
          <div style={{
            marginBottom: 14, padding: '16px 20px', borderRadius: 10,
            background: '#fff', border: '1px solid #E2E8ED',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 14, color: '#0088CE' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#23394A' }}>Data Provenance — Where Each Validation Source Comes From</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#EBF4FB', border: '1px solid #b8d9ef' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#0088CE', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
                  <i className="fa-solid fa-star" style={{ fontSize: 8, marginRight: 4 }} />Source of Truth
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a4f72', marginBottom: 2 }}>CSA Schedule 2</div>
                <div style={{ fontSize: 10, color: '#37526a', lineHeight: 1.5 }}>
                  Expected WC codes, fee structure ($125 PEPM), SUTA coverage type (CR%), contract term, services. Extracted via LlamaParse + AI Extraction Agent.
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#FDECEA', border: '1px solid #f5c0c7' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#C60C30', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
                  <i className="fa-solid fa-server" style={{ fontSize: 8, marginRight: 4 }} />System Being Validated
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#8a000a', marginBottom: 2 }}>PrismHR</div>
                <div style={{ fontSize: 10, color: '#6a0010', lineHeight: 1.5 }}>
                  Employee WC assignments, SUTA rate table, billing rules, pay groups, deduction code → GL mappings. Reads via REST API, writes back fixes via PUT.
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#E9F5EF', border: '1px solid #b3dfc8' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#2A8F60', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
                  <i className="fa-solid fa-building" style={{ fontSize: 8, marginRight: 4 }} />Supplementary Source
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a5c38', marginBottom: 2 }}>ClientSpace</div>
                <div style={{ fontSize: 10, color: '#1a4a2e', lineHeight: 1.5 }}>
                  State registrations, employee locations, client record, onboarding handoff page data. Provides geographic context for SUTA validation.
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#FEF9EE', border: '1px solid #f0d9a8' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#7a4800', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>
                  <i className="fa-solid fa-chart-bar" style={{ fontSize: 8, marginRight: 4 }} />Reference Data
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5c3c00', marginBottom: 2 }}>Informer</div>
                <div style={{ fontSize: 10, color: '#5c3c00', lineHeight: 1.5 }}>
                  SUTA bill rate tables by state, historical rate data, pre-approved state list. Used for SUTA bill rate validation and executive review escalation.
                </div>
              </div>
            </div>
          </div>

          {/* Resolve warning (only when NOT all-passed) */}
          {!allPassed && (
            <div style={{
              background: '#FDECEA', border: '1px solid #f5c0c7', borderRadius: 10,
              padding: '11px 16px', marginBottom: 20,
              fontSize: 13, color: '#8a000a', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="fa-solid fa-hand" style={{ fontSize: 13 }} />
              Resolve all critical issues before initializing payroll
            </div>
          )}

          {/* Validation check cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {effectiveChecks.map((check) => {
              const isExpanded = expandedChecks.has(check.id);
              const isPass = check.status === 'pass';
              const sev = SEV_COLORS[check.severity];

              return (
                <div key={check.id} style={{
                  ...cardBase,
                  overflow: 'hidden',
                  borderLeft: `4px solid ${isPass ? '#2A8F60' : check.severity === 'critical' ? '#C60C30' : '#FF9E1B'}`,
                }}>
                  {/* Card header */}
                  <button
                    onClick={() => toggleCheck(check.id)}
                    style={{
                      width: '100%', padding: '14px 16px', border: 'none', background: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      textAlign: 'left' as const, font: 'inherit',
                    }}
                  >
                    {/* Status icon */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: isPass ? '#E9F5EF' : sev.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <i className={`fa-solid ${isPass ? 'fa-circle-check' : check.severity === 'critical' ? 'fa-circle-xmark' : 'fa-triangle-exclamation'}`}
                        style={{ fontSize: 14, color: isPass ? '#2A8F60' : check.severity === 'critical' ? '#C60C30' : '#FF9E1B' }} />
                    </div>

                    {/* Check info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#23394A' }}>
                          {check.name}
                        </span>
                        {/* Status badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 800, borderRadius: 9999, padding: '2px 10px',
                          color: isPass ? '#1a5c38' : sev.fg,
                          background: isPass ? '#E9F5EF' : sev.bg,
                          textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                        }}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                        {/* Severity badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: '2px 10px',
                          color: sev.fg, background: sev.bg,
                        }}>
                          {sev.label}
                        </span>
                        {/* Source badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 600, borderRadius: 9999, padding: '2px 10px',
                          color: '#37526a', background: '#EDF1F5',
                        }}>
                          {check.sourceBadge}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B6F70' }}>
                        {allPassed && check.id === 1 ? 'All employees have valid WC codes matching CSA Schedule 2' :
                         allPassed && check.id === 2 ? `SUTA rate entered for CT (38 employees) — ${fixes.suta_ct_type === 'standard' ? 'Standard Rate, pre-approved' : 'Client Rate, exec-approved'}` :
                         allPassed && check.id === 5 ? 'All deduction codes reference valid accounts' :
                         check.oneLiner}
                      </div>
                    </div>

                    {/* Chevron */}
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}
                      style={{ fontSize: 10, color: '#98A1A8', flexShrink: 0 }} />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && !allPassed && (
                    <div style={{
                      padding: '0 16px 20px 58px',
                      borderTop: '1px solid #E2E8ED',
                      paddingTop: 16,
                    }}>
                      {/* Detail text */}
                      <div style={{
                        fontSize: 13, color: '#37526a', lineHeight: 1.6, marginBottom: 10,
                        padding: '10px 14px', borderRadius: 8,
                        background: '#F5F7F9', border: '1px solid #E2E8ED',
                      }}>
                        {check.detail}
                      </div>

                      {/* Source citations — where each piece of data was fetched from */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {check.id === 1 && (<>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Employee Roster + WC Assignments
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E9F5EF', color: '#1A7A4A', border: '1px solid #C6E4D4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-file-invoice" style={{ fontSize: 8 }} /> CSA Schedule 2: Expected WC Codes (CT 5606, CT 9012, CT 9083)
                          </span>
                        </>)}
                        {check.id === 2 && (<>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: SUTA Rate Table
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Employee State Locations
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E9F5EF', color: '#1A7A4A', border: '1px solid #C6E4D4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-file-invoice" style={{ fontSize: 8 }} /> CSA: SUTA Coverage Type = CR% (Client Rate)
                          </span>
                        </>)}
                        {check.id === 3 && (<>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Billing Rule Configuration
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E9F5EF', color: '#1A7A4A', border: '1px solid #C6E4D4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-file-invoice" style={{ fontSize: 8 }} /> CSA Schedule 2: Fee Structure ($125.00 PEPM)
                          </span>
                        </>)}
                        {check.id === 4 && (<>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Pay Group Configuration
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E9F5EF', color: '#1A7A4A', border: '1px solid #C6E4D4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-file-invoice" style={{ fontSize: 8 }} /> CSA: Billing Frequency (Per Payroll Period)
                          </span>
                        </>)}
                        {check.id === 5 && (<>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Deduction Code Registry
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#E7F1FA', color: '#0074B8', border: '1px solid #D0E3F1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <i className="fa-solid fa-server" style={{ fontSize: 8 }} /> PrismHR: Chart of Accounts
                          </span>
                        </>)}
                      </div>

                      {/* ===== WC issue table with inline editable dropdowns ===== */}
                      {check.issueTableType === 'wc' && check.issueTable && (
                        <div style={{ marginBottom: 14, overflowX: 'auto' as const }}>
                          <table style={{
                            width: '100%', borderCollapse: 'collapse' as const, fontSize: 12,
                            border: '1px solid #E2E8ED', borderRadius: 8,
                          }}>
                            <thead>
                              <tr style={{ background: '#F5F7F9' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Employee</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Current WC</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Expected WC</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const wcRows = check.issueTable as WCIssue[];
                                const fixKeys: (keyof Fixes)[] = ['wc_martinez', 'wc_chen', 'wc_patel'];
                                const defaultValues = ['8810', '8742', '(none)'];
                                return wcRows.map((row, i) => {
                                  const fixKey = fixKeys[i];
                                  const fixValue = fixes[fixKey];
                                  const isFixed = !!fixValue;
                                  return (
                                    <tr key={i} style={{
                                      background: isFixed ? '#f0faf4' : row.status === 'Missing' ? '#FDECEA' : '#fff',
                                      borderLeft: isFixed ? '3px solid #2A8F60' : '3px solid transparent',
                                      transition: 'all 0.2s ease',
                                    }}>
                                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED', fontWeight: 600, color: '#23394A' }}>{row.employee}</td>
                                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <select
                                            value={fixValue || defaultValues[i]}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val === defaultValues[i]) {
                                                setFixes((prev) => { const n = { ...prev }; delete n[fixKey]; return n; });
                                              } else {
                                                setFix(fixKey, val);
                                              }
                                            }}
                                            style={{
                                              padding: '5px 10px', borderRadius: 6,
                                              border: isFixed ? '2px solid #2A8F60' : '1px solid #E2E8ED',
                                              background: isFixed ? '#E9F5EF' : '#FAFBFC',
                                              fontSize: 12, fontFamily: 'ui-monospace, monospace',
                                              color: isFixed ? '#1a5c38' : '#C60C30',
                                              fontWeight: 600, cursor: 'pointer', outline: 'none',
                                              appearance: 'auto' as const, minWidth: 110,
                                            }}
                                          >
                                            <option value={defaultValues[i]} style={{ color: '#C60C30' }}>{defaultValues[i]}</option>
                                            {WC_CODE_OPTIONS.map((code) => (
                                              <option key={code} value={code} style={{ color: '#1a5c38' }}>{code}</option>
                                            ))}
                                          </select>
                                          {isFixed && (
                                            <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#2A8F60' }} />
                                          )}
                                        </div>
                                      </td>
                                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED', fontFamily: 'ui-monospace, monospace', color: '#2A8F60', fontWeight: 600 }}>{row.expectedWC}</td>
                                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED' }}>
                                        <span style={{
                                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                                          color: isFixed ? '#1a5c38' : '#8a000a',
                                          background: isFixed ? '#E9F5EF' : '#FDECEA',
                                        }}>
                                          {isFixed ? (
                                            <><i className="fa-solid fa-check" style={{ marginRight: 3, fontSize: 9 }} /> Fixed</>
                                          ) : (
                                            <><i className="fa-solid fa-xmark" style={{ marginRight: 3, fontSize: 9 }} /> {row.status}</>
                                          )}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>

                          {/* Fixes are made inline via dropdowns above — pushed to PrismHR in batch */}
                        </div>
                      )}

                      {/* ===== Deduction issue table with inline GL account fix ===== */}
                      {check.issueTableType === 'deduction' && check.issueTable && (
                        <div style={{ marginBottom: 14, overflowX: 'auto' as const }}>
                          <table style={{
                            width: '100%', borderCollapse: 'collapse' as const, fontSize: 12,
                            border: '1px solid #E2E8ED', borderRadius: 8,
                          }}>
                            <thead>
                              <tr style={{ background: '#F5F7F9' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Code</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Description</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 700, color: '#23394A', borderBottom: '2px solid #E2E8ED' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(check.issueTable as DeductionIssue[]).map((row, i) => {
                                const isValid = row.status === 'Valid';
                                const is401k = row.code === '401K-EE';
                                const deductionFixed = is401k && !!fixes.deduction_401k;
                                return (
                                  <tr key={i} style={{
                                    background: deductionFixed ? '#f0faf4' : isValid ? '#fff' : '#FDECEA',
                                    borderLeft: deductionFixed ? '3px solid #2A8F60' : '3px solid transparent',
                                  }}>
                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED', fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#23394A' }}>{row.code}</td>
                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED', color: '#37526a' }}>{row.description}</td>
                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8ED' }}>
                                      <span style={{
                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                                        color: (isValid || deductionFixed) ? '#1a5c38' : '#8a000a',
                                        background: (isValid || deductionFixed) ? '#E9F5EF' : '#FDECEA',
                                      }}>
                                        {(isValid || deductionFixed) ? (
                                          <><i className="fa-solid fa-check" style={{ marginRight: 3, fontSize: 9 }} /> {deductionFixed ? 'Fixed' : 'Valid'}</>
                                        ) : (
                                          <><i className="fa-solid fa-xmark" style={{ marginRight: 3, fontSize: 9 }} /> No Account</>
                                        )}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Inline fix for 401K-EE */}
                          <div style={{
                            marginTop: 14, padding: '16px 20px', borderRadius: 10,
                            background: fixes.deduction_401k ? '#f0faf4' : '#fff',
                            border: fixes.deduction_401k ? '2px solid #2A8F60' : '1px solid #E2E8ED',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s ease',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: 6,
                                background: fixes.deduction_401k ? '#E9F5EF' : '#FEF9EE',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <i className={`fa-solid ${fixes.deduction_401k ? 'fa-circle-check' : 'fa-wrench'}`}
                                  style={{ fontSize: 11, color: fixes.deduction_401k ? '#2A8F60' : '#FF9E1B' }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#23394A', letterSpacing: '-0.2px' }}>
                                Link 401K-EE to GL Account
                              </span>
                              {fixes.deduction_401k && (
                                <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#2A8F60', marginLeft: 'auto' }} />
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#37526a', whiteSpace: 'nowrap' as const }}>
                                Select GL Account:
                              </label>
                              <select
                                value={fixes.deduction_401k || ''}
                                onChange={(e) => {
                                  if (e.target.value) setFix('deduction_401k', e.target.value);
                                  else setFixes((prev) => { const n = { ...prev }; delete n.deduction_401k; return n; });
                                }}
                                style={{
                                  padding: '6px 12px', borderRadius: 6,
                                  border: fixes.deduction_401k ? '2px solid #2A8F60' : '1px solid #E2E8ED',
                                  background: fixes.deduction_401k ? '#E9F5EF' : '#FAFBFC',
                                  fontSize: 12, fontWeight: 600,
                                  color: fixes.deduction_401k ? '#1a5c38' : '#23394A',
                                  cursor: 'pointer', outline: 'none', appearance: 'auto' as const, minWidth: 200,
                                }}
                              >
                                <option value="">-- Select GL Account --</option>
                                {GL_ACCOUNT_OPTIONS.map((acct) => (
                                  <option key={acct} value={acct}>{acct}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pass detail for billing / pay group */}
                      {isPass && !check.issueTable && (
                        <div style={{
                          padding: '12px 14px', borderRadius: 8,
                          background: '#E9F5EF', border: '1px solid #b3dfc8',
                          marginBottom: 14,
                        }}>
                          {check.detail.split('. ').filter(Boolean).map((line, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#1a5c38', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                              <i className="fa-solid fa-check" style={{ fontSize: 10, marginTop: 4, color: '#2A8F60', flexShrink: 0 }} />
                              <span>{line.trim().replace(/\.$/, '')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Remediation is done inline via dropdowns/inputs — no separate steps needed */}

                      {/* ===== SUTA inline fix + Pre-Approval Decision (for SUTA check only) ===== */}
                      {check.id === 2 && (
                        <div style={{
                          marginBottom: 14, padding: '18px 20px', borderRadius: 10,
                          background: fixes.suta_ct_rate ? '#f0faf4' : '#fff',
                          border: fixes.suta_ct_rate ? '2px solid #2A8F60' : '1px solid #E2E8ED',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6,
                              background: fixes.suta_ct_rate ? '#E9F5EF' : '#FEF9EE',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <i className={`fa-solid ${fixes.suta_ct_rate ? 'fa-circle-check' : 'fa-shield-halved'}`}
                                style={{ fontSize: 11, color: fixes.suta_ct_rate ? '#2A8F60' : '#FF9E1B' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#23394A', letterSpacing: '-0.2px' }}>
                              Enter SUTA rate for CT
                            </span>
                            {fixes.suta_ct_rate && (
                              <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#2A8F60', marginLeft: 'auto' }} />
                            )}
                          </div>

                          {/* SUTA rate input */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#37526a', whiteSpace: 'nowrap' as const }}>
                                SUTA Rate:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., 2.31%"
                                value={fixes.suta_ct_rate || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    setFix('suta_ct_rate', val);
                                    if (!fixes.suta_ct_type) setFix('suta_ct_type', 'client');
                                  } else {
                                    setFixes((prev) => { const n = { ...prev }; delete n.suta_ct_rate; delete n.suta_ct_type; return n; });
                                  }
                                }}
                                style={{
                                  padding: '6px 12px', borderRadius: 6,
                                  border: fixes.suta_ct_rate ? '2px solid #2A8F60' : '1px solid #E2E8ED',
                                  background: fixes.suta_ct_rate ? '#E9F5EF' : '#FAFBFC',
                                  fontSize: 12, fontFamily: 'ui-monospace, monospace',
                                  fontWeight: 600, outline: 'none', width: 140,
                                  color: fixes.suta_ct_rate ? '#1a5c38' : '#23394A',
                                }}
                              />
                            </div>

                            {/* Rate type radio buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 2, marginBottom: 12 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#37526a', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="suta_rate_type"
                                  checked={(fixes.suta_ct_type || 'client') === 'client'}
                                  onChange={() => setFix('suta_ct_type', 'client')}
                                  style={{ accentColor: '#2A8F60', cursor: 'pointer' }}
                                />
                                Client Rate (CR%)
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#37526a', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="suta_rate_type"
                                  checked={fixes.suta_ct_type === 'standard'}
                                  onChange={() => setFix('suta_ct_type', 'standard')}
                                  style={{ accentColor: '#2A8F60', cursor: 'pointer' }}
                                />
                                Standard Rate (Pre-Approved)
                              </label>
                            </div>

                            {/* SUTA Pre-Approval Workflow — Detailed */}
                            <div style={{
                              padding: '14px 16px', borderRadius: 10,
                              background: '#fff', border: '1px solid #E2E8ED',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <i className="fa-solid fa-shield-halved" style={{ fontSize: 12, color: '#FF9E1B' }} />
                                <span style={{ fontWeight: 800, fontSize: 12, color: '#23394A' }}>
                                  SUTA Bill Rate Pre-Approval Workflow
                                </span>
                              </div>

                              {/* Pre-approval decision tree */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 0, marginBottom: 12, alignItems: 'stretch' }}>
                                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#E9F5EF', border: '1px solid #b3dfc8' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: '#2A8F60', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Standard Rate States</div>
                                  <div style={{ fontSize: 10, color: '#1a5c38', lineHeight: 1.6, marginBottom: 6 }}>Pre-approved at deal close by Sales. No executive review needed.</div>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                                    {['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NJ', 'VA'].map(s => (
                                      <span key={s} style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: '#d4eddf', color: '#1a5c38' }}>
                                        {s} <i className="fa-solid fa-check" style={{ fontSize: 6 }} />
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#98A1A8' }}>vs</div>
                                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#FEF9EE', border: '1px solid #f0d9a8' }}>
                                  <div style={{ fontSize: 10, fontWeight: 800, color: '#7a4800', letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Client Rate (CR%) States</div>
                                  <div style={{ fontSize: 10, color: '#5c3c00', lineHeight: 1.6, marginBottom: 6 }}>Requires executive SUTA Bill Rate Review. 1-week SLA before 1st payroll.</div>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: '#fef0d5', color: '#7a4800', border: '1px solid #f0d9a8' }}>
                                      CT <i className="fa-solid fa-clock" style={{ fontSize: 6 }} />
                                    </span>
                                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, color: '#98A1A8', background: '#F5F7F9' }}>
                                      + any non-standard rate
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Source attribution */}
                              <div style={{
                                padding: '8px 10px', borderRadius: 6,
                                background: '#F5F7F9', border: '1px solid #E2E8ED',
                                fontSize: 10, color: '#37526a', lineHeight: 1.7,
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <i className="fa-solid fa-plug" style={{ fontSize: 8, color: '#FF9E1B' }} />
                                  <span style={{ fontWeight: 700 }}>Data Sources for SUTA Validation:</span>
                                </div>
                                <div style={{ paddingLeft: 14 }}>
                                  <div><span style={{ fontWeight: 700, color: '#C60C30' }}>PrismHR</span> &rarr; GET /api/v1/suta-rates &mdash; current rate table (what&apos;s configured)</div>
                                  <div><span style={{ fontWeight: 700, color: '#0088CE' }}>CSA Schedule 2</span> &rarr; SUTA coverage type: CR% (Client Rate) &mdash; what&apos;s contractually agreed</div>
                                  <div><span style={{ fontWeight: 700, color: '#FF9E1B' }}>Informer</span> &rarr; GET /api/informer/suta-bill-rates/CT &mdash; state rate table for executive review</div>
                                  <div><span style={{ fontWeight: 700, color: '#2A8F60' }}>ClientSpace</span> &rarr; GET /api/v1/clients/{'{id}'}/registrations &mdash; confirms CT state registration exists</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SUTA approval routing — standard rates pre-approved during sales, client rates need executive review */}
                          {fixes.suta_ct_type === 'standard' ? (
                            <div style={{
                              padding: '16px 20px', borderRadius: 10,
                              background: '#E9F5EF', border: '2px solid #b3dfc8',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#2A8F60' }} />
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#1a5c38' }}>Standard Rate — Pre-Approved at Sales</span>
                              </div>
                              <div style={{ fontSize: 12, color: '#1a5c38', lineHeight: 1.7 }}>
                                <div>Connecticut standard SUTA rate was pre-approved during the sales process. No executive review required — this removes the approval queue from the critical path.</div>
                              </div>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                                padding: '8px 12px', borderRadius: 6,
                                background: '#d4eddf', fontSize: 11, fontWeight: 600, color: '#1a5c38',
                              }}>
                                <i className="fa-solid fa-bolt" style={{ fontSize: 10 }} />
                                Approval queue bypassed — ready for payroll initialization
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{
                                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                                background: '#F5F7F9', border: '1px solid #E2E8ED',
                                fontSize: 12, color: '#37526a', lineHeight: 1.7,
                              }}>
                                <div>CSA specifies: <strong>CR% (Client Rate)</strong> for Connecticut</div>
                                <div>Decision: Non-standard rate &rarr; <strong>Requires executive approval</strong></div>
                              </div>

                              <div style={{
                                padding: '16px 20px', borderRadius: 10,
                                background: '#FEF9EE', border: '2px solid #f0d9a8',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 14, color: '#FF9E1B' }} />
                                  <span style={{ fontSize: 13, fontWeight: 800, color: '#5c3c00' }}>Executive SUTA Bill Rate Review Required</span>
                                </div>
                                <div style={{
                                  display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 12px',
                                  fontSize: 12, color: '#5c3c00', lineHeight: 1.7,
                                }}>
                                  <span style={{ fontWeight: 700 }}>State:</span>
                                  <span>CT (Connecticut)</span>
                                  <span style={{ fontWeight: 700 }}>Rate Type:</span>
                                  <span>Client Rate (CR%) — non-standard</span>
                                  <span style={{ fontWeight: 700 }}>Source:</span>
                                  <span>Informer SUTA Bill Rate Report</span>
                                  <span style={{ fontWeight: 700 }}>SLA:</span>
                                  <span>Must be approved 1 week before 1st payroll</span>
                                  <span style={{ fontWeight: 700 }}>Effective Date:</span>
                                  <span>07/01/2026</span>
                                  <span style={{ fontWeight: 700 }}>Deadline:</span>
                                  <span style={{ fontWeight: 800, color: '#C60C30' }}>06/24/2026</span>
                                </div>
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
                                  padding: '8px 12px', borderRadius: 6,
                                  background: '#fef0d5', fontSize: 11, fontWeight: 600, color: '#5c3c00',
                                }}>
                                  <i className="fa-solid fa-lightbulb" style={{ fontSize: 10 }} />
                                  Tip: Switch to Standard Rate above to bypass executive review for known states
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Fix inline — all changes pushed to PrismHR via batch sync */}
                    </div>
                  )}

                  {/* Expanded detail for all-passed mode */}
                  {isExpanded && allPassed && (
                    <div style={{
                      padding: '0 16px 20px 58px',
                      borderTop: '1px solid #E2E8ED',
                      paddingTop: 16,
                    }}>
                      <div style={{
                        padding: '12px 14px', borderRadius: 8,
                        background: '#E9F5EF', border: '1px solid #b3dfc8',
                      }}>
                        <div style={{ fontSize: 12, color: '#1a5c38', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 10, marginTop: 4, color: '#2A8F60', flexShrink: 0 }} />
                          <span>All validations passed. No issues found.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ==================== PUSH BAR (sticky, above action plan) ==================== */}
          {hasAnyFix && !allPassed && pushPhase !== 'done' && (
            <div style={{
              ...cardBase, padding: '20px 24px', marginBottom: 24,
              background: '#1e293b', borderRadius: 12,
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: '#4ade80' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {fixedCount} of {totalIssues} issues fixed locally
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
                  Changes ready to push:
                </div>
                {fixEntries.map((entry, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: '#e2e8f0', lineHeight: 1.8,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 9, color: '#4ade80' }} />
                    {entry.label}
                  </div>
                ))}
              </div>

              <button
                onClick={startPush}
                disabled={pushPhase === 'pushing'}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 10,
                  background: '#2A8F60', color: '#fff', border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: pushPhase === 'pushing' ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 2px 10px rgba(42,143,96,0.35)',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={(e) => { if (pushPhase !== 'pushing') e.currentTarget.style.background = '#237A52'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#2A8F60'; }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 14 }} />
                Push All Fixes to PrismHR
              </button>

              <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, lineHeight: 1.5, textAlign: 'center' as const }}>
                Write-back via PrismHR REST API — PUT endpoints for WC codes, SUTA rates, and deduction mappings.
                After pushing, re-run validation to verify all checks pass.
              </div>
            </div>
          )}

          {/* ==================== PUSH PROGRESS OVERLAY ==================== */}
          {pushPhase === 'pushing' && (
            <div style={{
              position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999,
            }}>
              <div style={{
                background: '#fff', borderRadius: 16, padding: '32px 40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                maxWidth: 460, width: '90%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 22, height: 22, border: '2.5px solid #2A8F60', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#23394A' }}>
                    Pushing {fixEntries.length} fix{fixEntries.length !== 1 ? 'es' : ''} to PrismHR...
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fixEntries.map((entry, i) => {
                    const isDone = pushStep > i;
                    const isCurrent = pushStep === i;
                    const pushLabels: Record<string, string> = {
                      wc_martinez: 'Updating WC code for J. Martinez',
                      wc_chen: 'Updating WC code for R. Chen',
                      wc_patel: 'Updating WC code for S. Patel',
                      suta_ct_rate: 'Entering SUTA rate for CT',
                      deduction_401k: 'Linking 401K-EE to GL account',
                    };
                    const pushApis: Record<string, string> = {
                      wc_martinez: 'PUT /api/v1/employees/martinez/wc-code',
                      wc_chen: 'PUT /api/v1/employees/chen/wc-code',
                      wc_patel: 'PUT /api/v1/employees/patel/wc-code',
                      suta_ct_rate: 'PUT /api/v1/suta-rates/CT',
                      deduction_401k: 'PUT /api/v1/deduction-codes/401K-EE',
                    };
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8,
                        background: isDone ? '#E9F5EF' : isCurrent ? '#F5F7F9' : 'transparent',
                        border: isDone || isCurrent ? '1px solid #E2E8ED' : '1px solid transparent',
                        transition: 'all 0.3s ease',
                      }}>
                        {isDone ? (
                          <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#2A8F60' }} />
                        ) : isCurrent ? (
                          <div style={{
                            width: 14, height: 14, border: '2px solid #0088CE', borderTopColor: 'transparent',
                            borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                          }} />
                        ) : (
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E2E8ED' }} />
                        )}
                        <div>
                          <span style={{
                            fontSize: 13, fontWeight: isDone || isCurrent ? 600 : 400,
                            color: isDone ? '#1a5c38' : isCurrent ? '#0088CE' : '#6B6F70',
                          }}>
                            {pushLabels[entry.key] || entry.label}
                            {isDone && ' ...done'}
                          </span>
                          {(isDone || isCurrent) && pushApis[entry.key] && (
                            <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: '#98A1A8', marginTop: 1 }}>
                              <span style={{ color: '#f59e0b', fontWeight: 700 }}>PUT</span> {pushApis[entry.key].replace('PUT ', '')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PUSH COMPLETE BAR ==================== */}
          {pushPhase === 'done' && !allPassed && (
            <div style={{
              ...cardBase, padding: '20px 24px', marginBottom: 24,
              background: '#1e293b', borderRadius: 12,
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: '#4ade80' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  All fixes pushed to PrismHR successfully
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button
                  disabled
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: '#16a34a', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'default',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    opacity: 0.8,
                  }}
                >
                  <i className="fa-solid fa-check" style={{ fontSize: 11 }} />
                  Pushed
                </button>

                <button
                  onClick={reRunAfterPush}
                  style={{
                    padding: '10px 24px', borderRadius: 8,
                    background: '#0088CE', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 8px rgba(0,136,206,0.35)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#006FA6'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#0088CE'; }}
                >
                  <i className="fa-solid fa-rotate-right" style={{ fontSize: 11 }} />
                  Re-run Validation
                </button>
              </div>

              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                Re-run validation to verify all checks pass after pushing fixes.
              </div>
            </div>
          )}

          {/* ==================== REMEDIATION ACTION PLAN ==================== */}
          {(() => {
            const allResolved = isCheck1Fixed && isCheck2Fixed && isCheck5Fixed;
            const resolvedCount = [isCheck1Fixed, isCheck2Fixed, isCheck5Fixed].filter(Boolean).length;
            return (
            <div style={{
              ...cardBase, padding: '20px 24px', marginBottom: 24,
              borderLeft: `4px solid ${allResolved ? '#2A8F60' : '#23394A'}`,
              transition: 'border-color 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: allResolved ? '#2A8F60' : '#23394A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s ease',
                }}>
                  <i className={`fa-solid ${allResolved ? 'fa-circle-check' : 'fa-clipboard-list'}`} style={{ fontSize: 13, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#23394A', letterSpacing: '-0.3px' }}>Remediation Action Plan</span>
                {resolvedCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 9999, marginLeft: 'auto',
                    color: allResolved ? '#1a5c38' : '#37526a',
                    background: allResolved ? '#E9F5EF' : '#F5F7F9',
                    border: `1px solid ${allResolved ? '#b3dfc8' : '#E2E8ED'}`,
                  }}>
                    {resolvedCount}/3 resolved
                  </span>
                )}
              </div>

              <div style={{
                fontSize: 12, color: '#37526a', marginBottom: 14, lineHeight: 1.6,
                padding: '8px 12px', background: '#F5F7F9', borderRadius: 8, border: '1px solid #E2E8ED',
              }}>
                {allResolved
                  ? 'All remediation items resolved — ready to push fixes and initialize mock payroll.'
                  : 'Before initializing mock payroll, the PA must:'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {/* Action 1 — WC Codes */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  background: isCheck1Fixed ? '#E9F5EF' : '#FDECEA',
                  border: `1px solid ${isCheck1Fixed ? '#b3dfc8' : '#f5c0c7'}`,
                  transition: 'all 0.25s ease',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${isCheck1Fixed ? '#2A8F60' : '#C60C30'}`,
                    background: isCheck1Fixed ? '#2A8F60' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    transition: 'all 0.25s ease',
                  }}>
                    {isCheck1Fixed && <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: isCheck1Fixed ? '#1a5c38' : '#8a000a',
                      textDecoration: isCheck1Fixed ? 'line-through' : 'none',
                      transition: 'all 0.25s ease',
                    }}>
                      1. Fix WC codes for 3 employees in PrismHR
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: isCheck1Fixed ? '#1a5c38' : '#8a000a',
                      background: '#fff',
                      border: `1px solid ${isCheck1Fixed ? '#b3dfc8' : '#f5c0c7'}`,
                      textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                    }}>
                      {isCheck1Fixed ? 'Resolved' : 'Critical — blocks payroll'}
                    </span>
                  </div>
                </div>

                {/* Action 2 — SUTA Rate */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  background: isCheck2Fixed ? '#E9F5EF' : '#FEF9EE',
                  border: `1px solid ${isCheck2Fixed ? '#b3dfc8' : '#f0d9a8'}`,
                  transition: 'all 0.25s ease',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${isCheck2Fixed ? '#2A8F60' : '#FF9E1B'}`,
                    background: isCheck2Fixed ? '#2A8F60' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    transition: 'all 0.25s ease',
                  }}>
                    {isCheck2Fixed && <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: isCheck2Fixed ? '#1a5c38' : '#5c3c00',
                      textDecoration: isCheck2Fixed ? 'line-through' : 'none',
                      transition: 'all 0.25s ease',
                    }}>
                      2. Enter SUTA rate for CT or escalate to executive review
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: isCheck2Fixed ? '#1a5c38' : '#5c3c00',
                      background: '#fff',
                      border: `1px solid ${isCheck2Fixed ? '#b3dfc8' : '#f0d9a8'}`,
                      textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                    }}>
                      {isCheck2Fixed ? (fixes.suta_ct_type === 'standard' ? 'Pre-approved' : 'Resolved') : 'Warning — 1 week SLA'}
                    </span>
                  </div>
                </div>

                {/* Action 3 — Deduction Code */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  background: isCheck5Fixed ? '#E9F5EF' : '#FEF9EE',
                  border: `1px solid ${isCheck5Fixed ? '#b3dfc8' : '#f0d9a8'}`,
                  transition: 'all 0.25s ease',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${isCheck5Fixed ? '#2A8F60' : '#FF9E1B'}`,
                    background: isCheck5Fixed ? '#2A8F60' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    transition: 'all 0.25s ease',
                  }}>
                    {isCheck5Fixed && <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: isCheck5Fixed ? '#1a5c38' : '#5c3c00',
                      textDecoration: isCheck5Fixed ? 'line-through' : 'none',
                      transition: 'all 0.25s ease',
                    }}>
                      3. Configure 401(k) account for deduction code 401K-EE
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                      color: isCheck5Fixed ? '#1a5c38' : '#5c3c00',
                      background: '#fff',
                      border: `1px solid ${isCheck5Fixed ? '#b3dfc8' : '#f0d9a8'}`,
                      textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                    }}>
                      {isCheck5Fixed ? 'Resolved' : 'Warning'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: allResolved ? '#d4eddf' : '#E9F5EF',
                border: `1px solid ${allResolved ? '#2A8F60' : '#b3dfc8'}`,
                fontSize: 12, color: '#1a5c38', fontWeight: 600, lineHeight: 1.6,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.3s ease',
              }}>
                <i className={`fa-solid ${allResolved ? 'fa-circle-check' : 'fa-clock'}`} style={{ fontSize: 12, color: '#2A8F60', flexShrink: 0 }} />
                <span>
                  {allResolved
                    ? <><strong>All issues resolved inline</strong> — push fixes to PrismHR and initialize mock payroll</>
                    : <>Estimated time to resolve: <strong>15-20 minutes</strong> (vs 3-5 hours in current calculate-fail-fix cycle)</>
                  }
                </span>
              </div>
            </div>
            );
          })()}

          {/* ==================== ACTION BUTTONS ==================== */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
            <button
              onClick={runPreFlight}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: '#fff', color: '#23394A', border: '1px solid #E2E8ED',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#F5F7F9'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              <i className="fa-solid fa-rotate-right" style={{ fontSize: 11 }} />
              Re-run Validation
            </button>
            <button
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: '#fff', color: '#23394A', border: '1px solid #E2E8ED',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#F5F7F9'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              <i className="fa-solid fa-file-export" style={{ fontSize: 11 }} />
              Export Report
            </button>
            <button
              disabled={!allPassed}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: allPassed ? '#2A8F60' : '#E2E8ED',
                color: allPassed ? '#fff' : '#98A1A8',
                border: allPassed ? '1px solid #2A8F60' : '1px solid #E2E8ED',
                fontSize: 13, fontWeight: 700,
                cursor: allPassed ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                opacity: allPassed ? 1 : 0.7,
                transition: 'all 0.15s ease',
                boxShadow: allPassed ? '0 2px 8px rgba(42,143,96,0.25)' : 'none',
              }}
              title={allPassed ? 'Mark validation as reviewed' : 'Resolve all critical issues first'}
              onMouseOver={(e) => { if (allPassed) e.currentTarget.style.background = '#237A52'; }}
              onMouseOut={(e) => { if (allPassed) e.currentTarget.style.background = '#2A8F60'; }}
            >
              <i className="fa-solid fa-check-double" style={{ fontSize: 11 }} />
              Mark as Reviewed
            </button>
          </div>
        </>
      )}

      {/* ==================== EMPTY STATE ==================== */}
      {!selectedClient && (
        <div style={{
          background: '#FAFBFC', border: '2px dashed #D0D5DD', borderRadius: 16,
          padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, background: '#F1F3F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-plane-departure" style={{ fontSize: 32, color: '#98A1A8' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#23394A', textAlign: 'center' }}>
            Select a client to run pre-flight validation
          </div>
          <div style={{ fontSize: 13, color: '#6B6F70', textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
            Pre-flight checks validate PrismHR configuration against the CSA Schedule 2
            before payroll initialization, catching WC code errors, SUTA rate gaps, and
            billing mismatches before they cause payroll failures.
          </div>
        </div>
      )}

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
