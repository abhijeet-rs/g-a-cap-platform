'use client';

import { useNewBusinessStore } from '@/stores/newBusinessStore';

interface StepDef {
  num: number;
  label: string;
}

interface Props {
  steps: StepDef[];
  current: number;
}

export default function StepIndicator({ steps, current }: Props) {
  const goStep = useNewBusinessStore((s) => s.goStep);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#fff',
        borderBottom: '1px solid #E4E8ED',
      }}
    >
      {steps.map((step, i) => {
        const isCompleted = step.num < current;
        const isActive = step.num === current;
        const isLast = i === steps.length - 1;

        return (
          <div
            key={step.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: isLast ? '0 0 auto' : '1 1 0%',
            }}
          >
            <button
              onClick={() => goStep(step.num)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                flexShrink: 0,
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--type-badge)',
                  fontWeight: 600,
                  background: isCompleted
                    ? '#1A7A4A'
                    : isActive
                    ? '#C60C30'
                    : '#EDF0F3',
                  color: isCompleted || isActive ? '#fff' : '#374151',
                }}
              >
                {isCompleted ? '✓' : step.num}
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: 'var(--type-body-sm)',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1B2D3D' : '#374151',
                }}
              >
                {step.label}
              </span>
            </button>

            {/* Connecting bar */}
            {!isLast && (
              <div style={{ flex: 1, margin: '0 8px' }}>
                <div
                  style={{
                    height: 2,
                    borderRadius: 9999,
                    background: isCompleted ? '#1A7A4A' : '#EDF0F3',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
