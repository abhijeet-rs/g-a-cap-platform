import { create } from 'zustand';
import {
  type MismatchResolution,
  type LiveExtractedField,
  type LiveValidationMismatch,
  type ApprovalAction,
} from '@/data/onboarding';

/* ─── Constants ─── */

const API_BASE = 'http://localhost:8000';

/* ─── Types ─── */

export type UploadPhase = 'idle' | 'uploading' | 'processing' | 'done';

export type ExtractionStep =
  | 'received'
  | 'parsing'
  | 'structure'
  | 'entity'
  | 'cross_validation'
  | 'ready';

interface OnboardingState {
  /* Upload */
  uploadPhase: UploadPhase;
  fileName: string | null;
  startUpload: (file: File) => void;
  resetUpload: () => void;

  /* Extraction progress */
  currentStep: ExtractionStep;
  entityProgress: number; // 0-100
  setStep: (step: ExtractionStep) => void;
  setEntityProgress: (p: number) => void;

  /* Live extraction data */
  extractedFieldsLive: LiveExtractedField[];
  extractionError: string | null;
  documentId: string | null;
  rawMarkdown: string | null;
  isLiveExtraction: boolean;

  /* Validation */
  resolutions: Record<string, MismatchResolution>;
  resolve: (id: string, resolution: MismatchResolution) => void;
  approveAll: () => void;
  resetResolutions: () => void;

  /* Live validation */
  liveMismatches: LiveValidationMismatch[];
  runValidation: () => Promise<void>;
  isValidating: boolean;

  /* Drawer state */
  drawerOpen: boolean;
  drawerCsaId: string | null;
  drawerTab: 'validation' | 'audit';
  openDrawer: (csaId: string) => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: 'validation' | 'audit') => void;

  /* Field editing */
  fieldEdits: Record<string, string>;
  fieldNotes: Record<string, string>;
  selectedFieldId: string | null;
  editField: (fieldId: string, value: string) => void;
  addFieldNote: (fieldId: string, note: string) => void;
  selectField: (fieldId: string | null) => void;

  /* Approval workflow */
  approvalStatus: 'draft' | 'approved' | 'changes_requested' | 'rejected' | null;
  performApprovalAction: (action: ApprovalAction) => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  /* Upload */
  uploadPhase: 'idle',
  fileName: null,
  startUpload: (file: File) => {
    set({
      uploadPhase: 'uploading',
      fileName: file.name,
      extractedFieldsLive: [],
      extractionError: null,
      documentId: null,
      rawMarkdown: null,
      isLiveExtraction: false,
      liveMismatches: [],
    });

    // Two-step flow: upload first (creates DB row immediately), then parse in background
    (async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        // Step 1: Upload — this inserts a "processing" row in the DB instantly
        const uploadRes = await fetch(`${API_BASE}/api/csa/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status}`);
        }

        const uploadData: { document_id: string } = await uploadRes.json();
        const docId = uploadData.document_id;

        set({
          uploadPhase: 'processing',
          documentId: docId,
        });

        // Step 2: Parse in background — dashboard polling will show the spinner
        // then transition to eye icon when this completes
        fetch(`${API_BASE}/api/csa/${docId}/parse`, { method: 'POST' })
          .then(async (parseRes) => {
            if (parseRes.ok) {
              const fieldsRes = await fetch(`${API_BASE}/api/csa/${docId}/fields`);
              if (fieldsRes.ok) {
                const fieldsData = await fieldsRes.json();
                set({
                  uploadPhase: 'done',
                  currentStep: 'ready',
                  entityProgress: 100,
                  isLiveExtraction: true,
                  extractedFieldsLive: fieldsData.extracted_fields || [],
                  rawMarkdown: null,
                  extractionError: null,
                });
                return;
              }
            }
            set({ uploadPhase: 'done', currentStep: 'ready', entityProgress: 100 });
          })
          .catch(() => {
            set({ uploadPhase: 'done', currentStep: 'ready', entityProgress: 100 });
          });

      } catch (err) {
        console.warn('Backend API unreachable, falling back to mock data:', err);
        set({
          extractionError: err instanceof Error ? err.message : 'API error',
          isLiveExtraction: false,
        });
        setTimeout(() => {
          set({ uploadPhase: 'done', currentStep: 'entity', entityProgress: 72 });
        }, 1000);
      }
    })();
  },
  resetUpload: () =>
    set({
      uploadPhase: 'idle',
      fileName: null,
      currentStep: 'received',
      entityProgress: 0,
      extractedFieldsLive: [],
      extractionError: null,
      documentId: null,
      rawMarkdown: null,
      isLiveExtraction: false,
      liveMismatches: [],
    }),

  /* Extraction progress */
  currentStep: 'entity',
  entityProgress: 72,
  setStep: (step) => set({ currentStep: step }),
  setEntityProgress: (p) => set({ entityProgress: p }),

  /* Live extraction data */
  extractedFieldsLive: [],
  extractionError: null,
  documentId: null,
  rawMarkdown: null,
  isLiveExtraction: false,

  /* Validation */
  resolutions: {},
  resolve: (id, resolution) =>
    set((s) => ({
      resolutions: { ...s.resolutions, [id]: resolution },
    })),
  approveAll: () => {
    // Mark all remaining unresolved as accept_csa
    // This is a simplified demo action
    set({ resolutions: {} }); // reset so the UI shows "approved" state
  },
  resetResolutions: () => set({ resolutions: {} }),

  /* Live validation */
  liveMismatches: [],
  isValidating: false,
  runValidation: async () => {
    const { documentId } = get();
    if (!documentId) return;

    set({ isValidating: true });

    try {
      // Trigger validation
      await fetch(`${API_BASE}/api/csa/${documentId}/validate`, {
        method: 'POST',
      });

      // Fetch mismatches
      const mismatchRes = await fetch(`${API_BASE}/api/csa/${documentId}/mismatches`);
      if (!mismatchRes.ok) {
        throw new Error(`Mismatch fetch failed: ${mismatchRes.status}`);
      }

      const data = await mismatchRes.json();
      set({
        liveMismatches: data.mismatches || [],
        isValidating: false,
      });
    } catch (err) {
      console.warn('Validation API call failed:', err);
      set({ isValidating: false });
    }
  },

  /* Drawer state */
  drawerOpen: false,
  drawerCsaId: null,
  drawerTab: 'validation',
  openDrawer: (csaId: string) =>
    set({ drawerOpen: true, drawerCsaId: csaId, drawerTab: 'validation' }),
  closeDrawer: () =>
    set({ drawerOpen: false, drawerCsaId: null, selectedFieldId: null, approvalStatus: null }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),

  /* Field editing */
  fieldEdits: {},
  fieldNotes: {},
  selectedFieldId: null,
  editField: (fieldId, value) =>
    set((s) => ({ fieldEdits: { ...s.fieldEdits, [fieldId]: value } })),
  addFieldNote: (fieldId, note) =>
    set((s) => ({ fieldNotes: { ...s.fieldNotes, [fieldId]: note } })),
  selectField: (fieldId) => set({ selectedFieldId: fieldId }),

  /* Approval workflow */
  approvalStatus: null,
  performApprovalAction: (action: ApprovalAction) => {
    switch (action) {
      case 'save_draft':
        set({ approvalStatus: 'draft' });
        break;
      case 'approve':
        set({ approvalStatus: 'approved' });
        break;
      case 'request_changes':
        set({ approvalStatus: 'changes_requested' });
        break;
      case 'reject':
        set({ approvalStatus: 'rejected' });
        break;
      case 'rerun':
        set({ approvalStatus: null, fieldEdits: {}, fieldNotes: {}, selectedFieldId: null });
        break;
      case 'escalate':
        set({ approvalStatus: 'changes_requested' });
        break;
    }
  },
}));
