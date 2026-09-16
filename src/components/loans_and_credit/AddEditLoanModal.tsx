import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

export interface LoanFormData {
  id?: string;
  type: string;
  provider: string;
  nickname: string;
  accountNumber?: string;
  totalAmount: number;
  outstandingBalance?: number;
  interestRate: number;
  tenureYears: number;
  tenureMonths: number;
  startDate: string;
}

interface AddEditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LoanFormData) => void;
  initialData?: LoanFormData | null;
  isEditing?: boolean;
}

export const AddEditLoanModal: React.FC<AddEditLoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<LoanFormData>({
    type: 'Mortgage',
    provider: '',
    nickname: '',
    totalAmount: 0,
    interestRate: 5.25,
    tenureYears: 30,
    tenureMonths: 0,
    startDate: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDropdownOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialData) {
        setFormData({
          id: initialData.id,
          type: initialData.type || 'Mortgage',
          provider: initialData.provider || '',
          nickname: initialData.nickname || '',
          accountNumber: initialData.accountNumber || '',
          totalAmount: initialData.totalAmount || 0,
          outstandingBalance: initialData.outstandingBalance,
          interestRate: initialData.interestRate ?? 5.25,
          tenureYears: initialData.tenureYears ?? 30,
          tenureMonths: initialData.tenureMonths ?? 0,
          startDate: initialData.startDate || ''
        });
      } else {
        setFormData({
          type: 'Mortgage',
          provider: '',
          nickname: '',
          totalAmount: 0,
          interestRate: 5.25,
          tenureYears: 30,
          tenureMonths: 0,
          startDate: new Date().toISOString().split('T')[0]
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      onClose();
    }, 200);
  };

  // Estimated monthly EMI calculation
  const calculatedMonthlyEmi = (() => {
    const principal = formData.totalAmount || 0;
    const annualRate = formData.interestRate || 0;
    const totalMonths = (formData.tenureYears || 0) * 12 + (formData.tenureMonths || 0);
    if (principal <= 0) return 0;
    if (totalMonths <= 0) {
      return Math.round((principal * (annualRate / 100)) / 12);
    }
    return Math.round((principal * (annualRate / 100)) / 12 + (principal / totalMonths));
  })();

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      {/* Full screen backdrop overlay */}
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-[360px] sm:max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-[#C3C6CE]/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Form Title Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 pt-4 pb-3 border-b border-[#C3C6CE]/20 shrink-0 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-[#00162A] tracking-tight">
            {isEditing ? 'Edit Loan Details' : 'Add New Loan'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined select-none">close</span>
          </button>
        </div>

        {/* Form Container with Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 no-scrollbar">
            {/* Row 1: Loan Type & Loan Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  LOAN TYPE <span className="text-red-500 ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] flex items-center justify-between focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] cursor-pointer"
                >
                  <span>{formData.type || 'Select Loan Type'}</span>
                  <span className={`material-symbols-outlined text-[#74777F] transition-transform duration-200 select-none ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-[#C3C6CE]/30 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="max-h-48 overflow-y-auto py-1 no-scrollbar">
                      {['Mortgage', 'Auto Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other'].map((option) => {
                        const isSelected = formData.type === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, type: option });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full h-10 px-4 text-xs font-semibold transition-colors flex items-center justify-between border-b border-[#C3C6CE]/10 last:border-0 cursor-pointer ${isSelected
                                ? 'bg-[#F2F4F5] text-[#00162A]'
                                : 'text-[#43474D] hover:bg-[#F8F9FA]'
                              }`}
                          >
                            <span className="leading-none">{option}</span>
                            {isSelected ? (
                              <span className="material-symbols-outlined text-[#006A65] text-base leading-none select-none">
                                check
                              </span>
                            ) : (
                              <span className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  LOAN PROVIDER <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  required
                />
              </div>
            </div>

            {/* Row 2: Loan Nickname */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                LOAN NICKNAME <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. My Primary Residence"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                required
              />
            </div>

            {/* Row 3: Total Loan Amount & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  TOTAL LOAN AMOUNT <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#00162A]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={formData.totalAmount || ''}
                    onChange={(e) => setFormData({ ...formData, totalAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full pl-8 pr-3.5 sm:pr-4 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  START DATE <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  required
                />
              </div>
            </div>

            {/* Row 4: Annual Interest Rate (%) & Loan Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  ANNUAL INTEREST RATE (%) <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.25"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full pl-3.5 sm:pl-4 pr-8 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <span className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#74777F]">
                    %
                  </span>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5 sm:mb-2">
                  LOAN TENURE <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="30"
                      value={formData.tenureYears ?? ''}
                      onChange={(e) => setFormData({ ...formData, tenureYears: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#74777F] uppercase">
                      YRS
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.tenureMonths ?? ''}
                      onChange={(e) => setFormData({ ...formData, tenureMonths: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#74777F] uppercase">
                      MOS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated EMI Preview */}
            {formData.totalAmount > 0 && (
              <div className="bg-[#006A65]/5 border border-[#006A65]/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#006A65]/10 flex items-center justify-center text-[#006A65] shrink-0">
                    <span className="material-symbols-outlined select-none text-[18px]">
                      calculate
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold tracking-widest text-[#006A65] uppercase">
                      ESTIMATED MONTHLY INSTALLMENT (EMI)
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#74777F]">
                      Based on {formData.interestRate}% APR over {formData.tenureYears}y {formData.tenureMonths ? `${formData.tenureMonths}m` : ''}
                    </span>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#006A65] whitespace-nowrap self-end sm:self-auto">
                  ₹ {calculatedMonthlyEmi.toLocaleString('en-IN')} / mo
                </span>
              </div>
            )}
          </div>

          {/* Buttons Footer */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 border-t border-[#C3C6CE]/20 bg-white rounded-b-2xl sm:rounded-b-3xl shrink-0">
            <CancelButton onClick={onClose} className="w-full sm:w-auto" />
            <SaveButton type="submit" isSaving={isSaving} className="w-full sm:w-auto">
              {isEditing ? 'Save Changes' : 'Add Loan'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
