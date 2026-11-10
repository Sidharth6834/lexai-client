import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Scale, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Menu,
  Trash2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fallback mock data in case API request fails
  const mockStats = {
    totalDocuments: 5,
    analysesComplete: 3,
    riskAlerts: 1
  };

  const mockDocs = [
    {
      _id: '1',
      name: 'Non-Disclosure Agreement (NDA) - TechCorp.pdf',
      type: 'NDA',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      status: 'Complete',
      riskScore: 'Safe'
    },
    {
      _id: '2',
      name: 'Office Lease Agreement - Downtown Realty.pdf',
      type: 'Lease',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      status: 'Complete',
      riskScore: 'Caution'
    },
    {
      _id: '3',
      name: 'Software License Terms of Service.pdf',
      type: 'Terms of Service',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'Analyzing',
      riskScore: 'Safe'
    },
    {
      _id: '4',
      name: 'Executive Employment Contract - Jane Doe.pdf',
      type: 'Employment Contract',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      status: 'Complete',
      riskScore: 'Risky'
    },
    {
      _id: '5',
      name: 'Vendor Services SLA - Failed Upload.pdf',
      type: 'SLA',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: 'Failed',
      riskScore: 'Caution'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [statsRes, docsRes] = await Promise.all([
          axios.get('/api/documents/stats', config),
          axios.get('/api/documents', config)
        ]);

        setStats(statsRes.data);
        setDocuments(docsRes.data);
      } catch (err) {
        console.warn('API error, falling back to mock data:', err);
        const errorMsg = err.response?.data?.message || 'Something went wrong';
        toast.error(errorMsg);
        setStats(mockStats);
        setDocuments(mockDocs);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/documents/${docId}`, config);
      setDocuments(prev => prev.filter(d => d._id !== docId));
      
      if (stats) {
        setStats(prev => ({
          ...prev,
          totalDocuments: Math.max(0, prev.totalDocuments - 1)
        }));
      }
      
      toast.success('Document deleted');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      toast.error(errorMsg);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Badges styling functions - Swiss Precision
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complete':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">Complete</span>;
      case 'Analyzing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 animate-pulse">Analyzing</span>;
      case 'Failed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/25">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#181A1F] text-[#8E8D88] border border-[#202227]">{status}</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">Safe</span>;
      case 'Caution':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30">Caution</span>;
      case 'Risky':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/25">Risky</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#181A1F] text-[#8E8D88] border border-[#202227]">{risk || 'Unrated'}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
      <Sidebar activePage="dashboard" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

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
      <main className="flex-1 min-w-0 h-screen p-6 sm:p-8 lg:p-10 overflow-y-auto z-10">
        <div className="max-w-6xl mx-auto space-y-7">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#202227]">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D97706] font-semibold">Executive Overview</span>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-[#F4F3EF] sm:text-4xl mt-1">
                Welcome back, {user?.name || 'Counsel'}
              </h1>
              <p className="mt-1 text-xs text-[#8E8D88]">
                Review your active contract audit intelligence, liabilities, and covenants.
              </p>
            </div>
            <div>
              <Link 
                to="/upload" 
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] border border-amber-400/20 shadow-sm transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Contract</span>
              </Link>
            </div>
          </header>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-7">
              {/* STATS ROW - Swiss Minimalist Precision */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Documents */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8E8D88] font-semibold">Total Documents</p>
                    <p className="text-3xl font-mono font-bold text-[#F4F3EF] mt-2 tracking-tight">{stats?.totalDocuments || 0}</p>
                    <p className="text-[10px] text-[#575652] font-mono mt-1">Vault contracts</p>
                  </div>
                  <div className="p-3 bg-[#181A1F] rounded-lg text-[#F4F3EF] border border-[#2A2C34]">
                    <FileText className="h-5 w-5 text-[#8E8D88]" />
                  </div>
                </div>

                {/* Analyses Complete */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8E8D88] font-semibold">Analyses Complete</p>
                    <p className="text-3xl font-mono font-bold text-[#10B981] mt-2 tracking-tight">{stats?.analysesComplete || 0}</p>
                    <p className="text-[10px] text-[#10B981]/70 font-mono mt-1">Ready for review</p>
                  </div>
                  <div className="p-3 bg-[#10B981]/10 rounded-lg text-[#10B981] border border-[#10B981]/25">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>

                {/* Risk Alerts */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#8E8D88] font-semibold">Risk Alerts</p>
                    <p className="text-3xl font-mono font-bold text-[#E11D48] mt-2 tracking-tight">{stats?.riskAlerts || 0}</p>
                    <p className="text-[10px] text-[#E11D48]/70 font-mono mt-1">Flagged clauses</p>
                  </div>
                  <div className="p-3 bg-[#E11D48]/10 rounded-lg text-[#E11D48] border border-[#E11D48]/25">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
              </section>

              {/* RECENT DOCUMENTS section */}
              <section id="recent-documents" className="rounded-xl bg-[#131518] border border-[#202227] overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-[#202227] flex justify-between items-center bg-[#0E0F12]">
                  <h2 className="text-xs font-mono font-semibold text-[#F4F3EF] tracking-wider uppercase">Recent Documents</h2>
                  <Link to="/documents" className="text-xs font-mono font-medium text-[#D97706] hover:text-[#F59E0B] transition">
                    View All →
                  </Link>
                </div>

                {documents.length === 0 ? (
                  /* EMPTY STATE */
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="p-3 bg-[#181A1F] rounded-lg text-[#8E8D88] border border-[#202227] mb-3">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#F4F3EF] mb-1">No documents yet</h3>
                    <p className="text-[#8E8D88] text-xs max-w-sm mb-5">
                      Upload your first PDF legal document to initiate automated RAG clause audits.
                    </p>
                    <Link 
                      to="/upload" 
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Document</span>
                    </Link>
                  </div>
                ) : (
                  /* DOCUMENTS LIST */
                  <div className="divide-y divide-[#202227]">
                    {documents.slice(0, 5).map((doc) => (
                      <div 
                        key={doc._id} 
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-[#17191E] transition-colors duration-150 group"
                      >
                        <div className="min-w-0 flex-1 pr-4 mb-3 sm:mb-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-xs font-semibold text-[#F4F3EF] truncate max-w-md group-hover:text-white transition">
                              {doc.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181A1F] text-[#8E8D88] border border-[#2A2C34]">
                              {doc.type ? doc.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Other'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#8E8D88]">
                            Uploaded on {formatDate(doc.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <span className="text-[9px] uppercase font-mono text-[#575652]">Status</span>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <span className="text-[9px] uppercase font-mono text-[#575652]">Risk</span>
                              {getRiskBadge(doc.riskScore || doc.riskLevel)}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                            <button 
                              onClick={() => navigate(`/document/${doc._id}`)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-lg transition cursor-pointer"
                            >
                              <span>View Audit</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc._id);
                              }}
                              className="p-1.5 bg-[#181A1F] hover:bg-rose-500/15 text-[#8E8D88] hover:text-[#E11D48] border border-[#2A2C34] hover:border-rose-500/30 rounded-lg transition cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
