import React from 'react';
import { 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis,
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const RiskHeatmap = ({ clauses = [], onClauseClick }) => {
  const safeCount = clauses.filter(c => c.riskLevel === 'safe').length;
  const cautionCount = clauses.filter(c => c.riskLevel === 'caution').length;
  const riskyCount = clauses.filter(c => c.riskLevel === 'risky').length;
  const totalClauses = clauses.length;

  // Calculate Weighted Risk Score
  let score = 0;
  if (totalClauses > 0) {
    const totalPoints = safeCount * 0 + cautionCount * 50 + riskyCount * 100;
    score = Math.round(totalPoints / totalClauses);
  }

  // Get color based on score
  const getRiskColor = (val) => {
    if (val <= 33) return '#10b981'; // Green
    if (val <= 66) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const color = getRiskColor(score);
  
  // Chart data for Gauge
  const gaugeData = [
    {
      name: 'Risk Score',
      value: score,
      fill: color
    }
  ];

  // Chart data for Pie
  const pieData = [
    { name: 'Safe', value: safeCount, color: '#10b981' },
    { name: 'Caution', value: cautionCount, color: '#f59e0b' },
    { name: 'Risky', value: riskyCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Custom Pie labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-extrabold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handlePillClick = (index) => {
    if (onClauseClick) {
      onClauseClick(index);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* SECTION 1: RISK SCORE GAUGE */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <h2 className="text-md font-bold text-slate-300 uppercase tracking-wider mb-2 self-start">Overall Audit Rating</h2>
        
        <div className="relative w-full max-w-[280px] h-[190px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="80%" 
              innerRadius="75%" 
              outerRadius="100%" 
              barSize={18} 
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: 'rgba(255,255,255,0.04)' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center flex flex-col items-center w-full">
            <span className="text-5xl font-extrabold tracking-tight transition-colors duration-300 leading-none" style={{ color }}>
              {score}
            </span>
            <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest mt-2">Overall Risk Score</p>
            
            <div className="flex justify-between w-[240px] mt-3 text-[10px] font-black text-slate-500 tracking-wider">
              <span>0 (LOW RISK)</span>
              <span>100 (HIGH RISK)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* SECTION 2 & 3: STATISTICS BREAKDOWN & DISTRIBUTION */}
        <div className="space-y-6">
          {/* STAT BOXES */}
          <div className="grid grid-cols-3 gap-3">
            {/* Safe */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center space-y-2 shadow-md">
              <div className="flex justify-center text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-xl font-extrabold text-white">{safeCount}</p>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Safe Clauses</p>
            </div>
            
            {/* Caution */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-center space-y-2 shadow-md">
              <div className="flex justify-center text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-xl font-extrabold text-white">{cautionCount}</p>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Caution Clauses</p>
            </div>
            
            {/* Risky */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-center space-y-2 shadow-md">
              <div className="flex justify-center text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <p className="text-xl font-extrabold text-white">{riskyCount}</p>
              <p className="text-[9px] text-rose-450 font-bold uppercase tracking-wider">Risky Clauses</p>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Clause Risk Distribution</h3>
            {totalClauses === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-8">No clauses analyzed yet.</p>
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={75}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
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
                      height={30} 
                      formatter={(value) => <span className="text-xs font-bold text-slate-400">{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: VISUAL DOCUMENT HEATMAP */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">Document Risk Map</h3>
            <p className="text-xs text-slate-500 font-medium mb-6">Click any clause pill below to instantly jump to its details.</p>
            
            {clauses.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-8">No clauses detected in document.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {clauses.map((clause, index) => {
                  const isSafe = clause.riskLevel === 'safe';
                  const isCaution = clause.riskLevel === 'caution';
                  
                  return (
                    <button
                      key={clause._id || index}
                      onClick={() => handlePillClick(index)}
                      title={clause.explanation}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        isSafe 
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-450 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.04)]' 
                          : isCaution 
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-450 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.04)]' 
                            : 'bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.04)]'
                      }`}
                    >
                      {isSafe ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : isCaution ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">{clause.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RiskHeatmap;
