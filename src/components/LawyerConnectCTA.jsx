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
    <div className="relative overflow-hidden rounded-xl bg-[#181114] border border-[#E11D48]/35 p-5 shadow-lg animate-in fade-in slide-in-from-top duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-[#E11D48]/15 rounded-lg text-[#E11D48] shrink-0 border border-[#E11D48]/25">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-serif font-bold text-[#F4F3EF] tracking-tight">
              Critical Legal Exposure Detected
            </h3>
            <p className="text-xs text-[#C6C5BF] leading-relaxed max-w-2xl">
              We identified <span className="font-mono font-bold text-[#E11D48] bg-[#E11D48]/10 px-1.5 py-0.5 rounded border border-[#E11D48]/20">{riskyClausesCount}</span> high-risk covenants that may impose unbalanced liability. Counsel review is advised prior to execution.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onGetLegalAidClick}
            className="px-3.5 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs rounded-lg shadow-sm transition cursor-pointer"
          >
            Get Free Legal Aid
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 bg-[#131518] hover:bg-[#202227] text-[#8E8D88] hover:text-[#F4F3EF] font-medium text-xs rounded-lg border border-[#202227] transition cursor-pointer"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerConnectCTA;
