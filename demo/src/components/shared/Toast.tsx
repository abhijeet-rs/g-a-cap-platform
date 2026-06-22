'use client';

import { useUIStore } from '@/stores/uiStore';

const kindColors: Record<string, { bg: string; icon: string }> = {
  success: { bg: '#1A7A4A', icon: '✓' },
  error: { bg: '#C60C30', icon: '✕' },
  info: { bg: '#13212C', icon: 'ℹ' },
};

export default function Toast() {
  const toast = useUIStore((s) => s.toast);
  const toastKind = useUIStore((s) => s.toastKind);
  const toastVisible = useUIStore((s) => s.toastVisible);

  if (!toastVisible) return null;

  const kind = kindColors[toastKind] ?? kindColors.info;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, animation: 'toast-in .2s ease',
    }}>
      <div style={{
        height: 42, padding: '0 20px', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        background: kind.bg, color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,.2)',
        fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 14 }}>{kind.icon}</span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
