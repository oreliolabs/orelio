import React, { useState, useEffect, useMemo } from 'react';
import { AddEditDepositModal } from './AddEditDepositModal';
import type { DepositFormData } from './AddEditDepositModal';
import { DeleteDepositModal } from './DeleteDepositModal';
import { PrimaryButton } from '../common/PrimaryButton';
import { getDeposits, saveDeposits, getPrimaryMemberId } from '../../data/orelioStore';
import type { Deposit } from '../../data/types';
export type { Deposit } from '../../data/types';

export const formatDisplayDate = (val?: string | number): string => {
  if (val === undefined || val === null || val === '') return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (typeof val === 'number') {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      const day = dt.getUTCDate();
      const month = monthNames[dt.getUTCMonth()];
      const year = dt.getUTCFullYear();
      return `${day} ${month}, ${year}`;
    }
    return '';
  }

  const trimmed = val.trim();

  // Handle dd/mm/yyyy format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [dStr, mStr, yStr] = trimmed.split('/');
    const day = parseInt(dStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const year = parseInt(yStr, 10);
    if (month >= 0 && month < 12) {
      return `${day} ${monthNames[month]}, ${year}`;
    }
  }

  // Handle yyyy-mm-dd format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yStr, mStr, dStr] = trimmed.split('-');
    const day = parseInt(dStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const year = parseInt(yStr, 10);
    if (month >= 0 && month < 12) {
      return `${day} ${monthNames[month]}, ${year}`;
    }
  }

  const ts = Date.parse(trimmed.replace(',', ''));
  if (!isNaN(ts)) {
    const dt = new Date(ts);
    const day = dt.getUTCDate();
    const month = monthNames[dt.getUTCMonth()];
    const year = dt.getUTCFullYear();
    return `${day} ${month}, ${year}`;
  }

  return trimmed;
};

/** Returns a human-readable tenure string from two dates (epoch numbers or date strings) */
export const formatTenure = (startDate?: string | number, maturityDate?: string | number): string => {
  if (startDate === undefined || startDate === null || !maturityDate) return '-';

  const parseToDate = (val: string | number): Date | null => {
    if (typeof val === 'number') {
      const dt = new Date(val);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const trimmed = val.trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }
    const ts = Date.parse(trimmed.replace(',', ''));
    return isNaN(ts) ? null : new Date(ts);
  };

  const start = parseToDate(startDate);
  const end = parseToDate(maturityDate);
  if (!start || !end) return '-';

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  if (months < 0) { years--; months += 12; }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(' ') : '< 1 month';
};

export const calculateDepositMetrics = (
  maturityDate: string | number,
  startDate?: string | number,
  tenureYears: number = 1,
  tenureMonths: number = 0
): { progressPercent: number; daysRemaining: number } => {
  const parseToDate = (val?: string | number): Date | null => {
    if (val === undefined || val === null || val === '') return null;
    if (typeof val === 'number') {
      const dt = new Date(val);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const trimmed = val.trim();
    // Format: dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const parts = trimmed.split('/').map(Number);
      return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
    }
    // Format: yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-').map(Number);
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }
    // Format: 24 Oct, 2025 or 24 Oct 2025
    const timestamp = Date.parse(trimmed.replace(',', ''));
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    return null;
  };

  const matDate = parseToDate(maturityDate);
  const now = new Date();

  if (!matDate || isNaN(matDate.getTime())) {
    return { progressPercent: 50, daysRemaining: 180 };
  }

  // Determine start date
  let stDate = startDate !== undefined && startDate !== null ? parseToDate(startDate) : null;
  if (!stDate || isNaN(stDate.getTime())) {
    // Subtract tenure (or 1 year default) from maturity date to get start date
    const totalTenureDays = (tenureYears || 1) * 365 + (tenureMonths || 0) * 30;
    stDate = new Date(matDate.getTime() - totalTenureDays * 24 * 60 * 60 * 1000);
  }

  const totalDurationMs = matDate.getTime() - stDate.getTime();
  const elapsedMs = now.getTime() - stDate.getTime();
  const remainingMs = matDate.getTime() - now.getTime();

  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

  let progressPercent = 0;
  if (totalDurationMs > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
  }

  return {
    progressPercent,
    daysRemaining
  };
};

interface DepositsProps {
  isPrivate: boolean;
  selectedMemberId?: string | 'all';
}

export const Deposits: React.FC<DepositsProps> = ({ isPrivate, selectedMemberId = 'all' }) => {
  const [deposits, setDeposits] = useState<Deposit[]>(() => getDeposits(selectedMemberId));

  useEffect(() => {
    saveDeposits(deposits, selectedMemberId);
  }, [deposits, selectedMemberId]);

  // Context Menu & Expansion State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [expandedDepositId, setExpandedDepositId] = useState<string | null>(null);

  // Pagination states
  const [activePage, setActivePage] = useState<number>(1);
  const [maturedPage, setMaturedPage] = useState<number>(1);

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingDeposit, setDeletingDeposit] = useState<Deposit | null>(null);

  // Filter state for FD / RD
  const [filterType, setFilterType] = useState<'ALL' | 'FD' | 'RD'>('ALL');

  // Format Helper
  const formatVal = (val: string | number) => (isPrivate ? '••••' : val);
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(num).replace('INR', '₹');
  };

  const formatCompactCurrency = (num: number) => {
    if (!num || num === 0) return '₹0';
    if (num >= 10000000) {
      const val = (num / 10000000).toFixed(2).replace(/\.?0+$/, '');
      return `₹${val} Cr`;
    }
    if (num >= 1000000) {
      const val = (num / 100000).toFixed(1).replace(/\.?0+$/, '');
      return `₹${val}L`;
    }
    if (num >= 1000) {
      return `₹${Math.round(num / 1000)}k`;
    }
    return `₹${num}`;
  };

  // Close context menu on document click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Lock body scroll when modal open & handle Escape key
  useEffect(() => {
    if (isAddEditOpen || isDeleteOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsAddEditOpen(false);
          setIsDeleteOpen(false);
          setActiveMenuId(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isAddEditOpen, isDeleteOpen]);

  // Process deposits to dynamically compute maturity & days remaining
  const processedDeposits = useMemo(() => {
    return deposits.map((d: Deposit) => {
      const metrics = calculateDepositMetrics(d.maturityDate, d.startDate, d.tenureYears, d.tenureMonths);
      const isMatured = d.status === 'matured' || metrics.daysRemaining <= 0;
      return {
        ...d,
        daysRemaining: isMatured ? 0 : metrics.daysRemaining,
        progressPercent: isMatured ? 100 : metrics.progressPercent,
        status: isMatured ? ('matured' as const) : ('active' as const),
        maturedDate: d.maturedDate || (isMatured ? d.maturityDate : undefined)
      };
    });
  }, [deposits]);

  // Calculations for summary cards & filtering
  const rawActiveDeposits = processedDeposits.filter((d: Deposit) => d.status === 'active');
  const rawMaturedDeposits = processedDeposits.filter((d: Deposit) => d.status === 'matured');

  const activeDepositsList = rawActiveDeposits.filter((d: Deposit) => {
    if (filterType === 'FD') return d.type === 'FD';
    if (filterType === 'RD') return d.type === 'RD';
    return true;
  });

  const maturedDepositsList = rawMaturedDeposits.filter((d: Deposit) => {
    if (filterType === 'FD') return d.type === 'FD';
    if (filterType === 'RD') return d.type === 'RD';
    return true;
  });

  // Pagination logic (max 5 cards per page)
  const ITEMS_PER_PAGE = 5;

  const activeTotalPages = Math.ceil(activeDepositsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedActiveDeposits = activeDepositsList.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  const maturedTotalPages = Math.ceil(maturedDepositsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedMaturedDeposits = maturedDepositsList.slice(
    (maturedPage - 1) * ITEMS_PER_PAGE,
    maturedPage * ITEMS_PER_PAGE
  );

  const totalCurrentValue = rawActiveDeposits.reduce((acc: number, curr: Deposit) => acc + (curr.currentValue || 0), 0);
  const totalPrincipal = rawActiveDeposits.reduce((acc: number, curr: Deposit) => acc + (curr.principalOrMonthly || 0), 0);
  const totalGrowthPercent = totalPrincipal > 0 ? ((totalCurrentValue - totalPrincipal) / totalPrincipal) * 100 : 0;
  const fixedDeposits = rawActiveDeposits.filter((d: Deposit) => d.type === 'FD');
  const recurringDeposits = rawActiveDeposits.filter((d: Deposit) => d.type === 'RD');
  const totalFdValue = fixedDeposits.reduce((acc: number, curr: Deposit) => acc + (curr.currentValue || 0), 0);
  const totalRdValue = recurringDeposits.reduce((acc: number, curr: Deposit) => acc + (curr.currentValue || 0), 0);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingDeposit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setIsAddEditOpen(true);
  };

  const handleSaveDeposit = (formData: DepositFormData) => {
    const metrics = calculateDepositMetrics(
      formData.maturityDate,
      formData.startDate
    );

    const isMatured = metrics.daysRemaining <= 0 || formData.maturityDate <= Date.now();

    const targetMemberId = selectedMemberId === 'all' ? getPrimaryMemberId() : selectedMemberId;

    if (editingDeposit) {
      // Edit existing
      setDeposits((prev: Deposit[]) => prev.map((d: Deposit) => d.id === editingDeposit.id ? {
        ...d,
        type: formData.type,
        nickname: formData.nickname,
        bankName: formData.bankName,
        depositNumber: formData.depositNumber || '',
        principalOrMonthly: formData.amount,
        interestRate: formData.interestRate,
        currentValue: formData.amount * 1.08,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        status: isMatured ? 'matured' : 'active',
        maturedDate: isMatured ? (d.maturedDate || formData.maturityDate) : undefined,
        nominee: formData.nominee,
        memberId: d.memberId || targetMemberId
      } : d));
    } else {
      // Add new
      const newDep: Deposit = {
        id: `dep-${Date.now()}`,
        type: formData.type,
        nickname: formData.nickname,
        bankName: formData.bankName,
        depositNumber: formData.depositNumber || '50100482918829',
        interestRate: formData.interestRate,
        currentValue: formData.amount,
        principalOrMonthly: formData.amount,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        status: isMatured ? 'matured' : 'active',
        maturedDate: isMatured ? formData.maturityDate : undefined,
        nominee: formData.nominee,
        memberId: targetMemberId
      };
      setDeposits((prev: Deposit[]) => [newDep, ...prev]);
    }
    setIsAddEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingDeposit) {
      setDeposits(deposits.filter(d => d.id !== deletingDeposit.id));
      setDeletingDeposit(null);
      setIsDeleteOpen(false);
    }
  };

  const handleReinvest = (deposit: Deposit) => {
    const years = deposit.tenureYears || 1;
    const months = deposit.tenureMonths || 0;

    const parseToDate = (val?: string | number): Date => {
      if (typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
      }
      if (typeof val === 'string' && val.trim()) {
        const trimmed = val.trim();
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
          const [d, m, y] = trimmed.split('/').map(Number);
          return new Date(Date.UTC(y, m - 1, d));
        }
        const ts = Date.parse(trimmed.replace(',', ''));
        if (!isNaN(ts)) return new Date(ts);
      }
      return new Date();
    };

    const oldDate = parseToDate(deposit.maturityDate || deposit.maturedDate);
    const newDate = new Date(Date.UTC(
      oldDate.getUTCFullYear() + (years || 1),
      oldDate.getUTCMonth() + (months || 0),
      oldDate.getUTCDate()
    ));

    const oldMatEpoch = oldDate.getTime();
    const newMaturityEpoch = newDate.getTime();

    const metrics = calculateDepositMetrics(newMaturityEpoch, oldMatEpoch, years, months);

    // Convert matured back to active deposit with new maturity date
    setDeposits((prevDeposits: Deposit[]) => prevDeposits.map((d: Deposit) => d.id === deposit.id ? {
      ...d,
      status: 'active',
      startDate: oldMatEpoch,
      maturityDate: newMaturityEpoch,
      daysRemaining: metrics.daysRemaining,
      progressPercent: metrics.progressPercent,
      maturedDate: undefined
    } : d));
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-4 sm:pb-6">

      {/* Top Page Header */}
      {deposits.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#00162A] tracking-tight font-sans">
              My Deposits
            </h1>
            <p className="text-sm font-medium text-[#74777F] mt-1">
              Manage and track your fixed and recurring investments.
            </p>
          </div>
          <PrimaryButton
            onClick={handleOpenAdd}
            icon="add"
            className="w-full sm:w-auto justify-center"
          >
            New Deposit
          </PrimaryButton>
        </div>
      )}

      {deposits.length === 0 ? (
        <div className="text-center py-14 sm:py-20 px-4 sm:px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[36px]">
              savings
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#00162A] tracking-tight">No Deposits Yet</h3>
          <p className="text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Track and monitor your fixed and recurring deposits all in one secure place.
          </p>
          <div className="mt-6 w-full sm:w-auto flex justify-center">
            <PrimaryButton
              onClick={handleOpenAdd}
              icon="add"
              className="w-full sm:w-auto justify-center"
            >
              Add Your First Deposit
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          {/* Subtitle Divider */}
          <hr style={{ borderColor: 'rgba(191, 201, 196, 0.3)' }} />

          {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

        {/* Net Current Value Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-[#C3C6CE]/10 relative overflow-hidden flex flex-col justify-between min-h-[180px] sm:min-h-[190px]" style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
          <div className="relative z-10 space-y-2.5 sm:space-y-3">
            <span className="block text-[11px] sm:text-xs font-extrabold tracking-widest text-[#006A65] uppercase" style={{ letterSpacing: '2.4px' }}>
              NET CURRENT VALUE
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-orelio-navy whitespace-nowrap">
                {formatVal(formatCurrency(totalCurrentValue))}
              </span>
              {rawActiveDeposits.length > 0 && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  totalGrowthPercent >= 0 ? 'bg-[#006A65]/10 text-[#006A65]' : 'bg-red-50 text-red-600'
                }`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 400", fontSize: '16px' }}>
                    {totalGrowthPercent >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  {totalGrowthPercent >= 0 ? `+${totalGrowthPercent.toFixed(1)}%` : `${totalGrowthPercent.toFixed(1)}%`} this year
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#73777E]">
              Net Principal: <span className="text-[#00162A] font-semibold whitespace-nowrap">{formatVal(formatCurrency(totalPrincipal))}</span>
            </p>
          </div>

          {/* Decorative bar graphic */}
          <div className="absolute right-4 sm:right-6 bottom-0 flex items-end gap-1.5 sm:gap-2.5 opacity-40 sm:opacity-90 pointer-events-none">
            <div className="w-6 sm:w-8 h-10 sm:h-12 bg-[#006A65]/10" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-6 sm:w-8 h-14 sm:h-18 bg-[#006A65]/20" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-6 sm:w-8 h-12 sm:h-14 bg-[#006A65]/30" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-6 sm:w-8 h-20 sm:h-24 bg-[#006A65]/60" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-6 sm:w-8 h-16 sm:h-20 bg-[#006A65]/50" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
          </div>
        </div>

        {/* Active Deposits Stats Card */}
        <div className="lg:col-span-5 bg-[#004D40] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-md flex flex-col justify-between min-h-[180px] sm:min-h-[190px]">
          <div className="pb-3 md:pb-4">
            <span className="block text-[11px] sm:text-xs font-bold tracking-widest text-[#AFEFDD]/60 uppercase">
              ACTIVE DEPOSITS
            </span>
            <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-1">
              {rawActiveDeposits.length}
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-white/10 space-y-2 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#FFFFFF]/70">{fixedDeposits.length} Fixed {fixedDeposits.length === 1 ? 'Deposit' : 'Deposits'}</span>
              <span className="text-white whitespace-nowrap">{formatVal(formatCompactCurrency(totalFdValue))}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#FFFFFF]/70">{recurringDeposits.length} Recurring {recurringDeposits.length === 1 ? 'Deposit' : 'Deposits'}</span>
              <span className="text-white whitespace-nowrap">{formatVal(formatCompactCurrency(totalRdValue))}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Deposit Filter Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 sm:pt-2">
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="bg-[#F2F4F5] p-1 rounded-2xl flex items-center gap-1 text-xs font-bold w-full sm:w-fit">
            <button
              onClick={() => setFilterType('ALL')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap text-center ${filterType === 'ALL'
                ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
                : 'text-[#74777F] hover:text-[#00162A]'
                }`}
            >
              All Deposits ({rawActiveDeposits.length + rawMaturedDeposits.length})
            </button>
            <button
              onClick={() => setFilterType('FD')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap text-center ${filterType === 'FD'
                ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
                : 'text-[#74777F] hover:text-[#00162A]'
                }`}
            >
              <span className="material-symbols-outlined select-none text-[16px]">savings</span>
              <span className="hidden sm:inline">Fixed Deposits (FD)</span>
              <span className="sm:hidden">FDs</span>
            </button>
            <button
              onClick={() => setFilterType('RD')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap text-center ${filterType === 'RD'
                ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
                : 'text-[#74777F] hover:text-[#00162A]'
                }`}
            >
              <span className="material-symbols-outlined select-none text-[16px]">refresh</span>
              <span className="hidden sm:inline">Recurring Deposits (RD)</span>
              <span className="sm:hidden">RDs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Deposits Section */}
      {activeDepositsList.length > 0 && (
        <div className="space-y-6 pt-4">

          {/* Active Section Header */}
          <div className="flex items-center gap-4 w-full">
            <h2 className="text-xl font-semibold text-[#00162A] tracking-tight whitespace-nowrap">
              Active Deposits
            </h2>
            <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
              {activeDepositsList.length} ITEMS
            </span>
          </div>

          {/* Active Deposits List Cards */}
          <div className="space-y-5">
            {paginatedActiveDeposits.map((deposit: Deposit) => {
              const isMenuOpen = activeMenuId === deposit.id;
              const isExpanded = expandedDepositId === deposit.id;
              const metrics = calculateDepositMetrics(
                deposit.maturityDate,
                deposit.startDate,
                deposit.tenureYears,
                deposit.tenureMonths
              );
              const progressPercent = metrics.progressPercent;
              const daysRemaining = metrics.daysRemaining;

              return (
                <div
                  key={deposit.id}
                  onClick={() => setExpandedDepositId(isExpanded ? null : deposit.id)}
                  className={`group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border border-[#C3C6CE]/30 shadow-xs hover:border-2 hover:border-[#006A65] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)] transition-all duration-300 ease-out relative flex flex-col cursor-pointer ${isMenuOpen ? 'z-50' : 'z-0'
                    } ${isExpanded ? 'border-[#006A65]/60 shadow-[0_4px_20px_0_rgba(0,106,101,0.08)]' : ''}`}
                >
                  {/* Main Card Layout */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4 md:gap-5">
                    {/* Top block on mobile / Column 1 on desktop: Icon, Nickname, Deposit No & Mobile Actions */}
                    <div className="flex items-start justify-between md:justify-start gap-3.5 sm:gap-4 md:min-w-[220px] lg:min-w-[240px]">
                      {/* Left: Icon and Metadata */}
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 flex items-center justify-center shrink-0 transition-all duration-300 ease-out">
                          <span
                            className={`material-symbols-outlined select-none transition-transform duration-300 ${deposit.type === 'FD' ? 'group-hover:scale-100 group-hover:-rotate-12' : 'group-hover:rotate-180'
                              }`}
                            style={{ fontSize: '22px' }}
                          >
                            {deposit.type === 'FD' ? 'savings' : 'refresh'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-1 transition-colors duration-300">
                            {deposit.type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-[#00162A] truncate">
                            {deposit.nickname}
                          </h3>
                          <span className="block text-xs font-medium text-[#74777F] mt-1 truncate">
                            Deposit No.: {deposit.depositNumber}
                          </span>
                        </div>
                      </div>

                      {/* Mobile action buttons in top-right */}
                      <div className="flex md:hidden items-center gap-1 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDepositId(isExpanded ? null : deposit.id);
                          }}
                          className="w-8 h-8 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Expand card details"
                          title={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '20px' }}>
                            expand_more
                          </span>
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : deposit.id);
                            }}
                            className="w-8 h-8 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="More menu"
                          >
                            <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>more_vert</span>
                          </button>

                          {/* Context Menu / Popover Mobile */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleOpenEdit(deposit);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                              >
                                {deposit.type === 'FD' ? 'Edit FD' : 'Edit RD'}
                              </button>
                              <div className="border-t border-[#C3C6CE]/20" />
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeletingDeposit(deposit);
                                  setIsDeleteOpen(true);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors cursor-pointer"
                              >
                                {deposit.type === 'FD' ? 'Delete FD' : 'Delete RD'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Section (2-columns on mobile, inline flex items on desktop via md:contents) */}
                    <div className="grid grid-cols-2 md:contents gap-3 pt-2.5 md:pt-0 border-t md:border-t-0 border-[#C3C6CE]/15">
                      {/* Column 2: Interest Rate */}
                      <div className="md:min-w-[100px] lg:min-w-[110px]">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-1 md:mb-2 transition-colors duration-300">
                          INTEREST RATE
                        </span>
                        <span className="block text-sm sm:text-base font-extrabold text-[#00162A]">
                          {formatVal(`${deposit.interestRate}% p.a.`)}
                        </span>
                      </div>

                      {/* Column 3: Current Value */}
                      <div className="md:min-w-[130px] lg:min-w-[150px]">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-1 md:mb-2 transition-colors duration-300">
                          CURRENT VALUE
                        </span>
                        <span className="block text-sm sm:text-base font-extrabold text-[#00162A] whitespace-nowrap">
                          {formatVal(formatCurrency(deposit.currentValue))}
                        </span>
                        <span className="block text-xs font-medium text-[#74777F] mt-0.5 md:mt-1.5 whitespace-nowrap">
                          {deposit.type === 'FD' ? `Principal: ${formatVal(formatCurrency(deposit.principalOrMonthly))}` : `Monthly: ${formatVal(formatCurrency(deposit.principalOrMonthly))}`}
                        </span>
                      </div>

                      {/* Column 4: Maturity Progress */}
                      <div className="col-span-2 md:col-span-1 md:min-w-[180px] lg:min-w-[200px] md:flex-1 md:max-w-xs pt-1 md:pt-0">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 md:mb-3 transition-colors duration-300">
                          MATURITY PROGRESS
                        </span>
                        <div className="w-full bg-[#E5E8EB] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#006A65] h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-start text-xs font-medium text-[#74777F] mt-2 space-y-0 md:space-y-0.5">
                          <span>Matures {formatDisplayDate(deposit.maturityDate)}</span>
                          <span>{daysRemaining} days remaining</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 5: Desktop Expand Chevron & Context Menu Button */}
                    <div className="hidden md:flex items-center gap-1.5 relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDepositId(isExpanded ? null : deposit.id);
                        }}
                        className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Expand card details"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '22px' }}>
                          expand_more
                        </span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : deposit.id);
                          }}
                          className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="More menu"
                        >
                          <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>more_vert</span>
                        </button>

                        {/* Context Menu / Popover Desktop */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(deposit);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                            >
                              {deposit.type === 'FD' ? 'Edit FD' : 'Edit RD'}
                            </button>
                            <div className="border-t border-[#C3C6CE]/20" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeletingDeposit(deposit);
                                setIsDeleteOpen(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors cursor-pointer"
                            >
                              {deposit.type === 'FD' ? 'Delete FD' : 'Delete RD'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="w-full pt-4 border-t border-[#C3C6CE]/30 flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                        {/* Bank Name */}
                        <div className="flex items-start gap-3 sm:gap-4 md:min-w-[220px] lg:min-w-[240px]">
                          <div className="hidden md:block w-12 shrink-0" />
                          <div className="space-y-1 min-w-0">
                            <span className="block text-[10px] font-bold text-[#73777E] group-hover:text-[#006A65] uppercase transition-colors duration-300" style={{ letterSpacing: '1px' }}>
                              Bank Name
                            </span>
                            <span className="block text-sm font-bold text-[#00162A] break-all" style={{ letterSpacing: '1px' }}>
                              {deposit.bankName?.trim() ? deposit.bankName : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Nominee Name */}
                        <div className="min-w-[110px] space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] group-hover:text-[#006A65] uppercase transition-colors duration-300" style={{ letterSpacing: '1px' }}>
                            Nominee Name
                          </span>
                          <span className="block text-sm font-bold text-[#00162A] break-all" style={{ letterSpacing: '1px' }}>
                            {deposit.nominee?.trim() ? deposit.nominee : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Deposits Pagination */}
          {activeTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                ‹ Previous
              </button>
              {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setActivePage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePage === pageNum ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'
                    }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={activePage === activeTotalPages}
                onClick={() => setActivePage(prev => Math.min(prev + 1, activeTotalPages))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next ›
              </button>
            </div>
          )}

        </div>
      )}

      {/* Matured Deposits Section */}
      {maturedDepositsList.length > 0 && (
        <div className="space-y-6 pt-6">

          {/* Matured Section Header */}
          <div className="flex items-center gap-4 w-full">
            <h2 className="text-xl font-semibold text-[#43474D] tracking-tight whitespace-nowrap">
              Matured Deposits
            </h2>
            <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
              {maturedDepositsList.length} ITEMS
            </span>
          </div>

          {/* Matured Deposits Cards */}
          <div className="space-y-5">
            {paginatedMaturedDeposits.map((deposit: Deposit) => {
              const isExpanded = expandedDepositId === deposit.id;

              return (
                <div
                  key={deposit.id}
                  onClick={() => setExpandedDepositId(isExpanded ? null : deposit.id)}
                  className={`group bg-[#F2F4F5] rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border border-[#BFC9C4]/20 transition-all duration-300 ease-out flex flex-col cursor-pointer ${isExpanded ? 'border-[#006A65]/40 shadow-xs' : ''
                    }`}
                >
                  {/* Main Card Layout */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4 md:gap-5 w-full">
                    {/* Top block on mobile / Column 1 on desktop: Icon, Nickname, Deposit No & Mobile Actions */}
                    <div className="flex items-start justify-between md:justify-start gap-3.5 sm:gap-4 md:min-w-[220px] lg:min-w-[240px]">
                      {/* Icon & Metadata */}
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#BFC9C4]/20 text-[#74777F] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined select-none font-bold" style={{ fontSize: '22px' }}>task_alt</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1">
                            {deposit.type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-[#74777F] truncate">
                            {deposit.nickname}
                          </h3>
                          <span className="block text-xs font-medium text-[#74777F] mt-1 truncate">
                            Deposit No.: {deposit.depositNumber}
                          </span>
                        </div>
                      </div>

                      {/* Mobile action buttons in top-right */}
                      <div className="flex md:hidden items-center gap-1 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDepositId(isExpanded ? null : deposit.id);
                          }}
                          className="w-8 h-8 rounded-full text-[#74777F] hover:bg-white/80 hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Expand card details"
                          title={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '20px' }}>
                            expand_more
                          </span>
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === deposit.id ? null : deposit.id);
                            }}
                            className="w-8 h-8 rounded-full text-[#74777F] hover:bg-white/80 hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="More options"
                          >
                            <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>more_vert</span>
                          </button>

                          {/* Context Menu / Popover Mobile */}
                          {activeMenuId === deposit.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeletingDeposit(deposit);
                                  setIsDeleteOpen(true);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors cursor-pointer"
                              >
                                {deposit.type === 'FD' ? 'Delete FD' : 'Delete RD'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Section (grid on mobile, inline flex items on desktop via md:contents) */}
                    <div className="grid grid-cols-2 md:contents gap-3 pt-2.5 md:pt-0 border-t md:border-t-0 border-[#BFC9C4]/20">
                      {/* Final Rate */}
                      <div className="md:min-w-[100px] lg:min-w-[110px]">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1 md:mb-2">
                          FINAL RATE
                        </span>
                        <span className="block text-sm sm:text-base font-extrabold text-[#74777F]">
                          {formatVal(`${deposit.interestRate}% p.a.`)}
                        </span>
                      </div>

                      {/* Maturity Value */}
                      <div className="md:min-w-[130px] lg:min-w-[150px]">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1 md:mb-2">
                          MATURITY VALUE
                        </span>
                        <span className="block text-sm sm:text-base font-extrabold text-[#74777F] whitespace-nowrap">
                          {formatVal(formatCurrency(deposit.currentValue))}
                        </span>
                      </div>

                      {/* Matured On + Tenure */}
                      <div className="col-span-2 md:col-span-1 md:min-w-[130px] lg:min-w-[140px] pt-1 md:pt-0">
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1">
                          MATURED ON
                        </span>
                        <div className="flex items-baseline justify-between md:flex-col">
                          <span className="block text-xs sm:text-sm font-bold text-[#74777F]">
                            {formatDisplayDate(deposit.maturedDate || deposit.maturityDate)}
                          </span>
                          <span className="block text-xs font-medium text-[#74777F] mt-0.5 md:mt-1.5">
                            Tenure: {formatTenure(deposit.startDate, deposit.maturityDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reinvest, More Menu & Expand Chevron on Desktop */}
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#BFC9C4]/20 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReinvest(deposit);
                        }}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-[#C3C6CE]/50 bg-white text-[#00162A] font-bold text-xs tracking-wider uppercase hover:scale-105 active:scale-95 transition-all duration-200 ease-out cursor-pointer text-center"
                      >
                        REINVEST
                      </button>

                      {/* Desktop-only More Menu & Expand */}
                      <div className="hidden md:flex items-center gap-1.5 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === deposit.id ? null : deposit.id);
                            }}
                            className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="More options"
                          >
                            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>more_vert</span>
                          </button>

                          {activeMenuId === deposit.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setDeletingDeposit(deposit);
                                  setIsDeleteOpen(true);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors cursor-pointer"
                              >
                                {deposit.type === 'FD' ? 'Delete FD' : 'Delete RD'}
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDepositId(isExpanded ? null : deposit.id);
                          }}
                          className="w-9 h-9 rounded-full text-[#74777F] hover:bg-white/80 hover:text-[#00162A] transition-colors flex items-center justify-center cursor-pointer"
                          aria-label="Expand card details"
                          title={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '22px' }}>
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="w-full pt-4 border-t border-[#BFC9C4]/30 flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                        {/* Bank Name */}
                        <div className="flex items-start gap-3 sm:gap-4 md:min-w-[220px] lg:min-w-[240px]">
                          <div className="hidden md:block w-12 shrink-0" />
                          <div className="space-y-1 min-w-0">
                            <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                              Bank Name
                            </span>
                            <span className="block text-sm font-bold text-[#74777F] break-all" style={{ letterSpacing: '1px' }}>
                              {deposit.bankName?.trim() ? deposit.bankName : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Nominee Name */}
                        <div className="min-w-[110px] space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Nominee Name
                          </span>
                          <span className="block text-sm font-bold text-[#74777F] break-all" style={{ letterSpacing: '1px' }}>
                            {deposit.nominee?.trim() ? deposit.nominee : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matured Deposits Pagination */}
          {maturedTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
              <button
                disabled={maturedPage === 1}
                onClick={() => setMaturedPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                ‹ Previous
              </button>
              {Array.from({ length: maturedTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setMaturedPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${maturedPage === pageNum ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'
                    }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={maturedPage === maturedTotalPages}
                onClick={() => setMaturedPage(prev => Math.min(prev + 1, maturedTotalPages))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next ›
              </button>
            </div>
          )}

        </div>
      )}

      {/* Empty state when filtering */}
      {deposits.length > 0 && activeDepositsList.length === 0 && maturedDepositsList.length === 0 && (
        <div className="text-center py-12 bg-white border border-[#C3C6CE]/20 rounded-2xl mt-4">
          <span className="material-symbols-outlined text-gray-300 select-none text-[48px]">savings</span>
          <p className="text-base font-bold text-orelio-navy mt-3">No {filterType === 'FD' ? 'fixed' : 'recurring'} deposits found</p>
          <p className="text-sm text-gray-400 mt-1">Try switching to all deposits or register a new deposit.</p>
        </div>
      )}
    </>
  )}

      {/* Add / Edit Deposit Modal */}
      <AddEditDepositModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingDeposit(null);
        }}
        editingDeposit={editingDeposit}
        isFirstDeposit={deposits.length === 0}
        onSave={handleSaveDeposit}
      />

      {/* Delete Deposit Modal */}
      <DeleteDepositModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        deletingDeposit={deletingDeposit}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Deposits;
