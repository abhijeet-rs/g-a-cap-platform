/* ------------------------------------------------------------------ */
/*  Benefits Booklet data — modeled on the real "Benefits Selection    */
/*  Confirmation" PDF (Itafos Conda · Master Plan BCBSTX). Drives the   */
/*  rich in-app booklet replica preview in the Booklet & Sign-off flow. */
/* ------------------------------------------------------------------ */

export interface BookletTierRate {
  /** Coverage tier: EE Only, EE+Spouse, EE+Child(ren), EE+Family */
  tier: string;
  total: string;
  er: string;
  ee: string;
}

export interface BookletPlanOption {
  name: string;
  carrier: string;
  network?: string;
  /** true for the plan the group selected as the base/default */
  selected?: boolean;
  rates: BookletTierRate[];
}

export interface BookletCoverageSection {
  key: 'medical' | 'dental' | 'vision';
  title: string;
  plans: BookletPlanOption[];
}

export interface BookletTaxPlan {
  label: string;
  value: string;
}

export interface BookletSignatureBlock {
  role: string;
  name: string;
  org: string;
  /** signed date, or undefined when still pending */
  signedDate?: string;
}

export const bookletMeta = {
  client: 'Itafos Conda',
  clientId: '2908',
  prismId: 'GA-2908',
  planYear: '2026',
  effectivePeriod: 'July 1, 2026 – June 30, 2027',
  masterPlan: 'BCBSTX',
  enrollmentMethod: 'NextGen',
  billingFrequency: 'Monthly – 1st Pay Period',
  contributionFrequency: 'Per Pay Period',
  acaReporting: 'Over 50 — Applicable Large Employer',
  affordable: 'Yes',
  ownership: 'No',
  eligibility: 'All eligible employees',
  contributionStrategy: 'Variable',
  completedBy: 'Dana Whitfield, Account Manager',
  generatedFrom: 'Approved CAP · F7 Benefits Booklet template v4',
};

/* Tier labels reused across coverage tables */
export const bookletTiers = ['EE Only', 'EE + Spouse', 'EE + Child(ren)', 'EE + Family'];

export const bookletCoverage: BookletCoverageSection[] = [
  {
    key: 'medical',
    title: 'Medical Plan(s) and Monthly Contribution Strategy',
    plans: [
      {
        name: 'PPO $500 80%',
        carrier: 'BCBS Texas',
        network: 'Master Plan',
        selected: true,
        rates: [
          { tier: 'EE Only',        total: '$931.52',   er: '$670.69',   ee: '$260.83' },
          { tier: 'EE + Spouse',    total: '$2,022.31', er: '$1,456.06', ee: '$566.25' },
          { tier: 'EE + Child(ren)',total: '$1,831.84', er: '$1,318.93', ee: '$512.92' },
          { tier: 'EE + Family',    total: '$2,933.04', er: '$2,111.79', ee: '$821.25' },
        ],
      },
      {
        name: 'HDHP $3300 90%',
        carrier: 'BCBS Texas',
        network: 'Master Plan',
        rates: [
          { tier: 'EE Only',        total: '$745.55',   er: '$603.90',   ee: '$141.65' },
          { tier: 'EE + Spouse',    total: '$1,618.58', er: '$1,311.05', ee: '$307.53' },
          { tier: 'EE + Child(ren)',total: '$1,466.18', er: '$1,187.60', ee: '$278.57' },
          { tier: 'EE + Family',    total: '$2,347.50', er: '$1,901.47', ee: '$446.02' },
        ],
      },
    ],
  },
  {
    key: 'dental',
    title: 'Dental Plan(s) and Monthly Contribution Strategy',
    plans: [
      {
        name: 'Dental PPO $1500',
        carrier: 'Guardian',
        network: 'Open Market',
        selected: true,
        rates: [
          { tier: 'EE Only',        total: '$29.00',  er: '$23.20', ee: '$5.80' },
          { tier: 'EE + Spouse',    total: '$66.15',  er: '$52.92', ee: '$13.23' },
          { tier: 'EE + Child(ren)',total: '$84.00',  er: '$67.20', ee: '$16.80' },
          { tier: 'EE + Family',    total: '$115.50', er: '$92.40', ee: '$23.10' },
        ],
      },
    ],
  },
  {
    key: 'vision',
    title: 'Vision Plan(s) and Monthly Contribution Strategy',
    plans: [
      {
        name: 'Base PPO',
        carrier: 'Guardian',
        network: 'Open Market',
        selected: true,
        rates: [
          { tier: 'EE Only',        total: '$6.00',  er: '$4.80',  ee: '$1.20' },
          { tier: 'EE + Spouse',    total: '$12.00', er: '$9.60',  ee: '$2.40' },
          { tier: 'EE + Child(ren)',total: '$14.00', er: '$11.20', ee: '$2.80' },
          { tier: 'EE + Family',    total: '$20.00', er: '$16.00', ee: '$4.00' },
        ],
      },
    ],
  },
];

export const bookletTaxPlans: BookletTaxPlan[] = [
  { label: 'Flexible Spending (FSA)', value: 'Master · Plan Year · Voluntary' },
  { label: 'Health Savings (HSA)', value: 'ER Contributes · Plan Year' },
  { label: 'Employer-Paid Life', value: 'Voluntary · 1× salary' },
  { label: 'Short-Term Disability (STD)', value: 'ID-Indiv · Age Rated' },
  { label: 'Long-Term Disability (LTD)', value: 'ID-Family · Age Rated' },
  { label: 'Transit / Commuter', value: 'Not Offered' },
];

export const bookletDisclosures = {
  intro:
    'The notices and disclosures contained herein relate to G&A Beneficial, LLC as a broker (“Broker”) and ' +
    'G&A Outsourcing, LLC d/b/a G&A Partners and its affiliates (“PEO”) in connection with Brokerage and Plan ' +
    'Administrative Services provided with respect to the Component Benefit Plan(s) selected by your company ' +
    '(“Client”) that are provided through the Master Plan — BCBSTX (“Plan”).',
  renewalCredit:
    'Group agrees to renew its medical contract July 1, 2026 at the rates set out in this renewal and in ' +
    'consideration of receiving a $12,500 one-time credit. If prior to July 1, 2027 this group contract is ' +
    'terminated, the funding arrangement is changed, or the benefits are revised, the group agrees to refund ' +
    'G&A Partners this credit.',
  brokerCompensation:
    'In connection with each of the Component Benefit Plans you have selected, the Broker will receive ' +
    'commissions or service fees. Broker Compensation is not billed to Client and instead is paid by insurance ' +
    'carriers and/or third-party vendors. Premiums payable under the Plan do not adjust during the Plan year as a ' +
    'result of Broker Compensation. (ERISA § 408(b)(2)(B) disclosure.)',
};

export const bookletSignatures: BookletSignatureBlock[] = [
  { role: 'Account Manager', name: 'Dana Whitfield', org: 'G&A Partners' },
  { role: 'Client Authorized Signer', name: 'Robert Hale, CFO', org: 'Itafos Conda' },
  { role: 'Account Executive (Countersign)', name: 'Marcus Reyes', org: 'G&A Partners' },
];

/* Documents bundled into the DocuSign envelope alongside the booklet */
export const bookletEnvelopeContents = [
  { name: 'Benefits Booklet.pdf', color: '#0074B8' },
  { name: 'Benefits Selection Confirmation.pdf', color: '#C60C30' },
  { name: 'ER Confirmation.pdf', color: '#1A7A4A' },
];
