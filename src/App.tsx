import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Overview } from './components/Overview';
import { ManageFamily, EditMemberModal, RemoveMemberModal } from './components/manage_family/ManageFamily';
import { Notes } from './components/locker/Notes';
import { BankAccounts } from './components/cash_and_bank/BankAccounts';
import Deposits from './components/cash_and_bank/Deposits';
import { Insurance } from './components/insurance/Insurance';
import { LoansAndCredit } from './components/loans_and_credit/LoansAndCredit';
import { Stocks } from './components/stocks/Stocks';
import { WelcomePage } from './components/welcome/WelcomePage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ChangePasswordModal } from './components/settings/ChangePasswordModal';
import { DeleteConfirmationModal } from './components/common/DeleteConfirmationModal';
import { Briefcase } from 'lucide-react';

import { 
  getAllUsers, 
  hasAnyUsers, 
  setActiveUserId,
  resetOrelioDatabase, 
  getFamilyMembers, 
  saveFamilyMembers, 
  getUserSettings, 
  saveUserSettings, 
  isPasswordSet 
} from './data/orelioStore';
import type { FamilyMember, UserSettings, UserProfile } from './data/types';

function App() {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => !hasAnyUsers());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (!hasAnyUsers()) {
      return false;
    }
    return localStorage.getItem('orelio_authenticated') !== 'false';
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings());
  const [isPrivate, setIsPrivate] = useState<boolean>(() => getUserSettings().privacyModeDefault);
  const [passwordConfigured, setPasswordConfigured] = useState<boolean>(() => isPasswordSet());

  const [members, setMembers] = useState<FamilyMember[]>(() => getFamilyMembers());
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('orelio_selected_member_id')) || 'all';
  });

  const handleSelectMemberId = (id: string | 'all') => {
    setSelectedMemberId(id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('orelio_selected_member_id', id);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsOnboarding(false);
    localStorage.setItem('orelio_authenticated', 'false');
    setActiveTab('overview');
    handleSelectMemberId('all');
    setMobileSidebarOpen(false);
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
    setIsOnboarding(false);
    localStorage.setItem('orelio_authenticated', 'true');
    setActiveTab('overview');
    handleSelectMemberId('all');
    setMobileSidebarOpen(false);
    setMembers(getFamilyMembers());
    setSettings(getUserSettings());
    setPasswordConfigured(isPasswordSet());
  };

  const handleOnboardingComplete = (user: UserProfile) => {
    setActiveUserId(user.id);
    setIsOnboarding(false);
    handleSignIn();
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    resetOrelioDatabase();
    setIsAuthenticated(false);
    setIsOnboarding(true);
    setActiveTab('overview');
    handleSelectMemberId('all');
    setMobileSidebarOpen(false);
    setMembers([]);
    setSettings(getUserSettings());
    setPasswordConfigured(false);
  };

  useEffect(() => {
    const handleDbUpdated = () => {
      const usersExist = hasAnyUsers();
      if (!usersExist) {
        setIsAuthenticated(false);
        setIsOnboarding(true);
      }
      setMembers(getFamilyMembers());
      setSettings(getUserSettings());
      setPasswordConfigured(isPasswordSet());
    };
    window.addEventListener('orelio_db_updated', handleDbUpdated);
    return () => window.removeEventListener('orelio_db_updated', handleDbUpdated);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('overview');
      setMembers(getFamilyMembers());
      setSettings(getUserSettings());
      setPasswordConfigured(isPasswordSet());
    }
  }, [isAuthenticated]);

  // Modal states lifted to App.tsx
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to render pages/tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;
      
      // Asset categories
      case 'stocks':
        return <Stocks isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;

      case 'notes':
        return <Notes selectedMemberId={selectedMemberId} />;

      case 'savings':
        return <BankAccounts isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;

      case 'fds':
        return <Deposits isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;

      case 'insurance':
        return <Insurance isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;

      case 'loans-credit':
        return <LoansAndCredit isPrivate={isPrivate} selectedMemberId={selectedMemberId} />;

      case 'manage-family':
        return (
          <ManageFamily 
            isPrivate={isPrivate} 
            members={members} 
            onEditClick={(member) => {
              setSelectedMember(member);
              setIsEditing(true);
              setIsEditModalOpen(true);
            }}
            onRemoveClick={(member) => {
              setSelectedMember(member);
              setIsRemoveModalOpen(true);
            }}
            onAddClick={() => {
              setSelectedMember(null);
              setIsEditing(false);
              setIsEditModalOpen(true);
            }}
          />
        );

      case 'settings':
        return (
          <div className="space-y-6 fade-in w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-orelio-navy tracking-tight">Settings</h2>
              <p className="text-xs text-orelio-gray mt-1 font-medium">Manage preferences, security, and application defaults.</p>
            </div>
            
            <div className="glass-card divide-y divide-[#C3C6CE]/15 overflow-hidden">
              {/* Privacy Mode Default */}
              <div className="p-4.5 sm:p-6 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="block font-bold text-orelio-navy text-sm">Privacy Mode Default</span>
                  <span className="block text-xs text-orelio-gray font-medium leading-relaxed">
                    Hide financial figures automatically upon application startup.
                  </span>
                </div>
                <button 
                  type="button"
                  role="switch"
                  aria-checked={settings.privacyModeDefault}
                  onClick={() => {
                    const nextVal = !settings.privacyModeDefault;
                    const updated = { ...settings, privacyModeDefault: nextVal };
                    setSettings(updated);
                    saveUserSettings(updated);
                    setIsPrivate(nextVal);
                  }}
                  className={`w-12 h-6.5 rounded-full transition-all duration-300 relative shrink-0 cursor-pointer ${settings.privacyModeDefault ? 'bg-[#006A65]' : 'bg-[#E6E8E9]'}`}
                >
                  <span className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform duration-300 ${settings.privacyModeDefault ? 'translate-x-5.5' : ''}`} />
                </button>
              </div>


              {/* Master Password */}
              <div className="p-4.5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="block font-bold text-orelio-navy text-sm">
                      {passwordConfigured ? 'Master Password' : 'Set Password'}
                    </span>
                    {!passwordConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#BA1A1A] bg-[#FFF8F7] border border-[#BA1A1A]/20 whitespace-nowrap">
                        Not Set
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#006A65] bg-[#E6F4F1] border border-[#006A65]/20 whitespace-nowrap">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="block text-xs text-orelio-gray font-medium leading-relaxed">
                    {passwordConfigured
                      ? 'Password required to unlock your ledger after logging out.'
                      : 'Create a password to protect and encrypt your ledger when logging in.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className={`w-full sm:w-auto self-start sm:self-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98 shrink-0 whitespace-nowrap ${
                    passwordConfigured
                      ? 'border-[#C3C6CE]/35 bg-white text-orelio-navy hover:bg-[#F2F4F5]'
                      : 'border-[#006A65]/30 bg-[#E6F4F1] text-[#006A65] hover:bg-[#d5ede8]'
                  }`}
                >
                  <span className="material-symbols-outlined select-none text-[15px] text-[#006A65]">key</span>
                  <span>{passwordConfigured ? 'Update Password' : 'Set Password'}</span>
                </button>
              </div>

              {/* Danger Zone: Reset Ledger */}
              <div className="p-4.5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-[#FFF8F7]">
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="block font-bold text-[#BA1A1A] text-sm">Reset Ledger</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#BA1A1A] bg-white border border-[#BA1A1A]/20 whitespace-nowrap">
                      Danger Zone
                    </span>
                  </div>
                  <span className="block text-xs text-orelio-gray font-medium leading-relaxed">
                    Permanently wipe all accounts, family members, holdings, and restart with a fresh ledger.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="w-full sm:w-auto self-start sm:self-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-[#BA1A1A]/30 bg-white text-[#BA1A1A] hover:bg-[#BA1A1A] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined select-none text-[16px]">delete_forever</span>
                  <span>Reset All Data</span>
                </button>
              </div>
            </div>

            {/* Settings Page Footer */}
            <footer className="pt-6 pb-2 text-center select-none">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#707975]">
                <span>Orelio Wealth Ledger</span>
                <span>•</span>
                <span className="font-semibold text-orelio-navy">v0.1.0</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-[#006A65] bg-[#E6F4F1] border border-[#006A65]/20">
                  Beta
                </span>
              </div>
            </footer>
          </div>
        );

      default:
        // Generic elegant sub-page placeholder
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center fade-in px-6">
            <div className="w-16 h-16 rounded-2xl bg-orelio-lightgreen/50 text-orelio-darkgreen flex items-center justify-center mb-6">
              <Briefcase size={28} />
            </div>
            <h2 className="text-2xl font-extrabold text-orelio-navy tracking-tight">
              {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h2>
            <p className="text-xs text-orelio-gray mt-2 max-w-sm leading-relaxed">
              This screen compiles customized wealth calculations, records, and policies relating to {activeTab.replace('-', ' ')}. Updates post CAS sync.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setActiveTab('overview')} 
                className="px-5 py-2.5 rounded-xl bg-orelio-darkgreen text-white text-xs font-bold shadow-md hover:bg-orelio-darkgreen/90 active:scale-98 transition-all"
              >
                Back to Dashboard
              </button>
              <button className="px-5 py-2.5 rounded-xl border border-[#C3C6CE]/35 bg-white text-orelio-navy text-xs font-bold hover:bg-orelio-light-gray active:scale-98 transition-all">
                Add Records
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    if (isOnboarding || !hasAnyUsers() || getAllUsers().length === 0) {
      return (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete} 
          isFirstUser={true} 
        />
      );
    }
    return <WelcomePage onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen flex bg-orelio-bg font-sans antialiased overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] overflow-x-hidden">
        
        {/* Top Header Bar */}
        <Topbar 
          isPrivate={isPrivate} 
          setIsPrivate={setIsPrivate} 
          onMenuClick={() => setMobileSidebarOpen(true)}
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMemberId={handleSelectMemberId}
        />

        {/* Dynamic Inner Page Content */}
        <main key={selectedMemberId} className="flex-1 px-4 sm:px-6 md:px-8 pt-4 md:pt-5 max-w-7xl w-full mx-auto pb-16 min-w-0">
          {renderContent()}
        </main>
      </div>

      {/* Root Modals covering the entire screen (including sidebar menu and topbar) */}
      <EditMemberModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEditing={isEditing}
        selectedMember={selectedMember}
        onSave={(updatedOrNewMember) => {
          let nextMembers: FamilyMember[];
          if (isEditing && selectedMember) {
            nextMembers = members.map(m => m.id === selectedMember.id ? updatedOrNewMember : m);
          } else {
            nextMembers = [...members, updatedOrNewMember];
          }
          setMembers(nextMembers);
          saveFamilyMembers(nextMembers);
          setIsEditModalOpen(false);
        }}
      />
      
      {isRemoveModalOpen && selectedMember && (
        <RemoveMemberModal 
          isOpen={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
          selectedMember={selectedMember}
          onConfirm={() => {
            const nextMembers = members.filter(m => m.id !== selectedMember.id);
            setMembers(nextMembers);
            saveFamilyMembers(nextMembers);
            if (selectedMemberId === selectedMember.id) {
              handleSelectMemberId('all');
            }
            setIsRemoveModalOpen(false);
          }}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        mode={passwordConfigured ? 'update' : 'set'}
        onSuccess={() => {
          setPasswordConfigured(isPasswordSet());
        }}
      />

      {/* Reset Ledger Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Ledger Data?"
        subtitle="This will permanently delete all accounts, holdings, records, and preferences. You will return to the initial onboarding screen."
        confirmText="Reset Everything"
      />

    </div>
  );
}

export default App;
