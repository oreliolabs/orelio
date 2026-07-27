import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Asset Allocation Data (Semi-Donut)
const assetData: ChartDataItem[] = [
  { name: 'Stocks', value: 10, color: '#0284C7' },      // Sky blue
  { name: 'Bonds', value: 26, color: '#0F766E' },       // Teal
  { name: 'Fixed Deposits', value: 34, color: '#0D9488' }, // Mint Teal
  { name: 'Mutual Funds', value: 24, color: '#4F46E5' },  // Indigo
  { name: 'Cash', value: 10, color: '#F59E0B' },        // Amber
  { name: 'Gold', value: 12, color: '#EAB308' }         // Yellow
];

// Loans & Credit Liability Data (Full Donut)
const liabilityData: ChartDataItem[] = [
  { name: 'Home Loan', value: 85, color: '#DC2626' },    // Red
  { name: 'Car Loan', value: 12, color: '#F59E0B' },     // Amber
  { name: 'Others', value: 3, color: '#9CA3AF' }        // Gray
];

export const AssetAllocationChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Semi-Donut Graphic */}
      <div className="relative w-48 h-28 xs:w-56 xs:h-32 flex justify-center items-end overflow-hidden">
        <ResponsiveContainer width="100%" height="200%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={assetData}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={0}
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
              contentStyle={{ background: '#00162A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Total Stats */}
        <div className="absolute bottom-1 text-center">
          <span className="block text-2xl font-extrabold text-orelio-navy leading-none">100%</span>
          <span className="block text-[10px] text-orelio-gray font-bold tracking-wider uppercase mt-1">Allocated</span>
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

export const LiabilityChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Full Donut Graphic */}
      <div className="relative w-40 h-40 flex items-center justify-center">
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
              contentStyle={{ background: '#00162A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Total Stats */}
        <div className="absolute text-center">
          <span className="block text-2xl font-extrabold text-orelio-navy leading-none">97%</span>
          <span className="block text-[9px] text-orelio-gray font-bold tracking-wider uppercase mt-1">Utilization</span>
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
