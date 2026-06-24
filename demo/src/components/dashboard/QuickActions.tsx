'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useCopilotStore } from '@/stores/copilotStore';

export default function QuickActions() {
  const can = useAuthStore((s) => s.can);
  const toggle = useCopilotStore((s) => s.toggle);

  return (
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden', padding: 16,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#111827', marginBottom: 12 }}>Quick Actions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {can('create') && (
          <Link href="/new-business" style={{
            height: 36, borderRadius: 8, background: '#111827', color: '#fff',
            fontSize: 'var(--type-caption)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-xs)',
            transition: 'background 0.12s ease',
          }}>
            + New Business CAP
          </Link>
        )}
        <Link href="/renewal" style={{
          height: 36, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151',
          fontSize: 'var(--type-caption)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          transition: 'background 0.12s ease',
        }}>
          &#8635; Start Renewal
        </Link>
        <button onClick={toggle} style={{
          height: 36, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151',
          fontSize: 'var(--type-caption)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.12s ease',
        }}>
          &#10022; Ask Copilot
        </button>
      </div>
    </div>
  );
}
