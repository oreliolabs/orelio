import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface Deposit {
  id: string;
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  accountNumber: string;
  interestRate: number;
  currentValue: number;
  principalOrMonthly: number;
  maturityDate: string;
  daysRemaining: number;
  progressPercent: number;
  status: 'active' | 'matured';
  maturedDate?: string;
  nominee?: string;
}

interface DepositsProps {
  isPrivate: boolean;
}

const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: 'dep-1',
    type: 'FD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'HDFC Bank',
    accountNumber: '**** 8829',
    interestRate: 7.85,
    currentValue: 245000,
    principalOrMonthly: 200000,
    maturityDate: '24 Oct, 2025',
    daysRemaining: 245,
    progressPercent: 65,
    status: 'active'
  },
  {
    id: 'dep-2',
    type: 'RD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'ICICI Bank',
    accountNumber: '**** 8829',
    interestRate: 6.85,
    currentValue: 245000,
    principalOrMonthly: 2000,
    maturityDate: '12 Oct, 2025',
    daysRemaining: 245,
    progressPercent: 75,
    status: 'active'
  },
  {
    id: 'dep-3',
    type: 'FD',
    nickname: 'Retirement Alpha Fund',
    bankName: 'Kotak Bank',
    accountNumber: '**** 8829',
    interestRate: 7.85,
    currentValue: 245000,
    principalOrMonthly: 200000,
    maturityDate: '24 Oct, 2025',
    daysRemaining: 245,
    progressPercent: 65,
    status: 'active'
  },
  {
    id: 'dep-4',
    type: 'FD',
    nickname: 'Children Higher Education',
    bankName: 'Axis Bank',
    accountNumber: '**** 3411',
    interestRate: 7.50,
    currentValue: 310500,
    principalOrMonthly: 250000,
    maturityDate: '18 Dec, 2026',
    daysRemaining: 510,
    progressPercent: 40,
    status: 'active'
  },
  {
    id: 'dep-5',
    type: 'RD',
    nickname: 'Emergency Rainy Day RD',
    bankName: 'SBI Bank',
    accountNumber: '**** 9012',
    interestRate: 7.10,
    currentValue: 103000,
    principalOrMonthly: 5000,
    maturityDate: '05 Mar, 2026',
    daysRemaining: 220,
    progressPercent: 55,
    status: 'active'
  },
  {
    id: 'dep-m1',
    type: 'FD',
    nickname: '2023 Tax Saver',
    bankName: 'HDFC Bank',
    accountNumber: '**** 5562',
    interestRate: 6.75,
    currentValue: 55420,
    principalOrMonthly: 50000,
    maturityDate: '15 Jan, 2025',
    daysRemaining: 0,
    progressPercent: 100,
    status: 'matured',
    maturedDate: '15 Jan, 2025'
  },
  {
    id: 'dep-m2',
    type: 'FD',
    nickname: '2023 Tax Saver',
    bankName: 'ICICI Bank',
    accountNumber: '**** 5562',
    interestRate: 6.75,
    currentValue: 55420,
    principalOrMonthly: 50000,
    maturityDate: '15 Jan, 2025',
    daysRemaining: 0,
    progressPercent: 100,
    status: 'matured',
    maturedDate: '15 Jan, 2025'
  }
];

export const Deposits: React.FC<DepositsProps> = ({ isPrivate }) => {
  const [deposits, setDeposits] = useState<Deposit[]>(INITIAL_DEPOSITS);

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination states
  const [activePage, setActivePage] = useState<number>(1);
  const [maturedPage, setMaturedPage] = useState<number>(1);

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingDeposit, setDeletingDeposit] = useState<Deposit | null>(null);

  // Add/Edit Form Fields
  const [formType, setFormType] = useState<'FD' | 'RD'>('FD');
  const [formNickname, setFormNickname] = useState<string>('');
  const [formBankName, setFormBankName] = useState<string>('');
  const [formAccountNumber, setFormAccountNumber] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formInterestRate, setFormInterestRate] = useState<string>('');
  const [formMaturityDate, setFormMaturityDate] = useState<string>('');
  const [formTenureYears, setFormTenureYears] = useState<string>('');
  const [formTenureMonths, setFormTenureMonths] = useState<string>('');
  const [formHasNominee, setFormHasNominee] = useState<boolean>(false);
  const [formNomineeName, setFormNomineeName] = useState<string>('');

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

  // Calculations for summary cards
  const activeDepositsList = deposits.filter(d => d.status === 'active');
  const maturedDepositsList = deposits.filter(d => d.status === 'matured');

  const totalCurrentValue = activeDepositsList.reduce((acc, curr) => acc + curr.currentValue, 0);
  const fixedDeposits = activeDepositsList.filter(d => d.type === 'FD');
  const recurringDeposits = activeDepositsList.filter(d => d.type === 'RD');

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingDeposit(null);
    setFormType('FD');
    setFormNickname('');
    setFormBankName('');
    setFormAccountNumber('');
    setFormAmount('');
    setFormInterestRate('');
    setFormMaturityDate('');
    setFormTenureYears('');
    setFormTenureMonths('');
    setFormHasNominee(false);
    setFormNomineeName('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setFormType(deposit.type);
    setFormNickname(deposit.nickname);
    setFormBankName(deposit.bankName || '');
    setFormAccountNumber(deposit.accountNumber);
    setFormAmount(deposit.principalOrMonthly.toString());
    setFormInterestRate(deposit.interestRate.toString());
    setFormMaturityDate(deposit.maturityDate);
    setFormTenureYears('1');
    setFormTenureMonths('0');
    setFormHasNominee(!!deposit.nominee);
    setFormNomineeName(deposit.nominee || '');
    setIsAddEditOpen(true);
  };

  const handleSaveDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount) || 100000;
    const rateNum = parseFloat(formInterestRate) || 7.5;

    if (editingDeposit) {
      // Edit existing
      setDeposits(deposits.map(d => d.id === editingDeposit.id ? {
        ...d,
        type: formType,
        nickname: formNickname || (formType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'),
        bankName: formBankName || 'Bank',
        accountNumber: formAccountNumber || '**** 8829',
        principalOrMonthly: amountNum,
        interestRate: rateNum,
        currentValue: amountNum * 1.08,
        maturityDate: formMaturityDate || '24 Oct, 2025',
        nominee: formHasNominee ? formNomineeName : undefined
      } : d));
    } else {
      // Add new
      const newDep: Deposit = {
        id: `dep-${Date.now()}`,
        type: formType,
        nickname: formNickname || (formType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'),
        bankName: formBankName || 'HDFC Bank',
        accountNumber: formAccountNumber ? (formAccountNumber.startsWith('****') ? formAccountNumber : `**** ${formAccountNumber.slice(-4)}`) : '**** 8829',
        interestRate: rateNum,
        currentValue: amountNum,
        principalOrMonthly: amountNum,
        maturityDate: formMaturityDate || '24 Oct, 2026',
        daysRemaining: 365,
        progressPercent: 10,
        status: 'active',
        nominee: formHasNominee ? formNomineeName : undefined
      };
      setDeposits([newDep, ...deposits]);
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
    // Convert matured back to active deposit
    setDeposits(deposits.map(d => d.id === deposit.id ? {
      ...d,
      status: 'active',
      maturityDate: '26 Jul, 2026',
      daysRemaining: 365,
      progressPercent: 5
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
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#006A65] text-white font-bold text-sm shadow-sm hover:bg-[#006A65] active:scale-98 transition-all"
        >
          <span className="material-symbols-outlined select-none font-bold" style={{ fontSize: '18px' }}>add</span>
          <span>New Deposit</span>
        </button>
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
              {activeDepositsList.length > 0 ? activeDepositsList.length : 12}
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

      {/* Active Deposits Section */}
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
          {activeDepositsList.map((deposit) => {
            const isMenuOpen = activeMenuId === deposit.id;

            return (
              <div
                key={deposit.id}
                className={`group bg-white rounded-3xl p-5 md:p-6 border border-[#C3C6CE]/30 shadow-xs hover:border-2 hover:border-[#006A65] hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)] transition-all duration-300 ease-out relative flex flex-col md:flex-row md:items-start justify-between gap-5 ${isMenuOpen ? 'z-50' : 'z-0'}`}
              >
                {/* Left Side: Icon & Deposit Info */}
                <div className="flex items-start gap-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out">
                    {deposit.type === 'FD' ? (
                      <span className="material-symbols-outlined select-none transition-transform duration-300 group-hover:scale-100 group-hover:-rotate-12" style={{ fontSize: '24px' }}>savings</span>
                    ) : (
                      <span className="material-symbols-outlined select-none transition-transform duration-500 group-hover:rotate-180" style={{ fontSize: '24px' }}>refresh</span>
                    )}
                  </div>

                  <div>
                    <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                      {deposit.type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
                    </span>
                    <h3 className="text-base font-bold text-[#00162A]">
                      {deposit.nickname}
                    </h3>
                    <span className="block text-xs font-medium text-[#74777F] mt-1.5">
                      Account No.: {deposit.accountNumber}
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
                      style={{ width: `${deposit.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#74777F] mt-1.5">
                    <span>Matures {deposit.maturityDate}</span>
                    <span>{deposit.daysRemaining} days remaining</span>
                  </div>
                </div>

                {/* Column 5: More Options Button & Dropdown */}
                <div className="relative">
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
            );
          })}
        </div>

        {/* Active Deposits Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={activePage === 1}
            onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40"
          >
            ‹ Previous
          </button>
          <button
            onClick={() => setActivePage(1)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${activePage === 1 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            1
          </button>
          <button
            onClick={() => setActivePage(2)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${activePage === 2 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            2
          </button>
          <button
            onClick={() => setActivePage(3)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${activePage === 3 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            3
          </button>
          <button
            onClick={() => setActivePage(prev => Math.min(prev + 1, 3))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5]"
          >
            Next ›
          </button>
        </div>

      </div>

      {/* Matured Deposits Section */}
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
          {maturedDepositsList.map((deposit) => (
            <div
              key={deposit.id}
              className="group bg-[#F2F4F5] rounded-3xl p-5 md:p-6 border border-[#BFC9C4]/10 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#00162A] group-hover:bg-[#E6F4F1] group-hover:text-[#006A65] flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <span className="material-symbols-outlined select-none font-bold" style={{ fontSize: '22px' }}>check</span>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                    FD NICKNAME
                  </span>
                  <h3 className="text-base font-bold text-[#00162A]">
                    {deposit.nickname}
                  </h3>
                  <span className="block text-xs font-medium text-[#74777F] mt-1.5">
                    Account No.: {deposit.accountNumber}
                  </span>
                </div>
              </div>

              {/* Final Rate */}
              <div className="min-w-[110px]">
                <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                  FINAL RATE
                </span>
                <span className="block text-base font-extrabold text-[#00162A]">
                  {deposit.interestRate}% p.a.
                </span>
              </div>

              {/* Maturity Value */}
              <div className="min-w-[150px]">
                <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                  MATURITY VALUE
                </span>
                <span className="block text-base font-extrabold text-[#00162A]">
                  {formatVal(formatCurrency(deposit.currentValue))}
                </span>
              </div>

              {/* Matured On */}
              <div className="min-w-[140px]">
                <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
                  MATURED ON
                </span>
                <span className="block text-sm font-bold text-[#00162A]">
                  {deposit.maturedDate || '15 Jan, 2025'}
                </span>
              </div>

              {/* Reinvest Action */}
              <div>
                <button
                  onClick={() => handleReinvest(deposit)}
                  className="px-5 py-2.5 rounded-xl border border-[#C3C6CE]/50 bg-white text-[#00162A] font-extrabold text-xs tracking-wider uppercase hover:bg-[#F2F4F5] active:scale-98 transition-all"
                >
                  REINVEST
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Matured Deposits Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={maturedPage === 1}
            onClick={() => setMaturedPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5] disabled:opacity-40"
          >
            ‹ Previous
          </button>
          <button
            onClick={() => setMaturedPage(1)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${maturedPage === 1 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            1
          </button>
          <button
            onClick={() => setMaturedPage(2)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${maturedPage === 2 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            2
          </button>
          <button
            onClick={() => setMaturedPage(3)}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${maturedPage === 3 ? 'bg-[#00162A] text-white' : 'bg-[#F2F4F5] text-[#00162A]'}`}
          >
            3
          </button>
          <button
            onClick={() => setMaturedPage(prev => Math.min(prev + 1, 3))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#74777F] hover:bg-[#F2F4F5]"
          >
            Next ›
          </button>
        </div>

      </div>

      {/* Add / Edit Deposit Modal (Add Deposit.svg) */}
      {isAddEditOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#C3C6CE]/30 max-h-[90vh] overflow-y-auto no-scrollbar relative space-y-6">

            {/* Modal Close Button */}
            <button
              onClick={() => setIsAddEditOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
            >
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
            </button>

            {/* Modal Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-[#00162A] tracking-tight">
                {editingDeposit ? 'Edit Deposit' : 'Add New Deposit'}
              </h2>
            </div>

            {/* Deposit Type Switcher */}
            <div className="bg-[#F2F4F5] p-1.5 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormType('FD')}
                className={`py-3 rounded-xl transition-all ${formType === 'FD' ? 'bg-white text-[#00162A] shadow-sm' : 'text-[#74777F] hover:text-[#00162A]'}`}
              >
                Fixed Deposit
              </button>
              <button
                type="button"
                onClick={() => setFormType('RD')}
                className={`py-3 rounded-xl transition-all ${formType === 'RD' ? 'bg-white text-[#00162A] shadow-sm' : 'text-[#74777F] hover:text-[#00162A]'}`}
              >
                Recurring Deposit
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveDeposit} className="space-y-4">

              {/* Deposit Nickname */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  DEPOSIT NICKNAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Retirement Alpha Fund, Goldman Sachs"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              {/* Institution Name & Account Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    INSTITUTION / BANK NAME
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#74777F] select-none" style={{ fontSize: '18px' }}>account_balance</span>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    DEPOSIT NUMBER
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#74777F] select-none" style={{ fontSize: '18px' }}>tag</span>
                    <input
                      type="text"
                      placeholder="#### #### ####"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                  </div>
                </div>
              </div>

              {/* Principal Amount & Interest Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    {formType === 'FD' ? 'PRINCIPAL AMOUNT' : 'MONTHLY DEPOSIT'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm font-bold text-[#74777F]">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    INTEREST RATE (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="7.85"
                      value={formInterestRate}
                      onChange={(e) => setFormInterestRate(e.target.value)}
                      className="w-full pl-4 pr-8 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                    <span className="absolute right-3.5 top-3 text-sm font-bold text-[#74777F]">%</span>
                  </div>
                </div>
              </div>

              {/* Maturity Date & Tenure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    MATURITY DATE
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formMaturityDate}
                    onChange={(e) => setFormMaturityDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    TENURE
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Years"
                      value={formTenureYears}
                      onChange={(e) => setFormTenureYears(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65]"
                    />
                    <input
                      type="number"
                      placeholder="Months"
                      value={formTenureMonths}
                      onChange={(e) => setFormTenureMonths(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                </div>
              </div>

              {/* Nominee Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFormHasNominee(!formHasNominee)}
                  className="text-xs font-bold text-[#006A65] hover:underline flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '16px' }}>add</span>
                  <span>{formHasNominee ? 'REMOVE NOMINEE' : 'ADD NOMINEE'}</span>
                </button>

                {formHasNominee && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Nominee Full Name"
                      value={formNomineeName}
                      onChange={(e) => setFormNomineeName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#C3C6CE]/20">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-5 py-3 rounded-2xl text-sm font-bold text-[#00162A] hover:bg-[#F2F4F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#006A65] text-white font-bold text-sm shadow-sm hover:bg-[#006A65]/90 active:scale-98 transition-all"
                >
                  Save Deposit
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* Delete Deposit Modal (Delete.svg) */}
      {isDeleteOpen && deletingDeposit && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#C3C6CE]/30 relative space-y-5">

            <button
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
            >
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '24px' }}>delete</span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#00162A] tracking-tight">
                Delete {deletingDeposit.type === 'FD' ? 'FD' : 'RD'}?
              </h2>
              <p className="text-sm font-medium text-[#74777F] mt-1.5 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-[#00162A]">{deletingDeposit.nickname}</span> ({deletingDeposit.accountNumber})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C3C6CE]/20">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-[#00162A] hover:bg-[#F2F4F5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-sm hover:bg-rose-700 active:scale-98 transition-all"
              >
                Delete
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Deposits;
