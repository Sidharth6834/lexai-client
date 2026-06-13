import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart2, 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Menu,
  Scale,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats states
  const [stats, setStats] = useState({ data: null, loading: true, error: null });
  const [docTypes, setDocTypes] = useState({ data: null, loading: true, error: null });
  const [riskDist, setRiskDist] = useState({ data: null, loading: true, error: null });
  const [riskyClauses, setRiskyClauses] = useState({ data: null, loading: true, error: null });
  const [dailyChart, setDailyChart] = useState({ data: null, loading: true, error: null });
  const [recentActivity, setRecentActivity] = useState({ data: null, loading: true, error: null });

  // Fetch functions
  const fetchStats = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/stats');
      setStats({ data: res.data, loading: false, error: null });
    } catch (err) {
      setStats({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load platform stats' });
    }
  };

  const fetchDocTypes = async () => {
    setDocTypes(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/document-types');
      setDocTypes({ data: res.data, loading: false, error: null });
    } catch (err) {
      setDocTypes({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load document types' });
    }
  };

  const fetchRiskDist = async () => {
    setRiskDist(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/risk-distribution');
      setRiskDist({ data: res.data, loading: false, error: null });
    } catch (err) {
      setRiskDist({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load risk distribution' });
    }
  };

  const fetchRiskyClauses = async () => {
    setRiskyClauses(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/risky-clauses');
      setRiskyClauses({ data: res.data, loading: false, error: null });
    } catch (err) {
      setRiskyClauses({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load clause metrics' });
    }
  };

  const fetchDailyChart = async () => {
    setDailyChart(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/daily-chart');
      setDailyChart({ data: res.data, loading: false, error: null });
    } catch (err) {
      setDailyChart({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load daily activity log' });
    }
  };

  const fetchRecentActivity = async () => {
    setRecentActivity(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await axios.get('/api/admin/recent-activity');
      setRecentActivity({ data: res.data, loading: false, error: null });
    } catch (err) {
      setRecentActivity({ data: null, loading: false, error: err.response?.data?.message || 'Failed to load recent activity' });
    }
  };

  useEffect(() => {
    if (token) {
      // Redirect if not admin
      if (user && user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      
      // Parallel loading calls
      Promise.all([
        fetchStats(),
        fetchDocTypes(),
        fetchRiskDist(),
        fetchRiskyClauses(),
        fetchDailyChart(),
        fetchRecentActivity()
      ]);
    }
  }, [token, user]);

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDocType = (type) => {
    if (!type) return 'Document';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDateTick = (tickItem) => {
    if (!tickItem) return '';
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Shared Error Fallback Component
  const ErrorCard = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl h-full min-h-[220px]">
      <AlertCircle className="h-8 w-8 text-rose-455 animate-pulse" />
      <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs">{message}</p>
      <button 
        onClick={onRetry}
        className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold text-xs rounded-xl border border-rose-500/20 transition cursor-pointer"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Retry</span>
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar activePage="admin" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

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
        <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-screen p-6 sm:p-8 lg:p-12 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* HEADER */}
          <header className="flex justify-between items-end pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400">
                <BarChart2 className="h-6 w-6" />
                <span className="text-xs font-black tracking-widest uppercase">Platform Control</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl mt-1">Admin Analytics</h1>
            </div>
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest">Last 30 days</span>
          </header>

          {/* ROW 1: OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-900 rounded w-1/2"></div>
                    <div className="h-8 w-8 bg-slate-900 rounded-xl"></div>
                  </div>
                  <div className="h-8 bg-slate-900 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-900 rounded w-2/3"></div>
                </div>
              ))
            ) : stats.error ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <ErrorCard message={stats.error} onRetry={fetchStats} />
              </div>
            ) : (
              <>
                {/* Total Users */}
                <div className="glass-card bg-[#0e1322]/30 rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Users</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{stats.data.totalUsers}</h3>
                  <p className="text-[10px] text-blue-450 font-bold mt-2 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{stats.data.newUsersThisWeek} new this week</span>
                  </p>
                </div>

                {/* Documents Analyzed */}
                <div className="glass-card bg-[#0e1322]/30 rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Analyzed Docs</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
                      <FileCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{stats.data.analyzedDocuments}</h3>
                  <p className="text-[10px] text-emerald-400 font-bold mt-2">
                    {stats.data.totalDocuments - stats.data.analyzedDocuments - stats.data.failedDocuments} in analysis queue
                  </p>
                </div>

                {/* Risky Documents */}
                <div className="glass-card bg-[#0e1322]/30 rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Risky Contracts</span>
                    <div className="p-2 bg-rose-500/10 text-rose-455 rounded-xl border border-rose-500/10">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{stats.data.totalRiskyDocuments}</h3>
                  <p className="text-[10px] text-rose-450 font-bold mt-2">
                    {Math.round((stats.data.totalRiskyDocuments / (stats.data.analyzedDocuments || 1)) * 100)}% of complete audits
                  </p>
                </div>

                {/* Documents Today */}
                <div className="glass-card bg-[#0e1322]/30 rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Docs Today</span>
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white">{stats.data.documentsToday}</h3>
                  <p className="text-[10px] text-purple-400 font-bold mt-2">
                    Avg {stats.data.averageClausesPerDocument} clauses per file
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ROW 2: CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: LINE CHART */}
            <div className="glass-card bg-[#0e1322]/20 rounded-3xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Documents Analyzed — Last 30 Days</h3>
              {dailyChart.loading ? (
                <div className="h-[250px] flex items-center justify-center animate-pulse bg-slate-900/40 rounded-2xl" />
              ) : dailyChart.error ? (
                <ErrorCard message={dailyChart.error} onRetry={fetchDailyChart} />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChart.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={formatDateTick}
                        interval={5} 
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#090d16', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT: DONUT CHART */}
            <div className="glass-card bg-[#0e1322]/20 rounded-3xl p-6 border border-white/5 shadow-xl relative flex flex-col justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Overall Risk Distribution</h3>
              {riskDist.loading ? (
                <div className="h-[250px] flex items-center justify-center animate-pulse bg-slate-900/40 rounded-2xl" />
              ) : riskDist.error ? (
                <ErrorCard message={riskDist.error} onRetry={fetchRiskDist} />
              ) : (
                <div className="relative h-[250px] flex items-center justify-center">
                  
                  {/* Center Overlay Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Risk</span>
                    <span className="text-xs font-extrabold text-white">Overview</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Safe', value: riskDist.data.safe, color: '#22c55e' },
                          { name: 'Caution', value: riskDist.data.caution, color: '#f59e0b' },
                          { name: 'Risky', value: riskDist.data.risky, color: '#ef4444' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { name: 'Safe', value: riskDist.data.safe, color: '#22c55e' },
                          { name: 'Caution', value: riskDist.data.caution, color: '#f59e0b' },
                          { name: 'Risky', value: riskDist.data.risky, color: '#ef4444' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ 
                        background: '#090d16', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '12px', 
                        color: '#fff', 
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        formatter={(value, entry) => {
                          const val = entry.payload.value;
                          return <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{value} ({val})</span>;
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* ROW 3: TYPE BREAKDOWN & RISKY CLAUSES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: HORIZONTAL BAR CHART */}
            <div className="glass-card bg-[#0e1322]/20 rounded-3xl p-6 border border-white/5 shadow-xl">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Documents by Type</h3>
              {docTypes.loading ? (
                <div className="h-[280px] flex items-center justify-center animate-pulse bg-slate-900/40 rounded-2xl" />
              ) : docTypes.error ? (
                <ErrorCard message={docTypes.error} onRetry={fetchDocTypes} />
              ) : docTypes.data.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-16">No document types registered yet.</p>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={docTypes.data}
                      margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#4b5563" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="type" 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={formatDocType}
                        width={90}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          const label = name === 'count' ? 'Total' : 'Risky';
                          return [value, label];
                        }}
                        contentStyle={{ 
                          background: '#090d16', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '12px', 
                          color: '#fff', 
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="riskyCount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT: TOP RISKY CLAUSES LIST */}
            <div className="glass-card bg-[#0e1322]/20 rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Most Commonly Risky Clauses</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 mb-6">Across all analyzed documents</p>
                
                {riskyClauses.loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="h-6 w-6 bg-slate-900 rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-900 rounded w-1/3"></div>
                          <div className="h-2 bg-slate-900 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : riskyClauses.error ? (
                  <ErrorCard message={riskyClauses.error} onRetry={fetchRiskyClauses} />
                ) : riskyClauses.data.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-16">No risky clauses detected on the platform.</p>
                ) : (
                  <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                    {riskyClauses.data.map((clause, index) => {
                      const maxVal = Math.max(...riskyClauses.data.map(c => c.riskyCount), 1);
                      const percent = Math.round((clause.riskyCount / maxVal) * 100);

                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <div className="flex items-center space-x-2.5 min-w-0 pr-3">
                              <span className="h-5 w-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-slate-400 border border-white/5 shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-slate-200 truncate">{clause.title}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-455 border border-rose-500/10 text-[10px] uppercase font-black shrink-0">
                              {clause.riskyCount} Hits
                            </span>
                          </div>
                          {/* Progress Line */}
                          <div className="w-full h-1 bg-slate-950/80 rounded-full overflow-hidden border border-slate-900/50">
                            <div 
                              className="bg-rose-500 h-full rounded-full transition-all duration-300" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ROW 4: RECENT ACTIVITY TABLE */}
          <div className="glass-card bg-[#0e1322]/20 rounded-3xl p-6 border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Document Analyses</h3>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Platform Activity</span>
            </div>

            {recentActivity.loading ? (
              <div className="space-y-3">
                <div className="h-8 bg-slate-900 rounded-lg animate-pulse" />
                <div className="h-8 bg-slate-900 rounded-lg animate-pulse" />
                <div className="h-8 bg-slate-900 rounded-lg animate-pulse" />
              </div>
            ) : recentActivity.error ? (
              <ErrorCard message={recentActivity.error} onRetry={fetchRecentActivity} />
            ) : recentActivity.data.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-10">No activities recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-450 uppercase tracking-widest text-[9px]">
                      <th className="py-3.5 px-4">Document Name</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Risk Level</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4 text-right">Analyzed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentActivity.data.map((activity, index) => {
                      const isRisky = activity.riskLevel === 'risky';
                      const isCaution = activity.riskLevel === 'caution';

                      return (
                        <tr 
                          key={activity._id || index}
                          className="hover:bg-slate-900/15 transition-colors duration-150 odd:bg-slate-950/5 even:bg-slate-950/20"
                        >
                          <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate">
                            {activity.documentName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-350">
                            {formatDocType(activity.documentType)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black border ${
                              isRisky 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' 
                                : isCaution 
                                  ? 'bg-amber-500/10 text-amber-450 border-amber-500/10' 
                                  : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/10'
                            }`}>
                              {activity.riskLevel || 'Safe'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-350">
                            {activity.userName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-450 text-right">
                            {getRelativeTime(activity.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
