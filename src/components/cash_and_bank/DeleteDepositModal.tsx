import React from 'react';
import { createPortal } from 'react-dom';
import type { Deposit } from './Deposits';

interface DeleteDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletingDeposit: Deposit | null;
  onConfirmDelete: () => void;
}

export const DeleteDepositModal: React.FC<DeleteDepositModalProps> = ({
  isOpen,
  onClose,
  deletingDeposit,
  onConfirmDelete,
}) => {
  if (!isOpen || !deletingDeposit) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-3 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Graphic SVG */}
        <div className="mx-auto flex justify-center">
          <svg
            className="transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer origin-center"
            width="82"
            height="104"
            viewBox="0 0 82 104"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M35.0547 18.8154C46.2332 18.8035 58.1784 16.5893 66.9926 23.1441C76.6139 30.299 83.1824 42.0331 81.8217 53.594C80.5386 64.4953 68.7147 70.1723 60.548 77.8995C52.4369 85.5743 46.4194 96.7031 35.0547 97.8446C23.0447 99.0509 10.3675 93.1323 3.55753 83.6237C-2.59729 75.0299 3.42655 64 3.36292 53.594C3.29854 43.066 -4.05418 31.1597 3.1881 23.212C10.5057 15.1817 23.8972 18.8273 35.0547 18.8154Z"
              fill="#FFF0EF"
            />
            <path
              d="M33.5333 61L36.9999 57.5333L40.4666 61L42.3333 59.1333L38.8666 55.6667L42.3333 52.2L40.4666 50.3333L36.9999 53.8L33.5333 50.3333L31.6666 52.2L35.1333 55.6667L31.6666 59.1333L33.5333 61ZM30.3333 67C29.5999 67 28.9721 66.7389 28.4499 66.2167C27.9277 65.6944 27.6666 65.0667 27.6666 64.3333V47H26.3333V44.3333H32.9999V43H40.9999V44.3333H47.6666V47H46.3333V64.3333C46.3333 65.0667 46.0721 65.6944 45.5499 66.2167C45.0277 66.7389 44.3999 67 43.6666 67H30.3333Z"
              fill="#BA1A1A"
            />
          </svg>
        </div>

        {/* Content text */}
        <div className="space-y-2 mt-1">
          <h3 className="text-lg font-bold text-[#00162A]">
            Delete {deletingDeposit.type === 'FD' ? 'FD' : 'RD'}?
          </h3>
          <p className="text-sm text-[#43474D] leading-relaxed font-medium">
            Are you sure you want to delete{' '}
            <span className="font-bold text-[#00162A]">{deletingDeposit.nickname}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-[#3F4945] bg-[#E6E8E9] rounded-xl hover:bg-[#D5D7D8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#BA1A1A] rounded-xl hover:bg-[#9E1414] transition-colors shadow-sm cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
