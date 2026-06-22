'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import CopilotSidebar from '@/components/copilot/CopilotSidebar';
import SyncOverlay from '@/components/shared/SyncOverlay';
import Toast from '@/components/shared/Toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const screen = useAuthStore((s) => s.screen);

  useEffect(() => {
    if (screen === 'login') {
      router.push('/');
    }
  }, [screen, router]);

  if (screen === 'login') return null;

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#F5F7FA' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Topbar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
        <CopilotSidebar />
        <SyncOverlay />
        <Toast />
      </div>
    </div>
  );
}
