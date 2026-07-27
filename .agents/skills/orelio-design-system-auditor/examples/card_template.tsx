import React from 'react';

interface DepositCardProps {
  id: string;
  nickname: string;
  type: 'FD' | 'RD';
  accountNumber: string;
  interestRate: number;
  currentValue: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DepositCardTemplate: React.FC<DepositCardProps> = ({
  nickname,
  type,
  accountNumber,
  interestRate,
  currentValue,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`group bg-white rounded-3xl p-5 md:p-6 border border-[#C3C6CE]/30 shadow-xs hover:border-2 hover:border-[#006A65] hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)] transition-all duration-300 ease-out relative flex flex-col md:flex-row md:items-start justify-between gap-5 ${
        isMenuOpen ? 'z-50' : 'z-0'
      }`}
    >
      {/* Icon & Title */}
      <div className="flex items-start gap-4 min-w-[240px]">
        <div className="w-12 h-12 rounded-2xl bg-[#F0F4F8] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-105 flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out">
          <span
            className={`material-symbols-outlined select-none transition-transform duration-300 ${
              type === 'FD' ? 'group-hover:scale-100 group-hover:-rotate-12' : 'group-hover:rotate-180'
            }`}
            style={{ fontSize: '24px' }}
          >
            {type === 'FD' ? 'savings' : 'refresh'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-extrabold tracking-widest text-[#74777F] group-hover:text-[#006A65] uppercase mb-2 transition-colors duration-300">
            {type === 'FD' ? 'FD NICKNAME' : 'RD NICKNAME'}
          </span>
          <h3 className="text-base font-bold text-[#00162A]">{nickname}</h3>
          <span className="block text-xs font-medium text-[#74777F] mt-1.5">
            Account No.: {accountNumber}
          </span>
        </div>
      </div>

      {/* Popover Menu Trigger */}
      <div className="relative">
        <button
          onClick={onToggleMenu}
          className="w-9 h-9 rounded-full text-[#74777F] hover:bg-[#F2F4F5] hover:text-[#00162A] transition-colors flex items-center justify-center"
          aria-label="More menu"
        >
          <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
            more_vert
          </span>
        </button>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              onClick={onEdit}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors"
            >
              {type === 'FD' ? 'Edit FD' : 'Edit RD'}
            </button>
            <div className="border-t border-[#C3C6CE]/20" />
            <button
              onClick={onDelete}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors"
            >
              {type === 'FD' ? 'Delete FD' : 'Delete RD'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
