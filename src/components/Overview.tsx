import React from 'react';
import { AssetAllocationChart, LiabilityChart } from './Charts';
import { 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Activity, 
  PiggyBank 
} from 'lucide-react';
import { getOverviewMetrics } from '../data/orelioStore';

interface OverviewProps {
  isPrivate: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ isPrivate }) => {
  const metrics = getOverviewMetrics();

  // Helper to mask values in private mode
  const f = (val: string) => (isPrivate ? '••••' : val);

  return (
    <div className="space-y-6 fade-in">
      
      {/* ROW 1: Net Worth Card & Heads Up Alert Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Net Worth Card (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="block text-xs font-bold tracking-widest text-orelio-darkgreen uppercase">Current Net Worth</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-orelio-navy mt-1 tracking-tight">
                {f(metrics.netWorthDisplay)}
              </h2>
            </div>
            
            {/* Trend Badge */}
            <div className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <ArrowUpRight size={14} className="stroke-[2.5]" />
              <span>{f(metrics.yearGrowthAmount)} (+{metrics.yearGrowthPercent}%) this year</span>
            </div>
          </div>

          {/* SVG Sparkline Graph - smooth curve with gradient */}
          <div className="mt-8 sm:mt-4 h-24 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 600 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006A65" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#006A65" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(195, 198, 206, 0.15)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(195, 198, 206, 0.15)" strokeDasharray="4 4" />
              
              {/* Gradient Area under curve */}
              <path 
                d="M0 90 Q 150 75, 300 45 T 600 10 L 600 100 L 0 100 Z" 
                fill="url(#netWorthGrad)" 
              />
              
              {/* Curve Stroke */}
              <path 
                d="M0 90 Q 150 75, 300 45 T 600 10" 
                fill="none" 
                stroke="#006A65" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {/* End Point Dot */}
              <circle cx="600" cy="10" r="5" fill="#006A65" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Heads Up! FD Maturing Card (1/3 width) */}
        <div className="glass-card-dark p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-emerald-800/10 opacity-30 transform -rotate-12 group-hover:scale-110 transition-transform duration-300">
            <AlertCircle size={180} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <AlertCircle size={16} />
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Heads Up!</span>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white leading-snug">Fixed Deposit maturing soon</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                IDFC First Bank FD for {f('₹25L')} expires on 12/02/2024. Plan your reinvestment options.
              </p>
            </div>
          </div>

          <button className="relative z-10 w-full sm:w-auto self-start mt-6 px-5 py-2.5 rounded-xl bg-white text-forest-900 text-xs font-bold shadow-md hover:bg-emerald-50 active:scale-97 transition-all">
            Manage Asset
          </button>
        </div>

      </div>

      {/* ROW 2: Total Assets, Loans & Credit, Insurance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Assets KPI */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Total Assets</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f('₹ 2.79 Cr')}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <TrendingUp size={18} />
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold text-orelio-gray tracking-wider uppercase mb-1.5">
              <span>Target Allocation</span>
              <span className="text-orelio-navy">78%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-orelio-light-gray">
              <div className="h-full rounded-full bg-orelio-darkgreen transition-all" style={{ width: '78%' }} />
            </div>
          </div>
        </div>

        {/* Loans & Credit KPI */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Loans & Credit</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f('₹ 2.79 L')}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Wallet size={18} />
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold text-orelio-gray tracking-wider uppercase mb-1.5">
              <span>Debt Utilization</span>
              <span className="text-orelio-navy">4%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-orelio-light-gray">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: '4%' }} />
            </div>
          </div>
        </div>

        {/* Insurance KPI */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Insurance</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f('₹ 2.79 Cr')}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold text-orelio-gray tracking-wider uppercase mb-1.5">
              <span>Coverage Score</span>
              <span className="text-orelio-navy">99%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-orelio-light-gray">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '99%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* ROW 3: Liquidity Breakdown & Debt to Asset Ratio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Liquidity Breakdown (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col justify-between gap-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-orelio-darkgreen uppercase">Liquidity Profile</span>
            <h3 className="text-xl font-bold text-orelio-navy mt-0.5">Liquidity Breakdown</h3>
          </div>

          <div className="space-y-4">
            {/* Liquidity Item 1 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex-shrink-0">
                  <Activity size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Market Linked Assets</span>
                  <span className="block text-xs text-orelio-gray mt-0.5">Stocks, Mutual Funds (Medium Liquidity)</span>
                </div>
              </div>
              <div className="text-right pl-3">
                <span className="block text-sm font-bold text-orelio-navy">{f('₹ 1.24 Cr')}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                  <ArrowUpRight size={10} className="stroke-[2.5]" />
                  <span>+14.2%</span>
                </span>
              </div>
            </div>

            {/* Liquidity Item 2 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex-shrink-0">
                  <TrendingUp size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Fixed Income Assets</span>
                  <span className="block text-xs text-orelio-gray mt-0.5">FDs, Bonds (Fixed Lock-in)</span>
                </div>
              </div>
              <div className="text-right pl-3">
                <span className="block text-sm font-bold text-orelio-navy">{f('₹ 82.5 L')}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                  <ArrowUpRight size={10} className="stroke-[2.5]" />
                  <span>+7.1%</span>
                </span>
              </div>
            </div>

            {/* Liquidity Item 3 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
                  <Wallet size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Cash & Savings</span>
                  <span className="block text-xs text-orelio-gray mt-0.5">Bank Accounts (Instant Liquidity)</span>
                </div>
              </div>
              <div className="text-right pl-3">
                <span className="block text-sm font-bold text-orelio-navy">{f('₹ 23.5 L')}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 mt-0.5">
                  <ArrowDownRight size={10} className="stroke-[2.5]" />
                  <span>-2.4%</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Debt to Asset Ratio Card (1/3 width) */}
        <div className="glass-card-dark p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 text-emerald-800/10 opacity-30 transform rotate-12 group-hover:scale-110 transition-transform duration-300">
            <PiggyBank size={180} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Activity size={16} />
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Debt to Asset Ratio</span>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-extrabold tracking-tight text-white">{f('0.15')}</div>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                You have built a solid financial safety net that handles life's surprises well. Keep it up!
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-200 mt-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            <span>Under healthy threshold (&lt; 0.35)</span>
          </div>
        </div>

      </div>

      {/* ROW 4: Asset Allocation & Liabilities Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Assets Allocation Card */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-orelio-darkgreen uppercase">Wealth Distribution</span>
            <h3 className="text-lg font-bold text-orelio-navy mt-0.5">Total Assets Allocation</h3>
          </div>
          <div className="h-full flex items-center">
            <AssetAllocationChart />
          </div>
        </div>

        {/* Loans & Credit Liability Card */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-orelio-darkgreen uppercase">Liabilities Analysis</span>
            <h3 className="text-lg font-bold text-orelio-navy mt-0.5">Loans & Credit Liability</h3>
          </div>
          <div className="h-full flex items-center">
            <LiabilityChart />
          </div>
        </div>

      </div>

    </div>
  );
};
