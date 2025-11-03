// app/page.tsx
'use client'

import React from 'react';
import { LayerManagerColumn } from '@/components/LayerManagerColumn';
import { PreviewSection } from '@/components/PreviewSection';
import { LayerManagerProvider } from '@/context/useLayerManager';

export default function Page() {
  return (
    <LayerManagerProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-[320px] border-r border-slate-200 dark:border-slate-800">
          <LayerManagerColumn />
        </div>
        <div className="flex-1">
          <PreviewSection />
        </div>
      </div>
    </LayerManagerProvider>
  );
}
