'use client';

import { useSyncStore } from '@/stores/syncStore';

export default function SyncOverlay() {
  const active = useSyncStore((s) => s.active);
  const title = useSyncStore((s) => s.title);
  const steps = useSyncStore((s) => s.steps);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(16,32,45,.5)',
      backdropFilter: 'blur(3px)', zIndex: 180,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in .15s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%',
        margin: '0 16px', padding: 32,
        boxShadow: '0 20px 60px rgba(16,32,45,.3)',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step.status === 'running' && (
                  <div style={{
                    width: 16, height: 16, border: '2px solid rgba(198,12,48,.3)',
                    borderTopColor: '#C60C30', borderRadius: '50%',
                    animation: 'spin .7s linear infinite',
                  }} />
                )}
                {step.status === 'done' && (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#E4F2EA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A7A4A', fontSize: 10,
                  }}>✓</div>
                )}
                {step.status === 'pending' && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C0C8D0', margin: 'auto' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  color: step.status === 'running' ? '#1B2D3D' : '#98A1A8',
                  fontWeight: step.status === 'running' ? 500 : 400,
                }}>{step.label}</div>
                <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#C0C8D0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.api}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
