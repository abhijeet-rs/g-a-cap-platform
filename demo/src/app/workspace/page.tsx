'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUserInfo } from '@/stores/authStore';

/* ------------------------------------------------------------------ */
/*  Workspace launcher — the "OS" home. After login the user lands     */
/*  here and chooses a workspace (Sales / Operations), then an app.    */
/*  Operations → Benefits CAP Builder loads the current experience.    */
/* ------------------------------------------------------------------ */

type AppStatus = 'active' | 'delivered' | 'soon';

interface WorkspaceApp {
  name: string;
  desc: string;
  icon: string; // Font Awesome class
  status: AppStatus;
  href?: string;
}

interface Workspace {
  key: 'operations' | 'sales' | 'onboarding';
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  accentBg: string;
  apps: WorkspaceApp[];
}

const workspaces: Workspace[] = [
  {
    key: 'sales',
    name: 'Sales',
    tagline: 'G&A Beneficial',
    description: 'Source, quote, and win new benefits business — prospecting, underwriting, and proposals.',
    icon: 'fa-chart-line',
    accent: '#0074B8',
    accentBg: '#E7F1FA',
    apps: [
      { name: 'Prospecting Agent', desc: 'Lead qualification, research, and outreach.', icon: 'fa-magnifying-glass-chart', status: 'delivered' },
      { name: 'Proposal Agent', desc: 'Underwriting comparison and proposal assembly.', icon: 'fa-file-signature', status: 'delivered' },
      { name: 'Pipeline & Forecast', desc: 'Deal pipeline, stages, and revenue forecast.', icon: 'fa-chart-simple', status: 'soon' },
    ],
  },
  {
    key: 'operations',
    name: 'Operations',
    tagline: 'Benefits Operations',
    description: 'Run benefits operations end to end — CAP build & renewals, booklet sign-off, and Prism / ClientSpace write-back.',
    icon: 'fa-gears',
    accent: '#C60C30',
    accentBg: '#FDECEF',
    apps: [
      { name: 'Benefits CAP Builder', desc: 'Client Approved Plans, renewals, booklet & sign-off, Prism / ClientSpace write-back.', icon: 'fa-table-columns', status: 'active', href: '/dashboard' },
      { name: 'Benefits Administration', desc: 'Payroll deduction audits, carrier enrollment, and WSE issue resolution.', icon: 'fa-headset', status: 'soon' },
      { name: 'Reconciliation · Beacon', desc: 'Monthly payroll-to-carrier invoice reconciliation.', icon: 'fa-scale-balanced', status: 'soon' },
      { name: 'Compliance & Filings', desc: 'ACA, COBRA, 5500, and annual regulatory filings.', icon: 'fa-shield-halved', status: 'soon' },
    ],
  },
  {
    key: 'onboarding',
    name: 'Onboarding',
    tagline: 'Onboarding Operations',
    description: 'Manage client onboarding end to end — CSA extraction, cross-validation, system configuration, and first payroll readiness.',
    icon: 'fa-user-plus',
    accent: '#2A8F60',
    accentBg: '#E4F2EA',
    apps: [
      { name: 'CSA Extraction', desc: 'AI-assisted CSA document extraction, cross-validation, and onboarding data preparation.', icon: 'fa-file-invoice', status: 'active', href: '/onboarding/clients' },
      { name: 'Onboarding Tracker', desc: 'Client onboarding pipeline, milestones, and team workload.', icon: 'fa-list-check', status: 'soon' },
      { name: 'Pre-Flight Validator', desc: 'Mock payroll pre-flight checks for PrismHR configuration.', icon: 'fa-plane-departure', status: 'soon' },
    ],
  },
];

const statusMeta: Record<AppStatus, { label: string; fg: string; bg: string }> = {
  active: { label: 'Open', fg: '#1A7A4A', bg: '#E4F2EA' },
  delivered: { label: 'Delivered', fg: '#0074B8', bg: '#E7F1FA' },
  soon: { label: 'Coming soon', fg: '#98A1A8', bg: '#F1F3F5' },
};

export default function WorkspaceLauncher() {
  const router = useRouter();
  const screen = useAuthStore((s) => s.screen);
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);
  const { userName, userRole, userShort, userColor } = useUserInfo();

  const [activeKey, setActiveKey] = useState<Workspace['key'] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Auth guard — bounce back to login if the session isn't authenticated.
  useEffect(() => {
    if (screen === 'login') router.push('/');
  }, [screen, router]);

  if (screen === 'login') return null;

  const firstName = userName.split(' ')[0];
  const activeWorkspace = workspaces.find((w) => w.key === activeKey) ?? null;

  const openApp = (app: WorkspaceApp) => {
    if (app.status === 'active' && app.href) {
      router.push(app.href);
      return;
    }
    setNote(
      app.status === 'delivered'
        ? `${app.name} is already live — it opens in the Sales workspace (outside this demo).`
        : `${app.name} is coming soon to the G&A Compass platform.`,
    );
    setTimeout(() => setNote(null), 3200);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #F6F8FA 0%, #FFFFFF 60%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'IBM Plex Sans', 'Inter', system-ui, sans-serif", color: '#1B2D3D',
    }}>
      {/* ── Launcher top bar ── */}
      <div style={{
        height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E4E8ED',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#13212C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 'var(--type-badge)', color: '#fff', letterSpacing: -0.3,
          }}>G&A</div>
          <div>
            <div style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.1 }}>G&A Compass</div>
            <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8', letterSpacing: 0.3 }}>Enterprise Workspace</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--type-body-sm)', fontWeight: 600, color: '#1B2D3D', lineHeight: 1.2 }}>{userName}</div>
            <div style={{ fontSize: 'var(--type-badge)', color: '#98A1A8' }}>{userRole}{email ? ` · ${email}` : ''}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--type-badge)', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{userShort}</div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid #E4E8ED',
              background: '#fff', color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 28px 64px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 'var(--type-table-header)', textTransform: 'uppercase', letterSpacing: '0.06em',
              fontWeight: 700, color: '#98A1A8', marginBottom: 8,
            }}>
              {activeWorkspace ? (
                <span>
                  <button
                    onClick={() => { setActiveKey(null); setNote(null); }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#0074B8', fontWeight: 700, font: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >Workspaces</button>
                  <span style={{ color: '#CBD2D9', margin: '0 8px' }}>/</span>
                  <span>{activeWorkspace.name}</span>
                </span>
              ) : 'Your workspaces'}
            </div>
            <h1 style={{ fontSize: 'var(--type-display)', fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>
              {activeWorkspace ? `${activeWorkspace.name} apps` : `Welcome back, ${firstName}`}
            </h1>
            <p style={{ fontSize: 'var(--type-body-lg)', color: '#374151', marginTop: 8, marginBottom: 0, maxWidth: 640 }}>
              {activeWorkspace
                ? activeWorkspace.description
                : 'G&A Compass is your central platform for Sales and Benefits Operations. Choose a workspace to load an app.'}
            </p>
          </div>

          {/* ── DOMAIN VIEW: choose Sales or Operations ── */}
          {!activeWorkspace && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {workspaces.map((w) => {
                const isHover = hovered === w.key;
                return (
                  <button
                    key={w.key}
                    onClick={() => { setActiveKey(w.key); setNote(null); }}
                    onMouseEnter={() => setHovered(w.key)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      textAlign: 'left', cursor: 'pointer', font: 'inherit',
                      background: '#fff', border: `1px solid ${isHover ? w.accent : '#E4E8ED'}`,
                      borderRadius: 16, padding: 24,
                      boxShadow: isHover ? '0 12px 32px rgba(16,32,45,.12)' : '0 1px 2px rgba(16,32,45,.04)',
                      transform: isHover ? 'translateY(-2px)' : 'none',
                      transition: 'all .18s ease',
                      display: 'flex', flexDirection: 'column', gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 13, background: w.accentBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <i className={`fa-solid ${w.icon}`} style={{ fontSize: 22, color: w.accent }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--type-section-title)', fontWeight: 700, color: '#1B2D3D' }}>{w.name}</div>
                        <div style={{ fontSize: 'var(--type-body-sm)', color: '#98A1A8', fontWeight: 600 }}>{w.tagline}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 'var(--type-body)', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                      {w.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {w.apps.slice(0, 3).map((a) => (
                          <span key={a.name} style={{
                            fontSize: 'var(--type-badge)', fontWeight: 600, color: '#374151',
                            background: '#F5F7FA', border: '1px solid #EEF1F4', borderRadius: 9999, padding: '2px 9px',
                          }}>{a.name}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 'var(--type-body-sm)', fontWeight: 700, color: w.accent, whiteSpace: 'nowrap' }}>
                        Open &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── APP VIEW: apps within the chosen workspace ── */}
          {activeWorkspace && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {activeWorkspace.apps.map((app) => {
                  const sm = statusMeta[app.status];
                  const isActive = app.status === 'active';
                  const isHover = hovered === app.name;
                  return (
                    <button
                      key={app.name}
                      onClick={() => openApp(app)}
                      onMouseEnter={() => setHovered(app.name)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        textAlign: 'left', font: 'inherit',
                        cursor: isActive ? 'pointer' : 'default',
                        background: '#fff',
                        border: `1px solid ${isActive && isHover ? activeWorkspace.accent : '#E4E8ED'}`,
                        borderRadius: 14, padding: 18,
                        boxShadow: isActive && isHover ? '0 10px 26px rgba(16,32,45,.1)' : 'none',
                        transform: isActive && isHover ? 'translateY(-2px)' : 'none',
                        transition: 'all .16s ease',
                        opacity: app.status === 'soon' ? 0.7 : 1,
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: 46, height: 46, borderRadius: 11,
                        background: isActive ? activeWorkspace.accentBg : '#F1F3F5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <i className={`fa-solid ${app.icon}`} style={{ fontSize: 18, color: isActive ? activeWorkspace.accent : '#98A1A8' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 'var(--type-card-title)', fontWeight: 700, color: '#1B2D3D' }}>{app.name}</span>
                          <span style={{
                            fontSize: 'var(--type-badge)', fontWeight: 600, borderRadius: 9999, padding: '2px 8px',
                            color: sm.fg, background: sm.bg,
                          }}>{sm.label}</span>
                        </div>
                        <p style={{ fontSize: 'var(--type-body-sm)', color: '#374151', margin: 0, lineHeight: 1.5 }}>{app.desc}</p>
                        {isActive && (
                          <span style={{ display: 'inline-block', marginTop: 8, fontSize: 'var(--type-body-sm)', fontWeight: 700, color: activeWorkspace.accent }}>
                            Launch app &rarr;
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inline note for non-launchable apps */}
              {note && (
                <div style={{
                  marginTop: 18, padding: '12px 16px', borderRadius: 10,
                  background: '#F0F7FF', border: '1px solid #D7E7F5',
                  fontSize: 'var(--type-body-sm)', color: '#0074B8', fontWeight: 500,
                }}>
                  {note}
                </div>
              )}

              <button
                onClick={() => { setActiveKey(null); setNote(null); }}
                style={{
                  marginTop: 24, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #E4E8ED',
                  background: '#fff', color: '#374151', fontSize: 'var(--type-body-sm)', fontWeight: 600, cursor: 'pointer',
                }}
              >
                &larr; Back to workspaces
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
