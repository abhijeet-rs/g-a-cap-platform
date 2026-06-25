'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const personas = [
  { email: 'am@gapartners.com', label: 'Account Manager', shortLabel: 'AM', color: '#DC2626', bg: '#FEF2F2' },
  { email: 'ae@gapartners.com', label: 'Account Executive', shortLabel: 'AE', color: '#2563EB', bg: '#EFF6FF' },
  { email: 'coordinator@gapartners.com', label: 'Coordinator', shortLabel: 'BC', color: '#4B5563', bg: '#F3F4F6' },
  { email: 'analyst@gapartners.com', label: 'Analyst', shortLabel: 'BA', color: '#4B5563', bg: '#F3F4F6' },
  { email: 'manager@gapartners.com', label: 'GAB Manager', shortLabel: 'GM', color: '#059669', bg: '#ECFDF5' },
  { email: 'admin@gapartners.com', label: 'System Admin', shortLabel: 'SA', color: '#7C3AED', bg: '#F5F3FF' },
];

const stats = [
  { value: '189', label: 'FTEs' },
  { value: '~130K', label: 'WSEs' },
  { value: '$17.6M', label: 'FLC' },
  { value: '1,320', label: 'Setups/Yr' },
];

export default function LoginPage() {
  const router = useRouter();
  const screen = useAuthStore((s) => s.screen);
  const email = useAuthStore((s) => s.email);
  const password = useAuthStore((s) => s.password);
  const authLoading = useAuthStore((s) => s.authLoading);
  const setEmail = useAuthStore((s) => s.setEmail);
  const setPassword = useAuthStore((s) => s.setPassword);
  const login = useAuthStore((s) => s.login);
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  useEffect(() => {
    if (screen === 'app') router.push('/workspace');
  }, [screen, router]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', height: '100vh', background: '#fff' }}>

      {/* ===== LEFT: Brand Panel ===== */}
      <div style={{
        background: '#111827',
        padding: '40px 40px 32px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle gradient accent */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.12), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,.08), transparent 70%)' }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--type-badge)', color: '#111827', letterSpacing: -0.3 }}>G&A</div>
            <div>
              <div style={{ color: '#fff', fontSize: 'var(--type-card-title)', fontWeight: 700, letterSpacing: -0.3 }}>G&A Compass</div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 'var(--type-badge)', letterSpacing: 0.3 }}>Benefits Sales Platform</div>
            </div>
          </div>
        </div>

        {/* Value prop */}
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <div style={{ fontSize: 'var(--type-display)', lineHeight: 1.2, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 16 }}>
            AI-powered benefits orchestration, from prospect to enrollment.
          </div>
          <div style={{ fontSize: 'var(--type-body-sm)', lineHeight: 1.7, color: 'rgba(255,255,255,.5)' }}>
            Prospecting, proposals, CAP management, renewals, and Prism write-back — unified on one platform.
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, marginTop: 32 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.1)' : 'none',
                padding: '0 12px',
              }}>
                <div style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 'var(--type-badge)', color: 'rgba(255,255,255,.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Integration logos */}
          <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
            {['PrismHR', 'ClientSpace', 'DocuSign', 'WorkSight'].map(name => (
              <span key={name} style={{ fontSize: 'var(--type-badge)', color: 'rgba(255,255,255,.3)', background: 'rgba(255,255,255,.06)', padding: '4px 10px', borderRadius: 6, fontWeight: 500 }}>{name}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--type-badge)', color: 'rgba(255,255,255,.2)' }}>R Systems &middot; Confidential</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', padding: '3px 8px', borderRadius: 4 }}>v1.0 · Enterprise Preview</div>
        </div>
      </div>

      {/* ===== RIGHT: Login Panel ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Sign in header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 'var(--type-page-title)', fontWeight: 700, color: '#111827', letterSpacing: -0.3, marginBottom: 8 }}>Sign in to Compass</div>
            <div style={{ fontSize: 'var(--type-body-sm)', color: '#6B7280', lineHeight: 1.5 }}>Use your G&A enterprise credentials. Authentication is handled via SAML SSO.</div>
          </div>

          {/* Login form */}
          <form onSubmit={(e) => { e.preventDefault(); login(); }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 'var(--type-caption)', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Work Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gapartners.com"
                style={{
                  width: '100%', height: 44, border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '0 14px', fontSize: 'var(--type-body-sm)', color: '#111827', outline: 'none',
                  background: '#F9FAFB', transition: 'border-color .15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#111827'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 'var(--type-caption)', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', height: 44, border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '0 14px', fontSize: 'var(--type-body-sm)', color: '#111827', outline: 'none',
                  background: '#F9FAFB', transition: 'border-color .15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#111827'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB'; }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%', height: 44, border: 'none', borderRadius: 8,
                background: '#111827', color: '#fff', fontSize: 'var(--type-body-sm)', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                opacity: authLoading ? 0.7 : 1, transition: 'background .15s',
              }}
              onMouseEnter={(e) => { if (!authLoading) (e.target as HTMLButtonElement).style.background = '#374151'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#111827'; }}
            >
              {authLoading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Authenticating&hellip;
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Sign in with SAML SSO
                </>
              )}
            </button>

            {/* Security indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 'var(--type-label)', color: '#9CA3AF' }}>Protected by enterprise SSO &middot; SOC 2 compliant</span>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 'var(--type-label)', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo Access</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Persona selector — modern role cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {personas.map((p) => {
              const isSelected = email === p.email;
              const isHovered = hoveredPersona === p.email;
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => setEmail(p.email)}
                  onMouseEnter={() => setHoveredPersona(p.email)}
                  onMouseLeave={() => setHoveredPersona(null)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px', borderRadius: 8, cursor: 'pointer',
                    border: isSelected ? `2px solid ${p.color}` : '1px solid #E5E7EB',
                    background: isSelected ? p.bg : isHovered ? '#F9FAFB' : '#fff',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: p.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--type-badge)', fontWeight: 700, color: p.color,
                  }}>{p.shortLabel}</div>
                  <div style={{ fontSize: 'var(--type-label)', fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.2 }}>{p.label}</div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
