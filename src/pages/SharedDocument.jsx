import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  ShieldAlert
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
        return { text: 'Safe', className: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' };
      case 'caution':
        return { text: 'Caution', className: 'bg-amber-500/10 text-amber-450 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' };
      case 'risky':
        return { text: 'Risky', className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]' };
      default:
        return { text: 'Not Reviewed', className: 'bg-slate-800 text-slate-500 border border-slate-700/50' };
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
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-bold tracking-wider animate-pulse">Retrieving Secure Audit Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center shadow-2xl relative z-10">
          <ShieldAlert className="h-14 w-14 text-rose-500 mb-5 animate-bounce" />
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">Access Link Unavailable</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 font-semibold">{error}</p>
          <Link to="/register" className="w-full py-3.5 px-4 rounded-xl text-xs font-black text-white btn-gradient text-center shadow-lg transition flex items-center justify-center space-x-2">
            <span>Try LexAI for Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskDetails(doc.riskLevel);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col relative overflow-hidden pb-12">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER PUBLIC BANNER */}
      <div className="w-full bg-gradient-to-r from-indigo-950/90 to-violet-955/90 backdrop-blur-md border-b border-indigo-500/20 py-3 px-4 text-center text-xs font-bold text-slate-205 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-20 shadow-md">
        <span>Shared via <span className="text-white font-extrabold">LexAI</span> — Run legal audits on your own agreements.</span>
        <Link 
          to="/register" 
          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition text-[11px] font-black tracking-wide flex items-center space-x-1.5 shadow"
        >
          <span>Get Started Free</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* NAV LOGO HEADER */}
      <nav className="max-w-5xl mx-auto w-full px-6 pt-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Scale className="h-8 w-8" />
          <span className="text-2xl font-extrabold text-white tracking-wider">LexAI</span>
        </div>
        <Link 
          to="/login" 
          className="text-xs font-bold text-indigo-400 hover:text-indigo-350 transition hover:underline"
        >
          Sign In
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-8 space-y-6 relative z-10">
        {/* DOCUMENT HEADER */}
        <header className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              {doc.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {formatDocType(doc.type)}
              </span>
              <span className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskInfo.className}`}>
                Risk: {riskInfo.text}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-slate-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center space-x-2 max-w-xs">
            <Info className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>This is a secure, read-only review shared with you.</span>
          </div>
        </header>

        {/* TAB CONTROLS */}
        <div className="glass-card p-1 rounded-2xl flex space-x-1.5 overflow-x-auto scrollbar-none w-fit border border-white/5">
          {['overview', 'summary', 'clauses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 capitalize cursor-pointer flex items-center space-x-2 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-655 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              {tab === 'overview' && <BarChart2 className="h-4 w-4 shrink-0" />}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-bold text-white mb-4 tracking-tight flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span>Executive Summary</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {doc.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
                  <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Key Information</h2>
                  
                  <div className="divide-y divide-white/5 text-xs font-semibold">
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-400">Document Type</span>
                      <span className="text-white bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/5 capitalize">{doc.type.replace('_', ' ')}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-400">Risk Level</span>
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold capitalize ${
                        doc.riskLevel === 'safe' 
                          ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                          : doc.riskLevel === 'caution' 
                            ? 'bg-amber-500/10 text-amber-450 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                            : 'bg-rose-500/10 text-rose-450 border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      }`}>{doc.riskLevel || 'Pending'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-slate-400">Analysis Date</span>
                      <span className="text-slate-200">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLAUSE ANALYSIS */}
          {activeTab === 'clauses' && (
            <div className="space-y-6 max-w-5xl">
              {!doc.clauses || doc.clauses.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
                  <div className="p-5 bg-slate-900/60 rounded-full text-indigo-400 mb-6 border border-slate-800/80 animate-pulse">
                    <FileText className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No clauses found</h3>
                </div>
              ) : (
                doc.clauses.map((clause, index) => {
                  const isExpanded = !!expandedClauses[index];
                  const clRisk = getRiskDetails(clause.riskLevel);
                  
                  return (
                    <div 
                      key={clause._id || index}
                      id={`clause-card-${index}`}
                      className={`glass-card rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
                        isExpanded 
                          ? 'border-indigo-500/25 bg-indigo-950/10 shadow-[0_15px_30px_rgba(99,102,241,0.08)]' 
                          : 'border-white/5 hover:border-white/12 hover:bg-slate-900/25'
                      }`}
                    >
                      {/* Clause Title & Header */}
                      <div 
                        onClick={() => toggleClause(index)}
                        className="px-6 py-6 sm:px-8 sm:py-6.5 flex items-center justify-between cursor-pointer transition select-none"
                      >
                        <div className="flex items-center space-x-4 min-w-0 pr-4">
                          <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${clRisk.className}`}>
                            {clRisk.text}
                          </span>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{clause.title}</h3>
                        </div>
                        <div className="text-slate-400 flex-shrink-0 p-2.5 bg-slate-900/50 rounded-xl border border-white/5 shadow-inner hover:text-white transition">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {/* Expandable Body */}
                      {isExpanded && (
                        <div className="px-6 pb-8 pt-4 sm:px-8 border-t border-white/5 space-y-6">
                          {/* Original Text */}
                          <div>
                            <span className="text-xs tracking-widest font-black text-slate-500 uppercase">Original Contract Text</span>
                            <div className="mt-2.5 p-5 bg-slate-955/80 border border-slate-900/80 rounded-2xl text-sm font-mono text-slate-205 leading-relaxed italic border-l-4 border-indigo-500/50 shadow-inner">
                              "{clause.originalText}"
                            </div>
                          </div>

                          {/* Plain English Explanation */}
                          <div>
                            <span className="text-xs tracking-widest font-black text-slate-500 uppercase">Plain English Explanation</span>
                            <p className="mt-2 text-base leading-relaxed text-slate-200 font-medium">
                              {clause.explanation}
                            </p>
                          </div>

                          {/* Our Suggestion (Only show for caution/risky items) */}
                          {(clause.riskLevel === 'caution' || clause.riskLevel === 'risky') && (
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 text-indigo-200 shadow-md border-l-4 border-indigo-500">
                              <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                              <div className="space-y-1.5">
                                <span className="text-xs tracking-widest font-black text-indigo-400 uppercase">Our Suggestion</span>
                                <p className="text-sm leading-relaxed font-medium text-slate-300">
                                  {clause.suggestion}
                                </p>
                              </div>
                            </div>
                          )}
                          {clause.riskLevel === 'risky' && (
                            <div className="mt-2.5 pl-9">
                              <button
                                type="button"
                                onClick={() => setIsLegalModalOpen(true)}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-350 transition hover:underline cursor-pointer"
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
      <footer className="max-w-5xl mx-auto w-full px-6 pt-12 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider space-y-2 relative z-10">
        {doc.shareExpiresAt && (
          <div className="text-indigo-400/80">
            This public link will expire on {formatExpiryDate(doc.shareExpiresAt)}
          </div>
        )}
        <div>
          &copy; {new Date().getFullYear()} LexAI. All rights reserved.
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
