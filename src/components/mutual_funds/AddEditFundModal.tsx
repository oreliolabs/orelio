import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';
import type { MutualFundScheme, MutualFundCategory, FundFormData } from './MutualFundsTypes';
import { detectCategory } from './casParser';

interface AddEditFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fund: MutualFundScheme) => void;
  initialFund?: MutualFundScheme | null;
  isEditing?: boolean;
}

const CATEGORIES: MutualFundCategory[] = [
  'Equity',
  'Debt',
  'Hybrid',
  'ELSS',
  'Liquid',
  'Index',
  'Other'
];

export const AddEditFundModal: React.FC<AddEditFundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFund,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<FundFormData>({
    schemeName: '',
    amc: '',
    folioNumber: '',
    category: 'Equity',
    subCategory: '',
    isin: '',
    units: 0,
    nav: 0,
    navDate: new Date().toISOString().split('T')[0],
    investedAmount: 0,
    sipAmount: 0,
    sipActive: false,
    planType: 'Direct',
    dividendOption: 'Growth'
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialFund) {
        setFormData({
          id: initialFund.id,
          schemeName: initialFund.schemeName,
          amc: initialFund.amc,
          folioNumber: initialFund.folioNumber,
          category: initialFund.category,
          subCategory: initialFund.subCategory || '',
          isin: initialFund.isin || '',
          units: initialFund.units,
          nav: initialFund.nav,
          navDate: initialFund.navDate || new Date().toISOString().split('T')[0],
          investedAmount: initialFund.investedAmount,
          sipAmount: initialFund.sipAmount || 0,
          sipActive: initialFund.sipActive ?? false,
          planType: initialFund.planType || 'Direct',
          dividendOption: initialFund.dividendOption || 'Growth'
        });
      } else {
        setFormData({
          schemeName: '',
          amc: '',
          folioNumber: '',
          category: 'Equity',
          subCategory: 'Active Equity',
          isin: '',
          units: 0,
          nav: 0,
          navDate: new Date().toISOString().split('T')[0],
          investedAmount: 0,
          sipAmount: 0,
          sipActive: false,
          planType: 'Direct',
          dividendOption: 'Growth'
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialFund]);

  if (!isOpen) return null;

  const handleSchemeNameChange = (name: string) => {
    const { category, subCategory } = detectCategory(name);
    setFormData((prev) => ({
      ...prev,
      schemeName: name,
      category: prev.category === 'Equity' ? category : prev.category,
      subCategory: prev.subCategory ? prev.subCategory : subCategory
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const units = Number(formData.units) || 0;
    const nav = Number(formData.nav) || 0;
    const currentValue = Math.round(units * nav);
    const investedAmount = Number(formData.investedAmount) || 0;
    const unrealizedGain = currentValue - investedAmount;
    const unrealizedGainPercent = investedAmount > 0 ? (unrealizedGain / investedAmount) * 100 : 0;

    const savedScheme: MutualFundScheme = {
      id: formData.id || `fund-${Date.now()}`,
      schemeName: formData.schemeName.trim(),
      amc: formData.amc.trim() || 'Mutual Fund',
      folioNumber: formData.folioNumber.trim(),
      category: formData.category,
      subCategory: formData.subCategory?.trim() || `${formData.category} Fund`,
      isin: formData.isin?.trim().toUpperCase(),
      units,
      nav,
      navDate: formData.navDate || 'Latest',
      investedAmount,
      currentValue,
      unrealizedGain,
      unrealizedGainPercent: Number(unrealizedGainPercent.toFixed(2)),
      sipAmount: formData.sipActive ? Number(formData.sipAmount) || 0 : 0,
      sipActive: formData.sipActive,
      planType: formData.planType,
      dividendOption: formData.dividendOption,
      transactions: initialFund?.transactions || []
    };

    setTimeout(() => {
      onSave(savedScheme);
      setIsSaving(false);
      onClose();
    }, 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-[#C3C6CE]/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-5 pb-4 border-b border-[#C3C6CE]/20 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#00162A] tracking-tight">
              {isEditing ? 'Edit Mutual Fund' : 'Add Mutual Fund'}
            </h2>
            <p className="text-xs text-[#707975] font-medium">
              {isEditing ? 'Update scheme valuation and units' : 'Enter scheme details manually'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors"
          >
            <span className="material-symbols-outlined select-none">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 no-scrollbar">
            {/* Scheme Name */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                SCHEME NAME <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schemeName}
                onChange={(e) => handleSchemeNameChange(e.target.value)}
                placeholder="e.g. Parag Parikh Flexi Cap Fund - Direct Plan - Growth"
                className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
              />
            </div>

            {/* AMC & Folio Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  AMC / FUND HOUSE <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.amc}
                  onChange={(e) => setFormData({ ...formData, amc: e.target.value })}
                  placeholder="e.g. HDFC Mutual Fund"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  FOLIO NUMBER <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.folioNumber}
                  onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                  placeholder="e.g. 10293847/22"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>
            </div>

            {/* Category Dropdown & Sub-Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  ASSET CATEGORY <span className="text-[#BA1A1A]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] flex items-center justify-between focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                >
                  <span>{formData.category}</span>
                  <span
                    className={`material-symbols-outlined text-[#74777F] transition-transform duration-200 select-none ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-[#C3C6CE]/30 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="max-h-48 overflow-y-auto py-1 no-scrollbar">
                      {CATEGORIES.map((cat) => {
                        const isSelected = formData.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, category: cat });
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full h-10 px-4 text-xs font-semibold transition-colors flex items-center justify-between border-b border-[#C3C6CE]/10 last:border-0 ${isSelected
                              ? 'bg-[#F2F4F5] text-[#00162A]'
                              : 'text-[#43474D] hover:bg-[#F8F9FA]'
                              }`}
                          >
                            <span>{cat}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[#006A65] text-base select-none">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  SUB-CATEGORY
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. Small Cap, Flexi Cap"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>
            </div>

            {/* Units, NAV, Invested Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  UNITS HELD <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  min="0.001"
                  value={formData.units || ''}
                  onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) || 0 })}
                  placeholder="1420.485"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  CURRENT NAV (₹) <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={formData.nav || ''}
                  onChange={(e) => setFormData({ ...formData, nav: parseFloat(e.target.value) || 0 })}
                  placeholder="84.52"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  INVESTED COST (₹) <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  min="0"
                  value={formData.investedAmount || ''}
                  onChange={(e) => setFormData({ ...formData, investedAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="850000"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>
            </div>

            {/* Calculated Current Value Pill Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F2F4F5] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#74777F]">Calculated Current Value</span>
              <span className="font-extrabold text-[#00162A] text-sm">
                ₹ {Math.round((formData.units || 0) * (formData.nav || 0)).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Systematic Investment Plan (SIP) settings */}
            <div className="p-4 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-[#00162A]">Active Monthly SIP</span>
                  <span className="block text-[11px] text-[#74777F]">Is an automated monthly installment linked?</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sipActive}
                  onChange={(e) => setFormData({ ...formData, sipActive: e.target.checked })}
                  className="w-4 h-4 accent-[#006A65] rounded cursor-pointer"
                />
              </div>

              {formData.sipActive && (
                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-1.5">
                    SIP AMOUNT (₹ / MONTH)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="100"
                    value={formData.sipAmount || ''}
                    onChange={(e) => setFormData({ ...formData, sipAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="10000"
                    className="w-full px-4 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 bg-white flex-shrink-0">
            <CancelButton onClick={onClose} />
            <SaveButton type="submit" isSaving={isSaving}>
              {isEditing ? 'Save Changes' : 'Add Scheme'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
