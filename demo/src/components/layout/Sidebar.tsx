'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUserInfo } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';

export default function Sidebar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);
  const currentRole = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const { userName, userRole, userShort, userColor } = useUserInfo();
  const caps = useDataStore((s) => s.caps);

  const renewalCount = caps.filter(c => c.type === 'renewal' && (c.status === 'draft' || c.status === 'in_review')).length;
  const approvedCount = caps.filter(c => c.status === 'approved').length;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    cap: true, prospecting: false, proposal: false,
  });

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const isActive = (href: string) => {
    const p = href.split('?')[0];
    return pathname === p || pathname.startsWith(p + '/');
  };

  const shouldShow = (roles?: string[], perm?: string) => {
    if (perm && !can(perm as any)) return false;
    if (roles && !roles.includes(currentRole)) return false;
    return true;
  };

  // ── Styles (white/black theme) ──
  const link = (href: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px', borderRadius: 6, marginBottom: 1,
    background: isActive(href) ? '#F0F2F5' : 'transparent',
    color: isActive(href) ? '#1a1a1a' : '#6B7280',
    fontSize: 13, fontWeight: isActive(href) ? 600 : 400,
    textDecoration: 'none',
  });

  const subLink = (href: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px 6px 38px', borderRadius: 6, marginBottom: 1,
    background: isActive(href) ? '#F0F2F5' : 'transparent',
    color: isActive(href) ? '#1a1a1a' : '#9CA3AF',
    fontSize: 12, fontWeight: isActive(href) ? 600 : 400,
    textDecoration: 'none',
  });

  const sectionBtn = (exp: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '7px 12px', borderRadius: 6, marginBottom: 1,
    background: exp ? '#F0F2F5' : 'transparent',
    color: exp ? '#1a1a1a' : '#6B7280',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: 'none', textAlign: 'left',
  });

  return (
    <div style={{
      width: 240, flexShrink: 0, background: '#fff',
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid #E5E7EB',
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F3F4F6' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 10, color: '#fff', letterSpacing: -0.3,
        }}>G&A</div>
        <div>
          <div style={{ color: '#1a1a1a', fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>G&A Compass</div>
          <div style={{ color: '#9CA3AF', fontSize: 9, letterSpacing: 0.3 }}>Benefits Sales Platform</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <div style={{ padding: '8px 8px', flex: 1, overflowY: 'auto' }}>

        {/* Agents */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: '#9CA3AF', textTransform: 'uppercase', padding: '12px 12px 6px' }}>Agents</div>

        <button onClick={() => toggle('prospecting')} style={sectionBtn(expanded.prospecting)}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <div style={{ flex: 1 }}>
            <div>Prospecting Agent</div>
            <div style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF', marginTop: 1 }}>Lead qualification</div>
          </div>
          <span style={{ fontSize: 8, color: '#D1D5DB', transform: expanded.prospecting ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▶</span>
        </button>
        {expanded.prospecting && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Prospects</div>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Research</div>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Outreach</div>
            <div style={{ padding: '3px 38px', fontSize: 10, color: '#D1D5DB', fontStyle: 'italic' }}>Coming in Phase 2</div>
          </div>
        )}

        <button onClick={() => toggle('proposal')} style={sectionBtn(expanded.proposal)}>
          <span style={{ fontSize: 14 }}>📋</span>
          <div style={{ flex: 1 }}>
            <div>Proposal Agent</div>
            <div style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF', marginTop: 1 }}>Proposal workflow</div>
          </div>
          <span style={{ fontSize: 8, color: '#D1D5DB', transform: expanded.proposal ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▶</span>
        </button>
        {expanded.proposal && (
          <div style={{ marginBottom: 4 }}>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Artifacts</div>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Assembly</div>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Proposal Draft</div>
            <div style={{ ...subLink('#'), cursor: 'default' }}>Review & Send</div>
            <div style={{ padding: '3px 38px', fontSize: 10, color: '#D1D5DB', fontStyle: 'italic' }}>Coming in Phase 2</div>
          </div>
        )}

        {/* CAP Tool */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: '#9CA3AF', textTransform: 'uppercase', padding: '14px 12px 6px' }}>CAP Tool</div>

        <button onClick={() => toggle('cap')} style={sectionBtn(expanded.cap)}>
          <span style={{ fontSize: 14 }}>📊</span>
          <div style={{ flex: 1 }}>
            <div>Client Approved Plans</div>
            <div style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF', marginTop: 1 }}>CAP build & renewals</div>
          </div>
          <span style={{ fontSize: 8, color: '#D1D5DB', transform: expanded.cap ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▶</span>
        </button>
        {expanded.cap && (
          <div style={{ marginBottom: 4 }}>
            <Link href="/dashboard" style={subLink('/dashboard')}>Dashboard</Link>
            {shouldShow(undefined, 'create') && <Link href="/new-business" style={subLink('/new-business')}>New Business</Link>}
            <Link href="/renewal" style={subLink('/renewal')}>
              <span style={{ flex: 1 }}>Renewals</span>
              {renewalCount > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: '#EF4444', background: '#FEF2F2', padding: '1px 6px', borderRadius: 10 }}>{renewalCount}</span>}
            </Link>
            {shouldShow(undefined, 'esign') && <Link href="/esign" style={subLink('/esign')}>E-Signature</Link>}
            <Link href="/documents" style={subLink('/documents')}>Documents</Link>
            {shouldShow(['analyst', 'gab', 'admin']) && (
              <Link href="/writeback" style={subLink('/writeback')}>
                <span style={{ flex: 1 }}>Ben Admin</span>
                {approvedCount > 0 && <span style={{ fontSize: 9, fontWeight: 600, color: '#7C3AED', background: '#F5F3FF', padding: '1px 6px', borderRadius: 10 }}>{approvedCount}</span>}
              </Link>
            )}
          </div>
        )}

        {/* Administration */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: '#9CA3AF', textTransform: 'uppercase', padding: '14px 12px 6px' }}>Administration</div>
        <Link href="/admin" style={link('/admin')}><span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>⚙</span>Admin Console</Link>
        <Link href="/integrations" style={link('/integrations')}><span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>⇋</span>Integrations</Link>
        <Link href="/architecture" style={link('/architecture')}><span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>◇</span>Architecture</Link>
      </div>

      {/* ── User ── */}
      <div style={{ padding: 8, borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, backgroundColor: userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>{userShort}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#1a1a1a', fontSize: 12, fontWeight: 600 }}>{userName}</div>
            <div style={{ color: '#9CA3AF', fontSize: 10 }}>{userRole}</div>
          </div>
          <button onClick={logout} title="Sign out" style={{
            border: '1px solid #E5E7EB', background: '#fff', color: '#1a1a1a',
            cursor: 'pointer', fontSize: 12, padding: '4px 6px', borderRadius: 5,
          }}>⏻</button>
        </div>
      </div>
    </div>
  );
}
