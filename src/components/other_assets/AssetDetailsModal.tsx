import React from 'react';
import { createPortal } from 'react-dom';
import type { OtherAssetItem } from './OtherAssetsTypes';

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: OtherAssetItem | null;
  onEdit: (asset: OtherAssetItem) => void;
  isPrivate: boolean;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  isOpen,
  onClose,
  asset,
  onEdit,
  isPrivate
}) => {
  if (!isOpen || !asset) return null;

  const formatCurrency = (val: number) => {
    return isPrivate ? '••••••' : '₹ ' + val.toLocaleString('en-IN');
  };

  const isPositive = asset.unrealizedGain >= 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-[#C3C6CE]/30 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 md:px-8 pt-6 pb-4 border-b border-[#C3C6CE]/20 flex-shrink-0 bg-white">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase tracking-wider">
                {asset.category} {asset.subCategory ? `• ${asset.subCategory}` : ''}
              </span>
              {asset.rentalIncome && asset.rentalIncome > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#004D40] bg-[#AFEFDD]/40 uppercase tracking-wider">
                  YIELDING RENTAL
                </span>
              )}
              {asset.bondCouponRate && asset.bondCouponRate > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-sky-800 bg-sky-100 uppercase tracking-wider">
                  {asset.bondCouponRate}% COUPON
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#00162A] tracking-tight leading-snug">
              {asset.name}
            </h2>
            {asset.location && (
              <p className="text-xs font-semibold text-[#707975] flex items-center gap-1">
                <span className="material-symbols-outlined text-xs select-none">location_on</span>
                <span>{asset.location}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#74777F] hover:bg-[#F2F4F5] transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined select-none">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          {/* Main Financial Highlights Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/30">
            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                CURRENT VALUATION
              </span>
              <span className="block text-2xl font-extrabold text-[#00162A] mt-1">
                {formatCurrency(asset.currentValuation)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                PURCHASE COST BASIS
              </span>
              <span className="block text-2xl font-extrabold text-[#00162A] mt-1">
                {formatCurrency(asset.costBasis)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                TOTAL APPRECIATION
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xl font-extrabold ${
                    isPositive ? 'text-[#006A65]' : 'text-[#BA1A1A]'
                  }`}
                >
                  {isPrivate
                    ? '••••'
                    : `${isPositive ? '+' : ''}${formatCurrency(asset.unrealizedGain)}`}
                </span>
                <span
                  className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {asset.unrealizedGainPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Category-Specific Specifications */}
          {asset.category === 'Real Estate' && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#006A65] uppercase tracking-wider">
                Real Estate Attributes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Property Type</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                    {asset.propertyType || 'Residential'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Monthly Rental</span>
                  <span className="block text-sm font-extrabold text-[#006A65] mt-0.5">
                    {asset.rentalIncome ? formatCurrency(asset.rentalIncome) + ' / mo' : 'Self-Occupied / No Rent'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20 col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Gross Rental Yield</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                    {asset.rentalIncome && asset.currentValuation > 0
                      ? `${(((asset.rentalIncome * 12) / asset.currentValuation) * 100).toFixed(2)}% p.a.`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {asset.category === 'Crypto' && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#006A65] uppercase tracking-wider">
                Crypto & Custody Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Token Ticker</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                    {asset.cryptoSymbol || 'CRYPTO'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Holding Balance</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5 font-mono">
                    {isPrivate ? '••••' : asset.cryptoQuantity ?? 'N/A'} {asset.cryptoSymbol}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20 col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Custody / Wallet</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5 truncate">
                    {asset.walletPlatform || 'Self-Custody'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {asset.category === 'Bonds' && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#006A65] uppercase tracking-wider">
                Bond & Fixed Income Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Issuer</span>
                  <span className="block text-xs font-bold text-[#00162A] mt-0.5 truncate">
                    {asset.bondIssuer || 'Government / Sovereign'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Coupon Rate</span>
                  <span className="block text-sm font-extrabold text-[#006A65] mt-0.5">
                    {asset.bondCouponRate ? `${asset.bondCouponRate}% p.a.` : 'Cumulative'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Payout</span>
                  <span className="block text-xs font-bold text-[#00162A] mt-0.5">
                    {asset.bondPayoutFrequency || 'Annual'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Maturity Date</span>
                  <span className="block text-xs font-bold text-[#00162A] mt-0.5">
                    {asset.bondMaturityDate || 'Perpetual'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {asset.category === 'Gold & Metals' && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-[#006A65] uppercase tracking-wider">
                Precious Metal Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Weight (Grams)</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5 font-mono">
                    {asset.metalWeightGrams ? `${asset.metalWeightGrams} g` : 'N/A'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Purity</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                    {asset.metalPurity || '24K'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C3C6CE]/20 col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold text-[#74777F] uppercase">Custodian Location</span>
                  <span className="block text-sm font-extrabold text-[#00162A] mt-0.5 truncate">
                    {asset.custodian || 'Safe Deposit'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* General Metadata & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/20 text-xs">
            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                ACQUISITION DATE
              </span>
              <span className="block font-bold text-[#00162A] mt-1">
                {asset.acquisitionDate || 'N/A'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                CUSTODIAN / REGISTRY
              </span>
              <span className="block font-bold text-[#00162A] mt-1">
                {asset.custodian || asset.walletPlatform || 'Direct Ownership'}
              </span>
            </div>
          </div>

          {asset.notes && (
            <div className="p-4 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/25 space-y-1">
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                NOTES & REMARKS
              </span>
              <p className="text-xs text-[#43474D] leading-relaxed">
                {asset.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(asset);
            }}
            className="px-4 py-2 rounded-xl border border-[#C3C6CE]/40 text-xs font-bold text-[#00162A] hover:bg-[#F2F4F5] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined select-none text-sm">edit</span>
            <span>Edit Asset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#006A65] text-white text-xs font-bold hover:bg-[#00524E] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
