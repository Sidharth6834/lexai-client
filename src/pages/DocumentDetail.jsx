import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
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
  Share2, 
  AlertOctagon, 
  RefreshCw,
  AlertCircle
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
  const [retrying, setRetrying] = useState(false);
  
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
          console.warn('Silent polling error:', err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [doc?.status, id, token]);

  // 3. Scroll to bottom of chat — use requestAnimationFrame to ensure DOM has painted
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };
    // Double-RAF ensures the browser has completed layout and paint before scrolling
    requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
  }, [chatMessages, activeTab, sendingMessage]);

  // Handle retrying failed analysis
  const handleRetryAnalysis = async () => {
    try {
      setRetrying(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post(`/api/documents/${id}/retry`, {}, config);
      
      setDoc(prev => prev ? { ...prev, status: 'uploaded' } : null);
      toast.success('Retrying document analysis...');
    } catch (err) {
      console.error('Failed to retry analysis:', err);
      toast.error(err.response?.data?.message || 'Failed to retry analysis');
    } finally {
      setRetrying(false);
    }
  };

  // Handle report downloads
  const handleDownloadReport = async () => {
    if (!doc || doc.status !== 'complete') return;

    try {
      toast.loading('Preparing audit dossier report...', { id: 'download' });
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      };

      const response = await axios.get(`/api/documents/${id}/report`, config);

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${doc.name || 'document'}_audit_report.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
          // Ensure .pdf extension even if server sends without it
          if (!filename.endsWith('.pdf')) filename = filename.replace(/\.[^.]+$/, '') + '.pdf';
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Dossier downloaded successfully!', { id: 'download' });
    } catch (err) {
      console.error('Failed to download report:', err);
      toast.error('Failed to download report', { id: 'download' });
    }
  };

  // Handle message submission
  const handleSendMessage = async (customMessage = null) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() || sendingMessage) return;

    const newMessage = { role: 'user', content: textToSend };
    setChatMessages((prev) => [...prev, newMessage]);
    if (!customMessage) setInputMessage('');
    setSendingMessage(true);

    // Immediately scroll to bottom after adding user message
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        `/api/documents/${id}/chat`,
        { message: textToSend },
        config
      );

      // Server returns { response: "...", chatHistory: [...] }
      // Use the full chatHistory from server to stay perfectly in sync with DB
      if (response.data.chatHistory && response.data.chatHistory.length > 0) {
        setChatMessages(response.data.chatHistory);
      } else {
        // Fallback: append just the reply text
        const replyText = response.data.response || response.data.reply || 'No response received.';
        setChatMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
      }

      // Scroll after assistant reply is added
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      const errMsg = err.response?.data?.message || 'Failed to get answer';
      toast.error(errMsg);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠ ${errMsg}. Please try again.` }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSaveExpiry = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.patch(
        `/api/documents/${id}/expiry`,
        { expiryDate: tempExpiryDate },
        config
      );
      setDoc(prev => ({
        ...prev,
        expiryDate: response.data.expiryDate,
        expiryAlertSent: false
      }));
      setIsEditingExpiry(false);
      toast.success('Expiry date updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update expiry date');
    }
  };

  const toggleClause = (idx) => {
    setExpandedClauses(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'complete':
        return { text: 'Complete', className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' };
      case 'analyzing':
        return { text: 'Analyzing', className: 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 animate-pulse' };
      case 'uploaded':
        return { text: 'Uploaded', className: 'bg-[#181A1F] text-[#8E8D88] border border-[#202227]' };
      case 'failed':
        return { text: 'Failed', className: 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/25' };
      default:
        return { text: status || 'Unknown', className: 'bg-[#181A1F] text-[#8E8D88] border border-[#202227]' };
    }
  };

  const getRiskDetails = (risk) => {
    switch (risk) {
      case 'safe':
        return { text: 'Safe', className: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' };
      case 'caution':
        return { text: 'Caution', className: 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30' };
      case 'risky':
        return { text: 'Risky', className: 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/25' };
      default:
        return { text: 'Not Reviewed', className: 'bg-[#181A1F] text-[#8E8D88] border border-[#202227]' };
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
      <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
        <Sidebar activePage="documents" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Mobile Header Bar */}
        <div className="h-16 bg-[#0E0F12] border-b border-[#202227] flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-[#8E8D88] hover:text-white hover:bg-[#181A1F] rounded-lg transition"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 text-[#D97706]">
            <Scale className="h-5 w-5" />
            <span className="font-serif text-lg font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-xs font-semibold">
            {getInitials(user?.name)}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 h-screen p-5 sm:p-7 lg:p-10 overflow-y-auto z-10">
          <div className="max-w-5xl mx-auto">
            <DocumentDetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
        <div className="p-8 rounded-xl bg-[#131518] border border-[#202227] max-w-md w-full text-center flex flex-col items-center shadow-xl relative z-10">
          <AlertCircle className="h-10 w-10 text-[#E11D48] mb-3" />
          <h2 className="text-lg font-serif font-bold text-[#F4F3EF] mb-1 tracking-tight">Document Not Found</h2>
          <p className="text-[#8E8D88] text-xs mb-5">The document you requested does not exist or has been removed from the vault.</p>
          <Link to="/dashboard" className="w-full py-2 px-4 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] text-center shadow-sm transition">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDetails(doc.status);
  const riskInfo = getRiskDetails(doc.riskLevel);
  const chatSuggestions = ['Is this agreement fair?', 'What are my liabilities?', 'Explain the termination & dispute clauses'];

  return (
    <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
      <Sidebar activePage="documents" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Top Bar */}
      <div className="h-16 bg-[#0E0F12] border-b border-[#202227] flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-[#8E8D88] hover:text-white hover:bg-[#181A1F] rounded-lg transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 text-[#D97706]">
          <Scale className="h-5 w-5" />
          <span className="font-serif text-lg font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-xs font-semibold">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto z-10">
        <div className="flex-1 p-5 sm:p-7 lg:p-10 max-w-5xl w-full mx-auto space-y-6">
          
          {/* TOP HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#202227]">
            <div className="flex items-start space-x-3.5 min-w-0 flex-1">
              <Link 
                to="/documents" 
                className="p-2 bg-[#131518] rounded-lg hover:bg-[#181A1F] text-[#8E8D88] hover:text-[#F4F3EF] transition border border-[#202227] shadow-sm shrink-0"
                title="Back to Documents"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-[#D97706] font-semibold">Audit Dossier</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F4F3EF] truncate max-w-2xl mt-0.5">
                  {doc.name}
                </h1>
                
                {/* Meta details row */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181A1F] text-[#8E8D88] border border-[#2A2C34]">
                    {formatDocType(doc.type)}
                  </span>
                  
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-[#8E8D88]">
                    <Clock className="h-3 w-3 text-[#575652]" />
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${riskInfo.className}`}>
                    {riskInfo.text}
                  </span>

                  {/* Expiry Pill */}
                  {doc.expiryDate ? (
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#181A1F] text-[#8E8D88] border border-[#2A2C34]">
                      <Calendar className="h-3 w-3 text-[#D97706] shrink-0" />
                      <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                      {(() => {
                        const days = getDaysLeft(doc.expiryDate);
                        if (days !== null) {
                          if (days < 0) {
                            return <span className="text-[#E11D48] font-bold">(Expired)</span>;
                          } else if (days <= 30) {
                            return <span className="text-[#D97706] font-bold">({days}d left)</span>;
                          }
                        }
                        return null;
                      })()}
                      <button
                        onClick={() => {
                          setTempExpiryDate(doc.expiryDate ? doc.expiryDate.split('T')[0] : '');
                          setIsEditingExpiry(true);
                        }}
                        className="text-[#D97706] hover:underline ml-1 cursor-pointer"
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
                      className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#181A1F] text-[#8E8D88] hover:text-[#F4F3EF] border border-[#202227] hover:border-[#2A2C34] transition cursor-pointer"
                    >
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Set Expiry Date</span>
                    </button>
                  )}
                </div>

                {/* Expiry Date Editing Popup Inline */}
                {isEditingExpiry && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#181A1F] border border-[#202227] flex flex-wrap items-center gap-2">
                    <input 
                      type="date" 
                      value={tempExpiryDate}
                      onChange={(e) => setTempExpiryDate(e.target.value)}
                      className="px-2 py-1 bg-[#0A0B0D] border border-[#202227] rounded text-xs font-mono text-[#F4F3EF] focus:outline-none focus:border-[#D97706]"
                    />
                    <button 
                      onClick={handleSaveExpiry}
                      className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold rounded"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingExpiry(false)}
                      className="px-2.5 py-1 text-xs text-[#8E8D88] hover:text-[#F4F3EF]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {doc.status === 'complete' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 bg-[#131518] hover:bg-[#181A1F] text-[#8E8D88] hover:text-[#D97706] rounded-lg border border-[#202227] shadow-sm transition cursor-pointer"
                  title="Share Analysis"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDownloadReport}
                disabled={doc.status !== 'complete'}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </header>

          {/* POLLING ACTIVE BANNER */}
          {(doc.status === 'uploaded' || doc.status === 'analyzing') && (
            <div className="bg-[#181A1F] border border-[#D97706]/30 rounded-xl p-3.5 flex items-start space-x-3 text-[#D97706] animate-pulse">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#F4F3EF]">Algorithmic Legal Audit in Progress</p>
                <p className="text-[11px] text-[#8E8D88] mt-0.5 font-mono">
                  Extracting clauses, matching against legal benchmarks, and generating risk scores. This page will update automatically.
                </p>
              </div>
            </div>
          )}

          {/* FAILED BANNER */}
          {doc.status === 'failed' && (
            <div className="bg-[#181114] border border-[#E11D48]/35 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#E11D48]">
              <div className="flex items-start space-x-3">
                <AlertOctagon className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#F4F3EF]">Analysis Operation Failed</p>
                  <p className="text-[11px] text-[#8E8D88] font-mono mt-0.5">
                    An error occurred during covenant parsing or AI processing. Click retry to rerun the pipeline.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetryAnalysis}
                disabled={retrying}
                className="px-3 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                {retrying ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry Analysis</span>
                  </>
                )}
              </button>
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

          {/* TAB CONTROLS - Swiss Segmented Controls */}
          <div className="p-1 rounded-lg bg-[#131518] border border-[#202227] flex space-x-1 overflow-x-auto scrollbar-none w-fit">
            {[
              { id: 'overview', label: 'Risk Overview', icon: BarChart2 },
              { id: 'summary', label: 'Summary' },
              { id: 'clauses', label: 'Clause Analysis' },
              { id: 'chat', label: 'Interactive Chat', icon: MessageSquare }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-[#181A1F] text-[#F4F3EF] border border-[#2A2C34] shadow-sm font-semibold' 
                      : 'text-[#8E8D88] hover:text-[#F4F3EF] hover:bg-[#181A1F]/40 border border-transparent'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[400px]">
            
            {/* TAB 0: RISK HEATMAP OVERVIEW */}
            {activeTab === 'overview' && (
              doc.status === 'failed' ? (
                <div className="p-10 rounded-xl bg-[#131518] border border-[#202227] flex flex-col items-center space-y-3 text-center">
                  <AlertOctagon className="h-8 w-8 text-[#E11D48]" />
                  <h3 className="text-sm font-serif font-bold text-[#F4F3EF]">Analysis Failed</h3>
                  <p className="text-xs text-[#8E8D88] max-w-md font-mono">
                    The legal risk audit failed to complete. Click "Retry Analysis" above to re-trigger analysis.
                  </p>
                </div>
              ) : doc.status !== 'complete' ? (
                <div className="p-10 rounded-xl bg-[#131518] border border-[#202227] flex flex-col items-center space-y-3 animate-pulse">
                  <div className="h-20 w-20 rounded-full border-4 border-[#181A1F] border-t-[#D97706] animate-spin" />
                  <p className="text-xs font-mono text-[#8E8D88]">Auditing contract covenants against regulatory standards...</p>
                </div>
              ) : (
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
              )
            )}

            {/* TAB 1: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-6 rounded-xl bg-[#131518] border border-[#202227] shadow-sm space-y-3">
                    <div className="flex items-center space-x-2 text-[#D97706]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                      <h2 className="text-base font-serif font-bold text-[#F4F3EF]">Executive Audit Summary</h2>
                    </div>
                    {doc.status === 'failed' ? (
                      <p className="text-xs text-[#8E8D88] font-mono">Summary unavailable due to analysis failure.</p>
                    ) : doc.status !== 'complete' ? (
                      <div className="space-y-2 pt-2">
                        <div className="h-3 bg-[#181A1F] rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-[#181A1F] rounded w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-[#181A1F] rounded w-4/6 animate-pulse"></div>
                      </div>
                    ) : !doc.summary ? (
                      <p className="text-xs text-[#8E8D88] italic">No summary text available.</p>
                    ) : (
                      <p className="text-xs leading-relaxed text-[#C6C5BF]">
                        {doc.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Information Cards */}
                <div>
                  <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm space-y-3">
                    <h2 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider">Document Metadata</h2>
                    
                    <div className="divide-y divide-[#202227] text-xs font-mono">
                      <div className="py-2.5 flex justify-between items-center">
                        <span className="text-[#8E8D88]">Type</span>
                        <span className="text-[#F4F3EF] capitalize">{doc.type.replace('_', ' ')}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <span className="text-[#8E8D88]">Risk Level</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${riskInfo.className}`}>
                          {doc.riskLevel || 'Pending'}
                        </span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <span className="text-[#8E8D88]">Uploaded</span>
                        <span className="text-[#F4F3EF]">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center">
                        <span className="text-[#8E8D88]">Raw File</span>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#D97706] hover:underline flex items-center space-x-1"
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
              <div className="space-y-4 max-w-5xl">
                {doc.status === 'failed' ? (
                  <div className="p-12 text-center rounded-xl bg-[#131518] border border-[#202227]">
                    <AlertOctagon className="h-8 w-8 text-[#E11D48] mx-auto mb-2" />
                    <h3 className="text-sm font-serif font-bold text-[#F4F3EF]">Clause Breakdown Unavailable</h3>
                    <p className="text-xs text-[#8E8D88] font-mono mt-1">Covenants could not be extracted.</p>
                  </div>
                ) : doc.status !== 'complete' ? (
                  <div className="p-12 text-center rounded-xl bg-[#131518] border border-[#202227]">
                    <FileText className="h-8 w-8 text-[#D97706] mx-auto mb-2 animate-pulse" />
                    <h3 className="text-sm font-serif font-bold text-[#F4F3EF]">Analysis in progress</h3>
                    <p className="text-xs text-[#8E8D88] font-mono mt-1">Extracting individual covenants and drafting AI suggestions...</p>
                  </div>
                ) : !doc.clauses || doc.clauses.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-[#131518] border border-[#202227]">
                    <Info className="h-8 w-8 text-[#8E8D88] mx-auto mb-2" />
                    <h3 className="text-sm font-serif font-bold text-[#F4F3EF]">No Standard Clauses Detected</h3>
                    <p className="text-xs text-[#8E8D88] font-mono mt-1">Document did not contain readable legal covenants.</p>
                  </div>
                ) : (
                  doc.clauses.map((clause, index) => {
                    const isExpanded = !!expandedClauses[index];
                    const clRisk = getRiskDetails(clause.riskLevel);
                    
                    return (
                      <div 
                        key={clause._id || index}
                        id={`clause-card-${index}`}
                        className="rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition overflow-hidden shadow-sm"
                      >
                        {/* Clause Title & Header */}
                        <div 
                          onClick={() => toggleClause(index)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center space-x-3 min-w-0 pr-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${clRisk.className}`}>
                              {clRisk.text}
                            </span>
                            <h3 className="text-xs font-semibold text-[#F4F3EF] truncate">{clause.title}</h3>
                          </div>
                          <div className="text-[#8E8D88] hover:text-[#F4F3EF] p-1 rounded transition shrink-0">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>

                        {/* Expandable Body */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-[#202227] space-y-4">
                            {/* Original Text */}
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88]">Original Contract Covenant</span>
                              <div className="mt-1.5 p-3.5 bg-[#0A0B0D] border-l-2 border-[#D97706] border border-[#202227] rounded text-xs font-mono text-[#C6C5BF] leading-relaxed italic">
                                "{clause.originalText}"
                              </div>
                            </div>

                            {/* Plain English Explanation */}
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88]">Plain English Analysis</span>
                              <p className="mt-1 text-xs leading-relaxed text-[#F4F3EF]">
                                {clause.explanation}
                              </p>
                            </div>

                            {/* Our Suggestion */}
                            {(clause.riskLevel === 'caution' || clause.riskLevel === 'risky') && (
                              <div className="bg-[#181A1F] border border-[#2A2C34] rounded-lg p-3.5 space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97706] font-semibold">Recommended Modification</span>
                                <p className="text-xs leading-relaxed text-[#C6C5BF]">
                                  {clause.suggestion}
                                </p>
                              </div>
                            )}
                            {clause.riskLevel === 'risky' && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setIsLegalModalOpen(true)}
                                  className="text-xs font-mono font-medium text-[#D97706] hover:underline cursor-pointer"
                                >
                                  Need assistance with this clause? Consult free legal resources →
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

            {/* TAB 3: CHAT PANEL - Swiss Minimalist Terminal */}
            {activeTab === 'chat' && (
              <div className="rounded-xl bg-[#131518] border border-[#202227] overflow-hidden shadow-xl flex flex-col h-[480px] sm:h-[520px] max-w-4xl relative">
                
                {/* Header */}
                <div className="px-5 py-3 bg-[#0E0F12] border-b border-[#202227] flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#D97706]">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-mono font-medium text-[#F4F3EF]">
                      Covenant Query Engine: <span className="text-[#8E8D88]">{doc.name}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#575652] uppercase">RAG v3.8</span>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#0A0B0D]/60"
                >
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-2">
                      <div className="p-3 bg-[#181A1F] rounded-lg text-[#D97706] border border-[#202227]">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <h4 className="text-xs font-serif font-bold text-[#F4F3EF]">Inquire About This Contract</h4>
                      <p className="text-xs text-[#8E8D88] max-w-xs font-mono leading-relaxed">
                        Query indemnities, non-competes, payment terms, or unilateral termination covenants.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] sm:max-w-md px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#181A1F] text-[#F4F3EF] border border-[#2A2C34]'
                            : 'bg-[#131518] text-[#C6C5BF] border border-[#202227]'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}

                  {sendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-[#131518] border border-[#202227] text-[#8E8D88] px-3 py-2 rounded-lg flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Starter Suggestions */}
                {chatMessages.length === 0 && (
                  <div className="px-4 py-2 border-t border-[#202227] bg-[#0E0F12] flex flex-wrap gap-1.5">
                    {chatSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1 bg-[#181A1F] hover:bg-[#202227] text-[#8E8D88] hover:text-[#F4F3EF] text-[11px] font-mono rounded border border-[#202227] transition cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Inputs */}
                <div className="p-3 bg-[#0E0F12] border-t border-[#202227]">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <input
                      type="text"
                      disabled={sendingMessage || doc.status === 'failed'}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={doc.status === 'failed' ? "Chat unavailable because analysis failed." : "Type your legal inquiry about this contract..."}
                      className="flex-1 px-3 py-2 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sendingMessage || doc.status === 'failed'}
                      className="px-3 py-2 bg-[#D97706] hover:bg-[#B45309] disabled:opacity-40 text-white rounded-lg transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
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
