import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CancelButton } from './CancelButton';

export interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-200 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[340px] sm:max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-center z-10 animate-in fade-in zoom-in-95 duration-200 border border-[#C3C6CE]/30">
        {/* Logout Visual Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF0EF] text-[#BA1A1A] flex items-center justify-center mx-auto shadow-xs">
          <span className="material-symbols-outlined select-none text-2xl">
            logout
          </span>
        </div>

        {/* Content text */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-[#00162A]">Log out of Orelio?</h3>
          <p className="text-xs text-[#707975] leading-relaxed">
            Are you sure you want to log out, <span className="font-semibold text-[#00162A]">{userName}</span>?
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <CancelButton
            onClick={onClose}
            variant="primary"
            className="w-full"
          >
            Cancel
          </CancelButton>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-bold text-white bg-[#BA1A1A] hover:bg-[#9E1414] rounded-xl transition-colors shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined select-none text-base">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmationModal;
