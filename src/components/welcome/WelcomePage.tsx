import React, { useState } from 'react';
import {
  getUserProfile,
  getAllUsers,
  setActiveUserId,
  verifyUserPassword,
  getSecurityConfig
} from '../../data/orelioStore';
import type { UserProfile } from '../../data/types';
import { SwitchUserModal } from './SwitchUserModal';
import { CreateUserModal } from './CreateUserModal';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';

interface WelcomePageProps {
  onSignIn: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onSignIn }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getUserProfile());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => getAllUsers());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'leaving-to-onboard' | 'entering-from-onboard'>('idle');

  const handleStartOnboarding = () => {
    setTransitionState('leaving-to-onboard');
    setTimeout(() => {
      setIsOnboarding(true);
      setTransitionState('idle');
    }, 220);
  };

  const handleCancelOnboarding = () => {
    setIsOnboarding(false);
    setTransitionState('entering-from-onboard');
    setTimeout(() => {
      setTransitionState('idle');
    }, 350);
  };

  const security = getSecurityConfig();

  const handleSelectUser = (user: UserProfile) => {
    setActiveUserId(user.id);
    setCurrentUser(user);
    setPassword('');
    setErrorMessage(null);
  };

  const handleUserCreated = (newUser: UserProfile) => {
    setAllUsers(getAllUsers());
    setCurrentUser(newUser);
    setPassword('');
    setErrorMessage(null);
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const isValid = await verifyUserPassword(currentUser.id, password);
      if (!isValid) {
        setIsLoading(false);
        setErrorMessage('Incorrect password. Please verify and try again.');
        return;
      }

      setActiveUserId(currentUser.id);
      setIsUnlocked(true);
      setTimeout(() => {
        onSignIn();
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Error verifying password. Please try again.');
    }
  };

  const activeHint =
    currentUser.passwordHint !== undefined && currentUser.passwordHint !== ''
      ? currentUser.passwordHint
      : security.passwordHint;

  const initials =
    currentUser.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  if (isOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(user) => {
          setIsOnboarding(false);
          setAllUsers(getAllUsers());
          setCurrentUser(user);
          onSignIn();
        }}
        onCancel={handleCancelOnboarding}
        isFirstUser={allUsers.length === 0}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#00162A] flex flex-col justify-between selection:bg-[#E6F4F1] selection:text-[#004D40] font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#006A65]/10 via-[#006A65]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#E6F4F1]/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full px-4 sm:px-12 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-[14px] flex items-center justify-center p-2 flex-shrink-0 shadow-sm">
            <img src="/logo.svg" alt="Orelio Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-black leading-none">Orelio</span>
            <span className="block text-[9px] font-bold tracking-widest text-[#707975] uppercase mt-1">
              Wealth Ledger
            </span>
          </div>
        </div>
      </header>

      {/* Main Sign In Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-20 sm:pb-28 max-w-4xl mx-auto w-full relative z-10 text-center">
        {/* Sign In / Unlock Card */}
        <div
          className={`w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#C3C6CE]/30 space-y-7 text-left ${
            transitionState === 'leaving-to-onboard'
              ? 'page-exit-forward pointer-events-none'
              : transitionState === 'entering-from-onboard'
              ? 'page-enter-backward'
              : ''
          }`}
        >
          {/* Active User Persona Banner */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/25">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-xs ring-2 ring-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#006A65] to-[#004D40] text-white flex items-center justify-center font-bold text-base shadow-xs ring-2 ring-white select-none shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-[#00162A] truncate">
                {currentUser.name}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
              LOGGED OUT
            </span>
          </div>

          {/* Password Form */}
          <form onSubmit={handleUnlockSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="master-password">
                Password
              </label>
              <div className="relative flex items-center">
                <span
                  className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                  style={{ fontSize: '17px' }}
                >
                  lock
                </span>
                <input
                  id="master-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter password"
                  autoFocus
                  disabled={isLoading || isUnlocked}
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span
                    className="material-symbols-outlined select-none flex items-center justify-center"
                    style={{ fontSize: '17px' }}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Hint during beta/development */}
              {activeHint && !errorMessage && (
                <div className="flex items-center text-[11px] text-[#707975] px-0.5 pt-0.5">
                  <span className="flex items-center gap-1 text-[#006A65] font-medium">
                    <span
                      className="material-symbols-outlined select-none flex items-center justify-center"
                      style={{ fontSize: '14px' }}
                    >
                      key
                    </span>
                    <span>{activeHint}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in duration-200">
                <span className="material-symbols-outlined select-none text-base shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Unlock Action Button */}
            <button
              type="submit"
              disabled={isLoading || isUnlocked}
              className="w-full h-12 rounded-2xl bg-[#006A65] hover:bg-[#00524E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#006A65]/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined select-none animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                  <span>Verifying Password...</span>
                </div>
              ) : isUnlocked ? (
                <div className="flex items-center gap-2 text-emerald-100">
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '18px' }}>check_circle</span>
                  <span>Unlocked</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined select-none flex items-center justify-center" style={{ fontSize: '18px' }}>lock_open</span>
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          {/* User Management Options */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs">
            {allUsers.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSwitchUserOpen(true)}
                  className="px-2.5 py-1 rounded-xl font-bold text-[#006A65] hover:bg-[#E6F4F1] transition-all cursor-pointer active:scale-98"
                >
                  Switch User
                </button>
                <span className="text-[#C3C6CE] select-none">•</span>
              </>
            )}

            <button
              type="button"
              onClick={handleStartOnboarding}
              className="px-2.5 py-1 rounded-xl font-bold text-[#006A65] hover:bg-[#E6F4F1] transition-all cursor-pointer active:scale-98"
            >
              Create New User
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
        users={allUsers}
        activeUserId={currentUser.id}
        onSelectUser={handleSelectUser}
        onOpenCreateUser={() => {
          setIsSwitchUserOpen(false);
          handleStartOnboarding();
        }}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default WelcomePage;
