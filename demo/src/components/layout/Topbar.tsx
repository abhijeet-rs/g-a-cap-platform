'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCopilotStore } from '@/stores/copilotStore';
import { roles } from '@/data/roles';
import { Role } from '@/lib/types';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/new-business': 'CAP Builder',
  '/renewal': 'Renewals',
  '/esign': 'E-Signature',
  '/documents': 'Documents',
  '/admin': 'Data Repository',
  '/integrations': 'Integrations',
  '/architecture': 'Architecture',
  '/writeback': 'Ben Admin Console',
};

const crumbs: Record<string, string> = {
  '/dashboard': 'Workspace',
  '/new-business': 'CAP Builder',
  '/renewal': 'Workspace',
  '/esign': 'Workspace',
  '/documents': 'Workspace',
  '/admin': 'Data & Foundation',
  '/integrations': 'Data & Foundation',
  '/architecture': 'Reference',
  '/writeback': 'Workspace',
};

const allRoles: { key: Role; label: string }[] = [
  { key: 'am', label: 'Account Manager' },
  { key: 'ae', label: 'Account Executive' },
  { key: 'coord', label: 'Benefits Coordinator' },
  { key: 'analyst', label: 'Benefits Analyst' },
  { key: 'gab', label: 'GAB Manager' },
  { key: 'admin', label: 'System Admin' },
];

export default function Topbar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);
  const currentRole = useAuthStore((s) => s.role);
  const switchRole = useAuthStore((s) => s.switchRole);
  const toggle = useCopilotStore((s) => s.toggle);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'Page';

  const crumb = Object.entries(crumbs).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'Workspace';

  return (
    <div style={{
      height: 'var(--topbar-height)', flexShrink: 0, background: '#fff',
      borderBottom: '1px solid var(--border-primary)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 12,
    }}>
      {/* LEFT: page context */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 'var(--type-caption)', color: 'var(--text-tertiary)', fontWeight: 500, lineHeight: 1.2, letterSpacing: '0.01em' }}>{crumb}</div>
        <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitle}</div>
      </div>

      {/* CENTER-RIGHT: role switcher */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8,
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Viewing as
          </span>
          <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {roles[currentRole]?.label ?? 'User'}
          </span>
          <span style={{ fontSize: 'var(--type-badge)', color: 'var(--text-tertiary)' }}>&#9662;</span>
        </button>
        {roleDropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4,
            background: '#fff', border: '1px solid var(--border-primary)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100, minWidth: 200, overflow: 'hidden',
            animation: 'fade-in .1s ease',
          }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--type-badge)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch Role
            </div>
            {allRoles.map((r) => (
              <div
                key={r.key}
                onClick={() => { switchRole(r.key); setRoleDropdownOpen(false); }}
                style={{
                  padding: '8px 12px',
                  fontSize: 'var(--type-body-sm)',
                  fontWeight: currentRole === r.key ? 600 : 400,
                  color: currentRole === r.key ? '#C60C30' : 'var(--text-primary)',
                  background: currentRole === r.key ? '#FFF5F7' : '#fff',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-secondary)',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => { if (currentRole !== r.key) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (currentRole !== r.key) e.currentTarget.style.background = '#fff'; }}
              >
                {r.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: actions */}
      {can('create') && (
        <Link href="/new-business" style={{
          height: 34, padding: '0 14px', border: 'none', borderRadius: 8,
          background: 'var(--text-primary)', color: '#fff',
          fontSize: 'var(--type-body-sm)', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          boxShadow: '0 1px 3px rgba(0,0,0,.12)', textDecoration: 'none',
          transition: 'background 0.12s ease',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 'var(--type-body-sm)' }}>+</span> New Business CAP
        </Link>
      )}

      <Link href="/renewal" style={{
        height: 34, padding: '0 14px',
        border: '1px solid var(--border-primary)', borderRadius: 8,
        background: '#fff', color: 'var(--text-primary)',
        fontSize: 'var(--type-body-sm)', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        textDecoration: 'none', whiteSpace: 'nowrap',
        transition: 'border-color 0.12s ease',
      }}>
        ↻ Renewal CAP
      </Link>

      <button onClick={toggle} style={{
        height: 34, padding: '0 12px',
        border: '1px solid var(--color-cap-purple-border)', borderRadius: 8,
        background: 'var(--color-cap-purple-light)', color: 'var(--color-cap-purple)',
        fontSize: 'var(--type-body-sm)', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap',
        transition: 'background 0.12s ease',
      }}>
        ✦ Copilot
      </button>
    </div>
  );
}
