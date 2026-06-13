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

      {/* Modal Container */}
      <div className="relative bg-[#090d16] border border-white/10 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10 animate-in fade-in zoom-in duration-200 scrollbar-thin">
        {/* Glow ambient background shape */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-650/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-650/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Scale className="h-6 w-6" />
            <h3 className="text-lg font-bold text-white tracking-tight">Legal Resources & Help</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-900/60 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-8">
          
          {/* SECTION 1 - FREE GOVERNMENT LEGAL AID */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>Free Government Legal Aid</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* NALSA */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">NALSA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Free legal aid for eligible citizens of India.
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-extrabold">
                    <PhoneCall className="h-3 w-3 text-emerald-450" />
                    <span>Helpline: 15100</span>
                  </div>
                </div>
                <a 
                  href="https://nalsa.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>nalsa.gov.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* State Legal Services Authority */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">SLSA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Free legal aid from your local State Legal Services Authority.
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Find your state authority portal on NALSA.
                  </p>
                </div>
                <a 
                  href="https://nalsa.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>Find Authority</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* eDistrict Portal */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">eDistrict Portal</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Apply for legal aid online via state eDistrict systems.
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    Availability varies by state jurisdiction.
                  </p>
                </div>
                <a 
                  href="https://edistrict.delhi.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>edistrict.delhi.gov.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 2 - ONLINE LEGAL PLATFORMS (PAID) */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              <span>Online Legal Platforms (Paid)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Vakil Search */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">Vakil Search</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Connect with verified corporate, property & civil lawyers online.
                  </p>
                </div>
                <a 
                  href="https://vakilsearch.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>vakilsearch.com</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* LawRato */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">LawRato</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Free legal advice forums and lawyer directories for instant assistance.
                  </p>
                </div>
                <a 
                  href="https://lawrato.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>lawrato.com</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {/* MyAdvo */}
              <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 hover:scale-[1.01] transition duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-455">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold text-white">MyAdvo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Find top verified advocates with transparent, fixed pricing models.
                  </p>
                </div>
                <a 
                  href="https://myadvo.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] font-black rounded-lg border border-indigo-500/10 transition"
                >
                  <span>myadvo.in</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 3 - SELF HELP RESOURCES */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Self Help Resources</span>
            </h4>
            
            <div className="glass-card bg-[#0e1322]/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/5">
                <div>
                  <h5 className="text-xs font-bold text-white">Know Your Rights as a Tenant</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                    Read the official government resources outlining rental protections and regulations.
                  </p>
                </div>
                <a 
                  href="https://mhua.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white text-[10px] font-bold rounded-lg border border-white/5 transition shrink-0"
                >
                  <span>Open Official Page</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="pb-3.5 border-b border-white/5">
                <h5 className="text-xs font-bold text-white">Model Tenancy Act 2021 Summary</h5>
                <p className="text-[11px] text-slate-450 mt-1 leading-relaxed font-semibold">
                  A model framework outlining essential tenant rights: limits security deposits (max 2 months rent), sets dispute resolution frameworks, regulates eviction practices, and ensures quiet enjoyment covenant protections.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-white">Consumer Forum Complaint</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                    File complaints regarding deficient services or unfair practices.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-extrabold bg-[#030712] px-3 py-1.5 rounded-lg border border-white/5">
                  <PhoneCall className="h-3 w-3 text-emerald-450 shrink-0" />
                  <span>Helpline: 1800-11-4000</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-5 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-lg mx-auto font-medium">
            <span className="font-bold text-slate-450">Disclaimer:</span> LexAI is not a law firm. This information is for educational purposes only. Always consult a qualified lawyer for professional legal advice.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-white/5 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalResourcesModal;
