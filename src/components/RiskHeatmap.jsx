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
    if (val <= 33) return '#10B981'; // Green
    if (val <= 66) return '#D97706'; // Amber Brass
    return '#E11D48'; // Crimson
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
    { name: 'Safe', value: safeCount, color: '#10B981' },
    { name: 'Caution', value: cautionCount, color: '#D97706' },
    { name: 'Risky', value: riskyCount, color: '#E11D48' }
  ].filter(item => item.value > 0);

  // Custom Pie labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-mono font-bold">
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* SECTION 1: RISK SCORE GAUGE - Swiss Precision */}
      <div className="p-6 rounded-xl bg-[#131518] border border-[#202227] shadow-sm flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D97706] font-semibold">Audit Health Metric</span>
            <h2 className="text-sm font-serif font-bold text-[#F4F3EF] tracking-tight">Overall Risk Assessment</h2>
          </div>
          <span className="text-[10px] font-mono text-[#8E8D88]">{totalClauses} Covenants Evaluated</span>
        </div>
        
        <div className="relative w-full max-w-[280px] h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="80%" 
              innerRadius="75%" 
              outerRadius="100%" 
              barSize={16} 
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
                background={{ fill: '#181A1F' }}
                dataKey="value"
                cornerRadius={4}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center flex flex-col items-center w-full">
            <span className="text-4xl font-mono font-bold tracking-tight leading-none" style={{ color }}>
              {score}
            </span>
            <p className="text-[10px] text-[#8E8D88] font-mono uppercase tracking-widest mt-1.5">Composite Risk Index</p>
            
            <div className="flex justify-between w-[220px] mt-2 text-[9px] font-mono text-[#575652] tracking-wider">
              <span>0 (BENCHMARK)</span>
              <span>100 (HIGH EXPOSURE)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        
        {/* SECTION 2 & 3: STATISTICS BREAKDOWN & DISTRIBUTION */}
        <div className="space-y-5">
          {/* STAT BOXES - Swiss Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Safe */}
            <div className="bg-[#131518] border border-[#202227] rounded-xl p-3.5 text-center space-y-1.5 shadow-sm">
              <div className="flex justify-center text-[#10B981]">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="text-xl font-mono font-bold text-[#F4F3EF]">{safeCount}</p>
              <p className="text-[9px] text-[#10B981] font-mono uppercase tracking-wider font-semibold">Safe Clauses</p>
            </div>
            
            {/* Caution */}
            <div className="bg-[#131518] border border-[#202227] rounded-xl p-3.5 text-center space-y-1.5 shadow-sm">
              <div className="flex justify-center text-[#D97706]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="text-xl font-mono font-bold text-[#F4F3EF]">{cautionCount}</p>
              <p className="text-[9px] text-[#D97706] font-mono uppercase tracking-wider font-semibold">Caution Clauses</p>
            </div>
            
            {/* Risky */}
            <div className="bg-[#131518] border border-[#202227] rounded-xl p-3.5 text-center space-y-1.5 shadow-sm">
              <div className="flex justify-center text-[#E11D48]">
                <XCircle className="h-4 w-4" />
              </div>
              <p className="text-xl font-mono font-bold text-[#F4F3EF]">{riskyCount}</p>
              <p className="text-[9px] text-[#E11D48] font-mono uppercase tracking-wider font-semibold">Risky Clauses</p>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm">
            <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider mb-3">Clause Risk Distribution</h3>
            {totalClauses === 0 ? (
              <p className="text-xs text-[#575652] italic text-center py-8">No clauses analyzed yet.</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
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
                      height={28} 
                      formatter={(value) => <span className="text-xs font-mono text-[#8E8D88]">{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: VISUAL DOCUMENT HEATMAP */}
        <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] shadow-sm h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-semibold text-[#8E8D88] uppercase tracking-wider mb-1">Covenant Heatmap Map</h3>
            <p className="text-xs text-[#575652] mb-5">Click any covenant pill to inspect full analysis & AI redlines.</p>
            
            {clauses.length === 0 ? (
              <p className="text-xs text-[#575652] italic text-center py-8">No clauses detected in document.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[320px] overflow-y-auto pr-1">
                {clauses.map((clause, index) => {
                  const isSafe = clause.riskLevel === 'safe';
                  const isCaution = clause.riskLevel === 'caution';
                  
                  return (
                    <button
                      key={clause._id || index}
                      onClick={() => handlePillClick(index)}
                      title={clause.explanation}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition duration-150 cursor-pointer border ${
                        isSafe 
                          ? 'bg-[#10B981]/10 hover:bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25' 
                          : isCaution 
                            ? 'bg-[#D97706]/10 hover:bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30' 
                            : 'bg-[#E11D48]/10 hover:bg-[#E11D48]/15 text-[#E11D48] border-[#E11D48]/25'
                      }`}
                    >
                      {isSafe ? (
                        <CheckCircle className="h-3 w-3 text-[#10B981] shrink-0" />
                      ) : isCaution ? (
                        <AlertTriangle className="h-3 w-3 text-[#D97706] shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-[#E11D48] shrink-0" />
                      )}
                      <span className="truncate max-w-[140px]">{clause.title}</span>
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
