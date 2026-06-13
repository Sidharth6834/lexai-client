import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Info,
  Menu,
  Scale,
  BarChart2,
  Calendar,
  Share2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DocumentDetailSkeleton from '../components/skeletons/DocumentDetailSkeleton';
import Sidebar from '../components/Sidebar';
import RiskHeatmap from '../components/RiskHeatmap';
import ShareModal from '../components/ShareModal';
import LawyerConnectCTA from '../components/LawyerConnectCTA';
import LegalResourcesModal from '../components/LegalResourcesModal';

const DocumentDetail = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // Default to Risk Overview
  
  // Collapsed clauses tracker (stores clause index key)
  const [expandedClauses, setExpandedClauses] = useState({});
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditingExpiry, setIsEditingExpiry] = useState(false);
  const [tempExpiryDate, setTempExpiryDate] = useState('');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const chatContainerRef = useRef(null);

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr);
    const now = new Date();
    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fetch document details helper
  const fetchDocument = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`/api/documents/${id}`, config);
      const fetchedDoc = response.data;
      setDoc(fetchedDoc);
      setChatMessages(fetchedDoc.chatHistory || []);

      // Language sync removed
    } catch (err) {
      console.error('Failed to fetch document:', err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 1. Initial Load on Mount
  useEffect(() => {
    if (token && id) {
      fetchDocument(true);
    }
  }, [id, token]);

  // 2. Polling Effect (triggers if status is not 'complete' or 'failed')
  useEffect(() => {
    let intervalId = null;

    if (doc && (doc.status === 'uploaded' || doc.status === 'analyzing')) {
      intervalId = setInterval(async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          };
          const response = await axios.get(`/api/documents/${id}`, config);
          const updatedDoc = response.data;
          
          setDoc(updatedDoc);
          setChatMessages(updatedDoc.chatHistory || []);

          if (updatedDoc.status === 'complete') {
            toast.success('AI Analysis completed!');
            clearInterval(intervalId);
          } else if (updatedDoc.status === 'failed') {
            toast.error('AI Analysis failed.');
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [doc?.status, id, token]);

  // 3. Auto Scroll Chat to Bottom (Scrolls internally to avoid page jumping)
  useEffect(() => {
    if (activeTab === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  // Handle report downloads
  const handleDownloadReport = async () => {
    if (!doc || doc.status !== 'complete') return;
    
    const toastId = toast.loading('Generating your report...');
    try {
      const res = await axios.get(`/api/documents/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `LexAI_Report_${doc.name.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Report downloaded successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      toast.error(errorMsg, { id: toastId });
    }
  };

  // Handle sending a chat message
  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    if (!textToSend) setInputMessage('');
    setSendingMessage(true);

    // Optimistically add user message to state
    const userMsg = { role: 'user', content: messageText, createdAt: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      };
      
      const response = await axios.post(`/api/documents/${id}/chat`, { message: messageText }, config);
      if (response.data && response.data.chatHistory) {
        setChatMessages(response.data.chatHistory);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'AI service unavailable. Try again shortly.';
      toast.error(errorMsg);
    } finally {
      setSendingMessage(false);
    }
  };

  // Language changed handler removed

  const handleSaveExpiry = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.patch(`/api/documents/${id}/expiry`, { expiryDate: tempExpiryDate }, config);
      setDoc(prev => ({ ...prev, expiryDate: response.data.expiryDate }));
      setIsEditingExpiry(false);
      toast.success('Expiry date updated!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update expiry date');
    }
  };

  const toggleClause = (idx) => {
    setExpandedClauses(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper styles for badges
  const getStatusDetails = (status) => {
    switch (status) {
      case 'complete':
        return { text: 'Complete', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'analyzing':
        return { text: 'Analyzing', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' };
      case 'uploaded':
        return { text: 'Uploaded', className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
      case 'failed':
        return { text: 'Failed', className: 'bg-rose-500/10 text-rose-455 border border-rose-500/20' };
      default:
        return { text: status || 'Unknown', className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
    }
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // 4. Render Loading Skeletons
  if (loading) {
    return (
      <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
        {/* Background glowing shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <Sidebar activePage="documents" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Mobile Header Bar */}
        <div className="h-16 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 text-indigo-400">
            <Scale className="h-6 w-6" />
            <span className="text-lg font-bold text-white tracking-wide">ScaleAI</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {getInitials(user?.name)}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 h-screen p-6 sm:p-8 lg:p-12 overflow-y-auto z-10">
          <div className="max-w-5xl mx-auto">
            <DocumentDetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center shadow-2xl relative z-10">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Document Not Found</h2>
          <p className="text-slate-400 text-sm mb-6 font-medium">The document you requested does not exist or has been deleted.</p>
          <Link to="/dashboard" className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white btn-gradient text-center shadow-lg transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDetails(doc.status);
  const riskInfo = getRiskDetails(doc.riskLevel);

  // Suggestions for chat
  const chatSuggestions = ['Is this agreement fair?', 'What are my rights?', 'Explain the payment terms'];

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar activePage="documents" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Header Bar */}
      <div className="h-16 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2 text-indigo-400">
          <Scale className="h-6 w-6" />
          <span className="text-lg font-bold text-white tracking-wide">LexAI</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-screen p-6 sm:p-8 lg:p-12 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* TOP HEADER BAR */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-start space-x-4 min-w-0">
              <Link 
                to="/dashboard" 
                className="p-2 bg-slate-900/40 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition border border-slate-800/50 hover:border-slate-700/50 shadow-md backdrop-blur-md mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-white truncate max-w-xl tracking-tight sm:text-3xl">
                    {doc.name}
                  </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {formatDocType(doc.type)}
                  </span>
                  <span className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </span>
                  
                  {/* Badges */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                  {doc.status === 'complete' && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskInfo.className}`}>
                      Risk: {riskInfo.text}
                    </span>
                  )}

                  {/* Expiry Date Section */}
                  {isEditingExpiry ? (
                    <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 shadow-md">
                      <input
                        type="date"
                        value={tempExpiryDate}
                        onChange={(e) => setTempExpiryDate(e.target.value)}
                        className="bg-[#030712] border border-white/10 text-xs rounded-lg px-2 py-1 text-white focus:outline-none"
                      />
                      <button 
                        onClick={handleSaveExpiry}
                        className="px-2 py-1 bg-emerald-500/15 text-emerald-400 hover:text-white rounded text-[10px] font-bold border border-emerald-500/20 transition cursor-pointer"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingExpiry(false)}
                        className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : doc.expiryDate ? (
                    <div className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      getDaysLeft(doc.expiryDate) !== null && getDaysLeft(doc.expiryDate) <= 7
                        ? 'bg-rose-500/10 text-rose-455 border-rose-500/20 shadow-sm shadow-rose-500/5'
                        : getDaysLeft(doc.expiryDate) !== null && getDaysLeft(doc.expiryDate) <= 30
                          ? 'bg-amber-500/10 text-amber-450 border-amber-500/20 shadow-sm shadow-amber-500/5'
                          : 'bg-slate-900/60 text-slate-350 border border-white/5'
                    }`}>
                      {getDaysLeft(doc.expiryDate) !== null && getDaysLeft(doc.expiryDate) <= 7 ? (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                      ) : getDaysLeft(doc.expiryDate) !== null && getDaysLeft(doc.expiryDate) <= 30 ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5 text-slate-450" />
                      )}
                      <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                      <button
                        onClick={() => {
                          setTempExpiryDate(doc.expiryDate.split('T')[0]);
                          setIsEditingExpiry(true);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-350 font-bold ml-1 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempExpiryDate('');
                        setIsEditingExpiry(true);
                      }}
                      className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/40 text-slate-500 hover:text-slate-355 border border-dashed border-slate-800 hover:border-slate-700 transition cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Set Expiry Date</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
              {doc.status === 'complete' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center justify-center p-3 bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-white rounded-xl border border-slate-800/50 hover:border-slate-700/50 shadow-md backdrop-blur-md transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
                  title="Share Analysis"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleDownloadReport}
                disabled={doc.status !== 'complete'}
                className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white btn-gradient disabled:opacity-40 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>
          </header>

          {/* POLLING ACTIVE BANNER */}
          {(doc.status === 'uploaded' || doc.status === 'analyzing') && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-amber-400 animate-pulse">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">AI analysis in progress...</p>
                <p className="text-xs text-amber-500/80 mt-0.5">
                  This process usually takes 30-60 seconds. The page will update automatically.
                </p>
              </div>
            </div>
          )}

          {/* LAWYER CONNECT CTA BANNER */}
          {doc.status === 'complete' && doc.riskLevel === 'risky' && (
            <LawyerConnectCTA 
              documentId={doc._id}
              riskyClausesCount={doc.clauses ? doc.clauses.filter(c => c.riskLevel === 'risky').length : 0}
              onGetLegalAidClick={() => setIsLegalModalOpen(true)}
            />
          )}
 
          {/* TAB CONTROLS */}
          <div className="glass-card p-1 rounded-2xl flex space-x-1.5 overflow-x-auto scrollbar-none w-fit border border-white/5">
            {['overview', 'summary', 'clauses', 'chat'].map((tab) => (
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
          <div className="min-h-[400px]">
            
            {/* TAB 0: RISK HEATMAP OVERVIEW */}
            {activeTab === 'overview' && (
              doc.status !== 'complete' ? (
                /* Skeleton loader for RiskOverview */
                <div className="space-y-6 max-w-5xl mx-auto">
                  <div className="glass-card rounded-3xl p-8 border border-white/5 animate-pulse flex flex-col items-center space-y-4">
                    <div className="h-32 w-32 rounded-full border-8 border-slate-800 border-t-transparent animate-spin" />
                    <div className="h-6 bg-slate-900 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-900 rounded w-1/2"></div>
                    <p className="text-xs text-slate-500 italic">AI is auditing contract risks... This page will update automatically.</p>
                  </div>
                </div>
              ) : (
                <RiskHeatmap 
                  clauses={doc.clauses} 
                  onClauseClick={(index) => {
                    // Expand the target clause card
                    setExpandedClauses(prev => ({
                      ...prev,
                      [index]: true
                    }));
                    // Switch to clauses tab
                    setActiveTab('clauses');
                    // Smooth scroll to the target card after tab render
                    setTimeout(() => {
                      const element = document.getElementById(`clause-card-${index}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }} 
                />
              )
            )}

            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Document Summary */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <h2 className="text-lg font-bold text-white mb-4 tracking-tight flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>Executive Summary</span>
                    </h2>
                    {doc.status !== 'complete' ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-900/60 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-slate-900/60 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-slate-900/60 rounded animate-pulse w-4/6"></div>
                        <p className="text-xs text-slate-500 italic mt-4">Waiting for AI analysis to construct summary...</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {doc.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Information Cards */}
                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
                    <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Key Information</h2>
                    
                    <div className="divide-y divide-white/5">
                      <div className="py-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400">Document Type</span>
                        <span className="text-xs font-bold text-white bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/5 capitalize">{doc.type.replace('_', ' ')}</span>
                      </div>
                      <div className="py-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400">Risk Level</span>
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold capitalize ${
                          doc.riskLevel === 'safe' 
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                            : doc.riskLevel === 'caution' 
                              ? 'bg-amber-500/10 text-amber-450 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                              : 'bg-rose-500/10 text-rose-450 border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        }`}>{doc.riskLevel || 'Pending'}</span>
                      </div>
                      <div className="py-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400">Created At</span>
                        <span className="text-xs font-bold text-slate-200">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="py-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400">Original File</span>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
                        >
                          <span>View PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLAUSE ANALYSIS */}
            {activeTab === 'clauses' && (
              <div className="space-y-6 max-w-5xl">
                {doc.status !== 'complete' || !doc.clauses || doc.clauses.length === 0 ? (
                  /* Analysis Placeholder */
                  <div className="glass-card rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
                    <div className="p-5 bg-slate-900/60 rounded-full text-indigo-400 mb-6 border border-slate-800/80 animate-pulse">
                      <FileText className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Analysis in progress</h3>
                    <p className="text-sm text-slate-400 max-w-md mt-3">
                      Our AI is currently auditing document covenants. Risks, breakdowns, and suggestions will be populated here shortly.
                    </p>
                  </div>
                ) : (
                  /* Clause Cards List */
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
                              <div className="mt-2.5 p-5 bg-slate-950/80 border border-slate-900/80 rounded-2xl text-sm font-mono text-slate-205 leading-relaxed italic border-l-4 border-indigo-500/50 shadow-inner">
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

            {/* TAB 3: CHAT PANEL */}
            {activeTab === 'chat' && (
              <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col h-[480px] sm:h-[550px] max-w-4xl relative">
                {/* Ambient Console Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header */}
                <div className="px-6 py-4 bg-slate-950/40 border-b border-white/5 flex items-center space-x-3 relative z-10">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Command Chat: <span className="text-white font-extrabold">{doc.name}</span>
                  </span>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20 scrollbar-thin overflow-x-hidden relative z-10"
                >
                  {chatMessages.length === 0 ? (
                    /* Empty Chat View */
                    <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-3">
                      <div className="p-4 bg-slate-900/60 rounded-full text-slate-500 border border-white/5 shadow-md">
                        <MessageSquare className="h-8 w-8 text-indigo-400/80" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Ask anything about this document</h4>
                      <p className="text-xs text-slate-400 max-w-xs font-medium leading-relaxed">
                        Inquire about liabilities, obligations, termination periods, or ask for clarifications.
                      </p>
                    </div>
                  ) : (
                    /* Message Bubbles list */
                    chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end pr-3' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] sm:max-w-md px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-lg border ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none border-indigo-500/20'
                            : 'bg-slate-950/50 text-slate-200 border-white/5 rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {sendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-slate-950/50 border border-white/5 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-md">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Starter Suggestions */}
                {chatMessages.length === 0 && (
                  <div className="px-6 py-3 border-t border-white/5 bg-slate-955/20 flex flex-wrap gap-2 relative z-10">
                    {chatSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3 py-1.5 bg-slate-900/60 hover:bg-indigo-600/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 text-xs font-semibold rounded-full border border-white/5 transition duration-150 cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Inputs */}
                <div className="p-4 bg-slate-950/40 border-t border-white/5 relative z-10">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <input
                      type="text"
                      disabled={sendingMessage}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your question about this document..."
                      className="flex-1 px-4 py-3 bg-[#030712]/60 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs text-white placeholder-slate-650 transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sendingMessage}
                      className="p-3 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-655 hover:to-violet-655 disabled:opacity-45 text-white rounded-xl transition flex items-center justify-center shadow-lg cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {doc.status === 'complete' && (
        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          documentId={doc._id}
          token={token}
          shareEnabled={doc.shareEnabled}
          shareToken={doc.shareToken}
          shareExpiresAt={doc.shareExpiresAt}
          onShareStateChanged={(newState) => {
            setDoc(prev => prev ? {
              ...prev,
              shareEnabled: newState.shareEnabled,
              shareToken: newState.shareToken,
              shareExpiresAt: newState.shareExpiresAt
            } : null);
          }}
        />
      )}
      <LegalResourcesModal 
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};

export default DocumentDetail;
