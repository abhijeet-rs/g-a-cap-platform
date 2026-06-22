'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUserInfo } from '@/stores/authStore';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  perm?: 'create' | 'edit' | 'approve' | 'publish' | 'esign' | 'admin';
  badge?: string;
}

const workspaceItems: NavItem[] = [
  { label: 'Dashboard', icon: '▦', href: '/dashboard' },
  { label: 'New Business', icon: '＋', href: '/new-business', perm: 'create' },
  { label: 'Renewals', icon: '↻', href: '/renewal', badge: '3' },
  { label: 'E-Signature', icon: '✎', href: '/esign', perm: 'esign' },
  { label: 'Documents', icon: '◧', href: '/documents' },
];

const adminItems: NavItem[] = [
  { label: 'Admin Console', icon: '⚙', href: '/admin' },
  { label: 'Integrations', icon: '⇋', href: '/integrations' },
  { label: 'Architecture', icon: '◇', href: '/architecture' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);
  const logout = useAuthStore((s) => s.logout);
  const { userName, userRole, userShort, userColor } = useUserInfo();

  const renderNavItem = (item: NavItem) => {
    if (item.perm && !can(item.perm)) return null;
    const isActive = (() => {
      const itemPath = item.href.split('?')[0];
      return pathname === itemPath || pathname.startsWith(itemPath + '/');
    })();

    return (
      <Link key={item.href} href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px', borderRadius: 7,
        background: isActive ? 'rgba(255,255,255,.1)' : 'transparent',
        color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
        fontSize: 12, fontWeight: isActive ? 600 : 400,
        textDecoration: 'none', marginBottom: 1,
      }}>
        <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge && (
          <span style={{ fontSize: 9, fontWeight: 600, color: '#C60C30', background: 'rgba(198,12,48,.15)', padding: '1px 5px', borderRadius: 4 }}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div style={{
      width: 232, flexShrink: 0, background: '#13212C',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#C60C30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>CT</div>
        <div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>CAP Platform</div>
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 9 }}>G&A Partners</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', padding: '10px 10px 4px' }}>Workspace</div>
        {workspaceItems.map(renderNavItem)}

        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', padding: '18px 10px 4px' }}>Administration</div>
        {adminItems.map(renderNavItem)}
      </div>

      {/* User Card */}
      <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.05)' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            backgroundColor: userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>
            {userShort}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{userName}</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 9 }}>{userRole}</div>
          </div>
          <button onClick={logout} title="Sign out" style={{
            border: 'none', background: 'none', color: 'rgba(255,255,255,.35)',
            cursor: 'pointer', fontSize: 13, padding: 4,
          }}>
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
}
