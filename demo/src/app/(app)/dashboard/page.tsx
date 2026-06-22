'use client';

import { useState, useEffect } from 'react';
import MetricGrid from '@/components/dashboard/MetricGrid';
import ClientTable from '@/components/dashboard/ClientTable';
import RenewalRadar from '@/components/dashboard/RenewalRadar';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityLog from '@/components/dashboard/ActivityLog';
import { PageSkeleton } from '@/components/shared/Skeleton';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div style={{ padding: '20px 24px 48px', maxWidth: 1280 }}>
      <MetricGrid />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>
        <ClientTable />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RenewalRadar />
          <QuickActions />
        </div>
      </div>
      <ActivityLog />
    </div>
  );
}
