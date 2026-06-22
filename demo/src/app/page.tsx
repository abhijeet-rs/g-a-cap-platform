'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const personas = [
  { email: 'am@gapartners.com', label: 'Account Manager', color: '#C60C30' },
  { email: 'ae@gapartners.com', label: 'Account Executive', color: '#0074B8' },
  { email: 'coordinator@gapartners.com', label: 'Coordinator', color: '#5B6770' },
  { email: 'analyst@gapartners.com', label: 'Analyst', color: '#5B6770' },
  { email: 'manager@gapartners.com', label: 'GAB Manager', color: '#1A7A4A' },
  { email: 'admin@gapartners.com', label: 'System Admin', color: '#5A45C7' },
];

const stats = [
  { value: '189', label: 'Total FTEs' },
  { value: '~130K', label: 'WSEs' },
  { value: '$17.6M', label: 'Combined FLC' },
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

  useEffect(() => {
    if (screen === 'app') {
      router.push('/dashboard');
    }
  }, [screen, router]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', height: '100vh', background: '#0F1B24' }}>
      {/* ===== LEFT PANEL ===== */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #16242F 0%, #0E1A23 60%, #0B141B 100%)',
        padding: '56px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(198,12,48,.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,116,184,.1), transparent 70%)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#C60C30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: -1, boxShadow: '0 6px 18px rgba(198,12,48,.4)' }}>CT</div>
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>CAP Cloud Platform</div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 500, letterSpacing: 0.3 }}>G&A Partners &middot; Benefits Orchestration</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#E8546E', marginBottom: 16 }}>Initiative A &middot; System of Record</div>
          <div style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 600, color: '#fff', letterSpacing: -1, marginBottom: 18 }}>The Client Approved Plan, structured and orchestrated.</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.55)' }}>Replace the 29-sheet Excel workbook with a validated, version-controlled cloud platform — integrated with PrismHR, ClientSpace, WorkSight, and DocuSign.</div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,.1)' }} />}
                <div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
          R Systems &middot; Confidential &middot; Enterprise Preview
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, marginBottom: 6 }}>Sign in</div>
          <div style={{ fontSize: 13, color: '#64707A', marginBottom: 28 }}>Use your G&A enterprise credentials to access the CAP platform.</div>

          <form onSubmit={(e) => { e.preventDefault(); login(); }}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64707A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Work Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gapartners.com"
                style={{ width: '100%', height: 44, border: '1px solid #DCE2E8', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1B2D3D', outline: 'none', background: '#FBFCFD' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64707A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', height: 44, border: '1px solid #DCE2E8', borderRadius: 9, padding: '0 14px', fontSize: 14, color: '#1B2D3D', outline: 'none', background: '#FBFCFD' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%', height: 46, border: 'none', borderRadius: 9,
                background: '#C60C30', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(198,12,48,.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: authLoading ? 0.7 : 1,
              }}
            >
              {authLoading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Authenticating&hellip;
                </>
              ) : (
                <>Sign in with SAML SSO &rarr;</>
              )}
            </button>
          </form>

          {/* Persona hint box */}
          <div style={{ marginTop: 20, padding: 14, background: '#F7F9FB', border: '1px solid #EEF1F4', borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64707A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Sign in as any Persona</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
              {personas.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => setEmail(p.email)}
                  style={{
                    background: 'none', border: 'none', padding: '3px 0',
                    fontSize: 11, color: '#3B4A57', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <strong style={{ color: p.color }}>{p.email.split('@')[0]}</strong>@gapartners.com
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
