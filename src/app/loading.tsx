"use client";

import React from 'react';
import { AILoader } from "@/components/ui/ai-loader";

/**
 * DNTRNG™ GLOBAL SPLASH PROTOCOL
 * 
 * Provides a high-fidelity branded entry sequence during 
 * initial site hydration and segment transitions.
 */
export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex items-center justify-center animate-in fade-in duration-500">
      <AILoader 
        showBrand={true} 
        messages={[
          "Initializing System Core...",
          "Establishing Secure Registry Link...",
          "Retrieving Calibration Parameters...",
          "Synchronizing UI Telemetry Nodes...",
          "Hydrating Intelligence Registry...",
          "Operational Readiness: Optimal"
        ]}
      />
    </div>
  );
}
