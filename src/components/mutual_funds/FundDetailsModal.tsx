import React from 'react';
import { createPortal } from 'react-dom';
import type { MutualFundScheme } from './MutualFundsTypes';

interface FundDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: MutualFundScheme | null;
  onEdit: (fund: MutualFundScheme) => void;
  isPrivate: boolean;
}

export const FundDetailsModal: React.FC<FundDetailsModalProps> = ({
  isOpen,
  onClose,
  fund,
  onEdit,
  isPrivate
}) => {
  if (!isOpen || !fund) return null;

  const formatCurrency = (val: number) => {
    return isPrivate ? '••••••' : '₹ ' + val.toLocaleString('en-IN');
  };

  const isPositive = fund.unrealizedGain >= 0;

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
                {fund.category} • {fund.subCategory || 'Fund'}
              </span>
              {fund.sipActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#004D40] bg-[#AFEFDD]/40 uppercase tracking-wider">
                  SIP ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#00162A] tracking-tight leading-snug">
              {fund.schemeName}
            </h2>
            <p className="text-xs font-semibold text-[#707975]">{fund.amc}</p>
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
                CURRENT VALUE
              </span>
              <span className="block text-2xl font-extrabold text-[#00162A] mt-1">
                {formatCurrency(fund.currentValue)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                INVESTED CAPITAL
              </span>
              <span className="block text-2xl font-extrabold text-[#00162A] mt-1">
                {formatCurrency(fund.investedAmount)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] uppercase">
                TOTAL RETURNS
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xl font-extrabold ${
                    isPositive ? 'text-[#006A65]' : 'text-[#BA1A1A]'
                  }`}
                >
                  {isPrivate
                    ? '••••'
                    : `${isPositive ? '+' : ''}${formatCurrency(fund.unrealizedGain)}`}
                </span>
                <span
                  className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {fund.unrealizedGainPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Scheme & Folio Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F8F9FA] border border-[#C3C6CE]/20 text-xs">
            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                FOLIO NO.
              </span>
              <span className="block font-bold text-[#00162A] mt-1">{fund.folioNumber}</span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                UNITS HELD
              </span>
              <span className="block font-bold text-[#00162A] mt-1">
                {isPrivate ? '••••' : fund.units.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                LATEST NAV
              </span>
              <span className="block font-bold text-[#00162A] mt-1">
                ₹ {fund.nav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-extrabold text-[#74777F] uppercase tracking-wider">
                ISIN
              </span>
              <span className="block font-bold text-[#00162A] mt-1 truncate">
                {fund.isin || 'N/A'}
              </span>
            </div>
          </div>

          {/* Plan Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white border border-[#C3C6CE]/30">
              <span className="block text-[10px] font-bold text-[#74777F] uppercase">Plan Type</span>
              <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                {fund.planType || 'Direct Plan'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#C3C6CE]/30">
              <span className="block text-[10px] font-bold text-[#74777F] uppercase">Option</span>
              <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                {fund.dividendOption || 'Growth'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#C3C6CE]/30 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-bold text-[#74777F] uppercase">Monthly SIP</span>
              <span className="block text-sm font-extrabold text-[#00162A] mt-0.5">
                {fund.sipActive && fund.sipAmount
                  ? `₹ ${fund.sipAmount.toLocaleString('en-IN')} / mo`
                  : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Transactions History Ledger (if available) */}
          {fund.transactions && fund.transactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#00162A]">Transaction History</h3>
                <span className="text-[11px] font-extrabold text-[#74777F] uppercase tracking-wider">
                  {fund.transactions.length} TRANSACTIONS
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#C3C6CE]/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8F9FA] border-b border-[#C3C6CE]/20 text-[#74777F] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Units</th>
                      <th className="p-3 text-right">NAV</th>
                      <th className="p-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C3C6CE]/15 text-[#00162A] font-medium">
                    {fund.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FBFCFD] transition-colors">
                        <td className="p-3 font-semibold text-[#43474D]">{tx.date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'SIP'
                                ? 'bg-[#E6F4F1] text-[#006A65]'
                                : tx.type === 'REDEMPTION'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">
                          {isPrivate ? '••••' : `₹ ${tx.amount.toLocaleString('en-IN')}`}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {isPrivate ? '••••' : tx.units.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono">₹ {tx.nav.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold font-mono">
                          {isPrivate ? '••••' : tx.unitBalance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-[#C3C6CE]/20 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(fund);
            }}
            className="px-4 py-2 rounded-xl border border-[#C3C6CE]/40 text-xs font-bold text-[#00162A] hover:bg-[#F2F4F5] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined select-none text-sm">edit</span>
            <span>Edit Scheme</span>
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
