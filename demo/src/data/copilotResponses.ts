import { ProposedChange } from '@/lib/types';

interface CopilotResponse {
  body: string;
  citation: string;
  proposedChange?: ProposedChange;
}

// Read-only / synced fields that cannot be modified via copilot
const SYNCED_FIELDS = ['carrier rate', 'base rate', 'dental rate', 'vision rate', 'medical rate', 'prism rate'];

function isSyncedFieldQuery(q: string): boolean {
  return SYNCED_FIELDS.some((f) => q.includes(f));
}

export function getCopilotResponse(query: string): CopilotResponse {
  const q = query.toLowerCase();

  // CP7 guardrail: refuse to modify synced / read-only fields
  if ((q.includes('edit') || q.includes('change') || q.includes('update') || q.includes('set') || q.includes('modify')) && isSyncedFieldQuery(q)) {
    const matched = SYNCED_FIELDS.find((f) => q.includes(f)) ?? 'this field';
    return {
      body: `I can't modify **${matched}** — it's synced from PrismHR and read-only in this platform.\n\nTo update carrier rates, work directly in PrismHR or contact the Pricing team to issue a new rate table (F3).`,
      citation: 'CP7 · Guardrail · Synced field protection',
    };
  }

  // Blocking / handoff
  if (q.includes('blocking') || q.includes('handoff')) {
    return {
      body: '2 items block Ben Admin handoff:\n\n1. **Dental rate $29.00** does not match Prism $27.50 — confirm or correct.\n2. **Open-market SBCs incomplete** for Vol Life.\n\nResolve these to clear the handoff gate.',
      citation: 'F8 · Validation Rules · 2 error-severity gates',
    };
  }

  // Rate formula
  if (q.includes('rate') || q.includes('931') || q.includes('formula')) {
    return {
      body: '**PPO $500 EO rated premium:**\n\nBase $877.94 × Bucket 0.975 × AF 1.013 × (1+Comm 0.03) × RF 1.043 = **$931.52**\n\nThe base rate comes from the BCBSTX 2026 rate table (F3). The multiplier (1.061) comes from UW params applied via the Pricing Stack (F4).',
      citation: 'F3 · BCBSTX 2026 · F4 · Pricing Stack v3',
    };
  }

  // Contribution / strategy — with proposed write action
  if (q.includes('contribution') || q.includes('strategy')) {
    return {
      body: 'Current strategy: **Variable — 72% ER** for medical.\n\nER pays $670.69/mo for EO (PPO $500). Changing to **Flat Dollar $500** would shift $170.69/mo to the employee.\n\nWant me to model that?',
      citation: 'NB4 · Contribution Strategy',
      proposedChange: {
        field: 'Contribution Strategy',
        before: 'Variable — 72% ER',
        after: 'Flat Dollar — $500',
        description: 'Shift $170.69/mo to employee',
      },
    };
  }

  // Set / change / update keywords — generic write action proposal
  if (q.includes('set') || q.includes('change') || q.includes('update') || q.includes('modify')) {
    // Try to detect what field they want to change
    if (q.includes('flat') || q.includes('dollar') || q.includes('500')) {
      return {
        body: 'I can switch the contribution strategy to **Flat Dollar — $500**.\n\nThis would change the ER contribution from a variable percentage to a fixed dollar amount, shifting approximately $170.69/mo per EO to the employee.',
        citation: 'NB4 · Contribution Strategy',
        proposedChange: {
          field: 'Contribution Strategy',
          before: 'Variable — 72% ER',
          after: 'Flat Dollar — $500',
          description: 'Shift $170.69/mo to employee',
        },
      };
    }
    if (q.includes('ee count') || q.includes('employee count') || q.includes('employees')) {
      return {
        body: 'I can update the employee count. Current value is **298**.\n\nNote: changing the EE count will trigger a recalculation of all contribution amounts and ACA affordability checks.',
        citation: 'NB1 · Company Info',
        proposedChange: {
          field: 'EE Count',
          before: '298',
          after: '300',
          description: 'Update employee headcount — triggers recalc',
        },
      };
    }
    return {
      body: 'I can help you update fields. Please specify which field you\'d like to change — for example:\n\n• **Contribution strategy** — Variable, Flat Dollar, Base Plan, Rolldown\n• **EE count** — employee headcount\n• **Plan year** — effective period\n\nNote: carrier rates and Prism-synced fields are read-only.',
      citation: 'CP4 · Write actions',
    };
  }

  // Missing / incomplete / gap — list missing fields from assembly data
  if (q.includes('missing') || q.includes('incomplete') || q.includes('gap') || q.includes("what's missing")) {
    return {
      body: 'The following fields are **missing or incomplete**:\n\n**Company Info (8/12)**\n• Client Contact — empty\n\n**Underwriting (1/5)**\n• Bucket — needs input\n• Admin Factor — needs input\n• Risk Factor — needs input\n• Multiplier — needs input\n\n**Products (3/4)**\n• Life / Vol — empty\n\nTotal: **6 fields** need attention before the CAP is complete.',
      citation: 'NB3 · Assembly View · 6 gaps',
    };
  }

  // Generate / booklet
  if (q.includes('generate') || q.includes('booklet')) {
    return {
      body: "I'll generate the booklet now. This will:\n\n1. Load the booklet template (F7)\n2. Bind current CAP data to merge fields\n3. Render PDF in EN + ES\n4. Version the artifact\n\nEstimated time: ~3 seconds.",
      citation: 'F7 · Booklet Generation',
    };
  }

  // Summarize / summary — summarize the current CAP state
  if (q.includes('summarize') || q.includes('summary')) {
    return {
      body: '**CAP Summary — Itafos Conda**\n\n• **Plan Year:** 2026\n• **Carrier:** BCBS Texas\n• **EEs:** 298\n• **Contribution:** Variable — 72% ER\n• **Medical:** BCBSTX PPO $500 (EO billed: $931.52)\n• **Dental:** Guardian PPO $1500 (EO: $29.00)\n• **Vision:** Guardian Base PPO (EO: $18.20)\n\n**Readiness:** 2 errors, 1 warning\n• Dental rate mismatch ($29.00 vs $27.50)\n• UW params incomplete (Bucket, Admin Factor)\n• Vol Life SBC not uploaded (warning)',
      citation: 'NB6 · Preview & Submit',
    };
  }

  // Help / what can — list all capabilities
  if (q.includes('help') || q.includes('what can')) {
    return {
      body: 'Here\'s what I can do:\n\n**Read Actions (CP2)**\n• **Rate lookups** — carrier base rates, billed rates, tier breakdowns\n• **Validation blockers** — what\'s preventing Ben Admin handoff\n• **Missing fields** — gaps in assembly data\n• **Summarize** — current CAP state overview\n\n**Write Actions (CP4)**\n• **Contribution modeling** — switch between Variable, Flat Dollar, Base Plan, Rolldown\n• **Field updates** — modify editable CAP fields with before/after preview\n\n**Generate Actions**\n• **Booklet generation** — preview and issue for signature\n\n**Guardrails (CP7)**\n• I cannot modify Prism-synced fields (carrier rates, base rates)\n• All changes are logged to the audit trail\n• Applied changes show an "AI-assisted" badge\n\nTry: "What\'s missing?", "Model Flat $500", or "Summarize this CAP"',
      citation: 'CP1-CP7 · Full capability list',
    };
  }

  // Default fallback
  return {
    body: 'Based on the current CAP data, I can help with:\n\n• **Rate lookups** — carrier base rates, billed rates, tier breakdowns\n• **Validation blockers** — what\'s preventing Ben Admin handoff\n• **Contribution modeling** — Variable, Flat Dollar, Base Plan, Rolldown\n• **Missing fields** — gaps in assembly data\n• **Booklet generation** — preview and issue for signature\n• **Summarize** — current CAP state\n• **Workflow routing** — advance status, trigger approvals\n\nTry asking about specific rates, what\'s blocking handoff, or contribution strategies.',
    citation: 'CP2 · Context-aware',
  };
}
