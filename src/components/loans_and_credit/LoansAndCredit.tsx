import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddEditLoanModal } from './AddEditLoanModal';
import type { LoanFormData } from './AddEditLoanModal';
import { getLoans, saveLoans } from '../../data/orelioStore';
import type { LoanItem } from '../../data/types';
export type { LoanItem } from '../../data/types';

interface LoansAndCreditProps {
  isPrivate?: boolean;
}

export const LoansAndCredit: React.FC<LoansAndCreditProps> = ({ isPrivate = false }) => {
  const [loans, setLoans] = useState<LoanItem[]>(() => getLoans());

  useEffect(() => {
    saveLoans(loans);
  }, [loans]);

  // Modal and menu state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close More menu when clicking anywhere outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.loan-card-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
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

  // Metrics computation
  const totalOutstanding = loans.reduce((sum, item) => sum + item.outstandingBalance, 0);
  const totalDueThisMonth = loans.reduce((sum, item) => sum + item.monthlyEmi, 0);
  const avgInterestRate = loans.length > 0
    ? (loans.reduce((sum, item) => sum + item.interestRate, 0) / loans.length).toFixed(2)
    : '0.00';

  // Debt utilization = how much of the original loan total is still outstanding (lower = more repaid)
  const totalLoanAmount = loans.reduce((sum, item) => sum + item.totalAmount, 0);
  const debtUtilization = totalLoanAmount > 0
    ? Math.round((totalOutstanding / totalLoanAmount) * 100)
    : 0;

  const debtUtilizationStatus = (() => {
    if (debtUtilization <= 20) return { label: 'EXCELLENT', message: 'Almost fully repaid!' };
    if (debtUtilization <= 40) return { label: 'GREAT',     message: 'Strong repayment progress' };
    if (debtUtilization <= 60) return { label: 'HEALTHY',   message: 'Repayment timeline is on track' };
    if (debtUtilization <= 80) return { label: 'MODERATE',  message: 'Steady progress being made' };
    return                            { label: 'HIGH',      message: 'Early repayment stage' };
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
            repaymentProgressPercent: progress
          };
        }
        return item;
      }));
    } else {
      // Add new loan
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
        status: 'active'
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
    <div className="space-y-8 fade-in px-2 pb-2">
      {/* Header Section */}
      {loans.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-extrabold text-[#00162A] tracking-tight">
              Loans & Credit
            </h1>
            <p className="text-[14px] text-[#74777F] mt-1 font-medium">
              Manage and monitor your lending
            </p>
          </div>
          <div>
            <PrimaryButton icon="add" onClick={() => setIsAddModalOpen(true)}>
              Add New Loan
            </PrimaryButton>
          </div>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-20 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[36px]">
              credit_card
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#00162A] tracking-tight">No Loans Yet</h3>
          <p className="text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Track and monitor your personal, home, auto loans, and credit lines all in one secure place.
          </p>
          <div className="mt-6">
            <PrimaryButton
              onClick={() => {
                setSelectedLoan(null);
                setIsAddModalOpen(true);
              }}
              icon="add"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Outstanding Debt (Left Card) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="block text-[12px] font-extrabold tracking-widest text-[#006A65] uppercase">
                  TOTAL OUTSTANDING DEBT
                </span>
                <span className="block text-3xl md:text-4xl font-extrabold text-[#00162A] mt-2 tracking-tight">
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-[#C3C6CE]/20">
                <div>
                  <span className="block text-[12px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    DUE THIS MONTH
                  </span>
                  <span className="block text-lg font-extrabold text-[#00162A] mt-1">
                    {formatCurrency(totalDueThisMonth)}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    AVERAGE INTEREST
                  </span>
                  <span className="block text-lg font-extrabold text-[#00162A] mt-1">
                    {isPrivate ? '••••' : `${avgInterestRate}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Debt Utilization (Right Card - Forest Green) */}
            <div className="bg-[#004D40] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest text-[#AFEFDD] uppercase">
                  DEBT UTILIZATION
                </span>
                <span className="material-symbols-outlined select-none text-[#AFEFDD]/70">
                  pie_chart
                </span>
              </div>

              <div className="my-4 flex items-center justify-start relative">
                <div className="relative w-28 h-28 flex items-center justify-center">
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
                      strokeDasharray={`${debtUtilization}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">{debtUtilization}%</span>
                    <span className="text-[9px] font-bold text-[#AFEFDD] uppercase tracking-wider">{debtUtilizationStatus.label}</span>
                  </div>
                </div>
              </div>

              <div className="text-left pt-2">
                <p className="text-xs text-[#AFEFDD]/90 font-medium">
                  {debtUtilizationStatus.message}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header: Active Liabilities */}
          <div className="flex items-center gap-4 w-full pt-2">
            <h2 className="text-xl font-semibold text-[#00162A] tracking-tight whitespace-nowrap">
              Active Liabilities
            </h2>
            <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
              {loans.length} {loans.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>

          {/* Active Liabilities List */}
          <div className="space-y-4">
            {loans.map((loan) => {
              const isMenuOpen = activeMenuId === loan.id;
              return (
                <div
                  key={loan.id}
                  className={`
                    bg-white rounded-3xl p-6 border border-[#C3C6CE]/30 
                    hover:-translate-y-1
                    transition-all duration-300 group relative
                    ${isMenuOpen ? 'z-50' : 'z-0'}
                  `}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_160px_130px_1fr_36px] xl:grid-cols-[290px_170px_140px_1fr_36px] items-start gap-4 xl:gap-6">
                    {/* Column 1: Icon Badge & Loan Nickname */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined select-none text-[26px]">
                          {getLoanIcon(loan.type)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#00162A] tracking-tight truncate">
                          {loan.nickname}
                        </h3>
                        <p className="text-xs font-semibold text-[#74777F] uppercase tracking-wide mt-0.5 truncate">
                          {loan.provider} •••• {loan.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Outstanding Balance */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
                        OUTSTANDING
                      </span>
                      <span className="text-base font-bold text-[#00162A] mt-0.5">
                        {formatCurrency(loan.outstandingBalance)}
                      </span>
                    </div>

                    {/* Column 3: Monthly EMI */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
                        MONTHLY EMI
                      </span>
                      <span className="text-base font-bold text-[#00162A] mt-0.5">
                        {formatCurrency(loan.monthlyEmi)}
                      </span>
                    </div>

                    {/* Column 4: Repayment Progress Bar */}
                    <div className="flex flex-col justify-center w-full">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[11px] font-bold tracking-widest text-[#74777F] uppercase">
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

                    {/* Column 5: Actions Menu Trigger */}
                    <div className="flex items-center justify-end relative loan-card-menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === loan.id ? null : loan.id);
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors"
                        aria-label="More options"
                      >
                        <span className="material-symbols-outlined select-none text-[22px]">
                          more_vert
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-2xl shadow-[0_10px_38px_0_rgba(0,0,0,0.14)] border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkInstallmentPaid(loan);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#006A65] hover:bg-[#F0FDF4] transition-colors flex items-center gap-2"
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
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2"
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
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined select-none text-[18px]">
                              delete
                            </span>
                            Delete Loan
                          </button>
                        </div>
                      )}
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
