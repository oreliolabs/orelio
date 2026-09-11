import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UserProfile } from '../../data/types';
import { createNewUser } from '../../data/orelioStore';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: UserProfile) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form on open
      setName('');
      setEmail('');
      setDob('');
      setGender('Female');
      setPassword('');
      setConfirmPassword('');
      setPasswordHint('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage(null);
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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter the user full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a master password.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Master password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Master passwords do not match. Please re-enter.');
      return;
    }

    setIsSaving(true);

    try {
      const newUser = await createNewUser({
        name: trimmedName,
        email: trimmedEmail,
        dob: dob || undefined,
        gender,
        password,
        passwordHint: passwordHint.trim() || undefined
      });

      setIsSaving(false);
      onUserCreated(newUser);
      onClose();
    } catch (err) {
      setIsSaving(false);
      setErrorMessage('Failed to create new user profile. Please try again.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-left z-10 animate-in fade-in zoom-in-95 duration-200 border border-[#C3C6CE]/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined select-none text-2xl">
                person_add
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#00162A]">Create New User</h3>
              <p className="text-xs text-[#707975]">
                Set up a new vault profile and master credentials.
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in duration-200">
            <span className="material-symbols-outlined select-none text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-name">
              Full Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                person
              </span>
              <input
                id="new-user-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. John Doe"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-email">
              Email Address <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                mail
              </span>
              <input
                id="new-user-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. john@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* DOB & Gender Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* DOB */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-dob">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                  calendar_today
                </span>
                <input
                  id="new-user-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-gender">
                Gender
              </label>
              <select
                id="new-user-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Master Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-password">
                Master Password <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  id="new-user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Min 4 characters"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined select-none text-[17px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-confirm-password">
                Confirm Password <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                  lock_reset
                </span>
                <input
                  id="new-user-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined select-none text-[17px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Password Hint */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#00162A]" htmlFor="new-user-password-hint">
              Password Reminder Hint <span className="text-[#74777F] font-normal">(Optional)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
                key
              </span>
              <input
                id="new-user-password-hint"
                type="text"
                value={passwordHint}
                onChange={(e) => setPasswordHint(e.target.value)}
                placeholder="e.g. Favorite childhood pet name"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="pt-3 border-t border-[#C3C6CE]/20 flex items-center justify-end gap-3">
            <CancelButton onClick={onClose} disabled={isSaving} />
            <SaveButton type="submit" isSaving={isSaving} icon="person_add">
              Create Profile
            </SaveButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateUserModal;
