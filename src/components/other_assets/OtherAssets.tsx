import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddEditAssetModal } from './AddEditAssetModal';
import { AssetDetailsModal } from './AssetDetailsModal';
import { SAMPLE_OTHER_ASSETS } from './sampleOtherAssets';
import type {
  OtherAssetItem,
  AssetCategory,
  CategoryFilter,
  SortOption
} from './OtherAssetsTypes';

interface OtherAssetsProps {
  isPrivate: boolean;
}

const STORAGE_OTHER_ASSETS_KEY = 'orelio_other_assets_items';

export const OtherAssets: React.FC<OtherAssetsProps> = ({ isPrivate }) => {
  // Load initial assets from localStorage or fallback to sample
  const [assets, setAssets] = useState<OtherAssetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OTHER_ASSETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved other assets:', e);
    }
    return SAMPLE_OTHER_ASSETS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_OTHER_ASSETS_KEY, JSON.stringify(assets));
    } catch (e) {
      console.warn('Failed to persist other assets:', e);
    }
  }, [assets]);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OtherAssetItem | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<OtherAssetItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<OtherAssetItem | null>(null);

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
      if (!target.closest('.asset-card-menu-container')) {
        setActiveMenuId(null);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Format Helper
  const formatCurrency = (val: number) => {
    return isPrivate ? '••••••' : '₹ ' + val.toLocaleString('en-IN');
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'Real Estate':
        return 'apartment';
      case 'Crypto':
        return 'currency_bitcoin';
      case 'Bonds':
        return 'account_balance';
      case 'Gold & Metals':
        return 'monetization_on';
      case 'Alternative':
        return 'rocket_launch';
      case 'Vehicles':
        return 'directions_car';
      default:
        return 'inventory_2';
    }
  };

  // Portfolio Totals & Metrics
  const portfolioMetrics = useMemo(() => {
    let totalValuation = 0;
    let totalCost = 0;
    let totalMonthlyRental = 0;
    let totalAnnualBondCoupons = 0;

    const categoryBreakdown: Record<string, number> = {
      'Real Estate': 0,
      Crypto: 0,
      Bonds: 0,
      'Gold & Metals': 0,
      Alternative: 0,
      Other: 0
    };

    assets.forEach((asset) => {
      totalValuation += asset.currentValuation;
      totalCost += asset.costBasis;

      if (asset.rentalIncome && asset.rentalIncome > 0) {
        totalMonthlyRental += asset.rentalIncome;
      }
      if (asset.bondCouponRate && asset.bondCouponRate > 0) {
        totalAnnualBondCoupons += (asset.currentValuation * asset.bondCouponRate) / 100;
      }

      const key = asset.category in categoryBreakdown ? asset.category : 'Other';
      categoryBreakdown[key] += asset.currentValuation;
    });

    const totalAppreciation = totalValuation - totalCost;
    const totalAppreciationPercent = totalCost > 0 ? (totalAppreciation / totalCost) * 100 : 0;
    const totalMonthlyYield = totalMonthlyRental + Math.round(totalAnnualBondCoupons / 12);

    // Best performer
    let bestPerformer = assets.length > 0 ? assets[0] : null;
    assets.forEach((a) => {
      if (!bestPerformer || a.unrealizedGainPercent > bestPerformer.unrealizedGainPercent) {
        bestPerformer = a;
      }
    });

    return {
      totalValuation,
      totalCost,
      totalAppreciation,
      totalAppreciationPercent,
      totalMonthlyYield,
      categoryBreakdown,
      bestPerformer
    };
  }, [assets]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: assets.length };
    assets.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [assets]);

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        if (selectedCategory !== 'ALL' && asset.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = asset.name.toLowerCase().includes(q);
          const matchLocation = (asset.location || '').toLowerCase().includes(q);
          const matchSymbol = (asset.cryptoSymbol || '').toLowerCase().includes(q);
          const matchIssuer = (asset.bondIssuer || '').toLowerCase().includes(q);
          const matchSub = (asset.subCategory || '').toLowerCase().includes(q);
          if (!matchName && !matchLocation && !matchSymbol && !matchIssuer && !matchSub) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'VALUE_DESC':
            return b.currentValuation - a.currentValuation;
          case 'VALUE_ASC':
            return a.currentValuation - b.currentValuation;
          case 'GAIN_DESC':
            return b.unrealizedGain - a.unrealizedGain;
          case 'GAIN_ASC':
            return a.unrealizedGain - b.unrealizedGain;
          case 'GAIN_PERCENT_DESC':
            return b.unrealizedGainPercent - a.unrealizedGainPercent;
          case 'NAME_ASC':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  }, [assets, selectedCategory, searchQuery, sortBy]);

  // Handlers
  const handleSaveAsset = (savedAsset: OtherAssetItem) => {
    setAssets((prev) => {
      const idx = prev.findIndex((a) => a.id === savedAsset.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedAsset;
        return next;
      }
      return [savedAsset, ...prev];
    });
  };

  const handleDeleteConfirm = () => {
    if (deletingAsset) {
      setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
      setDeletingAsset(null);
      setIsDeleteOpen(false);
    }
  };

  const handleResetSample = () => {
    if (window.confirm('Reset portfolio to high-net-worth sample other assets?')) {
      setAssets(SAMPLE_OTHER_ASSETS);
      localStorage.setItem(STORAGE_OTHER_ASSETS_KEY, JSON.stringify(SAMPLE_OTHER_ASSETS));
    }
  };

  return (
    <div className="space-y-8 fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-[#006A65] uppercase">
              Assets / Alternative & Tangible
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[#004D40] bg-[#E6F4F1] uppercase">
              {assets.length} ASSETS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#00162A] tracking-tight mt-1">
            Other Assets Portfolio
          </h1>
          <p className="text-sm font-medium text-[#707975] mt-1">
            Track real estate holdings, cryptocurrency, bonds, precious metals, and private equity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetSample}
            className="px-3.5 py-2.5 rounded-xl border border-[#C3C6CE]/40 bg-white text-[#43474D] text-xs font-bold hover:bg-[#F2F4F5] active:scale-98 transition-all flex items-center gap-1.5"
            title="Reset to sample asset portfolio"
          >
            <span className="material-symbols-outlined select-none text-base">restart_alt</span>
            <span>Reset Demo</span>
          </button>

          <PrimaryButton
            icon="add"
            onClick={() => {
              setEditingAsset(null);
              setIsAddEditOpen(true);
            }}
          >
            Add New Asset
          </PrimaryButton>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

      {/* Top KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI 1: Net Asset Value Card */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group hover:border-[#006A65]/40 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
                OTHER ASSETS VALUE
              </span>
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  portfolioMetrics.totalAppreciation >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                <span className="material-symbols-outlined select-none text-xs">
                  {portfolioMetrics.totalAppreciation >= 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <span>
                  {portfolioMetrics.totalAppreciation >= 0 ? '+' : ''}
                  {portfolioMetrics.totalAppreciationPercent.toFixed(1)}% gain
                </span>
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00162A] tracking-tight">
                {formatCurrency(portfolioMetrics.totalValuation)}
              </span>
              <div className="flex items-center gap-4 text-xs font-medium text-[#707975] mt-2">
                <span>
                  Cost Basis:{' '}
                  <strong className="text-[#00162A]">
                    {formatCurrency(portfolioMetrics.totalCost)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Gain:{' '}
                  <strong
                    className={
                      portfolioMetrics.totalAppreciation >= 0
                        ? 'text-[#006A65]'
                        : 'text-[#BA1A1A]'
                    }
                  >
                    {isPrivate
                      ? '••••'
                      : `${portfolioMetrics.totalAppreciation >= 0 ? '+' : ''}₹ ${portfolioMetrics.totalAppreciation.toLocaleString('en-IN')}`}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#C3C6CE]/20 flex items-center justify-between text-xs">
            <span className="text-[#74777F] font-semibold">
              {assets.length} Holdings Across {new Set(assets.map((a) => a.category)).size} Classes
            </span>
            <span className="text-[#006A65] font-extrabold uppercase tracking-wider text-[11px]">
              TANGIBLE & DIGITAL
            </span>
          </div>
        </div>

        {/* KPI 2: Asset Allocation Stats Card (Forest Green #004D40) */}
        <div className="bg-[#004D40] rounded-3xl p-6 md:p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-[#AFEFDD] uppercase">
                CLASS BREAKDOWN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00342B] text-emerald-200">
                MULTI-ASSET
              </span>
            </div>

            {/* Allocation Segmented Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-[#00342B] overflow-hidden flex">
                {portfolioMetrics.totalValuation > 0 ? (
                  <>
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown['Real Estate'] / portfolioMetrics.totalValuation) * 100}%`
                      }}
                      className="h-full bg-[#AFEFDD]"
                      title="Real Estate"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Crypto / portfolioMetrics.totalValuation) * 100}%`
                      }}
                      className="h-full bg-amber-400"
                      title="Crypto"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Bonds / portfolioMetrics.totalValuation) * 100}%`
                      }}
                      className="h-full bg-sky-300"
                      title="Bonds"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown['Gold & Metals'] / portfolioMetrics.totalValuation) * 100}%`
                      }}
                      className="h-full bg-yellow-300"
                      title="Gold & Metals"
                    />
                    <div
                      style={{
                        width: `${(portfolioMetrics.categoryBreakdown.Alternative / portfolioMetrics.totalValuation) * 100}%`
                      }}
                      className="h-full bg-teal-300"
                      title="Alternative"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-[#00342B]" />
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#AFEFDD] flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium truncate">Real Estate</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalValuation > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown['Real Estate'] /
                            portfolioMetrics.totalValuation) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium truncate">Crypto</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalValuation > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown.Crypto /
                            portfolioMetrics.totalValuation) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-300 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium truncate">Bonds/SGB</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalValuation > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown.Bonds /
                            portfolioMetrics.totalValuation) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 flex-shrink-0" />
                  <span className="text-emerald-100/90 font-medium truncate">Gold & Metals</span>
                  <span className="font-extrabold ml-auto">
                    {portfolioMetrics.totalValuation > 0
                      ? Math.round(
                          (portfolioMetrics.categoryBreakdown['Gold & Metals'] /
                            portfolioMetrics.totalValuation) *
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
            <span>Inflation protected allocation</span>
            <span className="font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* KPI 3: Passive Monthly Inflow & Yield Card */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group hover:border-[#006A65]/40 transition-all">
          <div className="space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
              PASSIVE CASHFLOW YIELD
            </span>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00162A] tracking-tight">
                {isPrivate
                  ? '••••••'
                  : `₹ ${portfolioMetrics.totalMonthlyYield.toLocaleString('en-IN')}`}
              </span>
              <span className="block text-xs font-medium text-[#707975] mt-1">
                Estimated monthly rental & bond coupon cashflow
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/30 space-y-1">
              <span className="block text-[10px] font-extrabold uppercase text-[#74777F] tracking-wider">
                TOP APPRECIATED ASSET
              </span>
              <span className="block text-xs font-bold text-[#00162A] truncate">
                {portfolioMetrics.bestPerformer?.name || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#006A65]">
                <span className="material-symbols-outlined select-none text-xs">trending_up</span>
                <span>
                  +{portfolioMetrics.bestPerformer?.unrealizedGainPercent || 0}% overall appreciation
                </span>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#C3C6CE]/20 flex items-center justify-between text-xs">
            <span className="text-[#74777F] font-semibold">
              Annual Inflow: {formatCurrency(portfolioMetrics.totalMonthlyYield * 12)}
            </span>
            <span className="text-emerald-700 font-extrabold text-[11px] uppercase">
              STEADY YIELD
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search Bar, and Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(
            [
              'ALL',
              'Real Estate',
              'Crypto',
              'Bonds',
              'Gold & Metals',
              'Alternative'
            ] as CategoryFilter[]
          ).map((cat) => {
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
                <span>{cat === 'ALL' ? 'All Assets' : cat}</span>
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
              placeholder="Search asset, location, symbol..."
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
                  { label: 'Highest Valuation', val: 'VALUE_DESC' },
                  { label: 'Lowest Valuation', val: 'VALUE_ASC' },
                  { label: 'Highest Gain %', val: 'GAIN_PERCENT_DESC' },
                  { label: 'Highest Profit (₹)', val: 'GAIN_DESC' },
                  { label: 'Asset Name (A-Z)', val: 'NAME_ASC' }
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
            Assets Portfolio
          </h2>
          <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#C3C6CE]/30 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '32px' }}>
                inventory_2
              </span>
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-[#00162A]">
                {assets.length === 0 ? 'No Other Assets Tracked Yet' : 'No matching assets found'}
              </h3>
              <p className="text-xs text-[#707975] leading-relaxed">
                {assets.length === 0
                  ? 'Add real estate, cryptocurrency, sovereign bonds, gold bullion, or alternative investments to track your full consolidated net worth.'
                  : 'Try adjusting your search query or switching the category filter tab.'}
              </p>
            </div>

            {assets.length === 0 ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <PrimaryButton
                  icon="add"
                  onClick={() => {
                    setEditingAsset(null);
                    setIsAddEditOpen(true);
                  }}
                >
                  Add New Asset
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setAssets(SAMPLE_OTHER_ASSETS)}
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
          /* Asset Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssets.map((asset) => {
              const isMenuOpen = activeMenuId === asset.id;
              const isPositive = asset.unrealizedGain >= 0;

              return (
                <div
                  key={asset.id}
                  className={`
                    rounded-3xl bg-white border border-[#C3C6CE]/30 p-6 space-y-5 transition-all duration-300
                    hover:-translate-y-1 hover:border-2 hover:border-[#006A65] hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)]
                    group relative cursor-pointer
                    ${isMenuOpen ? 'z-50' : 'z-0'}
                  `}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.asset-card-menu-container')) {
                      return;
                    }
                    setSelectedAssetDetails(asset);
                    setIsDetailsOpen(true);
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
                          {getCategoryIcon(asset.category)}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold tracking-widest text-[#006A65] uppercase">
                            {asset.category} {asset.subCategory ? `• ${asset.subCategory}` : ''}
                          </span>
                          {asset.rentalIncome && asset.rentalIncome > 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-[#E6F4F1] text-[#004D40] uppercase">
                              RENTAL
                            </span>
                          )}
                          {asset.bondCouponRate && asset.bondCouponRate > 0 && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-800 uppercase">
                              {asset.bondCouponRate}% COUPON
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#00162A] group-hover:text-[#006A65] transition-colors leading-snug line-clamp-1 mt-0.5">
                          {asset.name}
                        </h3>

                        <span className="block text-xs font-medium text-[#707975] mt-0.5 truncate">
                          {asset.location || asset.walletPlatform || asset.custodian || asset.bondIssuer || 'Direct Custody'}
                        </span>
                      </div>
                    </div>

                    {/* Context Menu Trigger */}
                    <div className="relative asset-card-menu-container flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : asset.id);
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
                              setSelectedAssetDetails(asset);
                              setIsDetailsOpen(true);
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
                              setEditingAsset(asset);
                              setIsAddEditOpen(true);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] text-left transition-colors flex items-center justify-between"
                          >
                            <span>Edit Asset</span>
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
                              setDeletingAsset(asset);
                              setIsDeleteOpen(true);
                            }}
                            className="w-full px-4 py-2 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] text-left transition-colors flex items-center justify-between"
                          >
                            <span>Delete Asset</span>
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
                        {formatCurrency(asset.currentValuation)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        APPRECIATION
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className={`text-sm font-extrabold ${
                            isPositive ? 'text-[#006A65]' : 'text-[#BA1A1A]'
                          }`}
                        >
                          {isPrivate
                            ? '••••'
                            : `${isPositive ? '+' : ''}${formatCurrency(asset.unrealizedGain)}`}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1 rounded ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {asset.unrealizedGainPercent}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        PURCHASE COST
                      </span>
                      <span className="block text-sm font-bold text-[#43474D] mt-1">
                        {formatCurrency(asset.costBasis)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                        {asset.category === 'Real Estate'
                          ? 'MONTHLY RENT'
                          : asset.category === 'Crypto'
                          ? 'TOKENS HELD'
                          : asset.category === 'Bonds'
                          ? 'COUPON YIELD'
                          : asset.category === 'Gold & Metals'
                          ? 'WEIGHT'
                          : 'SPECIFICATION'}
                      </span>
                      <span className="block text-xs font-semibold text-[#00162A] mt-1 truncate">
                        {asset.category === 'Real Estate'
                          ? asset.rentalIncome
                            ? `${formatCurrency(asset.rentalIncome)}/mo`
                            : 'Self-Occupied'
                          : asset.category === 'Crypto'
                          ? isPrivate
                            ? '••••'
                            : `${asset.cryptoQuantity ?? '-'} ${asset.cryptoSymbol || ''}`
                          : asset.category === 'Bonds'
                          ? `${asset.bondCouponRate ?? '-'}% p.a.`
                          : asset.category === 'Gold & Metals'
                          ? `${asset.metalWeightGrams ?? '-'} g (${asset.metalPurity || '24K'})`
                          : asset.subCategory || 'Active'}
                      </span>
                      <span className="block text-[11px] text-[#74777F] truncate">
                        {asset.acquisitionDate ? `Since ${asset.acquisitionDate.slice(0, 7)}` : 'Recorded'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Asset Modal */}
      <AddEditAssetModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        initialAsset={editingAsset}
        isEditing={Boolean(editingAsset)}
      />

      {/* Detailed Asset Modal */}
      <AssetDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAssetDetails(null);
        }}
        asset={selectedAssetDetails}
        onEdit={(asset) => {
          setEditingAsset(asset);
          setIsAddEditOpen(true);
        }}
        isPrivate={isPrivate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingAsset(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset?"
        subtitle={`Are you sure you want to delete "${deletingAsset?.name}" from your portfolio?`}
        confirmText="Delete Asset"
      />
    </div>
  );
};
