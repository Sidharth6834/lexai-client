import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Upload, 
  Scale, 
  Menu, 
  X, 
  Trash2, 
  Search, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ArrowUpDown
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Documents = () => {
  const { user, token } = useContext(AuthContext);
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
        console.warn('Silent polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documents, token]);

  // Delete document handler
  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`/api/documents/${id}`, config);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Helper for filter count
  const getCount = (status) => {
    if (status === 'all') return documents.length;
    if (status === 'complete') return documents.filter(d => d.status === 'complete').length;
    if (status === 'analyzing') return documents.filter(d => d.status === 'analyzing' || d.status === 'uploaded').length;
    if (status === 'failed') return documents.filter(d => d.status === 'failed').length;
    return 0;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and sort computation
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'complete') return doc.status === 'complete';
    if (statusFilter === 'analyzing') return doc.status === 'analyzing' || doc.status === 'uploaded';
    if (statusFilter === 'failed') return doc.status === 'failed';
    return true;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
        <div className="flex-1 p-5 sm:p-7 lg:p-10 max-w-6xl w-full mx-auto space-y-7">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#202227]">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D97706] font-semibold">Repository</span>
              <h1 className="text-3xl font-serif font-bold text-[#F4F3EF] tracking-tight sm:text-4xl mt-1">
                Legal Documents Vault
              </h1>
              <p className="text-xs text-[#8E8D88] mt-1">Browse, filter, and audit all uploaded contracts and covenants.</p>
            </div>
            <div>
              <Link 
                to="/upload" 
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New PDF</span>
              </Link>
            </div>
          </div>

          {/* Search, Filter, Sort Controls Panel - Swiss Minimalist Bar */}
          <div className="rounded-xl p-4 bg-[#131518] border border-[#202227] space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#575652]" />
                <input 
                  type="text"
                  placeholder="Search by document name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#8E8D88] hover:text-white rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#575652]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0A0B0D] border border-[#202227] rounded-lg px-3 py-2 text-xs font-mono font-medium text-[#8E8D88] focus:outline-none focus:border-[#D97706] transition cursor-pointer"
                >
                  <option value="newest">Upload Date: Newest First</option>
                  <option value="oldest">Upload Date: Oldest First</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>

            </div>

            {/* Status Tabs Bar */}
            <div className="border-t border-[#202227] pt-3 flex overflow-x-auto scrollbar-none gap-2">
              {[
                { id: 'all', label: 'All Documents' },
                { id: 'complete', label: 'Complete', icon: CheckCircle2, color: 'text-[#10B981]' },
                { id: 'analyzing', label: 'Analyzing', icon: Clock, color: 'text-[#D97706]' },
                { id: 'failed', label: 'Failed', icon: AlertTriangle, color: 'text-[#E11D48]' }
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition flex-shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-[#181A1F] text-[#F4F3EF] border border-[#2A2C34] shadow-sm font-semibold' 
                        : 'text-[#8E8D88] hover:text-[#F4F3EF] hover:bg-[#181A1F]/50 border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className={`h-3.5 w-3.5 ${tab.color}`} />}
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      isActive ? 'bg-[#D97706] text-white' : 'bg-[#0A0B0D] text-[#8E8D88]'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#131518] border border-[#202227] rounded-xl h-[180px] animate-pulse" />
              ))}
            </div>
          ) : sortedDocuments.length === 0 ? (
            /* EMPTY VIEW */
            <div className="rounded-xl p-12 text-center flex flex-col items-center justify-center bg-[#131518] border border-[#202227]">
              <div className="p-3 bg-[#181A1F] rounded-lg text-[#8E8D88] border border-[#202227] mb-3">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#F4F3EF] mb-1">No documents found</h3>
              <p className="text-[#8E8D88] text-xs max-w-md mb-5">
                {searchQuery || statusFilter !== 'all' 
                  ? "We couldn't find any documents matching your active search query or status filters." 
                  : "You haven't uploaded any PDF documents yet. Upload a document to start audit reviews."}
              </p>
              {(searchQuery || statusFilter !== 'all') ? (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="px-4 py-2 bg-[#181A1F] text-[#C6C5BF] hover:bg-[#202227] text-xs font-semibold rounded-lg border border-[#2A2C34] transition cursor-pointer"
                >
                  Clear Search & Filters
                </button>
              ) : (
                <Link 
                  to="/upload" 
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload PDF</span>
                </Link>
              )}
            </div>
          ) : (
            /* DYNAMIC DOCUMENTS CARDS - Swiss Minimalist Precision */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDocuments.map((doc) => {
                let statusBg = 'bg-[#181A1F] text-[#8E8D88] border-[#2A2C34]';
                let statusDot = 'bg-[#8E8D88]';
                let statusText = doc.status;

                if (doc.status === 'complete') {
                  statusBg = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25';
                  statusDot = 'bg-[#10B981]';
                  statusText = 'Complete';
                } else if (doc.status === 'analyzing' || doc.status === 'uploaded') {
                  statusBg = 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30';
                  statusDot = 'bg-[#D97706] animate-pulse';
                  statusText = 'Analyzing';
                } else if (doc.status === 'failed') {
                  statusBg = 'bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]/25';
                  statusDot = 'bg-[#E11D48]';
                  statusText = 'Failed';
                }

                let riskBg = 'bg-[#181A1F] text-[#8E8D88] border-[#2A2C34]';
                let riskLabel = 'Not Evaluated';
                if (doc.status === 'complete') {
                  if (doc.riskLevel === 'safe' || doc.riskScore === 'Safe') {
                    riskBg = 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25';
                    riskLabel = 'Low Risk';
                  } else if (doc.riskLevel === 'caution' || doc.riskScore === 'Caution') {
                    riskBg = 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30';
                    riskLabel = 'Caution';
                  } else if (doc.riskLevel === 'risky' || doc.riskScore === 'Risky') {
                    riskBg = 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/25';
                    riskLabel = 'High Risk';
                  }
                }

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
                    className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition-all duration-150 flex flex-col justify-between group shadow-sm"
                  >
                    {/* Card Header Info */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#181A1F] text-[#8E8D88] rounded border border-[#2A2C34]">
                          {getDocTypeLabel(doc.type)}
                        </span>
                        
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 text-[9px] font-mono font-medium rounded border ${statusBg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`}></span>
                          <span>{statusText}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold text-[#F4F3EF] group-hover:text-white transition truncate" title={doc.name}>
                          {doc.name}
                        </h3>
                        <p className="text-[11px] text-[#8E8D88] line-clamp-2 h-7" title={doc.description}>
                          {doc.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#202227] text-[10px] text-[#8E8D88] font-mono">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-[#575652]" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                        {doc.status === 'complete' && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${riskBg}`}>
                            {riskLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 mt-3 border-t border-[#202227] flex items-center justify-between gap-2">
                      {doc.status === 'complete' ? (
                        <Link
                          to={`/document/${doc._id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-semibold transition"
                        >
                          <span>View Audit</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : doc.status === 'failed' ? (
                        <span className="flex-1 text-center py-1.5 px-3 bg-rose-500/10 border border-rose-500/20 text-[#E11D48] rounded-lg text-xs font-mono font-medium">
                          Analysis Failed
                        </span>
                      ) : (
                        <div className="flex-1 flex items-center justify-center space-x-2 py-1.5 px-3 bg-[#181A1F] border border-[#202227] text-[#8E8D88] rounded-lg text-xs font-mono">
                          <div className="animate-spin h-3 w-3 border-2 border-[#D97706] border-t-transparent rounded-full" />
                          <span>Auditing...</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleDeleteDocument(doc._id, e)}
                        className="p-1.5 text-[#8E8D88] hover:text-[#E11D48] hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
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
