import { useState } from 'react';
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
import { Briefcase } from 'lucide-react';

import { getFamilyMembers, saveFamilyMembers } from './data/orelioStore';
import type { FamilyMember } from './data/types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('orelio_authenticated') !== 'false';
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('orelio_authenticated', 'false');
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem('orelio_authenticated', 'true');
  };
  
  const [members, setMembers] = useState<FamilyMember[]>(() => getFamilyMembers());

  // Modal states lifted to App.tsx
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to render pages/tabs
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview isPrivate={isPrivate} />;
      
      // Asset categories
      case 'stocks':
        return <Stocks isPrivate={isPrivate} />;

      case 'notes':
        return <Notes />;

      case 'savings':
        return <BankAccounts isPrivate={isPrivate} />;

      case 'fds':
        return <Deposits isPrivate={isPrivate} />;

      case 'insurance':
        return <Insurance isPrivate={isPrivate} />;

      case 'loans-credit':
        return <LoansAndCredit isPrivate={isPrivate} />;

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
          <div className="space-y-6 fade-in p-2 w-full">
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
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isPrivate ? 'bg-orelio-darkgreen' : 'bg-orelio-light-gray'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isPrivate ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block font-bold text-orelio-navy text-sm">Currency Symbols (Coming soon)</span>
                  <span className="block text-xs text-orelio-gray font-medium">Configure primary denomination. Currently fixed to Indian Rupees (INR) only.</span>
                </div>
                <span className="text-xs font-bold text-orelio-navy bg-orelio-light-gray px-3 py-1.5 rounded-lg">INR (₹)</span>
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
        />

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
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
            setIsRemoveModalOpen(false);
          }}
        />
      )}

    </div>
  );
}

export default App;
