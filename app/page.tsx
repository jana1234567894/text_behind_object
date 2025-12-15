// app/page.tsx
'use client'

import React, { useState } from 'react';
import { LayerManagerColumn } from '@/components/LayerManagerColumn';
import { PreviewSection } from '@/components/PreviewSection';
import { LayerManagerProvider } from '@/context/useLayerManager';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function Page() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <div
        className={`transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 ${isPanelOpen ? 'w-[320px]' : 'w-0'
          }`}
      >
        {isPanelOpen && <LayerManagerColumn />}
      </div>
      <div className="relative flex-1">
        <Button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full h-8 w-8 p-0 z-10"
          style={{ left: isPanelOpen ? '-16px' : '8px' }}
        >
          {isPanelOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </Button>
        <PreviewSection />
      </div>
    </div>
  );
}
