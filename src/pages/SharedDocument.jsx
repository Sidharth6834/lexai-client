import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Scale, 
  Clock, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  BarChart2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import RiskHeatmap from '../components/RiskHeatmap';
import LegalResourcesModal from '../components/LegalResourcesModal';

const SharedDocument = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Default to Risk Overview
  const [expandedClauses, setExpandedClauses] = useState({});
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  useEffect(() => {
    const fetchSharedDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/shared/${token}`);
        setDoc(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch shared document:', err);
        setError(err.response?.data?.error || 'This shared link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedDocument();
    }
  }, [token]);

  const toggleClause = (idx) => {
    setExpandedClauses(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getRiskDetails = (risk) => {
    switch (risk) {
      case 'safe':
        return { text: 'Safe', className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-mono' };
      case 'caution':
        return { text: 'Caution', className: 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 font-mono' };
      case 'risky':
        return { text: 'Risky', className: 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30 font-mono' };
      default:
        return { text: 'Not Reviewed', className: 'bg-[#1A1D23] text-[#71717A] border border-[#202227] font-mono' };
    }
  };

  const formatDocType = (type) => {
    if (!type) return 'Document';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col items-center justify-center p-8 relative">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-2 border-[#D97706] border-t-transparent animate-spin rounded-full" />
          <p className="text-[#A1A1AA] text-xs font-mono uppercase tracking-widest">Retrieving Secure Audit Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col items-center justify-center p-6 relative">
        <div className="bg-[#131518] max-w-md w-full p-8 border border-[#202227] text-center flex flex-col items-center shadow-2xl relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/30 flex items-center justify-center mb-5">
            <ShieldAlert className="h-6 w-6 text-[#E11D48]" />
          </div>
          <h2 className="font-serif text-2xl font-medium text-[#F4F3EF] mb-2 tracking-tight">Access Link Unavailable</h2>
          <p className="text-[#A1A1AA] text-xs leading-relaxed mb-6 font-mono">{error}</p>
          <Link to="/register" className="w-full py-3 px-4 text-xs font-mono uppercase tracking-wider text-[#0A0B0D] bg-[#D97706] hover:bg-[#B45309] font-semibold text-center transition flex items-center justify-center space-x-2">
            <span>Try LegalMind for Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskDetails(doc.riskLevel);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col relative pb-16 font-sans">
      {/* HEADER PUBLIC BANNER */}
      <div className="w-full bg-[#131518] border-b border-[#202227] py-2.5 px-4 text-center text-xs font-mono text-[#A1A1AA] flex flex-col sm:flex-row items-center justify-center gap-3 relative z-20">
        <span>Shared via <span className="text-[#F4F3EF] font-semibold">LegalMind Chambers</span> — Run institutional audits on your own agreements.</span>
        <Link 
          to="/register" 
          className="px-3 py-1 bg-[#D97706] hover:bg-[#B45309] text-[#0A0B0D] text-[11px] font-mono uppercase tracking-wider font-semibold transition flex items-center space-x-1.5"
        >
          <span>Get Started Free</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* NAV LOGO HEADER */}
      <nav className="max-w-6xl mx-auto w-full px-6 pt-6 flex justify-between items-center relative z-10 border-b border-[#202227] pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-[#D97706]/40 bg-[#17191E] flex items-center justify-center">
            <Scale className="h-4 w-4 text-[#D97706]" />
          </div>
          <span className="font-serif text-xl tracking-wide text-[#F4F3EF]">LegalMind</span>
        </div>
        <Link 
          to="/login" 
          className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-[#D97706] transition"
        >
          Sign In &rarr;
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-8 space-y-8 relative z-10">
        {/* DOCUMENT HEADER */}
        <header className="pb-6 border-b border-[#202227] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#71717A]">
              <span>Shared Docket</span>
              <span>/</span>
              <span className="text-[#D97706]">{formatDocType(doc.type)}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F4F3EF] tracking-tight">
              {doc.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-[#17191E] text-[#D97706] border border-[#202227]">
                {formatDocType(doc.type)}
              </span>
              <span className="flex items-center space-x-1 text-[#71717A] text-xs font-mono">
                <Clock className="h-3.5 w-3.5 text-[#52525B]" />
                <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
              </span>
              <span className={`px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider ${riskInfo.className}`}>
                Risk: {riskInfo.text}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-[#A1A1AA] font-mono bg-[#131518] border border-[#202227] p-4 flex items-center space-x-3 max-w-sm">
            <Info className="h-4 w-4 text-[#D97706] shrink-0" />
            <span className="leading-relaxed">This is a secure, read-only audit dossier shared with authorized parties.</span>
          </div>
        </header>

        {/* TAB CONTROLS */}
        <div className="bg-[#131518] p-1 border border-[#202227] flex space-x-1 overflow-x-auto scrollbar-none w-fit">
          {['overview', 'summary', 'clauses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center space-x-2 ${
                activeTab === tab 
                  ? 'bg-[#17191E] text-[#D97706] border border-[#202227]' 
                  : 'text-[#A1A1AA] hover:text-[#F4F3EF] hover:bg-[#17191E]/50'
              }`}
            >
              {tab === 'overview' && <BarChart2 className="h-3.5 w-3.5 shrink-0" />}
              <span>{tab === 'overview' ? 'Risk Overview' : tab === 'clauses' ? 'Clause Analysis' : tab}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[350px]">
          
          {/* TAB 0: RISK OVERVIEW (HEATMAP) */}
          {activeTab === 'overview' && (
            <RiskHeatmap 
              clauses={doc.clauses} 
              onClauseClick={(index) => {
                setExpandedClauses(prev => ({
                  ...prev,
                  [index]: true
                }));
                setActiveTab('clauses');
                setTimeout(() => {
                  const element = document.getElementById(`clause-card-${index}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }} 
            />
          )}

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#131518] p-6 sm:p-8 border border-[#202227]">
                  <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#71717A] mb-3">
                    <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full"></span>
                    <span>Executive Briefing</span>
                  </div>
                  <h2 className="font-serif text-2xl font-normal text-[#F4F3EF] mb-4 tracking-tight">
                    Executive Summary
                  </h2>
                  <p className="text-sm text-[#D4D4D8] leading-relaxed font-normal">
                    {doc.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#131518] p-6 border border-[#202227] space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                    Key Metadata
                  </div>
                  
                  <div className="divide-y divide-[#202227] text-xs font-mono">
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-[#71717A]">Document Type</span>
                      <span className="text-[#F4F3EF] bg-[#17191E] px-2.5 py-1 border border-[#202227] uppercase">{doc.type.replace('_', ' ')}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-[#71717A]">Risk Level</span>
                      <span className={`px-2.5 py-1 border text-xs font-mono uppercase ${
                        doc.riskLevel === 'safe' 
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
                          : doc.riskLevel === 'caution' 
                            ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' 
                            : 'bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/30'
                      }`}>{doc.riskLevel || 'Pending'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-[#71717A]">Analysis Date</span>
                      <span className="text-[#F4F3EF]">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLAUSE ANALYSIS */}
          {activeTab === 'clauses' && (
            <div className="space-y-4 max-w-5xl">
              {!doc.clauses || doc.clauses.length === 0 ? (
                <div className="bg-[#131518] p-16 text-center border border-[#202227] flex flex-col items-center justify-center">
                  <div className="p-4 bg-[#17191E] rounded-full text-[#A1A1AA] mb-4 border border-[#202227]">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#F4F3EF]">No clauses found</h3>
                </div>
              ) : (
                doc.clauses.map((clause, index) => {
                  const isExpanded = !!expandedClauses[index];
                  const clRisk = getRiskDetails(clause.riskLevel);
                  
                  return (
                    <div 
                      key={clause._id || index}
                      id={`clause-card-${index}`}
                      className={`bg-[#131518] border transition-all duration-200 overflow-hidden ${
                        isExpanded 
                          ? 'border-[#D97706]/50 bg-[#17191E]' 
                          : 'border-[#202227] hover:border-[#2E3238]'
                      }`}
                    >
                      {/* Clause Title & Header */}
                      <div 
                        onClick={() => toggleClause(index)}
                        className="px-6 py-5 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-4 min-w-0 pr-4">
                          <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${clRisk.className}`}>
                            {clRisk.text}
                          </span>
                          <h3 className="font-serif text-base sm:text-lg font-normal text-[#F4F3EF] truncate">{clause.title}</h3>
                        </div>
                        <div className="text-[#71717A] flex-shrink-0 p-1.5 bg-[#17191E] border border-[#202227] hover:text-[#F4F3EF] transition">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {/* Expandable Body */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-[#202227] space-y-5 bg-[#0E0F12]">
                          {/* Original Text */}
                          <div>
                            <span className="text-[10px] tracking-widest font-mono uppercase text-[#71717A]">Original Contract Text</span>
                            <div className="mt-2 p-4 bg-[#131518] border border-[#202227] text-xs font-mono text-[#D4D4D8] leading-relaxed italic border-l-2 border-l-[#D97706]">
                              "{clause.originalText}"
                            </div>
                          </div>

                          {/* Plain English Explanation */}
                          <div>
                            <span className="text-[10px] tracking-widest font-mono uppercase text-[#71717A]">Plain English Explanation</span>
                            <p className="mt-1.5 text-sm leading-relaxed text-[#D4D4D8]">
                              {clause.explanation}
                            </p>
                          </div>

                          {/* Our Suggestion (Only show for caution/risky items) */}
                          {(clause.riskLevel === 'caution' || clause.riskLevel === 'risky') && (
                            <div className="bg-[#131518] border border-[#202227] p-4 flex items-start space-x-3 text-xs border-l-2 border-l-[#D97706]">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#D97706]" />
                              <div className="space-y-1">
                                <span className="text-[10px] tracking-widest font-mono uppercase text-[#D97706]">Our Suggestion</span>
                                <p className="text-xs leading-relaxed text-[#A1A1AA]">
                                  {clause.suggestion}
                                </p>
                              </div>
                            </div>
                          )}
                          {clause.riskLevel === 'risky' && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setIsLegalModalOpen(true)}
                                className="text-xs font-mono uppercase tracking-wider text-[#D97706] hover:underline cursor-pointer"
                              >
                                Need help with this clause? Get free legal advice &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER NOTICE */}
      <footer className="max-w-6xl mx-auto w-full px-6 pt-12 text-center text-[10px] text-[#71717A] font-mono uppercase tracking-widest space-y-2 relative z-10 border-t border-[#202227] mt-12">
        {doc.shareExpiresAt && (
          <div className="text-[#D97706]">
            This public link will expire on {formatExpiryDate(doc.shareExpiresAt)}
          </div>
        )}
        <div>
          &copy; {new Date().getFullYear()} LegalMind Chambers. Institutional Legal Intelligence.
        </div>
      </footer>
      <LegalResourcesModal 
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};

export default SharedDocument;
