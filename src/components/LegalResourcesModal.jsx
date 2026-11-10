import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Scale, 
  PhoneCall, 
  ExternalLink, 
  BookOpen, 
  Briefcase, 
  HelpCircle 
} from 'lucide-react';

const LegalResourcesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container - Chambers Swiss */}
      <div className="relative bg-[#131518] border border-[#202227] w-full max-w-2xl rounded-xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh] z-10 animate-in fade-in zoom-in duration-150 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#202227] mb-5">
          <div className="flex items-center space-x-2.5 text-[#D97706]">
            <Scale className="h-5 w-5" />
            <h3 className="text-base font-serif font-bold text-[#F4F3EF] tracking-tight">Legal Resources & Counsel Directories</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#8E8D88] hover:bg-[#181A1F] hover:text-[#F4F3EF] rounded-lg transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* SECTION 1 - FREE GOVERNMENT LEGAL AID */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-semibold text-[#8E8D88] uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="h-3.5 w-3.5 text-[#D97706]" />
              <span>Government Legal Aid Directories</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* NALSA */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">NALSA</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    National Legal Services Authority statutory aid.
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-[#10B981]">
                    <PhoneCall className="h-3 w-3 shrink-0" />
                    <span>Helpline: 15100</span>
                  </div>
                </div>
                <a 
                  href="https://nalsa.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>nalsa.gov.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* State Legal Services Authority */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">SLSA</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    State Legal Services Authority regional clinics.
                  </p>
                  <p className="text-[10px] font-mono text-[#575652]">
                    Find state directory on NALSA.
                  </p>
                </div>
                <a 
                  href="https://nalsa.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>Find Authority</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* eDistrict Portal */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">eDistrict Portal</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    State legal aid filing & dispute registration.
                  </p>
                  <p className="text-[10px] font-mono text-[#575652]">
                    State jurisdiction dependent.
                  </p>
                </div>
                <a 
                  href="https://edistrict.delhi.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>edistrict.delhi.gov.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 2 - ONLINE LEGAL PLATFORMS (PAID) */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-semibold text-[#8E8D88] uppercase tracking-wider flex items-center space-x-2">
              <Briefcase className="h-3.5 w-3.5 text-[#D97706]" />
              <span>Independent Advocate Networks</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vakil Search */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">Vakil Search</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    Corporate, commercial agreements & IP counsel.
                  </p>
                </div>
                <a 
                  href="https://vakilsearch.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>vakilsearch.com</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* LawRato */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">LawRato</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    Legal advice directory and dispute resolution.
                  </p>
                </div>
                <a 
                  href="https://lawrato.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>lawrato.com</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* MyAdvo */}
              <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#2E313A] transition">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <Scale className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF]">MyAdvo</span>
                  </div>
                  <p className="text-[11px] text-[#8E8D88] leading-relaxed">
                    Verified advocates with fixed commercial fee schedules.
                  </p>
                </div>
                <a 
                  href="https://myadvo.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition"
                >
                  <span>myadvo.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 3 - SELF HELP RESOURCES */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-semibold text-[#8E8D88] uppercase tracking-wider flex items-center space-x-2">
              <BookOpen className="h-3.5 w-3.5 text-[#D97706]" />
              <span>Statutory Reference Guidelines</span>
            </h4>
            
            <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#202227]">
                <div>
                  <h5 className="text-xs font-semibold text-[#F4F3EF]">Tenant & Occupancy Protections</h5>
                  <p className="text-[11px] text-[#8E8D88] mt-0.5">
                    Official statutory resources detailing statutory rental caps and lease terms.
                  </p>
                </div>
                <a 
                  href="https://mhua.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#131518] hover:bg-[#202227] text-[#D97706] text-[10px] font-mono rounded border border-[#202227] transition shrink-0"
                >
                  <span>mhua.gov.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="pb-2.5 border-b border-[#202227]">
                <h5 className="text-xs font-semibold text-[#F4F3EF]">Model Tenancy Act Provisions</h5>
                <p className="text-[11px] text-[#8E8D88] mt-0.5 leading-relaxed">
                  Caps security deposits, formalizes dispute adjudication, and establishes reciprocal quiet enjoyment rights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-semibold text-[#F4F3EF]">National Consumer Dispute Helpline</h5>
                  <p className="text-[11px] text-[#8E8D88] mt-0.5">
                    Remedies for deficient service covenants and unfair contract terms.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#10B981] bg-[#131518] px-2.5 py-1 rounded border border-[#202227]">
                  <PhoneCall className="h-3 w-3 shrink-0" />
                  <span>1800-11-4000</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Footer */}
        <div className="mt-6 pt-4 border-t border-[#202227] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[10px] text-[#575652] font-mono leading-relaxed max-w-md">
            LegalMind is an algorithmic contract analysis system, not a licensed legal practice. Consult certified counsel for formal advice.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#181A1F] hover:bg-[#202227] text-[#F4F3EF] font-medium text-xs rounded-lg border border-[#2A2C34] transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalResourcesModal;
