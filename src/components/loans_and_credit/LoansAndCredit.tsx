import React, { useState } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { AddEditLoanModal } from './AddEditLoanModal';
import type { LoanFormData } from './AddEditLoanModal';

export interface LoanItem {
  id: string;
  type: string;
  nickname: string;
  provider: string;
  accountNumber: string;
  totalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  startDate: string;
  nextEmiDate: string;
  monthlyEmi: number;
  repaymentProgressPercent: number;
  status: 'active' | 'closed';
}

interface LoansAndCreditProps {
  isPrivate?: boolean;
}

export const LoansAndCredit: React.FC<LoansAndCreditProps> = ({ isPrivate = false }) => {
  const [loans, setLoans] = useState<LoanItem[]>([
    {
      id: '1',
      type: 'Mortgage',
      nickname: 'Home Loan',
      provider: 'HSBC',
      accountNumber: '**** 9210',
      totalAmount: 1450000.00,
      outstandingBalance: 842000.00,
      interestRate: 4.82,
      tenureYears: 30,
      tenureMonths: 0,
      startDate: '2018-10-12',
      nextEmiDate: 'Oct 12, 2023',
      monthlyEmi: 12450.00,
      repaymentProgressPercent: 42,
      status: 'active'
    },
    {
      id: '2',
      type: 'Auto Loan',
      nickname: 'Car Loan - SUV',
      provider: 'HDFC Bank',
      accountNumber: '**** 4431',
      totalAmount: 1800000.00,
      outstandingBalance: 520000.00,
      interestRate: 7.50,
      tenureYears: 5,
      tenureMonths: 0,
      startDate: '2021-03-15',
      nextEmiDate: 'Nov 05, 2023',
      monthlyEmi: 32100.00,
      repaymentProgressPercent: 71,
      status: 'active'
    },
    {
      id: '3',
      type: 'Personal Loan',
      nickname: 'Renovation Credit',
      provider: 'ICICI Bank',
      accountNumber: '**** 1109',
      totalAmount: 500000.00,
      outstandingBalance: 121390.42,
      interestRate: 10.25,
      tenureYears: 3,
      tenureMonths: 0,
      startDate: '2022-06-01',
      nextEmiDate: 'Oct 28, 2023',
      monthlyEmi: 16100.00,
      repaymentProgressPercent: 76,
      status: 'active'
    }
  ]);

  // Modal and menu state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Success alert state for "Mark Installment as Paid"
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    if (isPrivate) return '••••••';
    return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Metrics computation
  const totalOutstanding = loans.reduce((sum, item) => sum + item.outstandingBalance, 0);
  const totalDueThisMonth = loans.reduce((sum, item) => sum + item.monthlyEmi, 0);
  const avgInterestRate = loans.length > 0
    ? (loans.reduce((sum, item) => sum + item.interestRate, 0) / loans.length).toFixed(2)
    : '0.00';

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
            startDate: formData.startDate || item.startDate,
            repaymentProgressPercent: progress
          };
        }
        return item;
      }));
      showNotification(`Successfully updated details for "${formData.nickname}"`);
    } else {
      // Add new loan
      const newLoan: LoanItem = {
        id: Date.now().toString(),
        type: formData.type,
        nickname: formData.nickname,
        provider: formData.provider,
        accountNumber: `**** ${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: formData.totalAmount,
        outstandingBalance: formData.totalAmount,
        interestRate: formData.interestRate,
        tenureYears: formData.tenureYears,
        tenureMonths: formData.tenureMonths,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        nextEmiDate: 'Nov 15, 2023',
        monthlyEmi: Math.round((formData.totalAmount * (formData.interestRate / 100)) / 12 + (formData.totalAmount / (formData.tenureYears * 12 || 12))),
        repaymentProgressPercent: 0,
        status: 'active'
      };
      setLoans([...loans, newLoan]);
      showNotification(`Added new loan "${formData.nickname}"`);
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
    showNotification(`Marked monthly installment paid for "${loan.nickname}"!`);
  };

  // Delete loan action
  const handleConfirmDelete = () => {
    if (selectedLoan) {
      setLoans(loans.filter((item) => item.id !== selectedLoan.id));
      showNotification(`Deleted loan "${selectedLoan.nickname}"`);
    }
    setIsDeleteModalOpen(false);
    setSelectedLoan(null);
  };

  return (
    <div className="space-y-8 fade-in p-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#006A65] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined select-none text-white">check_circle</span>
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Header Section */}
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
                {avgInterestRate}%
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
                  strokeDasharray="71, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">71%</span>
                <span className="text-[9px] font-bold text-[#AFEFDD] uppercase tracking-wider">HEALTHY</span>
              </div>
            </div>
          </div>

          <div className="text-left pt-2">
            <p className="text-xs text-[#AFEFDD]/90 font-medium">
              Repayment timeline is on track
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
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Column 1: Icon Badge & Loan Nickname */}
                <div className="flex items-start gap-4 min-w-[220px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined select-none text-2xl">
                      {getLoanIcon(loan.type)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase group-hover:text-[#006A65] transition-colors">
                      LOAN NICKNAME
                    </span>
                    <h3 className="text-base font-bold text-[#00162A] tracking-tight">
                      {loan.nickname}
                    </h3>
                    <p className="text-xs font-medium text-[#74777F] mt-0.5">
                      {loan.provider} • AC {loan.accountNumber}
                    </p>
                  </div>
                </div>

                {/* Column 2: Outstanding Balance */}
                <div className="min-w-[150px]">
                  <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase group-hover:text-[#006A65] transition-colors">
                    OUTSTANDING BALANCE
                  </span>
                  <span className="block text-base font-bold text-[#00162A] mt-1">
                    {formatCurrency(loan.outstandingBalance)}
                  </span>
                </div>

                {/* Column 3: Next EMI Date */}
                <div className="min-w-[140px]">
                  <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase group-hover:text-[#006A65] transition-colors">
                    NEXT EMI DATE
                  </span>
                  <span className="block text-base font-bold text-[#00162A] mt-1">
                    {loan.nextEmiDate}
                  </span>
                </div>

                {/* Column 4: Repayment Progress */}
                <div className="flex-1 max-w-xs">
                  <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase group-hover:text-[#006A65] transition-colors mb-1.5">
                    REPAYMENT PROGRESS
                  </span>
                  <div className="w-full h-2 rounded-full bg-[#F2F4F5] overflow-hidden">
                    <div
                      className="h-full bg-[#006A65] rounded-full transition-all duration-500"
                      style={{ width: `${loan.repaymentProgressPercent}%` }}
                    />
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-medium text-[#74777F]">
                      {loan.repaymentProgressPercent}% Paid
                    </span>
                  </div>
                </div>

                {/* Column 5: More Menu Button & Popover */}
                <div className="relative flex justify-end self-start">
                  <button
                    onClick={() => setActiveMenuId(isMenuOpen ? null : loan.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors -mt-1 -mr-1"
                  >
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>

                  {/* Context Dropdown Popover */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 w-42 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 z-50 fade-in overflow-hidden">
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsEditModalOpen(true);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[14px] font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>Edit Loan Details</span>
                      </button>

                      {loan.repaymentProgressPercent < 100 && loan.outstandingBalance > 0 && (
                        <button
                          onClick={() => handleMarkInstallmentPaid(loan)}
                          className="w-full text-left px-3.5 py-2 text-[14px] font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>Mark EMI as Paid</span>
                        </button>
                      )}

                      <div className="border-t border-[#C3C6CE]/20 my-0.5" />

                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsDeleteModalOpen(true);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[14px] font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>Delete Loan</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
              startDate: selectedLoan.startDate
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
