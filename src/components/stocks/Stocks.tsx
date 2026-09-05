import React, { useState, useEffect, useMemo } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { UploadStockCASModal } from './UploadStockCASModal';
import {
  getStocks,
  saveStocks,
  getMutualFunds,
  saveMutualFunds,
  getDebtHoldings,
  saveDebtHoldings,
  getStockMetadata,
  saveStockMetadata
} from '../../data/orelioStore';
import type {
  StockHolding,
  MutualFundHolding,
  DebtHolding,
  StockCASMetadata,
  ParsedCASResult
} from '../../data/types';

interface StocksProps {
  isPrivate: boolean;
}

type TabType = 'ALL' | 'STOCKS' | 'MUTUAL_FUNDS' | 'DEBTS';

export const Stocks: React.FC<StocksProps> = ({ isPrivate }) => {
  const [stocks, setStocks] = useState<StockHolding[]>(() => getStocks());
  const [mutualFunds, setMutualFunds] = useState<MutualFundHolding[]>(() => getMutualFunds());
  const [debts, setDebts] = useState<DebtHolding[]>(() => getDebtHoldings());
  const [metadata, setMetadata] = useState<StockCASMetadata | null>(() => getStockMetadata());

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Persist to central orelioStore
  useEffect(() => {
    saveStocks(stocks);
    saveMutualFunds(mutualFunds);
    saveDebtHoldings(debts);
    saveStockMetadata(metadata);
  }, [stocks, mutualFunds, debts, metadata]);

  // Format Helpers
  const formatCurrency = (val: number, maxDecimals: number = 2) => {
    return isPrivate ? '••••' : '₹ ' + val.toLocaleString('en-IN', { maximumFractionDigits: maxDecimals });
  };

  const formatUnits = (val: number, decimals: number = 0) => {
    return isPrivate
      ? '••••'
      : val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatPercent = (val: number) => {
    return isPrivate ? '••••' : `${val.toFixed(1)}%`;
  };

  // Metrics
  const {
    totalStocksValue,
    totalMutualFundsValue,
    totalDebtsValue,
    grandTotalMarketValue,
    totalInvestedValue,
    returnPercent
  } = useMemo(() => {
    const sVal = stocks.reduce((acc, s) => acc + s.marketValue, 0);
    const mVal = mutualFunds.reduce((acc, m) => acc + m.marketValue, 0);
    const dVal = debts.reduce((acc, d) => acc + d.marketValue, 0);
    const grandTotal = sVal + mVal + dVal;

    const sInv = stocks.reduce((acc, s) => acc + (s.investedValue || s.marketValue * 0.9), 0);
    const mInv = mutualFunds.reduce((acc, m) => acc + (m.investedValue || m.marketValue * 0.85), 0);
    const dInv = debts.reduce((acc, d) => acc + (d.faceValue * d.quantity || d.marketValue), 0);
    const totalInv = sInv + mInv + dInv;

    const gain = grandTotal - totalInv;
    const pct = totalInv > 0 ? (gain / totalInv) * 100 : 0;

    return {
      totalStocksValue: sVal,
      totalMutualFundsValue: mVal,
      totalDebtsValue: dVal,
      grandTotalMarketValue: grandTotal,
      totalInvestedValue: totalInv,
      returnPercent: pct
    };
  }, [stocks, mutualFunds, debts]);

  // Unique list of demat accounts for filtering
  const availableAccounts = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => s.dematAccount && set.add(s.dematAccount));
    mutualFunds.forEach((m) => m.dematAccount && set.add(m.dematAccount));
    debts.forEach((d) => d.dematAccount && set.add(d.dematAccount));
    return Array.from(set);
  }, [stocks, mutualFunds, debts]);

  // Filtered lists
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchAcc = selectedAccount === 'ALL' || s.dematAccount === selectedAccount;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.companyName.toLowerCase().includes(q) ||
        s.symbol.toLowerCase().includes(q) ||
        (s.isin && s.isin.toLowerCase().includes(q));
      return matchAcc && matchSearch;
    });
  }, [stocks, selectedAccount, searchQuery]);

  const filteredMutualFunds = useMemo(() => {
    return mutualFunds.filter((m) => {
      const matchAcc = selectedAccount === 'ALL' || m.dematAccount === selectedAccount;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.schemeName.toLowerCase().includes(q) ||
        (m.amc && m.amc.toLowerCase().includes(q)) ||
        m.isin.toLowerCase().includes(q);
      return matchAcc && matchSearch;
    });
  }, [mutualFunds, selectedAccount, searchQuery]);

  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      const matchAcc = selectedAccount === 'ALL' || d.dematAccount === selectedAccount;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.issuer.toLowerCase().includes(q) ||
        d.isin.toLowerCase().includes(q);
      return matchAcc && matchSearch;
    });
  }, [debts, selectedAccount, searchQuery]);

  // Unified items for "ALL" tab
  type UnifiedItem =
    | { type: 'STOCK'; item: StockHolding }
    | { type: 'MF'; item: MutualFundHolding }
    | { type: 'DEBT'; item: DebtHolding };

  const unifiedList = useMemo<UnifiedItem[]>(() => {
    const list: UnifiedItem[] = [];
    if (activeTab === 'ALL' || activeTab === 'STOCKS') {
      filteredStocks.forEach((s) => list.push({ type: 'STOCK', item: s }));
    }
    if (activeTab === 'ALL' || activeTab === 'MUTUAL_FUNDS') {
      filteredMutualFunds.forEach((m) => list.push({ type: 'MF', item: m }));
    }
    if (activeTab === 'ALL' || activeTab === 'DEBTS') {
      filteredDebts.forEach((d) => list.push({ type: 'DEBT', item: d }));
    }
    return list;
  }, [activeTab, filteredStocks, filteredMutualFunds, filteredDebts]);

  // Pagination logic
  const totalPages = Math.ceil(unifiedList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return unifiedList.slice(startIndex, startIndex + itemsPerPage);
  }, [unifiedList, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedAccount, searchQuery]);

  const handleCASSuccess = (data: ParsedCASResult) => {
    setStocks(data.stocks);
    setMutualFunds(data.mutualFunds);
    setDebts(data.debts);
    setMetadata(data.metadata);
    saveStocks(data.stocks);
    saveMutualFunds(data.mutualFunds);
    saveDebtHoldings(data.debts);
    saveStockMetadata(data.metadata);
    setCurrentPage(1);
  };

  const handleDeleteAll = () => {
    setStocks([]);
    setMutualFunds([]);
    setDebts([]);
    setMetadata(null);
    saveStocks([]);
    saveMutualFunds([]);
    saveDebtHoldings([]);
    saveStockMetadata(null);
    setCurrentPage(1);
    setIsDeleteModalOpen(false);
  };

  const totalHoldingsCount = stocks.length + mutualFunds.length + debts.length;

  return (
    <div className="space-y-6 fade-in px-2 pb-2">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-[#00162A]">Stocks & Mutual Funds</h2>
          </div>
          <p className="text-sm font-medium text-[#707975] mt-1">
            Manage and track your equity holdings, mutual funds, and portfolio performance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {totalHoldingsCount > 0 && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete all holdings data"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#707975] hover:text-[#BA1A1A] hover:bg-[#FFF8F7] border border-[#C3C6CE]/30 hover:border-[#BA1A1A]/30 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined select-none text-[20px]">
                delete
              </span>
            </button>
          )}
          <PrimaryButton
            icon="upload_file"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload CAS Statement
          </PrimaryButton>
        </div>
      </div>

      {totalHoldingsCount === 0 ? (
        <div className="text-center py-20 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[36px]">
              trending_up
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#00162A] tracking-tight">
            No Stocks or Mutual Funds Yet
          </h3>
          <p className="text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Upload your CDSL, NSDL, or CAMS Consolidated Account Statement (CAS) to import your stock and mutual fund investments.
          </p>
          <div className="mt-6">
            <PrimaryButton
              onClick={() => setIsUploadModalOpen(true)}
              icon="upload_file"
            >
              Upload Your First CAS Statement
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal Divider Bar */}
          <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

          {/* Top Row: Net Current Value Card & Asset Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Net Current Value Card (2 columns wide on large screens) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] border border-[#C3C6CE]/20 group">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="block text-xs font-extrabold tracking-widest text-[#006A65] uppercase"
                    style={{ letterSpacing: '2.4px' }}
                  >
                    CONSOLIDATED PORTFOLIO VALUE
                  </span>
                  {metadata?.statementPeriod && (
                    <span className="text-[11px] font-semibold text-[#74777F] bg-[#F2F4F5] px-2.5 py-0.5 rounded-full">
                      Period: {metadata.statementPeriod}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl md:text-4xl font-extrabold text-[#00162A]">
                    {formatCurrency(grandTotalMarketValue)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006A65]/10 text-[#006A65] text-[11px] font-bold">
                    <span className="material-symbols-outlined select-none text-xs">
                      trending_up
                    </span>
                    {isPrivate ? '•••• return' : `+${returnPercent.toFixed(1)}% return`}
                  </span>
                </div>

                <div className="flex items-center gap-6 pt-1 text-xs text-[#73777E] flex-wrap">
                  <p>
                    Invested Capital:{' '}
                    <span className="text-[#00162A] font-bold">
                      {formatCurrency(totalInvestedValue)}
                    </span>
                  </p>
                  {metadata?.investorName && (
                    <p>
                      Holder:{' '}
                      <span className="text-[#00162A] font-bold">
                        {metadata.investorName}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Sparkline Graphic */}
              <div className="absolute right-0 bottom-0 w-64 sm:w-80 md:w-[420px] h-32 pointer-events-none overflow-hidden opacity-85 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-full h-full" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="stockCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006A65" stopOpacity="0.22" />
                      <stop offset="70%" stopColor="#006A65" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#006A65" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 100 C 60 98, 110 66, 170 70 C 230 74, 275 42, 330 38 C 365 35, 385 15, 400 8 L 400 100 L 0 100 Z"
                    fill="url(#stockCurveGrad)"
                  />
                  <path
                    d="M 0 100 C 60 98, 110 66, 170 70 C 230 74, 275 42, 330 38 C 365 35, 385 15, 400 8"
                    stroke="#006A65"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Asset Breakdown Stack */}
            <div className="bg-white rounded-3xl p-5 border border-[#C3C6CE]/20 flex flex-col justify-between gap-3 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)]">
              <span className="text-xs font-extrabold tracking-widest text-[#74777F] uppercase">
                PORTFOLIO ALLOCATION
              </span>

              {/* Equities Row */}
              <div
                onClick={() => setActiveTab('STOCKS')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                  activeTab === 'STOCKS' ? 'bg-[#E6F4F1] border border-[#006A65]/30' : 'bg-[#FBFCFD] hover:bg-[#F2F4F5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <span className="material-symbols-outlined select-none text-base">show_chart</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#00162A]">Equities (Stocks)</span>
                    <span className="block text-[11px] text-[#74777F]">{stocks.length} Companies</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-extrabold text-[#00162A]">
                    {formatCurrency(totalStocksValue)}
                  </span>
                  <span className="text-[10px] text-[#74777F] font-bold">
                    {formatPercent(grandTotalMarketValue > 0 ? (totalStocksValue / grandTotalMarketValue) * 100 : 0)}
                  </span>
                </div>
              </div>

              {/* Mutual Funds Row */}
              <div
                onClick={() => setActiveTab('MUTUAL_FUNDS')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                  activeTab === 'MUTUAL_FUNDS' ? 'bg-[#E6F4F1] border border-[#006A65]/30' : 'bg-[#FBFCFD] hover:bg-[#F2F4F5]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <span className="material-symbols-outlined select-none text-base">pie_chart</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#00162A]">Mutual Funds & ETFs</span>
                    <span className="block text-[11px] text-[#74777F]">{mutualFunds.length} Schemes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-extrabold text-[#00162A]">
                    {formatCurrency(totalMutualFundsValue)}
                  </span>
                  <span className="text-[10px] text-[#74777F] font-bold">
                    {formatPercent(grandTotalMarketValue > 0 ? (totalMutualFundsValue / grandTotalMarketValue) * 100 : 0)}
                  </span>
                </div>
              </div>

              {/* Debts / Bonds Row */}
              {debts.length > 0 && (
                <div
                  onClick={() => setActiveTab('DEBTS')}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                    activeTab === 'DEBTS' ? 'bg-[#E6F4F1] border border-[#006A65]/30' : 'bg-[#FBFCFD] hover:bg-[#F2F4F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <span className="material-symbols-outlined select-none text-base">receipt_long</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#00162A]">Bonds & NCDs</span>
                      <span className="block text-[11px] text-[#74777F]">{debts.length} Instruments</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-extrabold text-[#00162A]">
                      {formatCurrency(totalDebtsValue)}
                    </span>
                    <span className="text-[10px] text-[#74777F] font-bold">
                      {formatPercent(grandTotalMarketValue > 0 ? (totalDebtsValue / grandTotalMarketValue) * 100 : 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Controls Bar: Tabs, Broker Filter, and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F2F4F5] rounded-2xl border border-[#C3C6CE]/20 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-[#00162A] shadow-xs'
                    : 'text-[#74777F] hover:text-[#00162A]'
                }`}
              >
                All Holdings ({totalHoldingsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('STOCKS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'STOCKS'
                    ? 'bg-white text-[#00162A] shadow-xs'
                    : 'text-[#74777F] hover:text-[#00162A]'
                }`}
              >
                Stocks ({stocks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MUTUAL_FUNDS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'MUTUAL_FUNDS'
                    ? 'bg-white text-[#00162A] shadow-xs'
                    : 'text-[#74777F] hover:text-[#00162A]'
                }`}
              >
                Mutual Funds ({mutualFunds.length})
              </button>
              {debts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('DEBTS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'DEBTS'
                      ? 'bg-white text-[#00162A] shadow-xs'
                      : 'text-[#74777F] hover:text-[#00162A]'
                  }`}
                >
                  Bonds & NCDs ({debts.length})
                </button>
              )}
            </div>

            {/* Account & Search Filters */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {availableAccounts.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-bold text-[#00162A] focus:outline-none focus:border-[#006A65] shadow-xs cursor-pointer"
                  >
                    <option value="ALL">All Brokers</option>
                    {availableAccounts.map((acc) => (
                      <option key={acc} value={acc}>
                        {acc}
                      </option>
                    ))}
                  </select>
                  <span
                    className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#74777F] pointer-events-none select-none text-[18px]"
                    style={{ fontVariationSettings: "'wght' 300" }}
                  >
                    keyboard_arrow_down
                  </span>
                </div>
              )}

              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined select-none text-base text-[#74777F] absolute left-3 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, symbol..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] placeholder-[#74777F]/70 focus:outline-none focus:border-[#006A65] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="glass-card p-6 overflow-hidden border border-[#C3C6CE]/20 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table
                className="w-full text-left text-sm font-medium border-collapse text-[#00162A]"
                style={{ color: '#00162A' }}
              >
                <thead>
                  <tr className="border-b border-[#C3C6CE]/20 text-[#74777F] text-xs tracking-wider uppercase">
                    <th className="pb-3 font-bold">Asset / Instrument</th>
                    <th className="pb-3 font-bold">Account / Broker</th>
                    <th className="pb-3 font-bold">Units / Qty</th>
                    <th className="pb-3 font-bold">Price / NAV</th>
                    <th className="pb-3 font-bold">Market Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3C6CE]/10 text-[#00162A]">
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#74777F]">
                        No holdings match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map(({ type, item }) => {
                      if (type === 'STOCK') {
                        const stock = item as StockHolding;
                        return (
                          <tr key={stock.id} className="hover:bg-[#FBFCFD]/80 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined select-none text-base">show_chart</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-[#00162A]">{stock.companyName}</span>
                                  <span className="block text-xs text-[#74777F] font-medium">
                                    {stock.symbol} {stock.sector ? `• ${stock.sector}` : ''}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F2F4F5] text-[#3F4945]">
                                {stock.dematAccount || 'Demat'}
                              </span>
                            </td>
                            <td className="py-4 font-semibold">
                              {formatUnits(stock.quantity)}
                            </td>
                            <td className="py-4">
                              {formatCurrency(stock.currentPrice)}
                            </td>
                            <td className="py-4 font-bold text-[#00162A]">
                              {formatCurrency(stock.marketValue)}
                            </td>
                          </tr>
                        );
                      }

                      if (type === 'MF') {
                        const mf = item as MutualFundHolding;
                        return (
                          <tr key={mf.id} className="hover:bg-[#FBFCFD]/80 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined select-none text-base">pie_chart</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-[#00162A]">{mf.schemeName}</span>
                                  <span className="block text-xs text-[#74777F] font-medium">
                                    {mf.amc || 'Mutual Fund'} • {mf.category || 'Direct Plan'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F2F4F5] text-[#3F4945]">
                                {mf.dematAccount || 'Zerodha'}
                              </span>
                            </td>
                            <td className="py-4 font-semibold">
                              {formatUnits(mf.units, 3)}
                            </td>
                            <td className="py-4">
                              {formatCurrency(mf.nav, 4)}
                            </td>
                            <td className="py-4 font-bold text-[#00162A]">
                              {formatCurrency(mf.marketValue)}
                            </td>
                          </tr>
                        );
                      }

                      // Debt Instrument
                      const debt = item as DebtHolding;
                      return (
                        <tr key={debt.id} className="hover:bg-[#FBFCFD]/80 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined select-none text-base">receipt_long</span>
                              </div>
                              <div>
                                <span className="block font-bold text-[#00162A]">{debt.issuer}</span>
                                <span className="block text-xs text-[#74777F] font-medium">
                                  {debt.interestRate ? `${debt.interestRate} NCD` : 'Bond'} • {debt.isin}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F2F4F5] text-[#3F4945]">
                              {debt.dematAccount || 'NSDL'}
                            </span>
                          </td>
                          <td className="py-4 font-semibold">
                            {formatUnits(debt.quantity)}
                          </td>
                          <td className="py-4">
                            {formatCurrency(debt.marketPrice)}
                          </td>
                          <td className="py-4 font-bold text-[#00162A]">
                            {formatCurrency(debt.marketValue)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-[#C3C6CE]/20">
                <span className="text-xs text-[#707975] font-semibold">
                  Showing <span className="text-[#00162A] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="text-[#00162A] font-bold">{Math.min(currentPage * itemsPerPage, unifiedList.length)}</span> of{' '}
                  <span className="text-[#00162A] font-bold">{unifiedList.length}</span> holdings
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-0.5 px-3 py-1.5 text-xs font-bold text-[#3F4945] hover:text-[#00162A] disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="material-symbols-outlined select-none text-lg">
                      chevron_left
                    </span>
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#00162A] text-white shadow-xs'
                              : 'border border-[#C3C6CE]/40 bg-white text-[#3F4945] hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-0.5 px-3 py-1.5 text-xs font-bold text-[#3F4945] hover:text-[#00162A] disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    Next
                    <span className="material-symbols-outlined select-none text-lg">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload CAS Statement Modal */}
      <UploadStockCASModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleCASSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete Stocks & Mutual Funds?"
        subtitle="Are you sure you want to delete all parsed stocks, mutual funds, and debt holdings? This action cannot be undone."
        confirmText="Delete All"
      />
    </div>
  );
};

