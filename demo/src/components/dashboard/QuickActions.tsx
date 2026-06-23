'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useCopilotStore } from '@/stores/copilotStore';

export default function QuickActions() {
  const can = useAuthStore((s) => s.can);
  const toggle = useCopilotStore((s) => s.toggle);

  return (
    <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #EEF1F4' }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Quick Actions</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px' }}>
        {can('create') && (
          <Link href="/new-business" style={{
            height: 32, borderRadius: 7, background: '#1a1a1a', color: '#fff',
            fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,.15)',
          }}>
            + New Business CAP
          </Link>
        )}
        <Link href="/renewal" style={{
          height: 32, borderRadius: 7, border: '1px solid #E4E8ED', background: '#fff', color: '#1B2D3D',
          fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
        }}>
          ↻ Start Renewal
        </Link>
        <button onClick={toggle} style={{
          height: 32, borderRadius: 7, border: '1px solid #E4DDF7', background: '#F8F6FE', color: '#5A45C7',
          fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          ✦ Ask Copilot
        </button>
      </div>
    </div>
  );
}
