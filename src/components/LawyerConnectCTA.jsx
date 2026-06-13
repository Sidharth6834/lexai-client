import React, { useState, useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

const LawyerConnectCTA = ({ documentId, riskyClausesCount, onGetLegalAidClick }) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (documentId) {
      const dismissedState = localStorage.getItem(`dismissed_cta_${documentId}`);
      setIsDismissed(dismissedState === 'true');
    }
  }, [documentId]);

  if (isDismissed || riskyClausesCount === 0) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(`dismissed_cta_${documentId}`, 'true');
    setIsDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-5 sm:p-6 shadow-xl border border-rose-550 animate-in fade-in slide-in-from-top duration-300">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white/10 rounded-xl text-white shrink-0 shadow-inner">
            <AlertOctagon className="h-7 w-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              This document has serious issues
            </h3>
            <p className="text-xs sm:text-sm text-red-50 font-medium leading-relaxed max-w-2xl">
              We found <span className="font-extrabold text-white bg-red-700/30 px-1.5 py-0.5 rounded">{riskyClausesCount}</span> risky clauses that may harm your interests. Consider consulting a legal professional before signing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onGetLegalAidClick}
            className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 font-extrabold text-xs rounded-xl shadow transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Get Free Legal Aid
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerConnectCTA;
