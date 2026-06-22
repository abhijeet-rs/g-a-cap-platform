import { SyncStep } from '@/lib/types';

export const syncSequences: Record<string, { title: string; steps: SyncStep[] }> = {
  nbSubmit: {
    title: 'Submitting CAP for Review',
    steps: [
      { label: 'Running validation engine (F8)', api: 'POST /api/validate', ms: 600 },
      { label: 'Creating case in ClientSpace', api: 'POST /api/clientspace/cases', ms: 800 },
      { label: 'Attaching structured CAP payload', api: 'PUT /api/clientspace/cases/{id}/payload', ms: 500 },
      { label: 'Notifying coordinator queue', api: 'POST /api/notifications', ms: 400 },
      { label: 'Status → Internal Review', api: 'PATCH /api/caps/{id}/status', ms: 300 },
    ],
  },
  renewalApprove: {
    title: 'Approving Renewal CAP',
    steps: [
      { label: 'Validating renewal diff resolutions', api: 'POST /api/validate/renewal', ms: 500 },
      { label: 'Snapshotting pinned versions', api: 'POST /api/caps/{id}/snapshot', ms: 700 },
      { label: 'Mirroring to ClientSpace', api: 'PUT /api/clientspace/cases/{id}', ms: 600 },
      { label: 'Status → Approved', api: 'PATCH /api/caps/{id}/status', ms: 400 },
    ],
  },
  sendEnvelope: {
    title: 'Routing for Signature',
    steps: [
      { label: 'Generating booklet PDF (F7)', api: 'POST /api/documents/generate', ms: 800 },
      { label: 'Creating DocuSign envelope', api: 'POST /api/docusign/envelopes', ms: 700 },
      { label: 'Attaching CAP Summary + Booklet + ER Confirmation', api: 'PUT /api/docusign/envelopes/{id}/docs', ms: 500 },
      { label: 'Configuring signer routing', api: 'PUT /api/docusign/envelopes/{id}/routing', ms: 400 },
      { label: 'Sending envelope', api: 'POST /api/docusign/envelopes/{id}/send', ms: 600 },
    ],
  },
  publishDownstream: {
    title: 'Publishing to Downstream Systems',
    steps: [
      { label: 'Generating Prism handoff payload (NB9)', api: 'POST /api/prism/handoff', ms: 700 },
      { label: 'Writing to PrismHR client config', api: 'PUT /api/prism/clients/{id}/benefits', ms: 900 },
      { label: 'Syncing to WorkSight enrollment portal', api: 'POST /api/worksight/sync', ms: 600 },
      { label: 'Updating ClientSpace case', api: 'PUT /api/clientspace/cases/{id}', ms: 500 },
      { label: 'Triggering deduction audit job', api: 'POST /api/payroll/audit', ms: 400 },
      { label: 'Status → Published', api: 'PATCH /api/caps/{id}/status', ms: 300 },
    ],
  },
  rebaseData: {
    title: 'Re-baselining onto Current Data',
    steps: [
      { label: 'Fetching 2026 carrier rate tables (F3)', api: 'GET /api/prism/rates/2026', ms: 600 },
      { label: 'Fetching current Pricing Stack (F4)', api: 'GET /api/foundation/pricing-stack', ms: 500 },
      { label: 'Recalculating billed rates', api: 'POST /api/caps/{id}/recalc', ms: 700 },
      { label: 'Generating diff preview', api: 'POST /api/caps/{id}/diff', ms: 300 },
    ],
  },
  generateBooklet: {
    title: 'Generating Benefits Booklet',
    steps: [
      { label: 'Loading template (F7)', api: 'GET /api/templates/booklet', ms: 400 },
      { label: 'Binding CAP data to merge fields', api: 'POST /api/documents/bind', ms: 600 },
      { label: 'Rendering PDF (EN + ES)', api: 'POST /api/documents/render', ms: 900 },
      { label: 'Versioning booklet artifact', api: 'POST /api/documents/version', ms: 500 },
    ],
  },
};
