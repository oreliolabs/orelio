import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import { getAssetAllocation, getLiabilityAllocation, getLoans } from '../data/orelioStore';

export const AssetAllocationChart: React.FC<{ selectedMemberId?: string | 'all' }> = ({ selectedMemberId = 'all' }) => {
  const assetData = getAssetAllocation(selectedMemberId);
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Full Donut Graphic */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Centered Total Stats (z-0 behind tooltip) */}
        <div className="absolute text-center pointer-events-none z-0 select-none">
          <span className="block text-2xl font-extrabold text-orelio-navy leading-none">100%</span>
          <span className="block text-[9px] text-orelio-gray font-bold tracking-wider uppercase mt-1">Allocated</span>
        </div>

        <div className="w-full h-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                contentStyle={{ 
                  backgroundColor: '#00162A', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  color: '#FFFFFF', 
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}
                itemStyle={{ color: '#FFFFFF' }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom Sleek Grid Legend */}
      <div className="flex-1 w-full grid grid-cols-2 gap-3">
        {assetData.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-orelio-light-gray/40 transition-colors">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.color }} 
            />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-orelio-navy truncate">{item.name}</span>
              <span className="block text-[11px] text-orelio-gray font-medium mt-0.5">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export const LiabilityChart: React.FC<{ selectedMemberId?: string | 'all'; isPrivate?: boolean }> = ({ 
  selectedMemberId = 'all',
  isPrivate = false
}) => {
  const liabilityData = getLiabilityAllocation(selectedMemberId);
  const loans = getLoans(selectedMemberId);
  const totalLiabilities = loans.reduce((acc, l) => acc + (l.outstandingBalance || 0), 0);

  const formatCompactDebt = (num: number) => {
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(1).replace(/\.?0+$/, '')} L`;
    if (num >= 1000) return `₹ ${(num / 1000).toFixed(1)}k`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Full Donut Graphic */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Centered Total Stats (z-0 behind tooltip) */}
        <div className="absolute text-center pointer-events-none z-0 select-none">
          <span className="block text-xl font-extrabold text-orelio-navy leading-none">
            {isPrivate ? '••••' : (totalLiabilities > 0 ? formatCompactDebt(totalLiabilities) : '₹ 0')}
          </span>
          <span className="block text-[9px] text-orelio-gray font-bold tracking-wider uppercase mt-1">Total Debt</span>
        </div>

        <div className="w-full h-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={liabilityData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={3}
                dataKey="value"
              >
                {liabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                contentStyle={{ 
                  backgroundColor: '#00162A', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  color: '#FFFFFF', 
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '5px 10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}
                itemStyle={{ color: '#FFFFFF' }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex-1 w-full flex flex-col gap-2.5">
        {liabilityData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-orelio-light-gray/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-xs font-semibold text-orelio-navy truncate">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-orelio-navy pl-2">{item.value}%</span>
          </div>
        ))}
      </div>

    </div>
  );
};
