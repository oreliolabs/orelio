import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '../../data/types';
import { createNewUser } from '../../data/orelioStore';

export interface OnboardingFlowProps {
  onComplete: (user: UserProfile) => void;
  onCancel?: () => void;
  isFirstUser?: boolean;
}

type OnboardingStep = 1 | 2 | 3 | 4;

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onCancel,
  isFirstUser = false
}) => {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const goToStep = (nextStep: OnboardingStep, dir?: 'forward' | 'backward') => {
    if (isStepTransitioning) return;
    const targetDir = dir || (nextStep > step ? 'forward' : 'backward');
    setDirection(targetDir);
    setHasNavigated(true);
    setIsStepTransitioning(true);
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      setIsStepTransitioning(false);
    }, 160);
  };

  const getStepAnimClass = () => {
    if (!hasNavigated) return 'step-card-enter';
    if (isStepTransitioning) {
      return direction === 'forward' ? 'step-exit-forward' : 'step-exit-backward';
    }
    return direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward';
  };

  // Form State
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed user state for final step
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);

  // Calculate age from DOB
  const calculateAge = (dateString: string): number | null => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${monthNames[monthIdx] || month} ${year}`;
    }
    return dateString;
  };

  // Step 1 -> Step 2
  const handleNextFromName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name to proceed.');
      return;
    }
    setErrorMessage(null);
    goToStep(2, 'forward');
  };

  // Step 2 -> Step 3
  const handleNextFromDob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      setErrorMessage('Please choose your date of birth.');
      return;
    }
    setErrorMessage(null);
    goToStep(3, 'forward');
  };

  // Step 3 -> Create User -> Step 4 (Celebration)
  const handleNextFromGender = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@orelio.vault`;
      const newUser = await createNewUser({
        name: name.trim(),
        email,
        dob,
        gender
      });

      setCreatedUser(newUser);
      setIsSubmitting(false);
      goToStep(4, 'forward'); // Move to celebratory Welcome screen
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Failed to create vault profile. Please try again.');
    }
  };

  const [isExiting, setIsExiting] = useState(false);

  const handleCancelClick = () => {
    if (!onCancel) return;
    setIsExiting(true);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  const calculatedAge = calculateAge(dob);
  const firstName = name.trim().split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#00162A] flex flex-col justify-between selection:bg-[#E6F4F1] selection:text-[#004D40] font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#006A65]/10 via-[#006A65]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#E6F4F1]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#006A65]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Integrated Progress */}
      <header className="w-full px-4 sm:px-12 py-5 flex items-center justify-between relative z-10">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 min-w-[120px]">
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

        {/* Center: Step Progress Indicator & Segmented Pills */}
        {step <= 3 && (
          <div className="flex flex-col items-center gap-1.5">
            <span key={step} className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#006A65] animate-in fade-in duration-200">
              Step {step} of 3
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= step ? 'w-6 sm:w-8 bg-[#006A65]' : 'w-4 sm:w-5 bg-[#C3C6CE]/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right: Close button or balanced spacer */}
        <div className="flex items-center justify-end min-w-[120px]">
          {onCancel && !isFirstUser && step < 4 ? (
            <button
              type="button"
              onClick={handleCancelClick}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#707975] hover:text-[#00162A] hover:bg-[#F2F4F5] transition-colors cursor-pointer"
              title="Close"
            >
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      </header>

      {/* Animated Body Wrapper */}
      <div className={`flex-1 flex flex-col justify-center ${isExiting ? 'page-exit-backward pointer-events-none' : 'page-enter-forward'}`}>

      {/* Main Container */}
      <main className={`flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-16 sm:pb-20 ${step === 4 ? 'max-w-xl' : 'max-w-lg'} mx-auto w-full relative z-10 transition-all duration-300`}>
        {/* Error Notification */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-[#FFF8F7] border border-[#BA1A1A]/20 flex items-center gap-2.5 text-xs text-[#BA1A1A] animate-in fade-in duration-200">
            <span className="material-symbols-outlined select-none text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 1: Name                                          */}
        {/* ---------------------------------------------------- */}
        {step === 1 && (
          <div className={`w-full bg-white rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#C3C6CE]/30 space-y-6 text-left ${getStepAnimClass()}`}>
            {/* Step Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined material-symbols-filled select-none text-[20px]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>badge</span>
            </div>

            {/* Intro text */}
            <p className="text-xs sm:text-sm text-[#707975] leading-relaxed">
              Welcome to Orelio! Let's personalize your private wealth ledger profile.
            </p>

            {/* Input Form */}
            <form onSubmit={handleNextFromName} className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#00162A] tracking-tight mb-2.5">
                  What's your name?
                </h2>
                <label htmlFor="onboard-name" className="block text-[11px] font-bold text-[#00162A] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                    style={{ fontSize: '18px' }}
                  >
                    person
                  </span>
                  <input
                    id="onboard-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Bhaumik Kore"
                    autoFocus
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm font-semibold text-[#00162A] placeholder:text-[#A0A5AA] placeholder:font-normal focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-12 rounded-2xl bg-[#006A65] hover:bg-[#00524E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#006A65]/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_forward</span>
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: Date of Birth                                */}
        {/* ---------------------------------------------------- */}
        {step === 2 && (
          <div className={`w-full bg-white rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#C3C6CE]/30 space-y-6 text-left ${getStepAnimClass()}`}>
            {/* Step Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined material-symbols-filled select-none text-[20px]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>cake</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleNextFromDob} className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#00162A] tracking-tight mb-2.5">
                  When were you born?
                </h2>
                <label htmlFor="onboard-dob" className="block text-[11px] font-bold text-[#00162A] uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <div
                  className="relative flex items-center cursor-pointer"
                  onClick={() => {
                    const inputEl = document.getElementById('onboard-dob') as HTMLInputElement;
                    try {
                      inputEl?.showPicker?.();
                    } catch {}
                  }}
                >
                  <span
                    className="absolute left-3.5 text-[#707975] material-symbols-outlined select-none pointer-events-none flex items-center justify-center"
                    style={{ fontSize: '16px' }}
                  >
                    calendar_today
                  </span>
                  <input
                    id="onboard-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch {}
                    }}
                    autoFocus
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FBFCFD] border border-[#C3C6CE]/35 text-sm font-semibold text-[#00162A] focus:bg-white focus:border-[#006A65] focus:ring-3 focus:ring-[#006A65]/10 outline-none transition-all cursor-pointer no-native-calendar"
                  />
                </div>

                {/* Age preview badge */}
                {calculatedAge !== null && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-[#006A65] font-semibold animate-in fade-in">
                    <span className="material-symbols-outlined select-none leading-none" style={{ fontSize: '16px' }}>verified</span>
                    <span>Current age: {calculatedAge} years old</span>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    goToStep(1, 'backward');
                  }}
                  className="h-12 px-5 rounded-2xl border border-[#C3C6CE]/40 hover:bg-[#F2F4F5] text-sm sm:text-base font-bold text-[#43474D] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_back</span>
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!dob}
                  className="flex-1 h-12 rounded-2xl bg-[#006A65] hover:bg-[#00524E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#006A65]/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: Gender                                       */}
        {/* ---------------------------------------------------- */}
        {step === 3 && (
          <div className={`w-full bg-white rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#C3C6CE]/30 space-y-6 text-left ${getStepAnimClass()}`}>
            {/* Step Icon */}
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006A65] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined select-none text-[20px]" style={{ fontSize: '20px' }}>diversity_3</span>
            </div>

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#00162A] tracking-tight">
              Select your gender
            </h2>

            {/* Gender Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Female', label: 'Female', icon: 'woman' },
                { id: 'Male', label: 'Male', icon: 'man' },
                { id: 'Other', label: 'Other', icon: 'diversity_1' }
              ].map((item) => {
                const isSelected = gender === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGender(item.id as 'Male' | 'Female' | 'Other')}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#E6F4F1] border-[#006A65] shadow-xs ring-2 ring-[#006A65]/10'
                        : 'bg-[#FBFCFD] border-[#C3C6CE]/35 hover:border-[#006A65]/40 hover:bg-[#F8FDFB]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#006A65] text-white' : 'bg-white text-[#707975]'
                      }`}
                    >
                      <span className="material-symbols-outlined select-none text-xl">{item.icon}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? 'text-[#004D40]' : 'text-[#00162A]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setErrorMessage(null);
                  goToStep(2, 'backward');
                }}
                className="h-12 px-5 rounded-2xl border border-[#C3C6CE]/40 hover:bg-[#F2F4F5] text-sm sm:text-base font-bold text-[#43474D] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_back</span>
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNextFromGender}
                className="flex-1 h-12 rounded-2xl bg-[#006A65] hover:bg-[#00524E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#006A65]/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined select-none animate-spin text-lg">progress_activity</span>
                    <span>Creating Vault...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: Welcome Message & Celebration Screen         */}
        {/* ---------------------------------------------------- */}
        {step === 4 && (
          <div className={`w-full bg-white rounded-3xl p-7 sm:p-9 shadow-[0_16px_50px_rgba(0,0,0,0.08)] border border-[#C3C6CE]/30 space-y-6 text-center ${getStepAnimClass()}`}>
            {/* Celebration Icon with Halo */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#006A65]/10 animate-ping duration-1000" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006A65] to-[#00897B] text-white flex items-center justify-center shadow-md shadow-[#006A65]/20">
                <span className="material-symbols-outlined select-none" style={{ fontSize: '26px' }}>celebration</span>
              </div>
            </div>

            {/* Congratulatory Header */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#006A65] bg-[#E6F4F1] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
                Account Successfully Created
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#00162A] tracking-tight">
                Welcome to Orelio, {firstName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#707975] max-w-md mx-auto leading-relaxed">
                Let's organize all your financial data in one place.
              </p>
            </div>

            {/* Profile Summary Badge */}
            <div className="p-4 rounded-2xl bg-[#FBFCFD] border border-[#C3C6CE]/30 text-left space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#006A65] text-white flex items-center justify-center font-bold text-base shadow-xs ring-2 ring-white select-none shrink-0">
                  {name.trim().charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#00162A] truncate">
                    {name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006A65]" />
                  Active
                </span>
              </div>

              {/* Key metadata chips */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#43474D]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#C3C6CE]/20">
                  <span className="material-symbols-outlined select-none text-base text-[#006A65]">cake</span>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-[#707975] uppercase font-bold">Born</span>
                    <span className="font-semibold text-[#00162A] truncate">{formatDisplayDate(dob)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#C3C6CE]/20">
                  <span className="material-symbols-outlined select-none text-base text-[#006A65]">diversity_3</span>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-[#707975] uppercase font-bold">Gender</span>
                    <span className="font-semibold text-[#00162A]">{gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (createdUser) {
                    onComplete(createdUser);
                  }
                }}
                className="w-full h-13 rounded-2xl bg-[#006A65] hover:bg-[#00524E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#006A65]/25 transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <span>Go to dashboard</span>
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>

      </div>
    </div>
  );
};

export default OnboardingFlow;
