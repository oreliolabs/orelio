import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UserProfile } from '../../data/types';
import { CancelButton } from '../common/CancelButton';

export interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (user: UserProfile) => void;
  onOpenCreateUser: () => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUserId,
  onSelectUser,
  onOpenCreateUser
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 text-left z-10 animate-in fade-in zoom-in-95 duration-200 border border-[#C3C6CE]/30">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined select-none text-2xl">
                switch_account
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#00162A]">Switch User</h3>
              <p className="text-xs text-[#707975]">
                Select an account profile to unlock the ledger.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined select-none text-lg">close</span>
          </button>
        </div>

        {/* User List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {users.map((user) => {
            const isActive = user.id === activeUserId;
            const initials = user.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'U';

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#E6F4F1]/40 border-[#006A65] shadow-xs'
                    : 'bg-[#FBFCFD] border-[#C3C6CE]/30 hover:border-[#006A65]/50 hover:bg-[#F8FDFB]'
                }`}
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-xs ring-2 ring-white"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#006A65] to-[#004D40] text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-white select-none shrink-0">
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#00162A] truncate group-hover:text-[#006A65] transition-colors">
                      {user.name}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
                        Active
                      </span>
                    )}
                  </div>
                  <span className="block text-xs text-[#74777F] truncate mt-0.5">
                    {user.email}
                  </span>
                </div>

                {/* Arrow or Checkmark */}
                <span
                  className={`material-symbols-outlined select-none text-xl transition-transform ${
                    isActive
                      ? 'text-[#006A65]'
                      : 'text-[#A0A5AA] group-hover:text-[#006A65] group-hover:translate-x-0.5'
                  }`}
                >
                  {isActive ? 'check_circle' : 'chevron_right'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#C3C6CE]/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateUser();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006A65] hover:text-[#00524E] hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined select-none text-base">person_add</span>
            <span>Create New User</span>
          </button>
          <CancelButton onClick={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SwitchUserModal;
