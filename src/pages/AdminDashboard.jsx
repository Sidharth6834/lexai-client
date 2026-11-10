import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RefreshCw
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
      if (user && user.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      
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

  const ErrorCard = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl h-full min-h-[200px]">
      <AlertCircle className="h-6 w-6 text-[#E11D48] animate-pulse" />
      <p className="text-xs text-[#8E8D88] font-mono leading-relaxed max-w-xs">{message}</p>
      <button 
        onClick={onRetry}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181A1F] hover:bg-[#202227] text-[#E11D48] font-mono text-xs rounded-lg border border-[#2A2C34] transition cursor-pointer"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Retry</span>
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
      <Sidebar activePage="admin" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-screen p-5 sm:p-7 lg:p-10 overflow-y-auto z-10">
        <div className="max-w-6xl mx-auto space-y-7">
          
          {/* HEADER */}
          <header className="flex justify-between items-end pb-5 border-b border-[#202227]">
            <div>
              <div className="flex items-center space-x-2 text-[#D97706]">
                <BarChart2 className="h-4 w-4" />
                <span className="text-[10px] font-mono font-semibold tracking-widest uppercase">Platform Governance</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#F4F3EF] tracking-tight sm:text-3xl mt-1">
                Chambers Admin Intelligence
              </h1>
            </div>
            <span className="text-[10px] text-[#575652] font-mono uppercase tracking-widest">30-Day Operational Window</span>
          </header>

          {/* ROW 1: OVERVIEW TILES - Swiss Minimalist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl p-5 bg-[#131518] border border-[#202227] animate-pulse space-y-3">
                  <div className="h-3 bg-[#181A1F] rounded w-1/2"></div>
                  <div className="h-7 bg-[#181A1F] rounded w-1/3"></div>
                  <div className="h-2.5 bg-[#181A1F] rounded w-2/3"></div>
                </div>
              ))
            ) : stats.error ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                <ErrorCard message={stats.error} onRetry={fetchStats} />
              </div>
            ) : (
              <>
                {/* Total Users */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88] font-semibold">Registered Users</span>
                    <div className="p-2 bg-[#181A1F] text-[#F4F3EF] rounded-lg border border-[#2A2C34]">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#F4F3EF]">{stats.data.totalUsers}</h3>
                  <p className="text-[10px] font-mono text-[#D97706] mt-2 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{stats.data.newUsersThisWeek} new this week</span>
                  </p>
                </div>

                {/* Documents Analyzed */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88] font-semibold">Analyzed Contracts</span>
                    <div className="p-2 bg-[#10B981]/10 text-[#10B981] rounded-lg border border-[#10B981]/25">
                      <FileCheck className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#10B981]">{stats.data.analyzedDocuments}</h3>
                  <p className="text-[10px] font-mono text-[#8E8D88] mt-2">
                    {stats.data.totalDocuments - stats.data.analyzedDocuments - stats.data.failedDocuments} queued / active
                  </p>
                </div>

                {/* Risky Documents */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88] font-semibold">High-Risk Covenants</span>
                    <div className="p-2 bg-[#E11D48]/10 text-[#E11D48] rounded-lg border border-[#E11D48]/25">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#E11D48]">{stats.data.totalRiskyDocuments}</h3>
                  <p className="text-[10px] font-mono text-[#E11D48] mt-2">
                    {Math.round((stats.data.totalRiskyDocuments / (stats.data.analyzedDocuments || 1)) * 100)}% of completed audits
                  </p>
                </div>

                {/* Documents Today */}
                <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] hover:border-[#2E313A] transition flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8D88] font-semibold">Daily Intake</span>
                    <div className="p-2 bg-[#181A1F] text-[#D97706] rounded-lg border border-[#2A2C34]">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#F4F3EF]">{stats.data.documentsToday}</h3>
                  <p className="text-[10px] font-mono text-[#8E8D88] mt-2">
                    Avg {stats.data.averageClausesPerDocument} clauses per file
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ROW 2: CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* LEFT: LINE CHART */}
            <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm">
              <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider mb-5">Ingestion Trajectory — Last 30 Days</h3>
              {dailyChart.loading ? (
                <div className="h-[240px] flex items-center justify-center animate-pulse bg-[#181A1F] rounded-lg" />
              ) : dailyChart.error ? (
                <ErrorCard message={dailyChart.error} onRetry={fetchDailyChart} />
              ) : (
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChart.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#575652" 
                        fontSize={9} 
                        fontFamily="JetBrains Mono"
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={formatDateTick}
                        interval={5} 
                      />
                      <YAxis 
                        stroke="#575652" 
                        fontSize={9} 
                        fontFamily="JetBrains Mono"
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#181A1F', 
                          border: '1px solid #202227', 
                          borderRadius: '8px', 
                          color: '#F4F3EF', 
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#D97706" 
                        strokeWidth={2} 
                        dot={{ r: 2.5, fill: '#D97706', strokeWidth: 0 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT: DONUT CHART */}
            <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm relative flex flex-col justify-between">
              <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider mb-5">Platform Risk Aggregation</h3>
              {riskDist.loading ? (
                <div className="h-[240px] flex items-center justify-center animate-pulse bg-[#181A1F] rounded-lg" />
              ) : riskDist.error ? (
                <ErrorCard message={riskDist.error} onRetry={fetchRiskDist} />
              ) : (
                <div className="relative h-[240px] flex items-center justify-center">
                  
                  {/* Center Overlay Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-[#575652] font-mono uppercase tracking-widest">Risk</span>
                    <span className="text-xs font-mono font-bold text-[#F4F3EF]">Portfolio</span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Safe', value: riskDist.data.safe, color: '#10B981' },
                          { name: 'Caution', value: riskDist.data.caution, color: '#D97706' },
                          { name: 'Risky', value: riskDist.data.risky, color: '#E11D48' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { name: 'Safe', value: riskDist.data.safe, color: '#10B981' },
                          { name: 'Caution', value: riskDist.data.caution, color: '#D97706' },
                          { name: 'Risky', value: riskDist.data.risky, color: '#E11D48' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ 
                        background: '#181A1F', 
                        border: '1px solid #202227', 
                        borderRadius: '8px', 
                        color: '#F4F3EF', 
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 'bold'
                      }} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={32} 
                        formatter={(value, entry) => {
                          const val = entry.payload.value;
                          return <span className="text-[10px] font-mono text-[#8E8D88] uppercase tracking-wide">{value} ({val})</span>;
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* ROW 3: TYPE BREAKDOWN & RISKY CLAUSES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* LEFT: HORIZONTAL BAR CHART */}
            <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm">
              <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider mb-5">Contracts by Jurisdiction / Type</h3>
              {docTypes.loading ? (
                <div className="h-[260px] flex items-center justify-center animate-pulse bg-[#181A1F] rounded-lg" />
              ) : docTypes.error ? (
                <ErrorCard message={docTypes.error} onRetry={fetchDocTypes} />
              ) : docTypes.data.length === 0 ? (
                <p className="text-xs text-[#575652] italic text-center py-16">No document types registered yet.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={docTypes.data}
                      margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#575652" fontSize={9} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="type" 
                        stroke="#575652" 
                        fontSize={9} 
                        fontFamily="JetBrains Mono"
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={formatDocType}
                        width={95}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          const label = name === 'count' ? 'Total' : 'Risky';
                          return [value, label];
                        }}
                        contentStyle={{ 
                          background: '#181A1F', 
                          border: '1px solid #202227', 
                          borderRadius: '8px', 
                          color: '#F4F3EF', 
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Bar dataKey="count" fill="#D97706" radius={[0, 4, 4, 0]} barSize={10} />
                      <Bar dataKey="riskyCount" fill="#E11D48" radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* RIGHT: TOP RISKY CLAUSES LIST */}
            <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider">Most Flagged Covenants</h3>
                <p className="text-[10px] text-[#575652] font-mono mt-0.5 mb-5">Ranked across institutional document audits</p>
                
                {riskyClauses.loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="h-5 w-5 bg-[#181A1F] rounded shrink-0"></div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 bg-[#181A1F] rounded w-1/3"></div>
                          <div className="h-2 bg-[#181A1F] rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : riskyClauses.error ? (
                  <ErrorCard message={riskyClauses.error} onRetry={fetchRiskyClauses} />
                ) : riskyClauses.data.length === 0 ? (
                  <p className="text-xs text-[#575652] italic text-center py-16">No risky clauses detected on the platform.</p>
                ) : (
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {riskyClauses.data.map((clause, index) => {
                      const maxVal = Math.max(...riskyClauses.data.map(c => c.riskyCount), 1);
                      const percent = Math.round((clause.riskyCount / maxVal) * 100);

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2 min-w-0 pr-3">
                              <span className="h-4 w-4 rounded bg-[#181A1F] flex items-center justify-center text-[10px] font-mono text-[#8E8D88] border border-[#202227] shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-[#F4F3EF] truncate text-xs font-medium">{clause.title}</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-[#E11D48] border border-rose-500/20 text-[10px] font-mono font-semibold shrink-0">
                              {clause.riskyCount} Flags
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[#0A0B0D] rounded-full overflow-hidden border border-[#202227]">
                            <div 
                              className="bg-[#E11D48] h-full rounded-full transition-all duration-200" 
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
          <div className="rounded-xl bg-[#131518] border border-[#202227] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#202227] flex justify-between items-center bg-[#0E0F12]">
              <h3 className="text-xs font-mono font-semibold text-[#F4F3EF] uppercase tracking-wider">Live Platform Audit Stream</h3>
              <span className="text-[10px] text-[#575652] font-mono uppercase tracking-widest">Global Activity</span>
            </div>

            {recentActivity.loading ? (
              <div className="p-5 space-y-2">
                <div className="h-6 bg-[#181A1F] rounded animate-pulse" />
                <div className="h-6 bg-[#181A1F] rounded animate-pulse" />
              </div>
            ) : recentActivity.error ? (
              <ErrorCard message={recentActivity.error} onRetry={fetchRecentActivity} />
            ) : recentActivity.data.length === 0 ? (
              <p className="text-xs text-[#575652] italic text-center py-10">No activities recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#202227] text-[#8E8D88] font-mono uppercase tracking-wider text-[10px] bg-[#0A0B0D]">
                      <th className="py-2.5 px-4">Document</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Risk Level</th>
                      <th className="py-2.5 px-4">Operator</th>
                      <th className="py-2.5 px-4 text-right">Analyzed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202227]">
                    {recentActivity.data.map((activity, index) => {
                      const isRisky = activity.riskLevel === 'risky';
                      const isCaution = activity.riskLevel === 'caution';

                      return (
                        <tr 
                          key={activity._id || index}
                          className="hover:bg-[#181A1F] transition-colors duration-150"
                        >
                          <td className="py-2.5 px-4 font-semibold text-[#F4F3EF] max-w-[200px] truncate">
                            {activity.documentName}
                          </td>
                          <td className="py-2.5 px-4 text-[#8E8D88] font-mono text-[11px]">
                            {formatDocType(activity.documentType)}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                              isRisky 
                                ? 'bg-rose-500/10 text-[#E11D48] border-rose-500/20' 
                                : isCaution 
                                  ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' 
                                  : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25'
                            }`}>
                              {activity.riskLevel || 'Safe'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-[#C6C5BF]">
                            {activity.userName}
                          </td>
                          <td className="py-2.5 px-4 text-[#8E8D88] font-mono text-[11px] text-right">
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
