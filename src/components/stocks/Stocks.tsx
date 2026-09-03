import React, { useState, useEffect, useMemo } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { UploadStockCASModal } from './UploadStockCASModal';
import { getStocks, saveStocks, getStockMetadata, saveStockMetadata } from '../../data/orelioStore';
import type { StockHolding, StockCASMetadata } from '../../data/types';

interface StocksProps {
  isPrivate: boolean;
}

export const Stocks: React.FC<StocksProps> = ({ isPrivate }) => {
  const [holdings, setHoldings] = useState<StockHolding[]>(() => getStocks());
  const [metadata, setMetadata] = useState<StockCASMetadata | null>(() => getStockMetadata());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Persist to central orelioStore
  useEffect(() => {
    saveStocks(holdings);
    if (metadata) {
      saveStockMetadata(metadata);
    }
  }, [holdings, metadata]);

  // Format Helper
  const formatCurrency = (val: number) => {
    return isPrivate ? '••••' : '₹ ' + val.toLocaleString('en-IN');
  };

  // Metrics
  const { totalMarketValue, totalInvestedValue, returnPercent } = useMemo(() => {
    let mv = 0;
    let iv = 0;
    holdings.forEach((h) => {
      mv += h.marketValue;
      iv += h.investedValue;
    });
    const gain = mv - iv;
    const pct = iv > 0 ? (gain / iv) * 100 : 18.4;
    return {
      totalMarketValue: mv,
      totalInvestedValue: iv,
      returnPercent: pct
    };
  }, [holdings]);

  const handleCASSuccess = (data: { holdings: StockHolding[]; metadata: StockCASMetadata }) => {
    setHoldings(data.holdings);
    setMetadata(data.metadata);
  };

  return (
    <div className="space-y-6 fade-in p-2">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-[#00162A]">Stocks & Mutual Funds</h2>
            <span className="text-xs font-medium text-[#74777F] flex items-center gap-1.5 mt-1">
              Last Updated: 2 secs ago
            </span>
          </div>
          <p className="text-sm font-medium text-[#707975] mt-1">
            Manage and track your equity holdings, mutual funds, and portfolio performance.
          </p>
        </div>
        <div>
          <PrimaryButton
            icon="upload_file"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload CAS Statement
          </PrimaryButton>
        </div>
      </div>

      {/* Horizontal Divider Bar */}
      <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

      {/* Net Current Value Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <span
              className="block text-xs font-extrabold tracking-widest text-[#006A65] uppercase"
              style={{ letterSpacing: '2.4px' }}
            >
              NET CURRENT VALUE
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-extrabold text-[#00162A]">
                {formatCurrency(totalMarketValue)}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006A65]/10 text-[#006A65] text-[11px] font-bold">
                <span
                  className="material-symbols-outlined select-none"
                  style={{ fontSize: '13px' }}
                >
                  trending_up
                </span>
                +{returnPercent.toFixed(1)}% this year
              </span>
            </div>
            <p className="text-sm text-[#73777E]">
              Invested Capital:{' '}
              <span className="text-[#00162A] font-semibold">
                {formatCurrency(totalInvestedValue)}
              </span>
            </p>
          </div>
        </div>

        {/* Modern Stock Performance Sparkline with Gradient & Glow - Flush to right and bottom */}
        <div className="absolute right-0 bottom-0 w-64 sm:w-80 md:w-[460px] h-32 pointer-events-none overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-full h-full" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="stockCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#006A65" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#006A65" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#006A65" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Gradient Area under curve - flush to right (400) and bottom (100) */}
            <path
              d="M 0 100 C 60 98, 110 66, 170 70 C 230 74, 275 42, 330 38 C 365 35, 385 15, 400 8 L 400 100 L 0 100 Z"
              fill="url(#stockCurveGrad)"
            />

            {/* Smooth upward trend line touching the bottom at (0,100) and running to the right border */}
            <path
              d="M 0 100 C 60 98, 110 66, 170 70 C 230 74, 275 42, 330 38 C 365 35, 385 15, 400 8"
              stroke="#006A65"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>


      {/* Section Header */}
      <div className="flex items-center gap-4 w-full pt-6 pb-2">
        <h2
          className="text-xl font-semibold text-[#00162A] tracking-tight whitespace-nowrap"
          style={{ color: '#00162A' }}
        >
          Current Holdings
        </h2>
        <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
          {holdings.length} HOLDINGS
        </span>
      </div>

      {/* Stock Table */}
      <div className="glass-card p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm font-medium border-collapse text-[#00162A]"
            style={{ color: '#00162A' }}
          >
            <thead>
              <tr className="border-b border-[#C3C6CE]/20 text-orelio-gray text-xs tracking-wider uppercase">
                <th className="pb-3 font-bold">Company</th>
                <th className="pb-3 font-bold">Qty</th>
                <th className="pb-3 font-bold">Current Price</th>
                <th className="pb-3 font-bold">Market Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3C6CE]/10 text-orelio-navy">
              {holdings.map((stock) => (
                <tr key={stock.id} className="hover:bg-[#FBFCFD]/80 transition-colors">
                  <td className="py-4">
                    <span className="block font-bold">{stock.companyName}</span>
                    <span className="block text-xs text-orelio-gray font-medium">
                      {stock.symbol}
                    </span>
                  </td>
                  <td className="py-4">{stock.quantity}</td>
                  <td className="py-4">₹ {stock.currentPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 font-bold">{formatCurrency(stock.marketValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload CAS Statement Modal */}
      <UploadStockCASModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleCASSuccess}
      />
    </div>
  );
};
