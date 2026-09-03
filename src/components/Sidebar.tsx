import React, { useState } from 'react';
import { LogoutConfirmationModal } from './common/LogoutConfirmationModal';
import { getUserProfile } from '../data/orelioStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  onLogout
}) => {
  // Submenu states
  const [assetsOpen, setAssetsOpen] = useState(true);
  const [cashBankOpen, setCashBankOpen] = useState(false);
  const [lockerOpen, setLockerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const navItems = [
    {
      name: 'Overview',
      icon: 'dashboard',
      id: 'overview'
    },
    {
      name: 'Assets',
      icon: 'business_center',
      id: 'assets',
      hasSubmenu: true,
      isOpen: assetsOpen,
      setIsOpen: setAssetsOpen,
      submenu: [
        { name: 'Stocks & Mutual Funds', id: 'stocks' }
      ]
    },
    // This one is a P2
    // {
    //   name: 'Retirement', 
    //   icon: 'elderly',
    //   id: 'retirement'
    // },
    {
      name: 'Cash & Bank',
      icon: 'account_balance',
      id: 'cash-bank',
      hasSubmenu: true,
      isOpen: cashBankOpen,
      setIsOpen: setCashBankOpen,
      submenu: [
        { name: 'Bank Accounts', id: 'savings' },
        { name: 'Deposits', id: 'fds' }
      ]
    },
    {
      name: 'Loans & Credit',
      icon: 'credit_card',
      id: 'loans-credit'
    },
    {
      name: 'Insurance',
      icon: 'verified_user',
      id: 'insurance'
    },
    {
      name: 'Locker',
      icon: 'lock',
      id: 'locker',
      hasSubmenu: true,
      isOpen: lockerOpen,
      setIsOpen: setLockerOpen,
      submenu: [
        // { name: 'Documents', id: 'documents' }, // This one is a P1
        { name: 'Notes', id: 'notes' },
        // { name: 'Passwords', id: 'passwords' } // This one is a P1
      ]
    },
    {
      name: 'Manage Family',
      icon: 'family_group',
      id: 'manage-family'
    },
    {
      name: 'Settings',
      icon: 'settings',
      id: 'settings'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[260px] bg-white border-r border-[#C3C6CE]/30 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo & Header */}
        <div className="flex items-center justify-between px-6 h-[80px] border-b border-[#C3C6CE]/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-[14px] flex items-center justify-center p-2 flex-shrink-0">
              <img src="/logo.svg" alt="Orelio Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-black font-sans leading-none">Orelio</span>
              <span className="block text-[9px] font-bold tracking-widest text-[#707975] uppercase mt-1">Wealth Ledger</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden flex items-center justify-center"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const isTabActive = activeTab === item.id || (item.submenu?.some(sub => sub.id === activeTab));

            if (item.hasSubmenu) {
              return (
                <div key={item.id} className="space-y-0">
                  <button
                    onClick={() => item.setIsOpen(!item.isOpen)}
                    className={`
                      group w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-[16px] transition-colors duration-200 text-left
                      ${isTabActive ? 'text-black' : 'text-[#707975] hover:text-black'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined select-none transition-transform duration-200 group-hover:scale-110 ${isTabActive ? 'font-bold' : ''}`}
                        style={{ fontSize: '20px' }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    <span className="material-symbols-outlined select-none text-[#707975]" style={{ fontSize: '20px' }}>
                      {item.isOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>

                  {/* Collapsible Submenu */}
                  {item.isOpen && (
                    <div className="pl-11 pr-2 -mt-1 space-y-0.5 transition-all duration-200">
                      {item.submenu?.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleTabClick(sub.id)}
                            className={`
                              w-full text-left block py-1.5 text-[16px] font-semibold transition-colors duration-200
                              ${isSubActive
                                ? 'text-black font-bold'
                                : 'text-[#707975] hover:text-black'
                              }
                            `}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[16px] transition-colors duration-200 text-left
                  ${isTabActive
                    ? 'text-black'
                    : 'text-[#707975] hover:text-black'
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined select-none transition-transform duration-200 group-hover:scale-110 ${isTabActive ? 'font-bold' : ''}`}
                  style={{ fontSize: '20px' }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-5 border-t border-[#C3C6CE]/20 bg-white">
          <div className="flex items-center gap-3">
            <img
              src="/alexander_bloom_avatar.png"
              alt={getUserProfile().name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-black truncate leading-tight">{getUserProfile().name}</span>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#707975] hover:text-[#BA1A1A] transition-colors mt-0.5 cursor-pointer group"
                title="Log out of account"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '13px' }}>
                  logout
                </span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={() => {
            setIsLogoutModalOpen(false);
            onLogout?.();
          }}
        />
      </aside>
    </>
  );
};
