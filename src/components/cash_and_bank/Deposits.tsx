import React, { useState, useEffect, useMemo } from 'react';
import { AddEditDepositModal } from './AddEditDepositModal';
import type { DepositFormData } from './AddEditDepositModal';
import { DeleteDepositModal } from './DeleteDepositModal';
import { PrimaryButton } from '../common/PrimaryButton';

export interface Deposit {
  id: string;
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  accountNumber: string;
  interestRate: number;
  currentValue: number;
  principalOrMonthly: number;
  startDate?: string;
  maturityDate: string;
  tenureYears?: number;
  tenureMonths?: number;
  daysRemaining: number;
  progressPercent: number;
  status: 'active' | 'matured';
  maturedDate?: string;
  nominee?: string;
}

export const formatDisplayDate = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    const day = dt.getDate();
    const month = monthNames[dt.getMonth()];
    const year = dt.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  return trimmed;
};

export const calculateDepositMetrics = (
  maturityDateStr: string,
  startDateStr?: string,
  tenureYears: number = 1,
  tenureMonths: number = 0
): { progressPercent: number; daysRemaining: number } => {
  const parseDateStr = (str: string): Date | null => {
    if (!str) return null;
    const trimmed = str.trim();
    // Format: dd/mm/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const parts = trimmed.split('/');
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    // Format: yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    // Format: 24 Oct, 2025 or 24 Oct 2025
    const timestamp = Date.parse(trimmed.replace(',', ''));
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
    return null;
  };

  const matDate = parseDateStr(maturityDateStr);
  const now = new Date();

  if (!matDate || isNaN(matDate.getTime())) {
    return { progressPercent: 50, daysRemaining: 180 };
  }

  // Determine start date
  let stDate = startDateStr ? parseDateStr(startDateStr) : null;
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
}

const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: 'dep-1',
    type: 'FD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'HDFC Bank',
    accountNumber: '50100482918829',
    interestRate: 7.85,
    currentValue: 245000,
    principalOrMonthly: 200000,
    startDate: '24/10/2023',
    maturityDate: '24/10/2025',
    daysRemaining: 245,
    progressPercent: 65,
    status: 'active',
    nominee: 'Priya Sharma'
  },
  {
    id: 'dep-2',
    type: 'RD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'ICICI Bank',
    accountNumber: '50100239108829',
    interestRate: 6.85,
    currentValue: 245000,
    principalOrMonthly: 2000,
    startDate: '12/10/2023',
    maturityDate: '12/10/2025',
    daysRemaining: 245,
    progressPercent: 75,
    status: 'active',
    nominee: 'Rohan Sharma'
  },
  {
    id: 'dep-3',
    type: 'FD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'Kotak Bank',
    accountNumber: '50100774928829',
    interestRate: 7.85,
    currentValue: 245000,
    principalOrMonthly: 200000,
    startDate: '24/10/2023',
    maturityDate: '24/10/2025',
    daysRemaining: 245,
    progressPercent: 65,
    status: 'active'
  },
  {
    id: 'dep-4',
    type: 'FD',
    nickname: 'Children Higher Education',
    bankName: 'Axis Bank',
    accountNumber: '91823019383411',
    interestRate: 7.50,
    currentValue: 310500,
    principalOrMonthly: 250000,
    startDate: '18/12/2024',
    maturityDate: '18/12/2026',
    daysRemaining: 510,
    progressPercent: 40,
    status: 'active',
    nominee: 'Aarav Sharma'
  },
  {
    id: 'dep-5',
    type: 'RD',
    nickname: 'Emergency Rainy Day RD',
    bankName: 'SBI Bank',
    accountNumber: '10293847569012',
    interestRate: 7.10,
    currentValue: 103000,
    principalOrMonthly: 5000,
    startDate: '05/03/2024',
    maturityDate: '05/03/2026',
    daysRemaining: 220,
    progressPercent: 55,
    status: 'active'
  },
  {
    id: 'dep-m1',
    type: 'FD',
    nickname: '2023 Tax Saver',
    bankName: 'HDFC Bank',
    accountNumber: '50100984715562',
    interestRate: 6.75,
    currentValue: 55420,
    principalOrMonthly: 50000,
    startDate: '15/01/2023',
    maturityDate: '15/01/2025',
    daysRemaining: 0,
    progressPercent: 100,
    status: 'matured',
    maturedDate: '15/01/2025',
    nominee: 'Priya Sharma'
  },
  {
    id: 'dep-m2',
    type: 'FD',
    nickname: '2023 Tax Saver',
    bankName: 'ICICI Bank',
    accountNumber: '50100348105562',
    interestRate: 6.75,
    currentValue: 55420,
    principalOrMonthly: 50000,
    startDate: '15/01/2023',
    maturityDate: '15/01/2025',
    daysRemaining: 0,
    progressPercent: 100,
    status: 'matured',
    maturedDate: '15/01/2025'
  }
];

export const Deposits: React.FC<DepositsProps> = ({ isPrivate }) => {
  const [deposits, setDeposits] = useState<Deposit[]>(INITIAL_DEPOSITS);

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

  // Close context menu on document click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isAddEditOpen || isDeleteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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

  const totalCurrentValue = rawActiveDeposits.reduce((acc: number, curr: Deposit) => acc + curr.currentValue, 0);
  const fixedDeposits = rawActiveDeposits.filter((d: Deposit) => d.type === 'FD');
  const recurringDeposits = rawActiveDeposits.filter((d: Deposit) => d.type === 'RD');

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

    if (editingDeposit) {
      // Edit existing
      setDeposits((prev: Deposit[]) => prev.map((d: Deposit) => d.id === editingDeposit.id ? {
        ...d,
        type: formData.type,
        nickname: formData.nickname,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        principalOrMonthly: formData.amount,
        interestRate: formData.interestRate,
        currentValue: formData.amount * 1.08,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        daysRemaining: metrics.daysRemaining,
        progressPercent: metrics.progressPercent,
        nominee: formData.nominee
      } : d));
    } else {
      // Add new
      const newDep: Deposit = {
        id: `dep-${Date.now()}`,
        type: formData.type,
        nickname: formData.nickname,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber || '50100482918829',
        interestRate: formData.interestRate,
        currentValue: formData.amount,
        principalOrMonthly: formData.amount,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        daysRemaining: metrics.daysRemaining,
        progressPercent: metrics.progressPercent,
        status: metrics.daysRemaining <= 0 ? 'matured' : 'active',
        nominee: formData.nominee
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
    const oldMatStr = deposit.maturityDate || deposit.maturedDate || '01 Jan, 2025';

    // Parse old maturity date
    let oldDate: Date;
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(oldMatStr.trim())) {
      const parts = oldMatStr.trim().split('/');
      oldDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      const ts = Date.parse(oldMatStr.replace(',', ''));
      oldDate = !isNaN(ts) ? new Date(ts) : new Date();
    }

    // Add tenure to old maturity date
    const newDate = new Date(oldDate.getFullYear() + (years || 1), oldDate.getMonth() + (months || 0), oldDate.getDate());

    // Format new maturity date string matching original style
    let newMaturityStr = '';
    if (oldMatStr.includes('/')) {
      const d = String(newDate.getDate()).padStart(2, '0');
      const m = String(newDate.getMonth() + 1).padStart(2, '0');
      const y = newDate.getFullYear();
      newMaturityStr = `${d}/${m}/${y}`;
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const d = newDate.getDate();
      const m = monthNames[newDate.getMonth()];
      const y = newDate.getFullYear();
      newMaturityStr = `${d} ${m}, ${y}`;
    }

    const metrics = calculateDepositMetrics(newMaturityStr, oldMatStr, years, months);

    // Convert matured back to active deposit with new maturity date
    setDeposits((prevDeposits: Deposit[]) => prevDeposits.map((d: Deposit) => d.id === deposit.id ? {
      ...d,
      status: 'active',
      startDate: oldMatStr,
      maturityDate: newMaturityStr,
      daysRemaining: metrics.daysRemaining,
      progressPercent: metrics.progressPercent,
      maturedDate: undefined
    } : d));
  };

  return (
    <div className="space-y-8 fade-in p-1 md:p-2">

      {/* Top Page Header */}
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
        >
          New Deposit
        </PrimaryButton>
      </div>

      {/* Subtitle Divider */}
      <hr style={{ borderColor: 'rgba(191, 201, 196, 0.3)' }} />

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Net Current Value Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#C3C6CE]/10 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="relative z-10 space-y-3">
            <span className="block text-xs font-extrabold tracking-widest text-[#006A65] uppercase" style={{ letterSpacing: '2.4px' }}>
              NET CURRENT VALUE
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-orelio-navy">
                {formatVal(formatCurrency(totalCurrentValue > 0 ? totalCurrentValue : 1248500))}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#006A65]/10 text-[#006A65] text-xs font-semibold">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 400", fontSize: '16px' }}>trending_up</span>
                +4.2% this year
              </span>
            </div>
            <p className="text-sm text-[#73777E]">
              Net Principal: <span className="text-[#00162A] font-semibold">{formatVal('₹54,32,854')}</span>
            </p>
          </div>

          {/* Decorative bar graphic */}
          <div className="absolute right-6 bottom-0 flex items-end gap-2.5 opacity-90 pointer-events-none">
            <div className="w-8 h-12 bg-[#006A65]/10" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-8 h-18 bg-[#006A65]/20" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-8 h-14 bg-[#006A65]/30" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-8 h-24 bg-[#006A65]/60" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
            <div className="w-8 h-20 bg-[#006A65]/50" style={{ borderRadius: '10px 10px 0px 0px' }}></div>
          </div>
        </div>

        {/* Active Deposits Stats Card */}
        <div className="lg:col-span-5 bg-[#004D40] rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col justify-between min-h-[190px]">
          <div className="pb-3 md:pb-4">
            <span className="block text-xs font-bold tracking-widest text-[#AFEFDD]/60 uppercase">
              ACTIVE DEPOSITS
            </span>
            <div className="text-4xl md:text-5xl font-extrabold text-white mt-1">
              {rawActiveDeposits.length > 0 ? rawActiveDeposits.length : 12}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2.5 text-sm font-medium">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#FFFFFF]/70">{fixedDeposits.length > 0 ? fixedDeposits.length : 8} Fixed Deposits</span>
              <span className="text-white">{formatVal('₹840k')}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#FFFFFF]/70">{recurringDeposits.length > 0 ? recurringDeposits.length : 4} Recurring Deposits</span>
              <span className="text-white">{formatVal('₹408k')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Deposit Filter Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="bg-[#F2F4F5] p-1 rounded-2xl inline-flex items-center gap-1 text-xs font-bold w-fit">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${filterType === 'ALL'
              ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
              : 'text-[#74777F] hover:text-[#00162A]'
              }`}
          >
            All Deposits ({rawActiveDeposits.length + rawMaturedDeposits.length})
          </button>
          <button
            onClick={() => setFilterType('FD')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${filterType === 'FD'
              ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
              : 'text-[#74777F] hover:text-[#00162A]'
              }`}
          >
            <span className="material-symbols-outlined select-none text-[16px]">savings</span>
            Fixed Deposits (FD)
          </button>
          <button
            onClick={() => setFilterType('RD')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${filterType === 'RD'
              ? 'bg-white text-[#00162A] shadow-xs font-extrabold'
              : 'text-[#74777F] hover:text-[#00162A]'
              }`}
          >
            <span className="material-symbols-outlined select-none text-[16px]">refresh</span>
            Recurring Deposits (RD)
          </button>
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
                  className={`group bg-white rounded-3xl p-5 md:p-6 border border-[#C3C6CE]/30 shadow-xs hover:border-2 hover:border-[#006A65] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)] transition-all duration-300 ease-out relative flex flex-col cursor-pointer ${isMenuOpen ? 'z-50' : 'z-0'
                    } ${isExpanded ? 'border-[#006A65]/60 shadow-[0_4px_20px_0_rgba(0,106,101,0.08)]' : ''}`}
                >
                  {/* Main Card Grid Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Column 1: Icon & Title & Deposit No */}
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out">
                        <span
                          className={`material-symbols-outlined select-none transition-transform duration-300 ${deposit.type === 'FD' ? 'group-hover:scale-100 group-hover:-rotate-12' : 'group-hover:rotate-180'
                            }`}
                          style={{ fontSize: '24px' }}
                        >
                          {deposit.type === 'FD' ? 'savings' : 'refresh'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-1.5 transition-colors duration-300">
                          {deposit.type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
                        </span>
                        <h3 className="text-base font-bold text-[#00162A]">
                          {deposit.nickname}
                        </h3>
                        <span className="block text-xs font-medium text-[#74777F] mt-1.5">
                          Deposit No.: {deposit.accountNumber}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Interest Rate */}
                    <div className="min-w-[110px]">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                        INTEREST RATE
                      </span>
                      <span className="block text-base font-extrabold text-[#00162A]">
                        {deposit.interestRate}% p.a.
                      </span>
                    </div>

                    {/* Column 3: Current Value */}
                    <div className="min-w-[150px]">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                        CURRENT VALUE
                      </span>
                      <span className="block text-base font-extrabold text-[#00162A]">
                        {formatVal(formatCurrency(deposit.currentValue))}
                      </span>
                      <span className="block text-xs font-medium text-[#74777F] mt-1.5">
                        {deposit.type === 'FD' ? `Principal: ${formatVal(formatCurrency(deposit.principalOrMonthly))}` : `Monthly: ${formatVal(formatCurrency(deposit.principalOrMonthly))}`}
                      </span>
                    </div>

                    {/* Column 4: Maturity Progress */}
                    <div className="min-w-[200px] flex-1 max-w-xs">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-3 transition-colors duration-300">
                        MATURITY PROGRESS
                      </span>
                      <div className="w-full bg-[#E5E8EB] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#006A65] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex flex-col text-xs font-medium text-[#74777F] mt-2 space-y-0.5">
                        <span>Matures {formatDisplayDate(deposit.maturityDate)}</span>
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    </div>

                    {/* Column 5: Expand Chevron & Context Menu Button */}
                    <div className="flex items-center gap-1.5 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDepositId(isExpanded ? null : deposit.id);
                        }}
                        className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center"
                        aria-label="Expand card details"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '22px' }}>
                          expand_more
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : deposit.id);
                        }}
                        className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center"
                        aria-label="More menu"
                      >
                        <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>more_vert</span>
                      </button>

                      {/* Context Menu / Popover */}
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
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors"
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
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors"
                          >
                            {deposit.type === 'FD' ? 'Delete FD' : 'Delete RD'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="w-full pt-4 border-t border-[#C3C6CE]/30 flex flex-col md:flex-row md:items-start gap-5">
                        {/* Bank Name aligned with FD NICKNAME */}
                        <div className="flex items-start gap-4 min-w-[240px]">
                          <div className="w-12 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-[#73777E] group-hover:text-[#006A65] uppercase transition-colors duration-300" style={{ letterSpacing: '1px' }}>
                              Bank Name
                            </span>
                            <span className="block text-sm font-bold text-[#00162A]" style={{ letterSpacing: '1px' }}>
                              {deposit.bankName?.trim() ? deposit.bankName : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Nominee Name aligned with INTEREST RATE */}
                        <div className="min-w-[110px] space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] group-hover:text-[#006A65] uppercase transition-colors duration-300" style={{ letterSpacing: '1px' }}>
                            Nominee Name
                          </span>
                          <span className="block text-sm font-bold text-[#00162A]" style={{ letterSpacing: '1px' }}>
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
            <div className="flex items-center justify-center gap-2 pt-4">
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
                  className={`group bg-[#F2F4F5] rounded-3xl p-5 md:p-6 border border-[#BFC9C4]/20 transition-all duration-300 ease-out flex flex-col cursor-pointer ${isExpanded ? 'border-[#006A65]/40 shadow-xs' : ''
                    }`}
                >
                  {/* Main Row */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 w-full">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 min-w-[240px]">
                      <div className="w-12 h-12 rounded-2xl bg-[#BFC9C4]/20 text-[#74777F] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined select-none font-bold" style={{ fontSize: '22px' }}>task_alt</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                          {deposit.type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
                        </span>
                        <h3 className="text-base font-bold text-[#74777F]">
                          {deposit.nickname}
                        </h3>
                        <span className="block text-xs font-medium text-[#74777F] mt-1.5">
                          Deposit No.: {deposit.accountNumber}
                        </span>
                      </div>
                    </div>

                    {/* Final Rate */}
                    <div className="min-w-[110px]">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                        FINAL RATE
                      </span>
                      <span className="block text-base font-extrabold text-[#74777F]">
                        {deposit.interestRate}% p.a.
                      </span>
                    </div>

                    {/* Maturity Value */}
                    <div className="min-w-[150px]">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                        MATURITY VALUE
                      </span>
                      <span className="block text-base font-extrabold text-[#74777F]">
                        {formatVal(formatCurrency(deposit.currentValue))}
                      </span>
                    </div>

                    {/* Matured On */}
                    <div className="min-w-[140px]">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                        MATURED ON
                      </span>
                      <span className="block text-sm font-bold text-[#74777F]">
                        {formatDisplayDate(deposit.maturedDate || deposit.maturityDate)}
                      </span>
                    </div>

                    {/* Reinvest Action & Expand Chevron */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReinvest(deposit);
                        }}
                        className="px-5 py-2.5 rounded-xl border border-[#C3C6CE]/50 bg-white text-[#00162A] font-bold text-xs tracking-wider uppercase hover:scale-105 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                      >
                        REINVEST
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDepositId(isExpanded ? null : deposit.id);
                        }}
                        className="w-9 h-9 rounded-full text-[#74777F] hover:bg-white/80 hover:text-[#00162A] transition-colors flex items-center justify-center"
                        aria-label="Expand card details"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <span className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`} style={{ fontSize: '22px' }}>
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="w-full pt-4 border-t border-[#BFC9C4]/30 flex flex-col md:flex-row md:items-start gap-5">
                        {/* Bank Name aligned with FD NICKNAME */}
                        <div className="flex items-start gap-4 min-w-[240px]">
                          <div className="w-12 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                              Bank Name
                            </span>
                            <span className="block text-sm font-bold text-[#74777F]" style={{ letterSpacing: '1px' }}>
                              {deposit.bankName?.trim() ? deposit.bankName : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Nominee Name aligned with FINAL RATE */}
                        <div className="min-w-[110px] space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Nominee Name
                          </span>
                          <span className="block text-sm font-bold text-[#74777F]" style={{ letterSpacing: '1px' }}>
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
            <div className="flex items-center justify-center gap-2 pt-4">
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

      {/* Add / Edit Deposit Modal */}
      <AddEditDepositModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingDeposit(null);
        }}
        editingDeposit={editingDeposit}
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
