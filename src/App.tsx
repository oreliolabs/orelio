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
import { MutualFunds } from './components/mutual_funds/MutualFunds';
import { OtherAssets } from './components/other_assets/OtherAssets';
import { PrimaryButton } from './components/common/PrimaryButton';
import { Briefcase } from 'lucide-react';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  dob: string;
  age: number;
  isDependent: boolean;
  gender: 'Male' | 'Female' | 'Other';
  avatarColor: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      firstName: 'Rajesh',
      lastName: 'Dubey',
      role: 'Self',
      dob: '15/02/1973',
      age: 52,
      isDependent: false,
      gender: 'Male',
      avatarColor: 'from-teal-600 to-emerald-500'
    },
    {
      id: '2',
      firstName: 'Priya',
      lastName: 'Dubey',
      role: 'Spouse',
      dob: '22/07/1977',
      age: 48,
      isDependent: false,
      gender: 'Female',
      avatarColor: 'from-pink-500 to-purple-600'
    },
    {
      id: '3',
      firstName: 'Kavya',
      lastName: 'Dubey',
      role: 'Child',
      dob: '05/06/2014',
      age: 12,
      isDependent: true,
      gender: 'Female',
      avatarColor: 'from-amber-400 to-orange-500'
    },
    {
      id: '4',
      firstName: 'Marjari',
      lastName: 'Rampure',
      role: 'Mother',
      dob: '11/11/1948',
      age: 77,
      isDependent: true,
      gender: 'Female',
      avatarColor: 'from-teal-500 to-cyan-600'
    }
  ]);

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
        return (
          <div className="space-y-6 fade-in p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#00162A]">Stocks</h2>
                <p className="text-sm font-medium text-[#707975] mt-1">
                  Manage and track your equity holdings and portfolio performance.
                </p>
              </div>
              <div>
                <PrimaryButton icon="upload_file">
                  Upload CAS Statement
                </PrimaryButton>
              </div>
            </div>

            {/* Horizontal Divider Bar */}
            <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

            {/* Net Current Value Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[180px] shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold tracking-widest text-[#006A65] uppercase" style={{ letterSpacing: '2.4px' }}>
                    NET CURRENT VALUE
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-extrabold text-[#00162A]">
                      {isPrivate ? '••••' : '₹ 45,20,000.00'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#006A65]/10 text-[#006A65] text-[11px] font-bold">
                      <span className="material-symbols-outlined select-none" style={{ fontSize: '13px' }}>trending_up</span>
                      +18.4% this year
                    </span>
                  </div>
                  <p className="text-sm text-[#73777E]">
                    Invested Capital: <span className="text-[#00162A] font-semibold">{isPrivate ? '••••' : '₹ 38,16,000'}</span>
                  </p>
                </div>
              </div>

              {/* Modern Stock Performance Sparkline with Gradient & Glow - Flush to right and bottom */}
              <div className="absolute right-0 bottom-0 w-64 sm:w-80 md:w-[460px] h-32 pointer-events-none overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-full h-full" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="stockCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006A65" stopOpacity="0.25" />
                      <stop offset="70%" stopColor="#006A65" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#006A65" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area under curve - flush to right (400) and bottom (100) */}
                  <path
                    d="M 0 100 C 80 96, 150 72, 220 56 C 290 42, 340 20, 400 6 L 400 100 L 0 100 Z"
                    fill="url(#stockCurveGrad)"
                  />

                  {/* Smooth upward trend line touching the bottom at (0,100) and running to the right border */}
                  <path
                    d="M 0 100 C 80 96, 150 72, 220 56 C 290 42, 340 20, 400 6"
                    stroke="#006A65"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Mock Stock table */}
            <div className="glass-card p-6 overflow-hidden">
              <h3 className="text-base font-bold text-orelio-navy mb-4">Current Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-medium border-collapse">
                  <thead>
                    <tr className="border-b border-[#C3C6CE]/20 text-orelio-gray text-xs tracking-wider uppercase">
                      <th className="pb-3 font-bold">Company</th>
                      <th className="pb-3 font-bold">Qty</th>
                      <th className="pb-3 font-bold">Avg Cost</th>
                      <th className="pb-3 font-bold">Current Price</th>
                      <th className="pb-3 font-bold text-right">Market Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C3C6CE]/10 text-orelio-navy">
                    <tr>
                      <td className="py-4">
                        <span className="block font-bold">HDFC Bank Ltd.</span>
                        <span className="block text-xs text-orelio-gray font-medium">HDFCBANK</span>
                      </td>
                      <td className="py-4">120</td>
                      <td className="py-4">₹ 1,520</td>
                      <td className="py-4">₹ 1,680</td>
                      <td className="py-4 font-bold text-right">{isPrivate ? '••••' : '₹ 2,01,600'}</td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <span className="block font-bold">Reliance Industries</span>
                        <span className="block text-xs text-orelio-gray font-medium">RELIANCE</span>
                      </td>
                      <td className="py-4">80</td>
                      <td className="py-4">₹ 2,410</td>
                      <td className="py-4">₹ 2,930</td>
                      <td className="py-4 font-bold text-right">{isPrivate ? '••••' : '₹ 2,34,400'}</td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <span className="block font-bold">Tata Consultancy Services</span>
                        <span className="block text-xs text-orelio-gray font-medium">TCS</span>
                      </td>
                      <td className="py-4">40</td>
                      <td className="py-4">₹ 3,850</td>
                      <td className="py-4">₹ 4,120</td>
                      <td className="py-4 font-bold text-right">{isPrivate ? '••••' : '₹ 1,64,800'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'mutual-funds':
        return <MutualFunds isPrivate={isPrivate} />;

      case 'other-assets':
        return <OtherAssets isPrivate={isPrivate} />;

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
          <div className="space-y-6 fade-in p-2 max-w-3xl">
            <div>
              <span className="text-xs font-bold tracking-widest text-orelio-gray uppercase">Preferences & System</span>
              <h2 className="text-2xl font-extrabold text-orelio-navy mt-1">Settings</h2>
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
                  <span className="block font-bold text-orelio-navy text-sm">Currency Symbols</span>
                  <span className="block text-xs text-orelio-gray font-medium">Configure primary denomination. Currently Indian Rupees (INR).</span>
                </div>
                <span className="text-xs font-bold text-orelio-navy bg-orelio-light-gray px-3 py-1.5 rounded-lg">INR (₹)</span>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="block font-bold text-orelio-navy text-sm">Integrate External Brokers</span>
                  <span className="block text-xs text-orelio-gray font-medium">Sync mutual fund and stock assets automatically via CAS.</span>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold text-white bg-orelio-navy rounded-lg hover:bg-orelio-navy/90 transition-all">Link CAS</button>
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

  return (
    <div className="min-h-screen flex bg-orelio-bg font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={mobileSidebarOpen}
        setIsOpen={setMobileSidebarOpen}
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
          if (isEditing && selectedMember) {
            setMembers(members.map(m => m.id === selectedMember.id ? updatedOrNewMember : m));
          } else {
            setMembers([...members, updatedOrNewMember]);
          }
          setIsEditModalOpen(false);
        }}
      />
      
      {isRemoveModalOpen && selectedMember && (
        <RemoveMemberModal 
          isOpen={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
          selectedMember={selectedMember}
          onConfirm={() => {
            setMembers(members.filter(m => m.id !== selectedMember.id));
            setIsRemoveModalOpen(false);
          }}
        />
      )}

    </div>
  );
}

export default App;
