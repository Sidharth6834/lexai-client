import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  LogOut, 
  Scale, 
  Menu, 
  X, 
  Trash2, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Documents = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Component states
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, complete, analyzing, failed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name_asc, name_desc

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/documents', config);
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  // Polling for analyzing documents (every 5 seconds)
  useEffect(() => {
    if (!token) return;
    
    const hasAnalyzing = documents.some(doc => 
      doc.status === 'analyzing' || doc.status === 'uploaded'
    );

    if (!hasAnalyzing) return;

    const interval = setInterval(async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get('/api/documents', config);
        setDocuments(response.data || []);
      } catch (err) {
        console.error('Error polling documents:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documents, token]);

  // Handle Document Deletion
  const handleDeleteDocument = async (docId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    const toastId = toast.loading('Deleting document...');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`/api/documents/${docId}`, config);
      toast.success('Document deleted successfully', { id: toastId });
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete document', { id: toastId });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper: Format initials for profile icon
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Filtering and Sorting logic
  const filteredDocuments = documents.filter((doc) => {
    // Search query filter
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'complete') return matchesSearch && doc.status === 'complete';
    if (statusFilter === 'failed') return matchesSearch && doc.status === 'failed';
    if (statusFilter === 'analyzing') return matchesSearch && (doc.status === 'analyzing' || doc.status === 'uploaded');
    
    return matchesSearch;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name_desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Count helper for badge tabs
  const getCount = (status) => {
    if (status === 'all') return documents.length;
    if (status === 'complete') return documents.filter(d => d.status === 'complete').length;
    if (status === 'analyzing') return documents.filter(d => d.status === 'analyzing' || d.status === 'uploaded').length;
    if (status === 'failed') return documents.filter(d => d.status === 'failed').length;
    return 0;
  };

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glowing bubbles */}
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
          <span className="text-lg font-bold text-white tracking-wide">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto z-10">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">My Legal Documents</h1>
              <p className="text-sm text-slate-400 mt-1">Browse, filter, and manage all your analyzed documents.</p>
            </div>
            <div>
              <Link 
                to="/upload" 
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New PDF</span>
              </Link>
            </div>
          </div>

          {/* Search, Filter, Sort Controls Panel */}
          <div className="glass-card rounded-3xl p-5 shadow-2xl space-y-5 bg-slate-900/30">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search by document name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                >
                  <option value="newest">Upload Date: Newest First</option>
                  <option value="oldest">Upload Date: Oldest First</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>

            </div>

            {/* Status Tabs Bar */}
            <div className="border-t border-slate-900/60 pt-4 flex overflow-x-auto scrollbar-none gap-2">
              {[
                { id: 'all', label: 'All Documents' },
                { id: 'complete', label: 'Complete', icon: CheckCircle2, color: 'text-emerald-450' },
                { id: 'analyzing', label: 'Analyzing', icon: Clock, color: 'text-indigo-400' },
                { id: 'failed', label: 'Failed', icon: AlertTriangle, color: 'text-rose-450' }
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-800/80 text-white border border-slate-700 shadow-md shadow-black/10' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className={`h-3.5 w-3.5 ${tab.color}`} />}
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-500'
                    }`}>
                      {getCount(tab.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DOCUMENTS GRID / LIST VIEW */}
          {loading ? (
            /* SKELETON LOADERS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-3xl h-[200px]" />
              ))}
            </div>
          ) : sortedDocuments.length === 0 ? (
            /* EMPTY VIEW */
            <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
              <div className="p-4 bg-slate-900/60 rounded-full text-slate-500 border border-slate-800 mb-4">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No documents found</h3>
              <p className="text-slate-400 text-sm max-w-md mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? "We couldn't find any documents matching your active search query or status filters." 
                  : "You haven't uploaded any PDF documents yet. Upload a document to start audit reviews."}
              </p>
              {(searchQuery || statusFilter !== 'all') ? (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="px-5 py-2.5 bg-slate-900/60 text-slate-350 hover:bg-slate-800 font-semibold rounded-xl text-sm border border-slate-800 transition cursor-pointer"
                >
                  Clear Search & Filters
                </button>
              ) : (
                <Link 
                  to="/upload" 
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload PDF</span>
                </Link>
              )}
            </div>
          ) : (
            /* DYNAMIC DOCUMENTS CARDS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDocuments.map((doc) => {
                // Determine status badge config
                let statusBg = 'bg-slate-550/10 text-slate-400 border-slate-500/20';
                let statusDot = 'bg-slate-400';
                let statusText = doc.status;

                if (doc.status === 'complete') {
                  statusBg = 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25';
                  statusDot = 'bg-emerald-400';
                  statusText = 'Complete';
                } else if (doc.status === 'analyzing' || doc.status === 'uploaded') {
                  statusBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
                  statusDot = 'bg-indigo-450 animate-pulse';
                  statusText = 'Analyzing';
                } else if (doc.status === 'failed') {
                  statusBg = 'bg-rose-500/10 text-rose-450 border-rose-500/25';
                  statusDot = 'bg-rose-450';
                  statusText = 'Failed';
                }

                // Determine risk badge config
                let riskBg = 'bg-slate-900 text-slate-400';
                let riskLabel = 'Not Evaluated';
                if (doc.status === 'complete') {
                  if (doc.riskLevel === 'safe' || doc.riskScore === 'Safe') {
                    riskBg = 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
                    riskLabel = 'Low Risk';
                  } else if (doc.riskLevel === 'caution' || doc.riskScore === 'Caution') {
                    riskBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    riskLabel = 'Medium Risk';
                  } else if (doc.riskLevel === 'risky' || doc.riskScore === 'Risky') {
                    riskBg = 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
                    riskLabel = 'High Risk';
                  }
                }

                // Format document type label
                const getDocTypeLabel = (type) => {
                  if (!type) return 'Other';
                  return type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                };

                return (
                  <div 
                    key={doc._id}
                    className="glass-card hover:border-slate-700 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 transform"
                  >
                    {/* Card Header Info */}
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        {/* Type badge */}
                        <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                          {getDocTypeLabel(doc.type)}
                        </span>
                        
                        {/* Status badge */}
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${statusBg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`}></span>
                          <span>{statusText}</span>
                        </span>
                      </div>

                      {/* Name & Desc */}
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition truncate" title={doc.name}>
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 h-8" title={doc.description}>
                          {doc.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Upload timestamp and risk indicator */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-900/60 text-[10px] text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-650" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                        {doc.status === 'complete' && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase ${riskBg}`}>
                            {riskLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="bg-slate-950/20 px-5 py-3 border-t border-slate-900/60 flex items-center justify-between gap-4">
                      {doc.status === 'complete' ? (
                        <Link
                          to={`/document/${doc._id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition duration-150 btn-gradient"
                        >
                          <span>View Audit</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : doc.status === 'failed' ? (
                        <span className="flex-1 text-center py-2 px-3 bg-rose-500/5 border border-rose-500/10 text-rose-450 rounded-xl text-xs font-semibold">
                          Analysis Failed
                        </span>
                      ) : (
                        <div className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900/40 border border-slate-900 text-slate-500 rounded-xl text-xs font-semibold">
                          <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                          <span>Auditing...</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleDeleteDocument(doc._id, e)}
                        className="p-2 text-slate-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Documents;
