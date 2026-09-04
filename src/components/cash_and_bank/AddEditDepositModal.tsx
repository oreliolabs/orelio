import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Deposit } from './Deposits';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

export interface DepositFormData {
  type: 'FD' | 'RD';
  nickname: string;
  bankName: string;
  depositNumber: string;
  amount: number;
  interestRate: number;
  startDate: number;
  maturityDate: number;
  nominee?: string;
}

interface AddEditDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDeposit: Deposit | null;
  isFirstDeposit?: boolean;
  onSave: (formData: DepositFormData) => void;
}

export const normalizeToDDMMYYYY = (val?: string | number): string => {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number') {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      const d = String(dt.getUTCDate()).padStart(2, '0');
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const y = dt.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }
    return '';
  }
  const trimmed = val.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    return `${d}/${m}/${parts[2]}`;
  }
  const ts = Date.parse(trimmed.replace(',', ''));
  if (!isNaN(ts)) {
    const dt = new Date(ts);
    const d = String(dt.getUTCDate()).padStart(2, '0');
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const y = dt.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  return trimmed;
};

export const ddmmYYYYToEpoch = (str: string): number => {
  if (!str) return 0;
  const trimmed = str.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number);
    return Date.UTC(y, m - 1, d);
  }
  return new Date(str).getTime() || 0;
};

export const isValidDDMMYYYY = (str: string): { valid: boolean; error?: string } => {
  if (!str || !str.trim()) {
    return { valid: false, error: 'Date is required' };
  }
  const trimmed = str.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return { valid: false, error: 'Enter date in dd/mm/yyyy format' };
  }
  const [dStr, mStr, yStr] = trimmed.split('/');
  const d = parseInt(dStr, 10);
  const m = parseInt(mStr, 10);
  const y = parseInt(yStr, 10);

  if (m < 1 || m > 12) {
    return { valid: false, error: 'Invalid month (01 - 12)' };
  }
  if (y < 1900 || y > 2100) {
    return { valid: false, error: 'Invalid year' };
  }

  const daysInMonth = new Date(y, m, 0).getDate();
  if (d < 1 || d > daysInMonth) {
    return { valid: false, error: `Invalid day for month (01 - ${daysInMonth})` };
  }

  return { valid: true };
};

export const parseDDMMYYYY = (str: string): Date | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str.trim())) return null;
  const [d, m, y] = str.trim().split('/').map(Number);
  return new Date(y, m - 1, d);
};

export const isoToDDMMYYYY = (iso: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return '';
  const [y, m, d] = iso.trim().split('-');
  return `${d}/${m}/${y}`;
};

export const ddmmYYYYToISO = (ddmm: string): string => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(ddmm.trim())) return '';
  const [d, m, y] = ddmm.trim().split('/');
  return `${y}-${m}-${d}`;
};

export const AddEditDepositModal: React.FC<AddEditDepositModalProps> = ({
  isOpen,
  onClose,
  editingDeposit,
  isFirstDeposit = false,
  onSave,
}) => {
  const [formType, setFormType] = useState<'FD' | 'RD'>('FD');
  const [formNickname, setFormNickname] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formDepositNumber, setFormDepositNumber] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formInterestRate, setFormInterestRate] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formMaturityDate, setFormMaturityDate] = useState('');
  const [formHasNominee, setFormHasNominee] = useState(false);
  const [formNomineeName, setFormNomineeName] = useState('');

  // Validation Error States
  const [startDateError, setStartDateError] = useState('');
  const [maturityDateError, setMaturityDateError] = useState('');

  // Native Date Picker Refs
  const startDatePickerRef = useRef<HTMLInputElement>(null);
  const maturityDatePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingDeposit) {
      setFormType(editingDeposit.type);
      setFormNickname(editingDeposit.nickname);
      setFormBankName(editingDeposit.bankName || '');
      setFormDepositNumber(editingDeposit.depositNumber || '');
      setFormAmount(editingDeposit.principalOrMonthly.toString());
      setFormInterestRate(editingDeposit.interestRate.toString());
      setFormStartDate(normalizeToDDMMYYYY(editingDeposit.startDate));
      setFormMaturityDate(normalizeToDDMMYYYY(editingDeposit.maturityDate));
      setFormHasNominee(!!editingDeposit.nominee);
      setFormNomineeName(editingDeposit.nominee || '');
      setStartDateError('');
      setMaturityDateError('');
    } else {
      setFormType('FD');
      setFormNickname('');
      setFormBankName('');
      setFormDepositNumber('');
      setFormAmount('');
      setFormInterestRate('');
      setFormStartDate('');
      setFormMaturityDate('');
      setFormHasNominee(false);
      setFormNomineeName('');
      setStartDateError('');
      setMaturityDateError('');
    }
  }, [editingDeposit, isOpen]);

  const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const handleStartDateChange = (val: string) => {
    const formatted = formatDateInput(val);
    setFormStartDate(formatted);
    if (startDateError) setStartDateError('');
  };

  const handleMaturityDateChange = (val: string) => {
    const formatted = formatDateInput(val);
    setFormMaturityDate(formatted);
    if (maturityDateError) setMaturityDateError('');
  };

  const calculatedTenure = useMemo(() => {
    if (!formStartDate || !formMaturityDate) return '';
    const d1 = parseDDMMYYYY(formStartDate);
    const d2 = parseDDMMYYYY(formMaturityDate);
    if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 <= d1) return '';

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (d2.getDate() < d1.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    if (years === 0 && months === 0) {
      const days = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} Days`;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    return parts.join(', ');
  }, [formStartDate, formMaturityDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dStart = parseDDMMYYYY(formStartDate);
    if (!dStart) {
      setStartDateError('Invalid date format (DD/MM/YYYY)');
      return;
    }

    const dMat = parseDDMMYYYY(formMaturityDate);
    if (!dMat) {
      setMaturityDateError('Invalid date format (DD/MM/YYYY)');
      return;
    }

    if (dMat <= dStart) {
      setMaturityDateError('Maturity date must be after start date');
      return;
    }

    const amountNum = parseFloat(formAmount) || 100000;
    const rateNum = parseFloat(formInterestRate) || 7.5;

    onSave({
      type: formType,
      nickname: formNickname || (formType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'),
      bankName: formBankName || 'HDFC Bank',
      depositNumber: formDepositNumber || '50100482918829',
      amount: amountNum,
      interestRate: rateNum,
      startDate: ddmmYYYYToEpoch(formStartDate),
      maturityDate: ddmmYYYYToEpoch(formMaturityDate),
      nominee: formHasNominee ? formNomineeName : undefined,
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#C3C6CE]/30 max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Modal Header with Divider */}
        <div className="p-6 md:px-8 md:pt-6 md:pb-4 border-b border-[#C3C6CE]/30 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#00162A] tracking-tight">
            {editingDeposit ? 'Edit Deposit' : isFirstDeposit ? 'Add Your First Deposit' : 'Add New Deposit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-5 flex-1 max-h-[calc(90vh-140px)]">

            {/* Deposit Type Switcher (FD / RD) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                DEPOSIT TYPE
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#F2F4F5]">
                <button
                  type="button"
                  onClick={() => setFormType('FD')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${formType === 'FD'
                    ? 'bg-white text-[#006A65] shadow-xs'
                    : 'text-[#74777F] hover:text-[#00162A]'
                    }`}
                >
                  Fixed Deposit (FD)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('RD')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${formType === 'RD'
                    ? 'bg-white text-[#006A65] shadow-xs'
                    : 'text-[#74777F] hover:text-[#00162A]'
                    }`}
                >
                  Recurring Deposit (RD)
                </button>
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                DEPOSIT NICKNAME <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Retirement Alpha Fund"
                value={formNickname}
                onChange={(e) => setFormNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
              />
            </div>

            {/* Bank Name & Deposit Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  BANK NAME <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                  DEPOSIT NUMBER
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3.5 text-[#74777F] select-none" style={{ fontSize: '18px' }}>
                    tag
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 50100482918829"
                    value={formDepositNumber}
                    onChange={(e) => setFormDepositNumber(e.target.value)}
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
                    min="0"
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
                    min="0"
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

            {/* Start Date & Maturity Date */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* START DATE */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    START DATE <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      value={formStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={`w-full pl-4 pr-10 py-3 rounded-2xl border bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:ring-1 ${startDateError
                        ? 'border-[#BA1A1A] focus:border-[#BA1A1A] focus:ring-[#BA1A1A]'
                        : 'border-[#C3C6CE]/50 focus:border-[#006A65] focus:ring-[#006A65]'
                        }`}
                    />
                    {/* Hidden Native Date Picker */}
                    <input
                      ref={startDatePickerRef}
                      type="date"
                      value={ddmmYYYYToISO(formStartDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStartDateChange(isoToDDMMYYYY(e.target.value));
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                    />
                    {/* Calendar Icon Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (startDatePickerRef.current) {
                          try {
                            startDatePickerRef.current.showPicker();
                          } catch (err) {
                            startDatePickerRef.current.focus();
                            startDatePickerRef.current.click();
                          }
                        }
                      }}
                      className="absolute right-3 top-3 text-[#74777F] hover:text-[#006A65] transition-colors cursor-pointer"
                      aria-label="Pick start date"
                      title="Open calendar date picker"
                    >
                      <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                        calendar_today
                      </span>
                    </button>
                  </div>
                  {startDateError && (
                    <p className="text-xs font-semibold text-[#BA1A1A] pt-0.5 pl-1">
                      {startDateError}
                    </p>
                  )}
                </div>

                {/* MATURITY DATE */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold tracking-widest text-[#74777F] uppercase">
                    MATURITY DATE <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      value={formMaturityDate}
                      onChange={(e) => handleMaturityDateChange(e.target.value)}
                      className={`w-full pl-4 pr-10 py-3 rounded-2xl border bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:ring-1 ${maturityDateError
                        ? 'border-[#BA1A1A] focus:border-[#BA1A1A] focus:ring-[#BA1A1A]'
                        : 'border-[#C3C6CE]/50 focus:border-[#006A65] focus:ring-[#006A65]'
                        }`}
                    />
                    {/* Hidden Native Date Picker */}
                    <input
                      ref={maturityDatePickerRef}
                      type="date"
                      value={ddmmYYYYToISO(formMaturityDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleMaturityDateChange(isoToDDMMYYYY(e.target.value));
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                    />
                    {/* Calendar Icon Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (maturityDatePickerRef.current) {
                          try {
                            maturityDatePickerRef.current.showPicker();
                          } catch (err) {
                            maturityDatePickerRef.current.focus();
                            maturityDatePickerRef.current.click();
                          }
                        }
                      }}
                      className="absolute right-3 top-3 text-[#74777F] hover:text-[#006A65] transition-colors cursor-pointer"
                      aria-label="Pick maturity date"
                      title="Open calendar date picker"
                    >
                      <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                        calendar_today
                      </span>
                    </button>
                  </div>
                  {maturityDateError && (
                    <p className="text-xs font-semibold text-[#BA1A1A] pt-0.5 pl-1">
                      {maturityDateError}
                    </p>
                  )}
                </div>

              </div>

              {calculatedTenure && !startDateError && !maturityDateError && (
                <p className="text-xs font-semibold text-[#006A65] pt-0.5 pl-1">
                  Auto-calculated Tenure: <span className="font-extrabold text-[#00162A]">{calculatedTenure}</span>
                </p>
              )}
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
                {formHasNominee ? 'Remove Nominee Details' : 'Add Nominee Details'}
              </button>

              {formHasNominee && (
                <div className="mt-3 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Nominee Full Name"
                    value={formNomineeName}
                    onChange={(e) => setFormNomineeName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#C3C6CE]/50 bg-white text-sm text-[#00162A] font-semibold focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer with Actions */}
          <div className="flex items-center justify-end gap-3 p-4 md:px-8 md:py-4 border-t border-[#C3C6CE]/20 flex-shrink-0 bg-white">
            <CancelButton onClick={onClose} />
            <SaveButton type="submit">
              Save Deposit
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddEditDepositModal;
