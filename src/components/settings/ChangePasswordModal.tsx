import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CancelButton } from '../common/CancelButton';
import { SaveButton } from '../common/SaveButton';
import { verifyMasterPassword, updateMasterPassword } from '../../data/orelioStore';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);

    try {
      const isCurrentValid = await verifyMasterPassword(currentPassword);
      if (!isCurrentValid) {
        setIsSaving(false);
        setErrorMessage('Current password is incorrect. Please verify and try again.');
        return;
      }

      await updateMasterPassword(newPassword);
      setIsSaving(false);
      setSuccessMessage('Password updated and encrypted successfully.');

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setIsSaving(false);
      setErrorMessage('Failed to update password. Please try again.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-left z-10 animate-in fade-in zoom-in-95 duration-200 border border-[#C3C6CE]/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#C3C6CE]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center">
              <span className="material-symbols-outlined select-none text-xl">
                key
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#00162A]">Update Password</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined select-none text-lg">close</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in">
            <span className="material-symbols-outlined select-none text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-[#E6F4F1] border border-[#006A65]/20 flex items-center gap-2 text-xs text-[#004D40] font-medium animate-in fade-in">
            <span className="material-symbols-outlined select-none text-base text-[#006A65] shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]">
              Current Password
            </label>
            <div className="relative flex items-center">
              <span
                className="absolute left-3 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                style={{ fontSize: '15px' }}
              >
                lock
              </span>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter existing password"
                disabled={isSaving || !!successMessage}
                autoFocus
                className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/50 text-xs text-[#00162A] placeholder:text-[#A0A5AA] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 text-[#707975] hover:text-[#00162A] p-1 rounded transition-colors cursor-pointer flex items-center justify-center"
                title={showCurrent ? 'Hide' : 'Show'}
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>
                  {showCurrent ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]">
              New Password
            </label>
            <div className="relative flex items-center">
              <span
                className="absolute left-3 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                style={{ fontSize: '15px' }}
              >
                lock_reset
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Minimum 6 characters"
                disabled={isSaving || !!successMessage}
                className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/50 text-xs text-[#00162A] placeholder:text-[#A0A5AA] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 text-[#707975] hover:text-[#00162A] p-1 rounded transition-colors cursor-pointer flex items-center justify-center"
                title={showNew ? 'Hide' : 'Show'}
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <span
                className="absolute left-3 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                style={{ fontSize: '15px' }}
              >
                check
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Re-enter new password"
                disabled={isSaving || !!successMessage}
                className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/50 text-xs text-[#00162A] placeholder:text-[#A0A5AA] focus:outline-none focus:border-[#006A65] focus:ring-1 focus:ring-[#006A65] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 text-[#707975] hover:text-[#00162A] p-1 rounded transition-colors cursor-pointer flex items-center justify-center"
                title={showConfirm ? 'Hide' : 'Show'}
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C3C6CE]/20">
            <CancelButton onClick={onClose} disabled={isSaving} />
            <SaveButton type="submit" isSaving={isSaving} disabled={!!successMessage}>
              Save Password
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
