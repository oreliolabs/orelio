import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Policy, PolicyFormData, PolicyType, PremiumFrequency } from './InsuranceTypes';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

interface AddEditPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPolicy: Policy | null;
  onSave: (formData: PolicyFormData) => void;
  isFirstPolicy?: boolean;
}

const toInputDate = (val?: number | string): string => {
  if (!val) return '';
  if (typeof val === 'number') {
    const dt = new Date(val);
    if (!isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const dt = new Date(val);
  if (!isNaN(dt.getTime())) {
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
};

export const AddEditPolicyModal: React.FC<AddEditPolicyModalProps> = ({
  isOpen,
  onClose,
  editingPolicy,
  onSave,
  isFirstPolicy = false
}) => {
  const [policyType, setPolicyType] = useState<PolicyType>('Life Insurance');
  const [provider, setProvider] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [premiumFrequency, setPremiumFrequency] = useState<PremiumFrequency>('Annual');
  const [sumInsured, setSumInsured] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (editingPolicy) {
        setPolicyType(editingPolicy.policyType);
        setProvider(editingPolicy.provider || '');
        setPolicyName(editingPolicy.policyName);
        setPolicyNumber(editingPolicy.policyNumber || '');
        setPremiumAmount(((editingPolicy.premiumAmount ?? (editingPolicy as any).annualPremium) ?? '').toString());
        setPremiumFrequency(editingPolicy.premiumFrequency);
        setSumInsured(editingPolicy.sumInsured.toString());
        setStartDate(toInputDate(editingPolicy.startDate));
        setExpiryDate(toInputDate(editingPolicy.expiryDate));
      } else {
        setPolicyType('Life Insurance');
        setProvider('');
        setPolicyName('');
        setPolicyNumber('');
        setPremiumAmount('');
        setPremiumFrequency('Annual');
        setSumInsured('');
        setStartDate('');
        setExpiryDate('');
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingPolicy, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave({
        policyType,
        provider,
        policyName,
        policyNumber,
        premiumAmount,
        premiumFrequency,
        sumInsured,
        startDate,
        expiryDate
      });
      setIsSaving(false);
      onClose();
    }, 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Full screen backdrop overlay: 000000 at 40% opacity */}
      <div className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200" onClick={onClose} />

      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-[360px] sm:max-w-xl md:max-w-2xl w-full shadow-2xl border border-[#C3C6CE]/30 my-auto max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Modal Header */}
        <div className="px-4 sm:px-8 pt-4 pb-3 sm:pt-5 sm:pb-4 border-b border-[#C3C6CE]/20 shrink-0 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#00162A] tracking-tight">
              {editingPolicy ? 'Edit Policy' : (isFirstPolicy ? 'Add Your First Policy' : 'Add New Policy')}
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-[#707975] mt-0.5">
              Enter your policy coverage details below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#F2F4F5] flex items-center justify-center text-[#707975] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 overflow-y-auto flex-1 no-scrollbar">
            {/* Row 1: Policy Type & Insurance Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  POLICY TYPE <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as PolicyType)}
                    className="w-full h-12 pl-4 pr-10 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="Life Insurance">Life Insurance</option>
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Property Insurance">Property Insurance</option>
                    <option value="Motor Insurance">Motor Insurance</option>
                    <option value="Term Insurance">Term Insurance</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 text-[#707975] select-none" style={{ fontSize: '20px' }}>
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  INSURANCE PROVIDER
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prudential, Allianz"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] placeholder-[#707975]/60 focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Row 2: Policy Name & Policy Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  POLICY NAME <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Estate Protection Plan"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] placeholder-[#707975]/60 focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  POLICY NUMBER
                </label>
                <input
                  type="text"
                  placeholder="Enter policy number"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] placeholder-[#707975]/60 focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Row 3: Premium Amount, Premium Frequency, Sum Assured */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  PREMIUM AMOUNT <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-sm text-[#707975]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={premiumAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) {
                        setPremiumAmount(val);
                      }
                    }}
                    className="w-full h-12 pl-8 pr-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] placeholder-[#707975]/60 focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  PREMIUM FREQUENCY <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <select
                    value={premiumFrequency}
                    onChange={(e) => setPremiumFrequency(e.target.value as PremiumFrequency)}
                    className="w-full h-12 pl-4 pr-10 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 text-[#707975] select-none" style={{ fontSize: '20px' }}>
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  SUM ASSURED <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-sm text-[#707975]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={sumInsured}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) {
                        setSumInsured(val);
                      }
                    }}
                    className="w-full h-12 pl-8 pr-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm text-[#00162A] placeholder-[#707975]/60 focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Start Date & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  START DATE <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all ${
                    !startDate ? 'text-[#707975]/60' : 'text-[#00162A]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#707975] uppercase mb-1.5">
                  EXPIRY DATE <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-[#F2F4F5] border border-[#C3C6CE]/30 font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#006A65] focus:bg-white transition-all ${
                    !expiryDate ? 'text-[#707975]/60' : 'text-[#00162A]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Fixed Modal Footer Actions */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end px-4 sm:px-8 py-3.5 sm:py-4 border-t border-[#C3C6CE]/20 bg-white rounded-b-2xl sm:rounded-b-3xl shrink-0">
            <CancelButton onClick={onClose} className="w-full sm:w-auto" />
            <SaveButton type="submit" isSaving={isSaving} className="w-full sm:w-auto">
              {editingPolicy ? 'Save Changes' : 'Save Policy'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
