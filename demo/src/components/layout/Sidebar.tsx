'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUserInfo } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { clients } from '@/data/clients';

export default function Sidebar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);
  const currentRole = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const { userName, userRole, userShort, userColor } = useUserInfo();
  const caps = useDataStore((s) => s.caps);

  const renewalCount = clients.filter(c => c.urgDays <= 95).length;
  const esignCount = 4;
  const docCount = 3;
  const approvedCount = caps.filter(c => c.status === 'approved').length;

  const isOnboarding = pathname.startsWith('/onboarding');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    cap: !isOnboarding, prospecting: false, proposal: false, csa: isOnboarding, preflight: pathname.startsWith('/onboarding/preflight'),
  });
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    if (isOnboarding) {
      setExpanded(p => ({ ...p, csa: true, cap: false }));
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/new-business') || pathname.startsWith('/renewal') || pathname.startsWith('/esign') || pathname.startsWith('/documents') || pathname.startsWith('/writeback')) {
      setExpanded(p => ({ ...p, cap: true, csa: false }));
    }
  }, [pathname, isOnboarding]);

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

  const link = (href: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', borderRadius: 8, marginBottom: 1,
    background: isActive(href) ? 'var(--bg-hover)' : (hoveredLink === href ? 'var(--bg-secondary)' : 'transparent'),
    color: isActive(href) ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--type-nav)', fontWeight: isActive(href) ? 600 : 500,
    textDecoration: 'none',
    transition: 'all 0.1s ease',
  });

  const subLink = (href: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px 6px 38px', borderRadius: 8, marginBottom: 1,
    background: isActive(href) ? 'var(--bg-hover)' : (hoveredLink === href ? 'var(--bg-secondary)' : 'transparent'),
    color: isActive(href) ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--type-nav-sub)', fontWeight: isActive(href) ? 600 : 400,
    textDecoration: 'none',
    transition: 'all 0.1s ease',
  });

  const sectionBtn = (exp: boolean, active?: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '8px 12px', borderRadius: 8, marginBottom: 1,
    background: (exp || active) ? 'var(--bg-hover)' : 'transparent',
    color: (exp || active) ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--type-nav)', fontWeight: 600, cursor: 'pointer',
    border: 'none', textAlign: 'left',
    transition: 'all 0.1s ease',
  });

  const badgeStyle = (fg: string, bg: string): React.CSSProperties => ({
    fontSize: 'var(--type-badge)', fontWeight: 600, color: fg, background: bg,
    padding: '1px 6px', borderRadius: 6, height: 18, minWidth: 18,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  });

  const sectionHeader: React.CSSProperties = {
    fontSize: 'var(--type-nav-section)', fontWeight: 600, letterSpacing: '0.06em',
    color: 'var(--text-tertiary)', textTransform: 'uppercase',
    padding: '20px 12px 6px',
  };

  const iconCol: React.CSSProperties = {
    width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    opacity: 0.7,
  };

  const chevron = (open: boolean): React.CSSProperties => ({
    fontSize: 8, color: 'var(--text-tertiary)',
    transform: open ? 'rotate(90deg)' : 'none',
    transition: 'transform .15s ease',
    flexShrink: 0,
  });

  return (
    <div style={{
      width: 'var(--sidebar-width)', flexShrink: 0, background: '#fff',
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid var(--border-primary)',
    }}>
      {/* Logo — doubles as the workspace switcher (back to the OS launcher) */}
      <Link
        href="/workspace"
        title="Switch workspace"
        onMouseEnter={() => setHoveredLink('__brand')}
        onMouseLeave={() => setHoveredLink(null)}
        style={{
          height: 'var(--topbar-height)', padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border-primary)', flexShrink: 0,
          textDecoration: 'none',
          background: hoveredLink === '__brand' ? 'var(--bg-secondary)' : 'transparent',
          transition: 'background 0.1s ease',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 'var(--type-nav-section)', color: '#fff', letterSpacing: -0.3,
        }}>G&A</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 'var(--type-nav)', fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>G&A Compass</div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--type-nav-section)', letterSpacing: 0.3, lineHeight: 1.2 }}>{pathname.startsWith('/onboarding') ? 'Onboarding Operations' : 'Benefits Operations'}</div>
        </div>
        <i className="fa-solid fa-grip" style={{ fontSize: 'var(--type-nav-section)', color: 'var(--text-tertiary)', opacity: hoveredLink === '__brand' ? 1 : 0.5, transition: 'opacity 0.1s ease' }} />
      </Link>

      {/* Nav */}
      <div style={{ padding: '4px 8px', flex: 1, overflowY: 'auto' }}>

        <div style={sectionHeader}>Agents</div>

        <button onClick={() => toggle('prospecting')} style={sectionBtn(expanded.prospecting)}>
          <span style={iconCol}><i className="fa-solid fa-magnifying-glass-chart" style={{ fontSize: 'var(--type-nav)', color: 'inherit' }}></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prospecting Agent</div>
            <div style={{ fontSize: 'var(--type-nav-sub)', fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 1 }}>Lead qualification</div>
          </div>
          <span style={chevron(expanded.prospecting)}>&#9654;</span>
        </button>
        {expanded.prospecting && (
          <div style={{ marginBottom: 4 }}>
            {['Prospects', 'Research', 'Outreach'].map(item => (
              <div key={item} style={{ ...subLink('#'), cursor: 'default' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-slate-300)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
            <div style={{ padding: '4px 38px', fontSize: 'var(--type-nav-sub)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Coming in Phase 2</div>
          </div>
        )}

        <button onClick={() => toggle('proposal')} style={sectionBtn(expanded.proposal)}>
          <span style={iconCol}><i className="fa-solid fa-file-signature" style={{ fontSize: 'var(--type-nav)', color: 'inherit' }}></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Proposal Agent</div>
            <div style={{ fontSize: 'var(--type-nav-sub)', fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 1 }}>Proposal workflow</div>
          </div>
          <span style={chevron(expanded.proposal)}>&#9654;</span>
        </button>
        {expanded.proposal && (
          <div style={{ marginBottom: 4 }}>
            {['Artifacts', 'Assembly', 'Proposal Draft', 'Review & Send'].map(item => (
              <div key={item} style={{ ...subLink('#'), cursor: 'default' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-slate-300)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
            <div style={{ padding: '4px 38px', fontSize: 'var(--type-nav-sub)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Coming in Phase 2</div>
          </div>
        )}

        <div style={sectionHeader}>CAP Tool</div>

        <button onClick={() => toggle('cap')} style={sectionBtn(expanded.cap)}>
          <span style={iconCol}><i className="fa-solid fa-table-columns" style={{ fontSize: 'var(--type-nav)', color: 'inherit' }}></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Client Approved Plans</div>
            <div style={{ fontSize: 'var(--type-nav-sub)', fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 1 }}>CAP build & renewals</div>
          </div>
          <span style={chevron(expanded.cap)}>&#9654;</span>
        </button>
        {expanded.cap && (
          <div style={{ marginBottom: 4 }}>
            <Link href="/dashboard" style={subLink('/dashboard')}
              onMouseEnter={() => setHoveredLink('/dashboard')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              Dashboard
            </Link>
            {shouldShow(undefined, 'create') && (
              <Link href="/new-business" style={subLink('/new-business')}
                onMouseEnter={() => setHoveredLink('/new-business')} onMouseLeave={() => setHoveredLink(null)}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/new-business') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
                CAP Builder
              </Link>
            )}
            <Link href="/renewal" style={subLink('/renewal')}
              onMouseEnter={() => setHoveredLink('/renewal')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/renewal') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              <span style={{ flex: 1 }}>Renewals</span>
              {renewalCount > 0 && <span style={badgeStyle('#C60C30', '#FDECEF')}>{renewalCount}</span>}
            </Link>
            {shouldShow(undefined, 'esign') && (
              <Link href="/esign" style={subLink('/esign')}
                onMouseEnter={() => setHoveredLink('/esign')} onMouseLeave={() => setHoveredLink(null)}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/esign') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
                <span style={{ flex: 1 }}>E-Signature</span>
                {esignCount > 0 && <span style={badgeStyle('#B0690A', '#FBF0DD')}>{esignCount}</span>}
              </Link>
            )}
            <Link href="/documents" style={subLink('/documents')}
              onMouseEnter={() => setHoveredLink('/documents')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/documents') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              <span style={{ flex: 1 }}>Documents</span>
              {docCount > 0 && <span style={badgeStyle('var(--text-secondary)', 'var(--bg-hover)')}>{docCount}</span>}
            </Link>
            {shouldShow(['analyst', 'gab', 'admin']) && (
              <Link href="/writeback" style={subLink('/writeback')}
                onMouseEnter={() => setHoveredLink('/writeback')} onMouseLeave={() => setHoveredLink(null)}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/writeback') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
                <span style={{ flex: 1 }}>Ben Admin</span>
                {approvedCount > 0 && <span style={badgeStyle('#5A45C7', '#F8F6FE')}>{approvedCount}</span>}
              </Link>
            )}
          </div>
        )}

        <div style={sectionHeader}>Onboarding Ops</div>

        <button onClick={() => toggle('csa')} style={sectionBtn(expanded.csa, isOnboarding)}>
          <span style={iconCol}><i className="fa-solid fa-file-invoice" style={{ fontSize: 'var(--type-nav)', color: 'inherit' }}></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>CSA Extraction</div>
            <div style={{ fontSize: 'var(--type-nav-sub)', fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 1 }}>AI-assisted extraction</div>
          </div>
          <span style={chevron(expanded.csa)}>&#9654;</span>
        </button>
        {expanded.csa && (
          <div style={{ marginBottom: 4 }}>
            <Link href="/onboarding/clients" style={{
              ...subLink('/onboarding/clients'),
              background: isActive('/onboarding/clients') ? 'var(--bg-hover)' : (hoveredLink === '/onboarding/clients' ? 'var(--bg-secondary)' : 'transparent'),
              color: isActive('/onboarding/clients') ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isActive('/onboarding/clients') ? 600 : 400,
            }}
              onMouseEnter={() => setHoveredLink('/onboarding/clients')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/onboarding/clients') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              Clients
            </Link>
            <Link href="/onboarding" style={subLink('/onboarding')}
              onMouseEnter={() => setHoveredLink('/onboarding')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: pathname === '/onboarding' ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              Extractions
            </Link>
            <Link href="/onboarding/extract" style={subLink('/onboarding/extract')}
              onMouseEnter={() => setHoveredLink('/onboarding/extract')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/onboarding/extract') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              Upload & Extract
            </Link>
          </div>
        )}

        <button onClick={() => toggle('preflight')} style={sectionBtn(expanded.preflight, pathname.startsWith('/onboarding/preflight'))}>
          <span style={iconCol}><i className="fa-solid fa-plane-departure" style={{ fontSize: 'var(--type-nav)', color: 'inherit' }}></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pre-Flight Validation</div>
            <div style={{ fontSize: 'var(--type-nav-sub)', fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 1 }}>Payroll config checks</div>
          </div>
          <span style={chevron(expanded.preflight)}>&#9654;</span>
        </button>
        {expanded.preflight && (
          <div style={{ marginBottom: 4 }}>
            <Link href="/onboarding/preflight" style={subLink('/onboarding/preflight')}
              onMouseEnter={() => setHoveredLink('/onboarding/preflight')} onMouseLeave={() => setHoveredLink(null)}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive('/onboarding/preflight') ? 'var(--text-primary)' : 'var(--color-slate-300)', flexShrink: 0, transition: 'background 0.1s' }} />
              Run Validation
            </Link>
          </div>
        )}

        <div style={sectionHeader}>Data &amp; Foundation</div>
        <Link href="/admin" style={link('/admin')}
          onMouseEnter={() => setHoveredLink('/admin')} onMouseLeave={() => setHoveredLink(null)}>
          <span style={iconCol}><i className="fa-solid fa-database" style={{ fontSize: 'var(--type-nav)' }} /></span>
          Data Repository
        </Link>
        <Link href="/integrations" style={link('/integrations')}
          onMouseEnter={() => setHoveredLink('/integrations')} onMouseLeave={() => setHoveredLink(null)}>
          <span style={iconCol}><i className="fa-solid fa-plug" style={{ fontSize: 'var(--type-nav)' }} /></span>
          Integrations
        </Link>
        <Link href="/architecture" style={link('/architecture')}
          onMouseEnter={() => setHoveredLink('/architecture')} onMouseLeave={() => setHoveredLink(null)}>
          <span style={iconCol}><i className="fa-solid fa-diagram-project" style={{ fontSize: 'var(--type-nav)' }} /></span>
          Architecture
        </Link>
      </div>

      {/* User */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, backgroundColor: userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--type-badge)', fontWeight: 700, color: '#fff',
          }}>{userShort}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 'var(--type-nav-sub)', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--type-nav-section)', lineHeight: 1.3 }}>{userRole}</div>
          </div>
          <button onClick={logout} title="Sign out" style={{
            border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 'var(--type-nav)', padding: '4px 6px', borderRadius: 6,
            transition: 'all 0.12s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>&#9211;</button>
        </div>
      </div>
    </div>
  );
}
