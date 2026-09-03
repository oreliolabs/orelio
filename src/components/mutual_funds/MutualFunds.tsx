import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { UploadCASModal } from './UploadCASModal';
import { AddEditFundModal } from './AddEditFundModal';
import { FundDetailsModal } from './FundDetailsModal';
import { SAMPLE_CAS_METADATA, SAMPLE_SCHEMES } from './sampleCASData';
import type {
  MutualFundScheme,
  CASStatementMetadata,
  CategoryFilter,
  SortOption,
  MutualFundCategory
} from './MutualFundsTypes';

interface MutualFundsProps {
  isPrivate: boolean;
}

const STORAGE_SCHEMES_KEY = 'orelio_mutual_funds_schemes';
const STORAGE_METADATA_KEY = 'orelio_mutual_funds_metadata';

export const MutualFunds: React.FC<MutualFundsProps> = ({ isPrivate }) => {
  // Load initial data from localStorage or fallback to sample
  const [schemes, setSchemes] = useState<MutualFundScheme[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SCHEMES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved mutual funds:', e);
    }
    return SAMPLE_SCHEMES;
  });

  const [metadata, setMetadata] = useState<CASStatementMetadata | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_METADATA_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved metadata:', e);
    }
    return SAMPLE_CAS_METADATA;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCHEMES_KEY, JSON.stringify(schemes));
      if (metadata) {
        localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(metadata));
      } else {
        localStorage.removeItem(STORAGE_METADATA_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist mutual funds:', e);
    }
  }, [schemes, metadata]);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<MutualFundScheme | null>(null);
  const [selectedFundDetails, setSelectedFundDetails] = useState<MutualFundScheme | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFund, setDeletingFund] = useState<MutualFundScheme | null>(null);

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter & Search & Sort states
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('VALUE_DESC');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mf-card-menu-container')) {
        setActiveMenuId(null);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Format Helpers
  const formatCurrency = (val: number) => {
    return isPrivate ? '••••••' : '₹ ' + val.toLocaleString('en-IN');
  };

  const getCategoryIcon = (category: MutualFundCategory) => {
    switch (category) {
      case 'Equity':
        return 'trending_up';
      case 'Debt':
        return 'account_balance';
      case 'Hybrid':
        return 'pie_chart';
      case 'ELSS':
        return 'shield';
      case 'Liquid':
        return 'savings';
      case 'Index':
        return 'layers';
      default:
        return 'business_center';
    }
  };

  // Portfolio Totals & Metrics
  const portfolioMetrics = useMemo(() => {
    let totalCurrent = 0;
    let totalInvested = 0;
    let totalSipAmount = 0;
    let activeSipCount = 0;

    const categoryBreakdown: Record<string, number> = {
      Equity: 0,
      Debt: 0,
      Hybrid: 0,
      ELSS: 0,
      Liquid: 0,
      Other: 0
    };

    schemes.forEach((scheme) => {
      totalCurrent += scheme.currentValue;
      totalInvested += scheme.investedAmount;
      if (scheme.sipActive && scheme.sipAmount) {
        totalSipAmount += scheme.sipAmount;
        activeSipCount += 1;
      }
      const catKey = scheme.category in categoryBreakdown ? scheme.category : 'Other';
      categoryBreakdown[catKey] += scheme.currentValue;
    });

    const totalGain = totalCurrent - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    const totalFolios = new Set(schemes.map((s) => s.folioNumber)).size;

    // Best performer
    let bestPerformer = schemes.length > 0 ? schemes[0] : null;
    schemes.forEach((s) => {
      if (!bestPerformer || s.unrealizedGainPercent > bestPerformer.unrealizedGainPercent) {
        bestPerformer = s;
      }
    });

    return {
      totalCurrent,
      totalInvested,
      totalGain,
      totalGainPercent,
      totalFolios,
      totalSipAmount,
      activeSipCount,
      categoryBreakdown,
      bestPerformer
    };
  }, [schemes]);

  // Filtered & Sorted schemes
  const filteredSchemes = useMemo(() => {
    return schemes
      .filter((s) => {
        if (selectedCategory !== 'ALL' && s.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = s.schemeName.toLowerCase().includes(q);
          const matchAmc = s.amc.toLowerCase().includes(q);
          const matchFolio = s.folioNumber.toLowerCase().includes(q);
          const matchIsin = (s.isin || '').toLowerCase().includes(q);
          if (!matchName && !matchAmc && !matchFolio && !matchIsin) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'VALUE_DESC':
            return b.currentValue - a.currentValue;
          case 'VALUE_ASC':
            return a.currentValue - b.currentValue;
          case 'GAIN_DESC':
            return b.unrealizedGain - a.unrealizedGain;
          case 'GAIN_ASC':
            return a.unrealizedGain - b.unrealizedGain;
          case 'GAIN_PERCENT_DESC':
            return b.unrealizedGainPercent - a.unrealizedGainPercent;
          case 'NAME_ASC':
            return a.schemeName.localeCompare(b.schemeName);
          default:
            return 0;
        }
      });
  }, [schemes, selectedCategory, searchQuery, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: schemes.length };
    schemes.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [schemes]);

  // Handlers
  const handleUploadSuccess = (data: {
    schemes: MutualFundScheme[];
    metadata: CASStatementMetadata;
  }) => {
    setSchemes(data.schemes);
    setMetadata(data.metadata);
  };

  const handleSaveFund = (savedFund: MutualFundScheme) => {
    setSchemes((prev) => {
      const index = prev.findIndex((f) => f.id === savedFund.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = savedFund;
        return next;
      }
      return [savedFund, ...prev];
    });
  };

  const handleDeleteConfirm = () => {
    if (deletingFund) {
      setSchemes((prev) => prev.filter((f) => f.id !== deletingFund.id));
      setDeletingFund(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleClearPortfolio = () => {
    if (window.confirm('Are you sure you want to clear your uploaded mutual funds data?')) {
      setSchemes([]);
      setMetadata(null);
      localStorage.removeItem(STORAGE_SCHEMES_KEY);
      localStorage.removeItem(STORAGE_METADATA_KEY);
    }
  };

  return (
    <div className="space-y-8 fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-[#006A65] uppercase">
              Assets / Mutual Funds
            </span>
            {metadata && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[#004D40] bg-[#E6F4F1] uppercase">
                {metadata.casType} SYNCED
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#00162A] tracking-tight mt-1">
            Mutual Funds Portfolio
          </h1>
          <p className="text-sm font-medium text-[#707975] mt-1">
            Consolidated Account Statement (CAS) tracking, performance analytics, and folio holdings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditingFund(null);
              setIsAddEditModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#C3C6CE]/40 bg-white text-[#00162A] text-xs font-bold hover:bg-[#F2F4F5] active:scale-98 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined select-none text-base">add</span>
            <span>Add Fund</span>
          </button>

          <PrimaryButton
            icon="upload_file"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload CAS Statement
          </PrimaryButton>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

      {/* Top KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI 1: Net Current Value Card */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group hover:border-[#006A65]/40 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
                PORTFOLIO VALUE
              </span>
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  portfolioMetrics.totalGain >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                <span className="material-symbols-outlined select-none text-xs">
                  {portfolioMetrics.totalGain >= 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <span>
                  {portfolioMetrics.totalGain >= 0 ? '+' : ''}
                  {portfolioMetrics.totalGainPercent.toFixed(1)}% total return
                </span>
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00162A] tracking-tight">
                {formatCurrency(portfolioMetrics.totalCurrent)}
              </span>
              <div className="flex items-center gap-4 text-xs font-medium text-[#707975] mt-2">
                <span>
                  Invested:{' '}
                  <strong className="text-[#00162A]">
                    {formatCurrency(portfolioMetrics.totalInvested)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Returns:{' '}
                  <strong
                    className={
                      portfolioMetrics.totalGain >= 0 ? 'text-[#006A65]' : 'text-[#BA1A1A]'
                    }
                  >
                    {isPrivate
                      ? '••••'
                      : `${portfolioMetrics.totalGain >= 0 ? '+' : ''}₹ ${portfolioMetrics.totalGain.toLocaleString('en-IN')}`}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#C3C6CE]/20 flex items-center justify-between text-xs">
            <span className="text-[#74777F] font-semibold">
              {portfolioMetrics.totalFolios} Folios across {schemes.length} Schemes
            </span>
            <span className="text-[#006A65] font-extrabold uppercase tracking-wider text-[11px]">
              CAS VERIFIED
            </span>
          </div>
        </div>

        {/* KPI 2: Asset Allocation Stats Card (Forest Green #004D40) */}
        <div className="bg-[#004D40] rounded-3xl p-6 md:p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-[#AFEFDD] uppercase">
                ASSET ALLOCATION
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00342B] text-emerald-200">
                DIVERSIFIED
              </span>
            </div>

            {/* Allocation Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-[#00342B] overflow-hidden flex">
                {portfolioMetrics.totalCurrent > 0 ? (
                  <>
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Equity / portfolioMetrics.totalCurrent) * 100}%`
                      }}
                      className="h-full bg-[#AFEFDD]"
                      title="Equity"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Hybrid / portfolioMetrics.totalCurrent) * 100}%`
                      }}
                      className="h-full bg-emerald-400"
                      title="Hybrid"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.ELSS / portfolioMetrics.totalCurrent) * 100}%`
                      }}
                      className="h-full bg-teal-300"
                      title="ELSS"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Liquid / portfolioMetrics.totalCurrent) * 100}%`
                      }}
                      className="h-full bg-amber-300"
                      title="Liquid"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Debt / portfolioMetrics.totalCurrent) * 100}%`
                      }}
                      className="h-full bg-sky-300"
                      title="Debt"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-[#00342B]" />
                )}
              </div>

              {/* Legend rows */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#AFEFDD] flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium">Equity</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalCurrent > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown.Equity /
                            portfolioMetrics.totalCurrent) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium">Hybrid</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalCurrent > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown.Hybrid /
                            portfolioMetrics.totalCurrent) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-300 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium">ELSS</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalCurrent > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown.ELSS /
                            portfolioMetrics.totalCurrent) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium">Liquid/Debt</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalCurrent > 0
                      ? Math.round(
                          ((portfolioMetrics.categoryBreakdown.Liquid +
                            portfolioMetrics.categoryBreakdown.Debt) /
                            portfolioMetrics.totalCurrent) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-700/40 text-[11px] text-emerald-100/80 flex items-center justify-between">
            <span>Aggressive wealth accumulation</span>
            <span className="font-bold">HEALTHY</span>
          </div>
        </div>

        {/* KPI 3: SIP & Inflow Card */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group hover:border-[#006A65]/40 transition-all">
          <div className="space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
              SYSTEMATIC INVESTMENT (SIP)
            </span>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00162A] tracking-tight">
                {isPrivate
                  ? '••••••'
                  : `₹ ${portfolioMetrics.totalSipAmount.toLocaleString('en-IN')}`}
              </span>
              <span className="block text-xs font-medium text-[#707975] mt-1">
                Total monthly recurring installment
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/30 space-y-1">
              <span className="block text-[10px] font-extrabold uppercase text-[#74777F] tracking-wider">
                TOP PERFORMING SCHEME
              </span>
              <span className="block text-xs font-bold text-[#00162A] truncate">
                {portfolioMetrics.bestPerformer?.schemeName || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#006A65]">
                <span className="material-symbols-outlined select-none text-xs">trending_up</span>
                <span>
                  +{portfolioMetrics.bestPerformer?.unrealizedGainPercent || 0}% gain
                </span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#C3C6CE]/20 flex items-center justify-between text-xs">
            <span className="text-[#74777F] font-semibold">
              {portfolioMetrics.activeSipCount} Active SIPs Linked
            </span>
            <span className="text-emerald-700 font-extrabold text-[11px] uppercase">
              AUTOPAY ON
            </span>
          </div>
        </div>
      </div>

      {/* Synced CAS Statement Information Banner */}
      {metadata && (
        <div className="rounded-2xl p-4 md:p-5 bg-[#FBFCFD] border border-[#C3C6CE]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined select-none text-xl">
                verified
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-[#00162A] uppercase tracking-wider">
                  Synced CAS Statement
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F4F5] text-[#707975]">
                  {metadata.fileName}
                </span>
                {metadata.pan && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4F1] text-[#006A65]">
                    PAN: {metadata.pan}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#74777F] mt-0.5 truncate">
                Investor: <strong className="text-[#43474D]">{metadata.investorName}</strong> • Period:{' '}
                {metadata.statementPeriod}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-[#C3C6CE]/40 bg-white text-[#006A65] text-xs font-bold hover:bg-[#E6F4F1]/30 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined select-none text-sm">sync</span>
              <span>Re-sync CAS</span>
            </button>
            <button
              type="button"
              onClick={handleClearPortfolio}
              className="p-1.5 rounded-xl text-[#74777F] hover:text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors"
              title="Clear synced portfolio"
            >
              <span className="material-symbols-outlined select-none text-base">delete_sweep</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs, Search Bar, and Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['ALL', 'Equity', 'Debt', 'Hybrid', 'ELSS', 'Liquid'] as CategoryFilter[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5
                  ${isSelected
                    ? 'bg-[#00162A] text-white shadow-sm'
                    : 'bg-white border border-[#C3C6CE]/30 text-[#74777F] hover:text-[#00162A] hover:border-[#00162A]/40'
                  }
                `}
              >
                <span>{cat === 'ALL' ? 'All Schemes' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F2F4F5] text-[#74777F]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777F] text-base select-none pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme, AMC, folio..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#C3C6CE]/40 rounded-xl text-xs font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74777F] hover:text-[#00162A]"
              >
                <span className="material-symbols-outlined text-sm select-none">close</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="px-3 py-2 bg-white border border-[#C3C6CE]/40 rounded-xl text-xs font-bold text-[#00162A] hover:bg-[#F2F4F5] transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="material-symbols-outlined select-none text-base text-[#74777F]">
                sort
              </span>
              <span>Sort</span>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl border border-[#C3C6CE]/30 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 py-1">
                {[
                  { label: 'Highest Value', val: 'VALUE_DESC' },
                  { label: 'Lowest Value', val: 'VALUE_ASC' },
                  { label: 'Highest Gain %', val: 'GAIN_PERCENT_DESC' },
                  { label: 'Highest Profit (₹)', val: 'GAIN_DESC' },
                  { label: 'Scheme Name (A-Z)', val: 'NAME_ASC' }
                ].map((item) => {
                  const isSelected = sortBy === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setSortBy(item.val as SortOption);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-xs text-left font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#F2F4F5] text-[#00162A]'
                          : 'text-[#43474D] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined select-none text-[#006A65] text-sm">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="space-y-6">
        {/* Section Header with Inline Divider */}
        <div className="flex items-center gap-4 w-full">
          <h2 className="text-xl font-bold text-[#00162A] tracking-tight whitespace-nowrap">
            Holdings
          </h2>
          <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
            {filteredSchemes.length} {filteredSchemes.length === 1 ? 'SCHEME' : 'SCHEMES'}
          </span>
        </div>

        {/* Empty State */}
        {filteredSchemes.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#C3C6CE]/30 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '32px' }}>
                donut_large
              </span>
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-[#00162A]">
                {schemes.length === 0 ? 'No Mutual Funds Tracked Yet' : 'No matching funds found'}
              </h3>
              <p className="text-xs text-[#707975] leading-relaxed">
                {schemes.length === 0
                  ? 'Upload your CAMS, KFintech, or MFCentral CAS statement to automatically display all your mutual fund folios, NAVs, and performance metrics in seconds.'
                  : 'Try adjusting your search query or switching category filter.'}
              </p>
            </div>

            {schemes.length === 0 ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <PrimaryButton icon="upload_file" onClick={() => setIsUploadModalOpen(true)}>
                  Upload CAS Statement
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => {
                    setSchemes(SAMPLE_SCHEMES);
                    setMetadata(SAMPLE_CAS_METADATA);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#C3C6CE]/40 bg-white text-xs font-bold text-[#006A65] hover:bg-[#E6F4F1]/30 transition-all"
                >
                  Load Sample Portfolio
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="text-xs font-bold text-[#006A65] underline underline-offset-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Holdings Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => {
              const isMenuOpen = activeMenuId === scheme.id;
              const isPositive = scheme.unrealizedGain >= 0;

              return (
                <div
                  key={scheme.id}
                  className={`
                    rounded-3xl bg-white border border-[#C3C6CE]/30 p-6 space-y-5 transition-all duration-300
                    hover:-translate-y-1 hover:border-2 hover:border-[#006A65] hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)]
                    group relative cursor-pointer
                    ${isMenuOpen ? 'z-50' : 'z-0'}
                  `}
                  onClick={(e) => {
                    // Open details unless clicking more_vert menu
                    if ((e.target as HTMLElement).closest('.mf-card-menu-container')) {
                      return;
                    }
                    setSelectedFundDetails(scheme);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  {/* Card Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] group-hover:bg-[#006A65] text-[#006A65] group-hover:text-white flex items-center justify-center transition-all duration-300 flex-shrink-0">
                        <span
                          className="material-symbols-outlined select-none"
                          style={{ fontSize: '24px' }}
                        >
                          {getCategoryIcon(scheme.category)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold tracking-widest text-[#006A65] uppercase">
                            {scheme.category} {scheme.subCategory ? `• ${scheme.subCategory}` : ''}
                          </span>
                          {scheme.sipActive && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-[#E6F4F1] text-[#004D40] uppercase">
                              SIP
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#00162A] group-hover:text-[#006A65] transition-colors leading-snug line-clamp-1 mt-0.5">
                          {scheme.schemeName}
                        </h3>

                        <span className="block text-xs font-medium text-[#707975] mt-0.5">
                          {scheme.amc} • Folio: {scheme.folioNumber}
                        </span>
                      </div>
                    </div>

                    {/* Popover Menu Trigger */}
                    <div className="relative mf-card-menu-container flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : scheme.id);
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
                      >
                        <span className="material-symbols-outlined select-none">more_vert</span>
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl border border-[#C3C6CE]/30 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setSelectedFundDetails(scheme);
                              setIsDetailsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] text-left transition-colors flex items-center justify-between"
                          >
                            <span>View Details</span>
                            <span className="material-symbols-outlined select-none text-sm text-[#74777F]">
                              visibility
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setEditingFund(scheme);
                              setIsAddEditModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] text-left transition-colors flex items-center justify-between"
                          >
                            <span>Edit Fund</span>
                            <span className="material-symbols-outlined select-none text-sm text-[#74777F]">
                              edit
                            </span>
                          </button>

                          <div className="border-t border-[#C3C6CE]/20 my-0.5" />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              setDeletingFund(scheme);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] text-left transition-colors flex items-center justify-between"
                          >
                            <span>Delete Fund</span>
                            <span className="material-symbols-outlined select-none text-sm text-[#BA1A1A]">
                              delete
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics 4-Column Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#C3C6CE]/20">
                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        CURRENT VALUE
                      </span>
                      <span className="block text-base font-extrabold text-[#00162A] mt-1">
                        {formatCurrency(scheme.currentValue)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        TOTAL RETURNS
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`text-sm font-extrabold ${
                            isPositive ? 'text-[#006A65]' : 'text-[#BA1A1A]'
                          }`}
                        >
                          {isPrivate
                            ? '••••'
                            : `${isPositive ? '+' : ''}${formatCurrency(scheme.unrealizedGain)}`}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1 rounded ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {scheme.unrealizedGainPercent}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        INVESTED COST
                      </span>
                      <span className="block text-sm font-bold text-[#43474D] mt-1">
                        {formatCurrency(scheme.investedAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        UNITS & NAV
                      </span>
                      <span className="block text-xs font-semibold text-[#00162A] mt-1">
                        {isPrivate ? '••••' : scheme.units.toLocaleString('en-IN', { maximumFractionDigits: 2 })} units
                      </span>
                      <span className="block text-[11px] text-[#74777F]">
                        @ ₹{scheme.nav.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload CAS Modal */}
      <UploadCASModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Add / Edit Fund Modal */}
      <AddEditFundModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingFund(null);
        }}
        onSave={handleSaveFund}
        initialFund={editingFund}
        isEditing={Boolean(editingFund)}
      />

      {/* Detailed Fund View Modal */}
      <FundDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedFundDetails(null);
        }}
        fund={selectedFundDetails}
        onEdit={(fund) => {
          setEditingFund(fund);
          setIsAddEditModalOpen(true);
        }}
        isPrivate={isPrivate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingFund(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Mutual Fund?"
        subtitle={`Are you sure you want to remove "${deletingFund?.schemeName}" from your portfolio?`}
        confirmText="Delete Fund"
      />
    </div>
  );
};
