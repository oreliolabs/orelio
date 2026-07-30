import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Deposit } from './Deposits';

export interface DepositFormData {
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  interestRate: number;
  maturityDate: string;
  nominee?: string;
}

interface AddEditDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDeposit: Deposit | null;
  onSave: (formData: DepositFormData) => void;
}

export const AddEditDepositModal: React.FC<AddEditDepositModalProps> = ({
  isOpen,
  onClose,
  editingDeposit,
  onSave,
}) => {
  const [formType, setFormType] = useState<'FD' | 'RD'>('FD');
  const [formNickname, setFormNickname] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formInterestRate, setFormInterestRate] = useState('');
  const [formMaturityDate, setFormMaturityDate] = useState('');
  const [formTenureYears, setFormTenureYears] = useState('1');
  const [formTenureMonths, setFormTenureMonths] = useState('0');
  const [formHasNominee, setFormHasNominee] = useState(false);
  const [formNomineeName, setFormNomineeName] = useState('');

  useEffect(() => {
    if (editingDeposit) {
      setFormType(editingDeposit.type);
      setFormNickname(editingDeposit.nickname);
      setFormBankName(editingDeposit.bankName || '');
      setFormAccountNumber(editingDeposit.accountNumber);
      setFormAmount(editingDeposit.principalOrMonthly.toString());
      setFormInterestRate(editingDeposit.interestRate.toString());
      setFormMaturityDate(editingDeposit.maturityDate);
      setFormTenureYears('1');
      setFormTenureMonths('0');
      setFormHasNominee(!!editingDeposit.nominee);
      setFormNomineeName(editingDeposit.nominee || '');
    } else {
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
    }
  }, [editingDeposit, isOpen]);

  const formatMaturityDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount) || 100000;
    const rateNum = parseFloat(formInterestRate) || 7.5;

    onSave({
      type: formType,
      nickname: formNickname || (formType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'),
      bankName: formBankName || 'HDFC Bank',
      accountNumber: formAccountNumber || '**** 8829',
      amount: amountNum,
      interestRate: rateNum,
      maturityDate: formMaturityDate || (editingDeposit ? '24 Oct, 2025' : '24 Oct, 2026'),
      nominee: formHasNominee ? formNomineeName : undefined,
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#C3C6CE]/30 max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Modal Header with Divider */}
        <div className="p-6 md:px-8 md:pt-6 md:pb-4 border-b border-[#C3C6CE]/30 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#00162A] tracking-tight">
            {editingDeposit ? 'Edit Deposit' : 'Add New Deposit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 min-h-0 no-scrollbar">
            {/* Deposit Type Switcher */}
            <div className="bg-[#F2F4F5] p-1.5 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormType('FD')}
                className={`py-3 rounded-xl transition-all ${formType === 'FD'
                  ? 'bg-white text-[#00162A] shadow-sm'
                  : 'text-[#74777F] hover:text-[#00162A]'
                  }`}
              >
                Fixed Deposit
              </button>
              <button
                type="button"
                onClick={() => setFormType('RD')}
                className={`py-3 rounded-xl transition-all ${formType === 'RD'
                  ? 'bg-white text-[#00162A] shadow-sm'
                  : 'text-[#74777F] hover:text-[#00162A]'
                  }`}
              >
                Recurring Deposit
              </button>
            </div>

            {/* Deposit Nickname */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                DEPOSIT NICKNAME <span className="text-red-500 ml-0.5">*</span>
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
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#74777F] select-none"
                    style={{ fontSize: '18px' }}
                  >
                    account_balance
                  </span>
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
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#74777F] select-none"
                    style={{ fontSize: '18px' }}
                  >
                    tag
                  </span>
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
                  {formType === 'FD' ? 'PRINCIPAL AMOUNT' : 'MONTHLY DEPOSIT'} <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-[#74777F]">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  INTEREST RATE (%) <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="7.85"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(e.target.value)}
                    className="w-full pl-4 pr-8 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3.5 top-3 text-sm font-bold text-[#74777F]">%</span>
                </div>
              </div>
            </div>

            {/* Maturity Date & Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  MATURITY DATE <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  value={formMaturityDate}
                  onChange={(e) => setFormMaturityDate(formatMaturityDateInput(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  TENURE <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Years"
                    value={formTenureYears}
                    onChange={(e) => setFormTenureYears(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-2 focus:border-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <input
                    type="number"
                    placeholder="Months"
                    value={formTenureMonths}
                    onChange={(e) => setFormTenureMonths(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-2 focus:border-[#006A65] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Nominee Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFormHasNominee(!formHasNominee)}
                className="text-xs font-bold text-[#006A65] flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '16px' }}>
                  {formHasNominee ? 'remove' : 'add'}
                </span>
                <span>{formHasNominee ? 'REMOVE NOMINEE' : 'ADD NOMINEE'}</span>
              </button>

              {formHasNominee && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Nominee Full Name"
                    value={formNomineeName}
                    onChange={(e) => setFormNomineeName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-2 focus:border-[#006A65]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex items-center justify-end gap-3 p-4 md:px-8 md:py-4 border-t border-[#C3C6CE]/20 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-sm font-bold text-[#00162A] hover:bg-[#F2F4F5] active:scale-98 transition-all cursor-pointer"
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
  );
};
