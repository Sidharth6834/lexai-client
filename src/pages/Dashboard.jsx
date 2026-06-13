import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Scale, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  LogOut, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Trash2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user, logout, token } = useContext(AuthContext);
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
        
        // Define auth headers config
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // Fetch stats & documents in parallel
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
        // Load fallback mock data
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/documents/${docId}`, config);
      
      // Update local state
      setDocuments(prev => prev.filter(d => d._id !== docId));
      
      // Update stats
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

  // Helper to get first letter of name
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Badges styling functions
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complete':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Complete</span>;
      case 'Analyzing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Analyzing</span>;
      case 'Failed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Safe</span>;
      case 'Caution':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Caution</span>;
      case 'Risky':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Risky</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{risk}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar activePage="dashboard" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

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
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, {user?.name || 'Guest'}
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Review your legal document analytics and insights.
          </p>
        </header>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-8">
            {/* STATS ROW */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Documents */}
              <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.15)] group">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Documents</p>
                  <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">{stats?.totalDocuments || 0}</p>
                </div>
                <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform duration-305">
                  <FileText className="h-5.5 w-5.5" />
                </div>
              </div>

              {/* Analyses Complete */}
              <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.15)] group">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analyses Complete</p>
                  <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">{stats?.analysesComplete || 0}</p>
                </div>
                <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-305">
                  <CheckCircle className="h-5.5 w-5.5" />
                </div>
              </div>

              {/* Risk Alerts */}
              <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover:border-rose-500/35 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.15)] group">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Alerts</p>
                  <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">{stats?.riskAlerts || 0}</p>
                </div>
                <div className="p-3.5 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform duration-305">
                  <AlertTriangle className="h-5.5 w-5.5" />
                </div>
              </div>
            </section>

            {/* RECENT DOCUMENTS section */}
            <section id="recent-documents" className="glass-card rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-slate-900/60 flex justify-between items-center bg-slate-950/20">
                <h2 className="text-md font-bold text-white tracking-wider uppercase">Recent Documents</h2>
                <Link to="/documents" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition uppercase tracking-wider">
                  View All
                </Link>
              </div>

              {documents.length === 0 ? (
                /* EMPTY STATE */
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="p-4 bg-slate-900/60 rounded-full text-slate-500 border border-slate-800 mb-4">
                    <FileText className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">No documents yet</h3>
                  <p className="text-slate-400 text-sm max-w-sm mb-6">
                    Upload your first PDF legal document to get started with RAG analysis.
                  </p>
                  <Link 
                    to="/upload" 
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-gradient"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Document</span>
                  </Link>
                </div>
              ) : (
                /* DOCUMENTS LIST */
                <div className="divide-y divide-slate-900/60">
                  {documents.slice(0, 3).map((doc) => (
                    <div 
                      key={doc._id} 
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-900/20 transition duration-200 group border-l-2 border-transparent hover:border-indigo-500/50"
                    >
                      <div className="min-w-0 flex-1 pr-4 mb-4 sm:mb-0">
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <h3 className="text-sm font-bold text-white truncate max-w-md group-hover:text-indigo-400 transition">
                            {doc.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {doc.type ? doc.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Other'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Uploaded on {formatDate(doc.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Status</span>
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Risk Profile</span>
                            {getRiskBadge(doc.riskScore || doc.riskLevel)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                          <button 
                            onClick={() => navigate(`/document/${doc._id}`)}
                            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white btn-gradient rounded-xl"
                          >
                            <span>View Audit</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc._id);
                            }}
                            className="p-2.5 bg-slate-900/60 hover:bg-rose-500/15 text-slate-500 hover:text-rose-450 border border-slate-800 hover:border-rose-500/20 rounded-xl transition duration-150 cursor-pointer"
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
      </main>
    </div>
  );
};

export default Dashboard;
