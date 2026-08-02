import React, { useState, useEffect } from 'react';
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full screen backdrop overlay with #000000 and 40% opacity */}
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-[#C3C6CE]/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Form Title Header (Fixed) */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-4 pb-3 border-b border-[#C3C6CE]/20 flex-shrink-0 bg-white">
          <h2 className="text-xl font-bold text-[#00162A] tracking-tight">
            {isEditing ? 'Edit Loan Details' : 'Add New Loan'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
          >
            <span className="material-symbols-outlined select-none">close</span>
          </button>
        </div>

        {/* Form Container with Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
            {/* Row 1: Loan Type & Loan Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  LOAN TYPE
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] appearance-none"
                  >
                    <option value="Mortgage">Mortgage</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other Loan</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#74777F] pointer-events-none select-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  LOAN PROVIDER
                </label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  required
                />
              </div>
            </div>

            {/* Row 2: Loan Nickname */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                LOAN NICKNAME
              </label>
              <input
                type="text"
                placeholder="e.g. My Primary Residence"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-4 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                required
              />
            </div>

            {/* Row 3: Total Loan Amount */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                TOTAL LOAN AMOUNT
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#00162A]">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formData.totalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  required
                />
              </div>
            </div>

            {/* Row 4: Annual Interest Rate (%) & Loan Tenure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  ANNUAL INTEREST RATE (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5.25"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-4 pr-8 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#74777F]">
                    %
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  LOAN TENURE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="30"
                      value={formData.tenureYears ?? ''}
                      onChange={(e) => setFormData({ ...formData, tenureYears: parseInt(e.target.value, 10) || 0 })}
                      className="w-full pl-4 pr-12 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#74777F] uppercase">
                      YRS
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.tenureMonths ?? ''}
                      onChange={(e) => setFormData({ ...formData, tenureMonths: parseInt(e.target.value, 10) || 0 })}
                      className="w-full pl-4 pr-12 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/60 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#74777F] uppercase">
                      MOS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Start Date */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                START DATE
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                required
              />
            </div>
          </div>

          {/* Buttons Footer (Fixed) */}
          <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 flex-shrink-0 bg-white rounded-b-3xl">
            <CancelButton onClick={onClose} />
            <SaveButton type="submit" isSaving={isSaving}>
              {isEditing ? 'Save Changes' : 'Verify & Add Loan'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
