import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';
import type { OtherAssetItem, AssetCategory, AssetFormData } from './OtherAssetsTypes';

interface AddEditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: OtherAssetItem) => void;
  initialAsset?: OtherAssetItem | null;
  isEditing?: boolean;
}

const CATEGORIES: AssetCategory[] = [
  'Real Estate',
  'Crypto',
  'Bonds',
  'Gold & Metals',
  'Alternative',
  'Vehicles',
  'Other'
];

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAsset,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: 'Real Estate',
    subCategory: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    costBasis: 0,
    currentValuation: 0,
    location: '',
    propertyType: 'Residential',
    rentalIncome: 0,
    cryptoSymbol: '',
    cryptoQuantity: 0,
    cryptoAvgPrice: 0,
    walletPlatform: '',
    bondCouponRate: 0,
    bondMaturityDate: '',
    bondIssuer: '',
    bondPayoutFrequency: 'Annual',
    metalWeightGrams: 0,
    metalPurity: '24K (99.9%)',
    custodian: '',
    notes: ''
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const propertyTypeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (propertyTypeDropdownRef.current && !propertyTypeDropdownRef.current.contains(event.target as Node)) {
        setIsPropertyTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialAsset) {
        setFormData({
          id: initialAsset.id,
          name: initialAsset.name,
          category: initialAsset.category,
          subCategory: initialAsset.subCategory || '',
          acquisitionDate: initialAsset.acquisitionDate || new Date().toISOString().split('T')[0],
          costBasis: initialAsset.costBasis,
          currentValuation: initialAsset.currentValuation,
          location: initialAsset.location || '',
          propertyType: initialAsset.propertyType || 'Residential',
          rentalIncome: initialAsset.rentalIncome || 0,
          cryptoSymbol: initialAsset.cryptoSymbol || '',
          cryptoQuantity: initialAsset.cryptoQuantity || 0,
          cryptoAvgPrice: initialAsset.cryptoAvgPrice || 0,
          walletPlatform: initialAsset.walletPlatform || '',
          bondCouponRate: initialAsset.bondCouponRate || 0,
          bondMaturityDate: initialAsset.bondMaturityDate || '',
          bondIssuer: initialAsset.bondIssuer || '',
          bondPayoutFrequency: initialAsset.bondPayoutFrequency || 'Annual',
          metalWeightGrams: initialAsset.metalWeightGrams || 0,
          metalPurity: initialAsset.metalPurity || '24K (99.9%)',
          custodian: initialAsset.custodian || '',
          notes: initialAsset.notes || ''
        });
      } else {
        setFormData({
          name: '',
          category: 'Real Estate',
          subCategory: 'Residential Property',
          acquisitionDate: new Date().toISOString().split('T')[0],
          costBasis: 0,
          currentValuation: 0,
          location: '',
          propertyType: 'Residential',
          rentalIncome: 0,
          cryptoSymbol: '',
          cryptoQuantity: 0,
          cryptoAvgPrice: 0,
          walletPlatform: '',
          bondCouponRate: 0,
          bondMaturityDate: '',
          bondIssuer: '',
          bondPayoutFrequency: 'Annual',
          metalWeightGrams: 0,
          metalPurity: '24K (99.9%)',
          custodian: '',
          notes: ''
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialAsset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const costBasis = Number(formData.costBasis) || 0;
    const currentValuation = Number(formData.currentValuation) || 0;
    const unrealizedGain = currentValuation - costBasis;
    const unrealizedGainPercent = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;

    const savedAsset: OtherAssetItem = {
      id: formData.id || `asset-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory?.trim() || `${formData.category} Asset`,
      acquisitionDate: formData.acquisitionDate,
      costBasis,
      currentValuation,
      unrealizedGain,
      unrealizedGainPercent: Number(unrealizedGainPercent.toFixed(2)),

      // Real Estate
      location: formData.location?.trim(),
      propertyType: formData.propertyType,
      rentalIncome: formData.rentalIncome ? Number(formData.rentalIncome) : 0,

      // Crypto
      cryptoSymbol: formData.cryptoSymbol?.trim().toUpperCase(),
      cryptoQuantity: formData.cryptoQuantity ? Number(formData.cryptoQuantity) : undefined,
      cryptoAvgPrice: formData.cryptoAvgPrice ? Number(formData.cryptoAvgPrice) : undefined,
      walletPlatform: formData.walletPlatform?.trim(),

      // Bonds
      bondCouponRate: formData.bondCouponRate ? Number(formData.bondCouponRate) : undefined,
      bondMaturityDate: formData.bondMaturityDate,
      bondIssuer: formData.bondIssuer?.trim(),
      bondPayoutFrequency: formData.bondPayoutFrequency,

      // Gold
      metalWeightGrams: formData.metalWeightGrams ? Number(formData.metalWeightGrams) : undefined,
      metalPurity: formData.metalPurity?.trim(),

      // Custodian & notes
      custodian: formData.custodian?.trim(),
      notes: formData.notes?.trim()
    };

    setTimeout(() => {
      onSave(savedAsset);
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
              {isEditing ? 'Edit Asset Details' : 'Add New Asset'}
            </h2>
            <p className="text-xs text-[#707975] font-medium">
              Record real estate, crypto, bonds, precious metals, or custom holdings
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 no-scrollbar">
            {/* Asset Name */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                ASSET NAME / IDENTIFIER <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Prestige Golfshire Villa, Bitcoin Cold Storage, SGB 2023-24"
                className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
              />
            </div>

            {/* Category Dropdown & Sub-Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  ASSET CLASS <span className="text-[#BA1A1A]">*</span>
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
                  SUB-CATEGORY / SPECIFICATION
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. Luxury Villa, Sovereign Gold Bond, Layer-1"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>
            </div>

            {/* Financial Valuation: Cost Basis & Current Valuation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  PURCHASE COST BASIS (₹) <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  min="0"
                  value={formData.costBasis || ''}
                  onChange={(e) => setFormData({ ...formData, costBasis: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 24000000"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  CURRENT ESTIMATED VALUE (₹) <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  min="0"
                  value={formData.currentValuation || ''}
                  onChange={(e) => setFormData({ ...formData, currentValuation: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 32000000"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65]"
                />
              </div>
            </div>

            {/* Category-Specific Dynamic Fields */}
            {formData.category === 'Real Estate' && (
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/30 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006A65] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm select-none">apartment</span>
                  <span>Real Estate Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      PROPERTY LOCATION
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Nandi Hills Road, Bangalore"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>

                  <div className="relative" ref={propertyTypeDropdownRef}>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      PROPERTY TYPE
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPropertyTypeDropdownOpen(!isPropertyTypeDropdownOpen)}
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] flex items-center justify-between focus:outline-none focus:border-[#006A65]"
                    >
                      <span>{formData.propertyType}</span>
                      <span className="material-symbols-outlined text-[#74777F] text-sm select-none">
                        expand_more
                      </span>
                    </button>

                    {isPropertyTypeDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-[#C3C6CE]/30 shadow-lg overflow-hidden z-50 py-1">
                        {['Residential', 'Commercial', 'Plot / Land', 'REIT', 'Other'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, propertyType: type as any });
                              setIsPropertyTypeDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-xs text-left hover:bg-[#F2F4F5] text-[#00162A]"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                    MONTHLY RENTAL INFLOW (₹ / MONTH)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.rentalIncome || ''}
                    onChange={(e) => setFormData({ ...formData, rentalIncome: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 85000"
                    className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Crypto' && (
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/30 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006A65] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm select-none">currency_bitcoin</span>
                  <span>Crypto & Digital Asset Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      TOKEN SYMBOL
                    </label>
                    <input
                      type="text"
                      value={formData.cryptoSymbol}
                      onChange={(e) => setFormData({ ...formData, cryptoSymbol: e.target.value.toUpperCase() })}
                      placeholder="e.g. BTC, ETH, SOL"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      TOKENS / QUANTITY HELD
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={formData.cryptoQuantity || ''}
                      onChange={(e) => setFormData({ ...formData, cryptoQuantity: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 1.45"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                    STORAGE WALLET / EXCHANGE PLATFORM
                  </label>
                  <input
                    type="text"
                    value={formData.walletPlatform}
                    onChange={(e) => setFormData({ ...formData, walletPlatform: e.target.value })}
                    placeholder="e.g. Ledger Cold Storage, Binance, Trezor"
                    className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                  />
                </div>
              </div>
            )}

            {formData.category === 'Bonds' && (
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/30 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006A65] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm select-none">account_balance</span>
                  <span>Bond & Fixed Income Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      BOND ISSUER / ENTITY
                    </label>
                    <input
                      type="text"
                      value={formData.bondIssuer}
                      onChange={(e) => setFormData({ ...formData, bondIssuer: e.target.value })}
                      placeholder="e.g. Reserve Bank of India (RBI), NHAI"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      ANNUAL COUPON RATE (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.bondCouponRate || ''}
                      onChange={(e) => setFormData({ ...formData, bondCouponRate: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 7.50"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      PAYOUT FREQUENCY
                    </label>
                    <select
                      value={formData.bondPayoutFrequency}
                      onChange={(e) => setFormData({ ...formData, bondPayoutFrequency: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    >
                      <option value="Annual">Annual</option>
                      <option value="Semi-Annual">Semi-Annual</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Cumulative">Cumulative at Maturity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      MATURITY DATE
                    </label>
                    <input
                      type="date"
                      value={formData.bondMaturityDate}
                      onChange={(e) => setFormData({ ...formData, bondMaturityDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.category === 'Gold & Metals' && (
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/30 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006A65] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm select-none">monetization_on</span>
                  <span>Precious Metals Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      WEIGHT IN GRAMS
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.metalWeightGrams || ''}
                      onChange={(e) => setFormData({ ...formData, metalWeightGrams: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 250"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                      PURITY
                    </label>
                    <input
                      type="text"
                      value={formData.metalPurity}
                      onChange={(e) => setFormData({ ...formData, metalPurity: e.target.value })}
                      placeholder="e.g. 24K (99.99%), 22K (91.6%)"
                      className="w-full px-3 py-2 bg-white border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Acquisition Date & Custodian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  ACQUISITION / PURCHASE DATE
                </label>
                <input
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] focus:outline-none focus:border-[#006A65]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                  CUSTODIAN / REGISTRY / PLATFORM
                </label>
                <input
                  type="text"
                  value={formData.custodian}
                  onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                  placeholder="e.g. Bank Locker, NSDL, Self-Custody"
                  className="w-full px-4 py-2.5 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-sm font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65]"
                />
              </div>
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase mb-2">
                NOTES & REMARKS
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Lease terms, valuation date, key details..."
                className="w-full px-4 py-2 bg-[#FBFCFD] border border-[#C3C6CE]/50 rounded-xl text-xs font-medium text-[#00162A] placeholder-[#74777F]/50 focus:outline-none focus:border-[#006A65]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 bg-white flex-shrink-0">
            <CancelButton onClick={onClose} />
            <SaveButton type="submit" isSaving={isSaving}>
              {isEditing ? 'Save Changes' : 'Add Asset'}
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
