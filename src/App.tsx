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
import { Briefcase } from 'lucide-react';

import { getAllUsers, getFamilyMembers, saveFamilyMembers, getUserSettings, saveUserSettings, isPasswordSet } from './data/orelioStore';
import type { FamilyMember, UserSettings } from './data/types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('orelio_authenticated') !== 'false';
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings());
  const [isPrivate, setIsPrivate] = useState<boolean>(() => getUserSettings().privacyModeDefault);
  const [passwordConfigured, setPasswordConfigured] = useState<boolean>(() => isPasswordSet());

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('orelio_authenticated', 'false');
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem('orelio_authenticated', 'true');
    setMembers(getFamilyMembers());
    setSettings(getUserSettings());
    setPasswordConfigured(isPasswordSet());
  };

  useEffect(() => {
    if (isAuthenticated) {
      setMembers(getFamilyMembers());
      setSettings(getUserSettings());
      setPasswordConfigured(isPasswordSet());
    }
  }, [isAuthenticated]);
  
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

  // Modal states lifted to App.tsx
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
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
          <div className="space-y-6 fade-in px-2 pb-2 w-full">
            <div>
              <h2 className="text-2xl font-extrabold text-orelio-navy">Settings</h2>
            </div>
            
            <div className="glass-card divide-y divide-[#C3C6CE]/15">
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <span className="block font-bold text-orelio-navy text-sm">Privacy Mode Default</span>
                  <span className="block text-xs text-orelio-gray font-medium">Hide financial numbers upon application startup.</span>
                </div>
                <button 
                  onClick={() => {
                    const nextVal = !settings.privacyModeDefault;
                    const updated = { ...settings, privacyModeDefault: nextVal };
                    setSettings(updated);
                    saveUserSettings(updated);
                    setIsPrivate(nextVal);
                  }}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.privacyModeDefault ? 'bg-orelio-darkgreen' : 'bg-orelio-light-gray'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${settings.privacyModeDefault ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block font-bold text-orelio-navy text-sm">Currency Symbols (Coming soon)</span>
                  <span className="block text-xs text-orelio-gray font-medium">Configure primary denomination. Currently fixed to Indian Rupees (INR) only.</span>
                </div>
                <span className="text-xs font-bold text-orelio-navy bg-orelio-light-gray px-3 py-1.5 rounded-lg">
                  {settings.currency} ({settings.currencySymbol})
                </span>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="block font-bold text-orelio-navy text-sm">
                      {passwordConfigured ? 'Update Password' : 'Set Password'}
                    </span>
                    {!passwordConfigured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#BA1A1A] bg-[#FFF8F7] border border-[#BA1A1A]/20">
                        Not Set
                      </span>
                    )}
                  </div>
                  <span className="block text-xs text-orelio-gray font-medium">
                    {passwordConfigured
                      ? 'Password required to unlock your ledger after logout.'
                      : 'Create a password to protect and encrypt your ledger when logging in.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98 ${
                    passwordConfigured
                      ? 'border-[#C3C6CE]/35 bg-white text-orelio-navy hover:bg-[#F2F4F5]'
                      : 'border-[#006A65]/30 bg-[#E6F4F1] text-[#006A65] hover:bg-[#d5ede8]'
                  }`}
                >
                  <span className="material-symbols-outlined select-none text-[15px] text-[#006A65]">key</span>
                  <span>{passwordConfigured ? 'Update Password' : 'Set Password'}</span>
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block font-bold text-orelio-navy text-sm">Version</span>
                  <span className="block text-xs text-orelio-gray font-medium">Current application release build and status.</span>
                </div>
                <span className="text-xs font-bold text-orelio-navy bg-orelio-light-gray px-3 py-1.5 rounded-lg">
                  v0.1.0 <span className="text-[#006A65] font-extrabold ml-1">(Beta)</span>
                </span>
              </div>
            </div>
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
    if (getAllUsers().length === 0) {
      return <OnboardingFlow onComplete={handleSignIn} isFirstUser={true} />;
    }
    return <WelcomePage onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen flex bg-orelio-bg font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:pl-[260px]">
        
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
        <main key={selectedMemberId} className="flex-1 px-6 md:px-8 pt-4 md:pt-5 max-w-7xl w-full mx-auto pb-16">
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

    </div>
  );
}

export default App;
