import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddEditLoanModal } from './AddEditLoanModal';
import type { LoanFormData } from './AddEditLoanModal';
import { getLoans, saveLoans, getPrimaryMemberId } from '../../data/orelioStore';
import type { LoanItem } from '../../data/types';
export type { LoanItem } from '../../data/types';

interface LoansAndCreditProps {
  isPrivate?: boolean;
  selectedMemberId?: string | 'all';
}

export const LoansAndCredit: React.FC<LoansAndCreditProps> = ({ isPrivate = false, selectedMemberId = 'all' }) => {
  const [loans, setLoans] = useState<LoanItem[]>(() => getLoans(selectedMemberId));

  useEffect(() => {
    saveLoans(loans, selectedMemberId);
  }, [loans, selectedMemberId]);

  // Modal, menu, and expanded card state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // Close More menu when clicking anywhere outside or pressing Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.loan-card-menu-container')) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    if (isPrivate) return '••••••';
    return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  // Convert YYYY-MM-DD string from date input to epoch ms (UTC midnight)
  const dateStringToEpoch = (dateStr: string): number => {
    if (!dateStr) return Date.now();
    return new Date(dateStr + 'T00:00:00Z').getTime();
  };

  // Convert epoch ms to YYYY-MM-DD string for date inputs
  const epochToDateString = (epoch: number): string => {
    if (!epoch) return '';
    return new Date(epoch).toISOString().split('T')[0];
  };

  // Helper for displaying readable dates
  const formatDate = (epoch?: number): string => {
    if (!epoch) return '-';
    return new Date(epoch).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Metrics computation
  const totalOutstanding = loans.reduce((sum, item) => sum + item.outstandingBalance, 0);
  const totalDueThisMonth = loans.reduce((sum, item) => sum + item.monthlyEmi, 0);
  const avgInterestRate = loans.length > 0
    ? (loans.reduce((sum, item) => sum + item.interestRate, 0) / loans.length).toFixed(2)
    : '0.00';

  // Debt payoff = percentage of original principal repaid (higher = closer to debt free)
  const totalLoanAmount = loans.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalRepaidAmount = Math.max(0, totalLoanAmount - totalOutstanding);
  const debtPayoffPercent = totalLoanAmount > 0
    ? Math.min(100, Math.max(0, Math.round((totalRepaidAmount / totalLoanAmount) * 100)))
    : 100;

  const debtPayoffStatus = (() => {
    if (loans.length === 0 || totalOutstanding === 0) {
      return { label: 'DEBT FREE', message: 'All loans completely paid off!' };
    }
    if (debtPayoffPercent >= 80) {
      return { label: 'EXCELLENT', message: 'Almost fully debt-free!' };
    }
    if (debtPayoffPercent >= 50) {
      return { label: 'HALFWAY', message: 'Over halfway through payoff' };
    }
    if (debtPayoffPercent >= 20) {
      return { label: 'STEADY', message: 'Steady repayment progress' };
    }
    return { label: 'STARTING', message: 'Early repayment stage' };
  })();

  // Helper for loan category icon
  const getLoanIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mortgage':
      case 'home loan':
        return 'home';
      case 'auto loan':
      case 'car loan':
        return 'directions_car';
      case 'education loan':
      case 'student loan':
        return 'school';
      case 'credit card':
        return 'credit_card';
      default:
        return 'payments';
    }
  };

  // Save new or edited loan
  const handleSaveLoan = (formData: LoanFormData) => {
    if (selectedLoan && isEditModalOpen) {
      // Edit existing loan
      setLoans(loans.map((item) => {
        if (item.id === selectedLoan.id) {
          const totalAmt = formData.totalAmount || item.totalAmount;
          const currentOut = formData.outstandingBalance ?? item.outstandingBalance;
          const progress = Math.min(100, Math.max(0, Math.round(((totalAmt - currentOut) / totalAmt) * 100)));
          return {
            ...item,
            type: formData.type,
            provider: formData.provider,
            nickname: formData.nickname,
            totalAmount: totalAmt,
            outstandingBalance: currentOut,
            interestRate: formData.interestRate,
            tenureYears: formData.tenureYears,
            tenureMonths: formData.tenureMonths,
            startDate: formData.startDate ? dateStringToEpoch(formData.startDate) : item.startDate,
            repaymentProgressPercent: progress,
            memberId: item.memberId || (selectedMemberId === 'all' ? getPrimaryMemberId() : selectedMemberId)
          };
        }
        return item;
      }));
    } else {
      // Add new loan
      const targetMemberId = selectedMemberId === 'all' ? getPrimaryMemberId() : selectedMemberId;
      const newLoan: LoanItem = {
        id: Date.now().toString(),
        type: formData.type,
        nickname: formData.nickname,
        provider: formData.provider,
        accountNumber: formData.accountNumber || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        totalAmount: formData.totalAmount,
        outstandingBalance: formData.totalAmount,
        interestRate: formData.interestRate,
        tenureYears: formData.tenureYears,
        tenureMonths: formData.tenureMonths,
        startDate: formData.startDate ? dateStringToEpoch(formData.startDate) : Date.now(),
        nextEmiDate: (() => { const d = new Date(); d.setUTCMonth(d.getUTCMonth() + 1); d.setUTCDate(1); return d.getTime(); })(),
        monthlyEmi: Math.round((formData.totalAmount * (formData.interestRate / 100)) / 12 + (formData.totalAmount / (formData.tenureYears * 12 || 12))),
        repaymentProgressPercent: 0,
        status: 'active',
        memberId: targetMemberId
      };
      setLoans([...loans, newLoan]);
    }
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedLoan(null);
  };

  // Mark installment paid action
  const handleMarkInstallmentPaid = (loan: LoanItem) => {
    setLoans(loans.map((item) => {
      if (item.id === loan.id) {
        const newOutstanding = Math.max(0, item.outstandingBalance - item.monthlyEmi);
        const newProgress = Math.min(100, Math.round(((item.totalAmount - newOutstanding) / item.totalAmount) * 100));
        return {
          ...item,
          outstandingBalance: newOutstanding,
          repaymentProgressPercent: newProgress
        };
      }
      return item;
    }));
    setActiveMenuId(null);
  };

  // Delete loan action
  const handleConfirmDelete = () => {
    if (selectedLoan) {
      setLoans(loans.filter((item) => item.id !== selectedLoan.id));
    }
    setIsDeleteModalOpen(false);
    setSelectedLoan(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-4 sm:pb-6">
      {/* Header Section */}
      {loans.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#00162A] tracking-tight">
              Loans & Credit
            </h1>
            <p className="text-xs sm:text-sm text-[#74777F] mt-1 font-medium">
              Manage and monitor your lending
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton
              icon="add"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto justify-center"
            >
              Add New Loan
            </PrimaryButton>
          </div>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-12 sm:py-20 px-4 sm:px-6 flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[32px] sm:text-[36px]">
              credit_card
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#00162A] tracking-tight">No Loans Yet</h3>
          <p className="text-xs sm:text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Track and monitor your personal, home, auto loans, and credit lines all in one secure place.
          </p>
          <div className="mt-6 w-full sm:w-auto">
            <PrimaryButton
              onClick={() => {
                setSelectedLoan(null);
                setIsAddModalOpen(true);
              }}
              icon="add"
              className="w-full sm:w-auto justify-center"
            >
              Add Your First Loan
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal Divider after Header Section */}
          <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Total Outstanding Debt (Left Card) */}
            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="block text-[11px] sm:text-[12px] font-extrabold tracking-widest text-[#006A65] uppercase">
                  TOTAL OUTSTANDING DEBT
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#00162A] mt-2 tracking-tight break-words">
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#C3C6CE]/20">
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    DUE THIS MONTH
                  </span>
                  <span className="block text-sm sm:text-lg font-extrabold text-[#00162A] mt-1 break-words">
                    {formatCurrency(totalDueThisMonth)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    AVERAGE INTEREST
                  </span>
                  <span className="block text-sm sm:text-lg font-extrabold text-[#00162A] mt-1">
                    {isPrivate ? '••••' : `${avgInterestRate}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Debt Payoff (Right Card - Forest Green) */}
            <div className="bg-[#004D40] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest text-[#AFEFDD] uppercase">
                  DEBT PAYOFF
                </span>
                <span className="material-symbols-outlined select-none text-[#AFEFDD]/70">
                  trending_up
                </span>
              </div>

              <div className="my-3 sm:my-4 flex items-center justify-start relative">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#00342B]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#AFEFDD]"
                      strokeDasharray={`${debtPayoffPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-extrabold text-white">{debtPayoffPercent}%</span>
                    <span className="text-[9px] font-bold text-[#AFEFDD] uppercase tracking-wider">{debtPayoffStatus.label}</span>
                  </div>
                </div>
              </div>

              <div className="text-left pt-1 sm:pt-2">
                <p className="text-xs text-[#AFEFDD]/90 font-medium">
                  {debtPayoffStatus.message}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header: Active Liabilities */}
          <div className="flex items-center gap-3 sm:gap-4 w-full pt-1 sm:pt-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[#00162A] tracking-tight whitespace-nowrap">
              Active Liabilities
            </h2>
            <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
              {loans.length} {loans.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>

          {/* Active Liabilities List */}
          <div className="space-y-3.5 sm:space-y-4">
            {loans.map((loan) => {
              const isMenuOpen = activeMenuId === loan.id;
              const isExpanded = expandedLoanId === loan.id;

              return (
                <div
                  key={loan.id}
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                  className={`
                    bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#C3C6CE]/30 
                    hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:border-[#006A65]/40
                    transition-all duration-300 group relative cursor-pointer
                    ${isMenuOpen ? 'z-50' : 'z-0'}
                  `}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                    {/* Top Row on mobile / Left Column on desktop */}
                    <div className="flex items-center justify-between lg:w-[270px] xl:w-[290px] shrink-0 min-w-0">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined select-none text-[22px] sm:text-[26px]">
                            {getLoanIcon(loan.type)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-[#00162A] tracking-tight truncate">
                            {loan.nickname}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-semibold text-[#74777F] uppercase tracking-wide mt-0.5 truncate">
                            {loan.provider} •••• {loan.accountNumber.slice(-4)}
                          </p>
                        </div>
                      </div>

                      {/* Mobile-only action buttons: Menu + Expand Chevron */}
                      <div className="flex items-center gap-1 lg:hidden shrink-0">
                        <div className="relative loan-card-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === loan.id ? null : loan.id);
                            }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                            aria-label="More options"
                          >
                            <span className="material-symbols-outlined select-none text-[20px]">
                              more_vert
                            </span>
                          </button>

                          {/* Mobile Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-10 z-50 w-52 bg-white rounded-2xl shadow-[0_10px_38px_0_rgba(0,0,0,0.14)] border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in duration-200"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkInstallmentPaid(loan);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#006A65] hover:bg-[#F0FDF4] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined select-none text-[18px]">
                                  check_circle
                                </span>
                                Mark Installment Paid
                              </button>
                              <div className="border-t border-[#C3C6CE]/20" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLoan(loan);
                                  setIsEditModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined select-none text-[18px]">
                                  edit
                                </span>
                                Edit Loan
                              </button>
                              <div className="border-t border-[#C3C6CE]/20" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLoan(loan);
                                  setIsDeleteModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined select-none text-[18px]">
                                  delete
                                </span>
                                Delete Loan
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLoanId(isExpanded ? null : loan.id);
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:text-[#00162A] hover:bg-white/80 transition-colors cursor-pointer"
                          aria-label="Expand loan details"
                        >
                          <span
                            className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`}
                            style={{ fontSize: '22px' }}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Metrics: 2 columns on mobile, flex row on desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:flex-1 gap-3.5 sm:gap-4 lg:gap-6 min-w-0">
                      {/* Outstanding Balance */}
                      <div className="flex flex-col lg:w-[150px] shrink-0">
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
                          OUTSTANDING
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#00162A] mt-0.5 truncate">
                          {formatCurrency(loan.outstandingBalance)}
                        </span>
                      </div>

                      {/* Monthly EMI */}
                      <div className="flex flex-col lg:w-[130px] shrink-0">
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
                          MONTHLY EMI
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#00162A] mt-0.5 truncate">
                          {formatCurrency(loan.monthlyEmi)}
                        </span>
                      </div>

                      {/* Repayment Progress Bar */}
                      <div className="col-span-2 sm:col-span-1 lg:flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
                            REPAID
                          </span>
                          <span className="text-[#006A65] font-extrabold text-xs">
                            {loan.repaymentProgressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-[#E5E9EB] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#006A65] h-full rounded-full transition-all duration-500"
                            style={{ width: `${loan.repaymentProgressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desktop-only action buttons: Menu + Expand Chevron */}
                    <div className="hidden lg:flex items-center justify-end gap-1 shrink-0">
                      <div className="relative loan-card-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === loan.id ? null : loan.id);
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <span className="material-symbols-outlined select-none text-[22px]">
                            more_vert
                          </span>
                        </button>

                        {/* Desktop Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-10 z-50 w-52 bg-white rounded-2xl shadow-[0_10px_38px_0_rgba(0,0,0,0.14)] border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in duration-200"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkInstallmentPaid(loan);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#006A65] hover:bg-[#F0FDF4] transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined select-none text-[18px]">
                                check_circle
                              </span>
                              Mark Installment Paid
                            </button>
                            <div className="border-t border-[#C3C6CE]/20" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLoan(loan);
                                setIsEditModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined select-none text-[18px]">
                                edit
                              </span>
                              Edit Loan
                            </button>
                            <div className="border-t border-[#C3C6CE]/20" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLoan(loan);
                                setIsDeleteModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined select-none text-[18px]">
                                delete
                              </span>
                              Delete Loan
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLoanId(isExpanded ? null : loan.id);
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                        aria-label="Expand loan details"
                        title={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        <span
                          className={`material-symbols-outlined select-none transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#006A65]' : ''}`}
                          style={{ fontSize: '22px' }}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Collapsible Drawer */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="w-full pt-4 border-t border-[#BFC9C4]/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Total Loan Amount */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Total Borrowed
                          </span>
                          <span className="block text-xs sm:text-sm font-bold text-[#00162A] break-all" style={{ letterSpacing: '0.5px' }}>
                            {formatCurrency(loan.totalAmount)}
                          </span>
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Interest Rate
                          </span>
                          <span className="block text-xs sm:text-sm font-bold text-[#006A65]" style={{ letterSpacing: '0.5px' }}>
                            {loan.interestRate}% APR
                          </span>
                        </div>

                        {/* Tenure */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Tenure
                          </span>
                          <span className="block text-xs sm:text-sm font-bold text-[#74777F]">
                            {loan.tenureYears} yrs {loan.tenureMonths > 0 ? `${loan.tenureMonths} mos` : ''}
                          </span>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-bold text-[#73777E] uppercase" style={{ letterSpacing: '1px' }}>
                            Start Date
                          </span>
                          <span className="block text-xs sm:text-sm font-bold text-[#74777F]">
                            {formatDate(loan.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Loan Modal */}
      <AddEditLoanModal
        isOpen={isAddModalOpen || isEditModalOpen}
        isEditing={isEditModalOpen}
        initialData={
          isEditModalOpen && selectedLoan
            ? {
              id: selectedLoan.id,
              type: selectedLoan.type,
              provider: selectedLoan.provider,
              nickname: selectedLoan.nickname,
              accountNumber: selectedLoan.accountNumber,
              totalAmount: selectedLoan.totalAmount,
              outstandingBalance: selectedLoan.outstandingBalance,
              interestRate: selectedLoan.interestRate,
              tenureYears: selectedLoan.tenureYears,
              tenureMonths: selectedLoan.tenureMonths,
              startDate: epochToDateString(selectedLoan.startDate)
            }
            : null
        }
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedLoan(null);
        }}
        onSave={handleSaveLoan}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLoan(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Loan?"
        subtitle={
          selectedLoan
            ? `Are you sure you want to delete "${selectedLoan.nickname}"? This action cannot be undone.`
            : 'Are you sure you want to delete this loan?'
        }
        confirmText="Delete Loan"
      />
    </div>
  );
};
