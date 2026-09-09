import React, { useState } from 'react';
import { getUserProfile, verifyMasterPassword, getSecurityConfig } from '../../data/orelioStore';

interface WelcomePageProps {
  onSignIn: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onSignIn }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const security = getSecurityConfig();

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your master password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const isValid = await verifyMasterPassword(password);
      if (!isValid) {
        setIsLoading(false);
        setErrorMessage('Incorrect master password. Please verify and try again.');
        return;
      }

      setIsUnlocked(true);
      setTimeout(() => {
        onSignIn();
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Error verifying password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#00162A] flex flex-col justify-between selection:bg-[#E6F4F1] selection:text-[#004D40] font-sans relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#006A65]/10 via-[#006A65]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#E6F4F1]/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
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

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#C3C6CE]/30 text-xs font-semibold text-[#006A65] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">256-Bit Encrypted Private Vault</span>
          <span className="sm:hidden">Encrypted Vault</span>
        </div>
      </header>

      {/* Main Hero & Sign In Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-4xl mx-auto w-full relative z-10 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F1] border border-[#006A65]/20 text-xs font-bold text-[#004D40] mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
          <span className="material-symbols-outlined select-none text-sm text-[#006A65]">
            shield_lock
          </span>
          <span>Unified Wealth Ledger for Private Families</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#00162A] tracking-tight leading-[1.15] max-w-3xl mb-4">
          Clarity across every asset. <br className="hidden sm:block" />
          <span className="text-[#006A65]">Complete financial privacy.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#707975] max-w-xl mx-auto mb-10 leading-relaxed">
          Consolidate your family's equities, mutual funds, bank accounts, and private assets in one single high-security ledger.
        </p>

        {/* Sign In / Unlock Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#C3C6CE]/30 space-y-5 text-left">
          {/* Active User Persona Banner */}
          {(() => {
            const userProfile = getUserProfile();
            return (
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/25">
                <img
                  src="/alexander_bloom_avatar.png"
                  alt={userProfile.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-xs ring-2 ring-white"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[#00162A] truncate">
                    {userProfile.name}
                  </span>
                  <span className="block text-xs text-[#74777F] truncate">
                    {userProfile.email}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
                  Locked
                </span>
              </div>
            );
          })()}

          {/* Master Password Form */}
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#00162A]" htmlFor="master-password">
                Update Master Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none text-[18px] pointer-events-none">
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
                  placeholder="Enter master password"
                  autoFocus
                  disabled={isLoading || isUnlocked}
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm text-[#00162A] placeholder:text-[#A0A5AA] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined select-none text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-center gap-2 text-xs text-[#BA1A1A] animate-in fade-in duration-200">
                <span className="material-symbols-outlined select-none text-base shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Password Hint during beta/development */}
            {security.passwordHint && !errorMessage && (
              <div className="flex items-center justify-between text-[11px] text-[#707975] px-0.5">
                <span className="flex items-center gap-1 text-[#006A65] font-medium">
                  <span className="material-symbols-outlined select-none text-[13px]">key</span>
                  <span>{security.passwordHint}</span>
                </span>
                <span className="text-[10px] text-[#A0A5AA]">PBKDF2 SHA-256</span>
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
                  <span className="material-symbols-outlined select-none animate-spin text-lg">progress_activity</span>
                  <span>Verifying Vault Password...</span>
                </div>
              ) : isUnlocked ? (
                <div className="flex items-center gap-2 text-emerald-100">
                  <span className="material-symbols-outlined select-none text-lg">check_circle</span>
                  <span>Vault Unlocked</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined select-none text-lg">lock_open</span>
                  <span>Unlock Wealth Ledger</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Security Notes */}
          <div className="pt-2 border-t border-[#C3C6CE]/20 flex items-center justify-between text-[11px] text-[#74777F]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined select-none text-xs text-emerald-600">verified_user</span>
              <span>Encrypted Local Vault</span>
            </span>
            <span>Zero Third-Party Tracking</span>
          </div>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-3xl text-left">
          <div className="p-4 rounded-2xl bg-white/70 border border-[#C3C6CE]/25 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined select-none text-base">monitoring</span>
            </div>
            <h3 className="text-xs font-bold text-[#00162A]">Integrated CAS & Demat</h3>
            <p className="text-[11px] text-[#707975] mt-1 leading-snug">
              Import CDSL, NSDL, and CAMS statements instantly with automated portfolio valuation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-[#C3C6CE]/25 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined select-none text-base">diversity_3</span>
            </div>
            <h3 className="text-xs font-bold text-[#00162A]">Multi-Family Hierarchy</h3>
            <p className="text-[11px] text-[#707975] mt-1 leading-snug">
              Group holdings across members and dependents with customizable privacy figures mode.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-[#C3C6CE]/25 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center mb-2.5">
              <span className="material-symbols-outlined select-none text-base">lock</span>
            </div>
            <h3 className="text-xs font-bold text-[#00162A]">Bank-Grade Privacy</h3>
            <p className="text-[11px] text-[#707975] mt-1 leading-snug">
              Encrypted offline-first storage keeps your net worth confidential and secure.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#C3C6CE]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#74777F] relative z-10">
        <div>
          © {new Date().getFullYear()} Orelio Private Wealth Ledger. All rights reserved.
        </div>
        <div className="flex items-center gap-5">
          <span className="hover:text-[#00162A] cursor-pointer transition-colors">Privacy Charter</span>
          <span className="hover:text-[#00162A] cursor-pointer transition-colors">Security Whitepaper</span>
          <span className="hover:text-[#00162A] cursor-pointer transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
