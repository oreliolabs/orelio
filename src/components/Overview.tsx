import React from 'react';
import { AssetAllocationChart, LiabilityChart } from './Charts';
import { 
  /* AlertCircle, */
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Activity, 
  PiggyBank 
} from 'lucide-react';
import { 
  getOverviewMetrics,
  getStocks,
  getMutualFunds,
  getDebtHoldings,
  getBankAccounts,
  getDeposits,
  getLoans,
  getPolicies
} from '../data/orelioStore';

interface OverviewProps {
  isPrivate: boolean;
  selectedMemberId?: string | 'all';
}

export const Overview: React.FC<OverviewProps> = ({ isPrivate, selectedMemberId = 'all' }) => {
  const metrics = getOverviewMetrics(selectedMemberId);
  const stocks = getStocks(selectedMemberId);
  const mfs = getMutualFunds(selectedMemberId);
  const debts = getDebtHoldings(selectedMemberId);
  const bankAccounts = getBankAccounts(selectedMemberId);
  const deposits = getDeposits(selectedMemberId);
  const loans = getLoans(selectedMemberId);
  const policies = getPolicies(selectedMemberId);

  const marketLinked = stocks.reduce((acc, s) => acc + s.marketValue, 0) +
                       mfs.reduce((acc, m) => acc + m.marketValue, 0) +
                       debts.reduce((acc, d) => acc + d.marketValue, 0);
  const cash = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const fixedIncome = deposits
    .filter((d) => d.status === 'active')
    .reduce((acc, d) => acc + (d.currentValue || d.principalOrMonthly || 0), 0);

  const totalAssets = marketLinked + cash + fixedIncome;
  const totalLiabilities = loans.reduce((acc, l) => acc + (l.outstandingBalance || 0), 0);
  const totalInsurance = policies.reduce((acc, p) => acc + (p.sumInsured || 0), 0);

  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets).toFixed(2) : '0.00';
  const debtRatioNum = parseFloat(debtToAssetRatio);

  const formatCompact = (num: number) => {
    if (num >= 10000000) {
      const val = (num / 10000000).toFixed(2).replace(/\.?0+$/, '');
      return `₹\u00A0${val} Cr`;
    }
    if (num >= 100000) {
      const val = (num / 100000).toFixed(1).replace(/\.?0+$/, '');
      return `₹\u00A0${val} L`;
    }
    if (num >= 1000) {
      return `₹\u00A0${Math.round(num / 1000)}k`;
    }
    return `₹\u00A0${num.toLocaleString('en-IN')}`;
  };

  /*
  const upcomingDeposit = deposits
    .filter((d) => d.status === 'active' && d.maturityDate)
    .sort((a, b) => (a.maturityDate || 0) - (b.maturityDate || 0))[0];

  const upcomingDepositDate = upcomingDeposit ? new Date(upcomingDeposit.maturityDate).toLocaleDateString('en-GB') : '';
  const upcomingDepositAmount = upcomingDeposit ? formatCompact(upcomingDeposit.currentValue || upcomingDeposit.principalOrMonthly) : '';
  */

  // Helper to mask values in private mode
  const f = (val: string) => (isPrivate ? '••••' : val);

  return (
    <div className="space-y-6 fade-in">
      
      {/* ROW 1: Net Worth Card & Heads Up Alert Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Net Worth Card (Full width while Heads Up card is hidden) */}
        <div className="col-span-full glass-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006A65]/5 hover:border-[#006A65]/35 cursor-default">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="block text-xs font-bold tracking-widest text-orelio-darkgreen uppercase">Current Net Worth</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-orelio-navy mt-1 tracking-tight">
                {f(metrics.netWorthDisplay)}
              </h2>
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

            </svg>
          </div>
        </div>

        {/* Heads Up! FD Maturing Card (1/3 width) - Temporarily hidden */}
        {/*
        <div className="glass-card-dark p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/40 hover:border-emerald-500/35 cursor-default">
          <div className="absolute -right-6 -bottom-6 text-emerald-800/10 opacity-30 transform -rotate-12 group-hover:scale-115 group-hover:rotate-0 transition-transform duration-500 ease-out pointer-events-none">
            <AlertCircle size={180} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform duration-300 ease-out">
                <AlertCircle size={16} />
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Heads Up!</span>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white leading-snug">
                {upcomingDeposit ? 'Fixed Deposit maturing soon' : 'Portfolio in Good Standing'}
              </h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                {upcomingDeposit 
                  ? `${upcomingDeposit.bankName} FD for ${f(upcomingDepositAmount)} expires on ${upcomingDepositDate}. Plan your reinvestment options.`
                  : 'All fixed income reserves are active. Review your wealth allocation regularly.'}
              </p>
            </div>
          </div>

          <button className="relative z-10 w-full sm:w-auto self-start mt-6 px-5 py-2.5 rounded-xl bg-white text-forest-900 text-xs font-bold shadow-md hover:bg-emerald-50 hover:scale-103 active:scale-97 transition-all cursor-pointer">
            Manage Asset
          </button>
        </div>
        */}

      </div>

      {/* ROW 2: Total Assets, Loans & Credit, Insurance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Assets KPI */}
        <div className="glass-card p-6 group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/5 hover:border-sky-500/35 cursor-default">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Total Assets</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f(formatCompact(totalAssets))}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out">
              <TrendingUp size={18} />
            </span>
          </div>
        </div>

        {/* Loans & Credit KPI */}
        <div className="glass-card p-6 group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/5 hover:border-amber-500/35 cursor-default">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Loans & Credit</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f(formatCompact(totalLiabilities))}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 ease-out">
              <Wallet size={18} />
            </span>
          </div>
        </div>

        {/* Insurance KPI */}
        <div className="glass-card p-6 group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5 hover:border-emerald-500/35 cursor-default">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold tracking-wider text-orelio-gray uppercase">Insurance</span>
              <span className="block text-2xl font-extrabold text-orelio-navy mt-1">{f(formatCompact(totalInsurance))}</span>
            </div>
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out">
              <ShieldCheck size={18} />
            </span>
          </div>
        </div>

      </div>

      {/* ROW 3: Liquidity Breakdown & Debt to Asset Ratio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Liquidity Breakdown (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5 sm:gap-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006A65]/5 hover:border-[#006A65]/35 cursor-default">
          <div>
            <h3 className="text-xl font-bold text-orelio-navy">Liquidity Breakdown</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Liquidity Item 1 */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 hover:translate-x-1 transition-all duration-200 group cursor-default">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-3">
                <span className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Activity size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Market Linked Assets</span>
                  <span className="block text-xs text-orelio-gray mt-0.5 truncate">Stocks, Mutual Funds (Medium Liquidity)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-sm sm:text-base font-bold text-orelio-navy whitespace-nowrap">{f(formatCompact(marketLinked))}</span>
              </div>
            </div>

            {/* Liquidity Item 2 */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 hover:translate-x-1 transition-all duration-200 group cursor-default">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-3">
                <span className="p-2 sm:p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Fixed Income Assets</span>
                  <span className="block text-xs text-orelio-gray mt-0.5 truncate">FDs, Bonds (Fixed Lock-in)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-sm sm:text-base font-bold text-orelio-navy whitespace-nowrap">{f(formatCompact(fixedIncome))}</span>
              </div>
            </div>

            {/* Liquidity Item 3 */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-orelio-light-gray/25 border border-[#C3C6CE]/10 hover:bg-orelio-light-gray/45 hover:translate-x-1 transition-all duration-200 group cursor-default">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-3">
                <span className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Wallet size={18} />
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-orelio-navy truncate">Cash & Savings</span>
                  <span className="block text-xs text-orelio-gray mt-0.5 truncate">Bank Accounts (Instant Liquidity)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-sm sm:text-base font-bold text-orelio-navy whitespace-nowrap">{f(formatCompact(cash))}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Debt to Asset Ratio Card (1/3 width) */}
        <div className="glass-card-dark p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/40 hover:border-emerald-500/35 cursor-default">
          <div className="absolute -right-8 -bottom-8 text-emerald-800/10 opacity-30 transform rotate-12 group-hover:scale-115 group-hover:rotate-6 transition-transform duration-500 ease-out pointer-events-none">
            <PiggyBank size={180} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform duration-300 ease-out">
                <Activity size={16} />
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Debt to Asset Ratio</span>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-extrabold tracking-tight text-white">{f(debtToAssetRatio)}</div>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                {debtRatioNum < 0.35 
                  ? "You have built a solid financial safety net that handles life's surprises well. Keep it up!"
                  : "Keep an eye on debt levels relative to assets to maintain long-term financial security."}
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-200 mt-6 flex items-center gap-2 group-hover:border-emerald-500/40 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            <span>{debtRatioNum < 0.35 ? 'Under healthy threshold (< 0.35)' : 'Monitor debt threshold'}</span>
          </div>
        </div>

      </div>

      {/* ROW 4: Asset Allocation & Liabilities Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Assets Allocation Card */}
        <div className="glass-card p-6 md:p-7 flex flex-col justify-start transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006A65]/5 hover:border-[#006A65]/35 cursor-default">
          <div>
            <h3 className="text-lg font-bold text-orelio-navy">Total Assets Allocation</h3>
          </div>
          <div className="mt-3 flex-1 flex items-start">
            <AssetAllocationChart selectedMemberId={selectedMemberId} />
          </div>
        </div>

        {/* Loans & Credit Liability Card */}
        <div className="glass-card p-6 md:p-7 flex flex-col justify-start transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#006A65]/5 hover:border-[#006A65]/35 cursor-default">
          <div>
            <h3 className="text-lg font-bold text-orelio-navy">Loans & Credit Liability</h3>
          </div>
          <div className="mt-3 flex-1 flex items-start">
            <LiabilityChart selectedMemberId={selectedMemberId} isPrivate={isPrivate} />
          </div>
        </div>

      </div>

    </div>
  );
};
