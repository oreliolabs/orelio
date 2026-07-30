import React from 'react';
import { createPortal } from 'react-dom';
import type { Policy } from './InsuranceTypes';

interface DeletePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onConfirm: () => void;
}

export const DeletePolicyModal: React.FC<DeletePolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  onConfirm
}) => {
  if (!isOpen || !policy) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Full screen backdrop overlay: 000000 at 40% opacity */}
      <div className="fixed inset-0 bg-[#000000]/40 transition-opacity duration-200" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#C3C6CE]/30 space-y-5 my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-[#BA1A1A]">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF8F7] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined select-none" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#00162A]">Delete Policy</h3>
            <p className="text-xs text-[#707975] font-medium">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm font-medium text-[#43474D]">
          Are you sure you want to delete policy <span className="font-bold text-[#00162A]">"{policy.policyName}"</span> ({policy.policyNumber})?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-sm text-[#707975] hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#BA1A1A] hover:bg-[#a01616] text-white font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Delete Policy
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
