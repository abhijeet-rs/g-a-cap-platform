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
  '/new-business': 'New Client Approved Plan',
  '/renewal': 'Renewals',
  '/esign': 'E-Signature',
  '/documents': 'Documents',
  '/admin': 'Admin Console',
  '/integrations': 'Integrations',
  '/architecture': 'Architecture',
};

const crumbs: Record<string, string> = {
  '/dashboard': 'Workspace',
  '/new-business': 'CAP Builder',
  '/renewal': 'Workspace',
  '/esign': 'Workspace',
  '/documents': 'Workspace',
  '/admin': 'Administration',
  '/integrations': 'Administration',
  '/architecture': 'Reference',
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
      height: 54, flexShrink: 0, background: '#fff',
      borderBottom: '1px solid #E4E8ED',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#98A1A8', fontWeight: 500 }}>{crumb}</div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{pageTitle}</div>
      </div>

      {/* Viewing As role indicator */}
      <div ref={dropdownRef} style={{ position: 'relative', marginRight: 8 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid #E4E8ED',
            background: '#FBFCFD',
          }}
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
        >
          <span style={{ fontSize: 10, color: '#98A1A8', fontWeight: 500, lineHeight: '14px' }}>
            VIEWING AS
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1B2D3D', lineHeight: '16px' }}>
            {roles[currentRole]?.label ?? 'User'} &#9662;
          </span>
        </div>
        {roleDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid #E4E8ED',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 100,
              minWidth: 180,
              overflow: 'hidden',
            }}
          >
            {allRoles.map((r) => (
              <div
                key={r.key}
                onClick={() => {
                  switchRole(r.key);
                  setRoleDropdownOpen(false);
                }}
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: currentRole === r.key ? 600 : 400,
                  color: currentRole === r.key ? '#C60C30' : '#1B2D3D',
                  background: currentRole === r.key ? '#FFF5F7' : '#fff',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F3F5',
                }}
              >
                {r.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {can('create') && (
        <Link href="/new-business" style={{
          height: 34, padding: '0 14px', border: 'none', borderRadius: 8,
          background: '#C60C30', color: '#fff', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          boxShadow: '0 3px 10px rgba(198,12,48,.2)', textDecoration: 'none',
        }}>
          <span style={{ fontSize: 14 }}>+</span> New Business CAP
        </Link>
      )}

      <Link href="/renewal" style={{
        height: 34, padding: '0 14px', border: '1px solid #E4E8ED', borderRadius: 8,
        background: '#fff', color: '#1B2D3D', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        textDecoration: 'none',
      }}>
        ↻ Renewal CAP
      </Link>

      <button onClick={toggle} style={{
        height: 34, padding: '0 12px', border: '1px solid #ECE9FA', borderRadius: 8,
        background: '#F8F6FE', color: '#5A45C7', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        ✦ Copilot
      </button>
    </div>
  );
}
