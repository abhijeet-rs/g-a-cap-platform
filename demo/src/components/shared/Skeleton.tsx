'use client';

import { useEffect, useState } from 'react';

export function PageSkeleton() {
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1280 }}>
      {/* Metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: '14px 16px', height: 100 }}>
            <SkeletonLine width="60%" height={8} />
            <SkeletonLine width="40%" height={28} style={{ marginTop: 12 }} />
            <SkeletonLine width="80%" height={8} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16 }}>
        <SkeletonLine width="30%" height={14} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SkeletonLine width="25%" height={10} />
              <SkeletonLine width="15%" height={10} />
              <SkeletonLine width="10%" height={10} />
              <SkeletonLine width="20%" height={10} />
              <SkeletonLine width="12%" height={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  const widths = [85, 72, 91, 66, 78, 95]; // deterministic
  return (
    <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 20 }}>
      <SkeletonLine width="40%" height={12} />
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} width={`${widths[i % widths.length]}%`} height={10} />
        ))}
      </div>
    </div>
  );
}

export function WizardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Step indicator skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#fff', borderBottom: '1px solid #E4E8ED' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SkeletonLine width="24px" height={24} style={{ borderRadius: '50%' }} />
            <SkeletonLine width="80px" height={10} />
            {i < 6 && <SkeletonLine width="40px" height={2} />}
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div style={{ flex: 1, padding: '20px 24px', maxWidth: 1080, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Left card */}
          <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 20 }}>
            <SkeletonLine width="40%" height={14} />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><SkeletonLine width="30%" height={8} /><SkeletonLine width="100%" height={34} style={{ marginTop: 6 }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><SkeletonLine width="50%" height={8} /><SkeletonLine width="100%" height={34} style={{ marginTop: 6 }} /></div>
                <div><SkeletonLine width="50%" height={8} /><SkeletonLine width="100%" height={34} style={{ marginTop: 6 }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><SkeletonLine width="50%" height={8} /><SkeletonLine width="100%" height={34} style={{ marginTop: 6 }} /></div>
                <div><SkeletonLine width="50%" height={8} /><SkeletonLine width="100%" height={34} style={{ marginTop: 6 }} /></div>
              </div>
            </div>
          </div>
          {/* Right card */}
          <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 20 }}>
            <SkeletonLine width="45%" height={14} />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SkeletonLine width="24px" height={24} style={{ borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="60%" height={10} />
                    <SkeletonLine width="80%" height={8} style={{ marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Upload zone skeleton */}
        <div style={{ border: '2px dashed #E4E8ED', borderRadius: 10, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <SkeletonLine width="24px" height={24} style={{ borderRadius: '50%' }} />
          <SkeletonLine width="200px" height={12} />
          <SkeletonLine width="160px" height={8} />
        </div>
        {/* Files skeleton */}
        <div style={{ background: '#fff', border: '1px solid #E4E8ED', borderRadius: 10, padding: 16, marginTop: 16 }}>
          <SkeletonLine width="20%" height={8} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SkeletonLine width="20px" height={20} style={{ borderRadius: 4 }} />
                <SkeletonLine width="200px" height={10} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer skeleton */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid #E4E8ED', background: '#fff', display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonLine width="80px" height={38} style={{ borderRadius: 8 }} />
        <SkeletonLine width="120px" height={38} style={{ borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = 10, style }: { width?: string; height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg, #EDF0F3 25%, #F5F7FA 50%, #EDF0F3 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}
