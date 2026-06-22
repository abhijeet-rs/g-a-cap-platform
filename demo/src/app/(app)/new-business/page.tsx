'use client';

import { useState, useEffect } from 'react';
import { useNewBusinessStore } from '@/stores/newBusinessStore';
import StepIndicator from '@/components/new-business/StepIndicator';
import StepIntake from '@/components/new-business/StepIntake';
import StepExtraction from '@/components/new-business/StepExtraction';
import StepAssembly from '@/components/new-business/StepAssembly';
import StepRates from '@/components/new-business/StepRates';
import StepValidation from '@/components/new-business/StepValidation';
import StepPreview from '@/components/new-business/StepPreview';
import WizardFooter from '@/components/new-business/WizardFooter';
import { WizardSkeleton } from '@/components/shared/Skeleton';

const steps = [
  { num: 1, label: 'Intake & Upload' },
  { num: 2, label: 'AI Extraction' },
  { num: 3, label: 'Assembly' },
  { num: 4, label: 'Plan Design & Rates' },
  { num: 5, label: 'Readiness' },
  { num: 6, label: 'Preview & Submit' },
];

export default function NewBusinessPage() {
  const step = useNewBusinessStore((s) => s.step);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <WizardSkeleton />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepIndicator steps={steps} current={step} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '18px 24px 16px' }}>
          {step === 1 && <StepIntake />}
          {step === 2 && <StepExtraction />}
          {step === 3 && <StepAssembly />}
          {step === 4 && <StepRates />}
          {step === 5 && <StepValidation />}
          {step === 6 && <StepPreview />}
        </div>
      </div>
      <WizardFooter />
    </div>
  );
}
