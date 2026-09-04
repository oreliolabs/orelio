import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrimaryButton } from '../common/PrimaryButton';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

import { getBankAccounts, saveBankAccounts } from '../../data/orelioStore';
import type { BankAccount } from '../../data/types';

interface BankAccountsProps {
  isPrivate: boolean;
}

export const BankAccounts: React.FC<BankAccountsProps> = ({ isPrivate }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>(() => getBankAccounts());

  useEffect(() => {
    saveBankAccounts(accounts);
  }, [accounts]);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set(['2'])); // Seeding ICICI as expanded by default like in SVG
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Inline balance editing state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState<string>('');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Form states
  const [formBankName, setFormBankName] = useState('');
  const [formAccountType, setFormAccountType] = useState('Savings Account');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formIfscCode, setFormIfscCode] = useState('');
  const [formBalance, setFormBalance] = useState('');


  // Format helper
  const f = (val: string) => (isPrivate ? '••••' : val);
  const formatBankUpdateTime = (timestamp: number | string): string => {
    if (!timestamp) return 'just now';
    const num = typeof timestamp === 'number' ? timestamp : Number(timestamp);
    const date = !isNaN(num) ? new Date(num) : new Date(timestamp);
    if (isNaN(date.getTime())) {
      return String(timestamp);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) {
      return 'just now';
    }
    if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    }

    const isToday =
      now.getDate() === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      yesterday.getDate() === date.getDate() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getFullYear() === date.getFullYear();

    if (isYesterday) {
      return `yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}`;
    }

    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(num).replace('INR', '₹');
  };

  // Close dropdown on clicking elsewhere
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isAddEditOpen || isDeleteOpen || isHistoryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddEditOpen, isDeleteOpen, isHistoryOpen]);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    const next = new Set(expandedCardIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedCardIds(next);
  };

  // Aggregate stats
  const totalLiquidity = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Filter & Sort
  const filteredAndSortedAccounts = React.useMemo(() => {
    return [...accounts].reverse();
  }, [accounts]);

  // Handle inline balance save
  const handleSaveBalance = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const val = parseFloat(editBalanceValue);
    if (isNaN(val)) return;

    setAccounts(prev => prev.map(acc =>
      acc.id === id
        ? { ...acc, balance: val, lastUpdated: Date.now() }
        : acc
    ));
    setEditingAccountId(null);
  };

  const handleCancelBalance = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccountId(null);
  };

  // Add / Edit Account Modal handlers
  const handleAddClick = () => {
    setSelectedAccount(null);
    setFormBankName('');
    setFormAccountType('Savings Account');
    setFormAccountNumber('');
    setFormIfscCode('');
    setFormBalance('');
    setIsAddEditOpen(true);
  };

  const handleEditClick = (acc: BankAccount) => {
    setSelectedAccount(acc);
    setFormBankName(acc.bankName);
    setFormAccountType(acc.accountType);
    setFormAccountNumber(acc.accountNumber);
    setFormIfscCode(acc.ifscCode);
    setFormBalance(acc.balance.toString());
    setIsAddEditOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(formBalance) || 0;

    if (selectedAccount) {
      // Editing
      setAccounts(prev => prev.map(acc =>
        acc.id === selectedAccount.id
          ? {
            ...acc,
            bankName: formBankName,
            accountType: formAccountType,
            accountNumber: formAccountNumber,
            ifscCode: formIfscCode,
            balance: bal,
            lastUpdated: Date.now()
          }
          : acc
      ));
    } else {
      // Adding new
      const newAcc: BankAccount = {
        id: Date.now().toString(),
        bankName: formBankName,
        accountType: formAccountType,
        accountNumber: formAccountNumber,
        ifscCode: formIfscCode,
        balance: bal,
        lastUpdated: Date.now()
      };
      setAccounts(prev => [...prev, newAcc]);
    }
    setIsAddEditOpen(false);
  };

  // Delete handlers
  const handleDeleteConfirm = () => {
    if (selectedAccount) {
      setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
      setIsDeleteOpen(false);
      setSelectedAccount(null);
    }
  };

  return (
    <div className="space-y-6 fade-in p-2">
      {/* Header section */}
      {accounts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-orelio-navy tracking-tight">Bank Accounts</h2>
            <p className="text-sm text-orelio-gray mt-1 font-medium">
              Manage and monitor your liquidity across all bank accounts.
            </p>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-20 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[36px]">
              account_balance
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#00162A] tracking-tight">No Bank Accounts Yet</h3>
          <p className="text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Track and monitor your savings, current, and salary bank accounts all in one secure place.
          </p>
          <div className="mt-6">
            <PrimaryButton
              onClick={handleAddClick}
              icon="add"
            >
              Add Your First Bank Account
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          {/* TOTAL LIQUIDITY CARD */}
          <div
            className="bg-white rounded-4xl border border-[#C3C6CE]/10 px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.02)' }}
          >
            <div className="space-y-4">
              <span className="block text-[12px] font-black text-[#006A65] uppercase" style={{ letterSpacing: '2.4px' }}>Total Liquidity</span>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-3xl font-extrabold text-orelio-navy">
                  {f(formatCurrency(totalLiquidity))}
                </span>
                {/* <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#006A65]/10 text-[#006A65] text-xs font-semibold">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 400", fontSize: '16px' }}>trending_up</span>
                  +12.3% vs last year
                </span> */}
              </div>
              <p className="text-sm text-[#73777E] font-medium">
                Combined cash balance across <span className="text-[#00162A] font-semibold">{accounts.length} accounts</span>
              </p>
            </div>
            <PrimaryButton
              onClick={handleAddClick}
              icon="add"
              className="self-start sm:self-center"
            >
              New Bank Account
            </PrimaryButton>
          </div>


          {/* BANK ACCOUNTS LIST */}
          <div className="space-y-4">
            {filteredAndSortedAccounts.length > 0 ? (
              filteredAndSortedAccounts.map((account) => {
                const isExpanded = expandedCardIds.has(account.id);
                const isEditing = editingAccountId === account.id;

                return (
                  <div
                    key={account.id}
                    onClick={() => !isEditing && toggleExpand(account.id)}
                    className={`group bg-white rounded-3xl border-2 border-[#C3C6CE]/20 hover:border-[#006A65]/80 hover:shadow-[0px_8px_24px_rgba(0,106,101,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out relative z-0 ${activeMenuId === account.id ? 'z-20' : ''
                      }`}
                  >
                    {/* Main Card Header */}
                    <div className="p-5 flex items-start justify-between gap-4 cursor-pointer">
                      <div className="flex items-start gap-4">
                        {/* Bank Icon Container */}
                        <div className="w-10 h-10 rounded-2xl bg-[#F2F4F5] text-[#00162A] group-hover:bg-[#006A65] group-hover:text-white group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ease-out flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-6" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500", fontSize: '20px' }}>account_balance</span>
                        </div>
                        {/* Bank metadata */}
                        <div className="space-y-1">
                          <span className="block text-[10px] font-black tracking-widest text-[#006A65] uppercase">
                            {account.accountType}
                          </span>
                          <h4 className="text-base font-bold text-orelio-navy group-hover:text-[#006A65] transition-colors duration-300">
                            {account.bankName}
                          </h4>
                          <p className="text-xs text-[#73777E] font-medium flex items-center gap-1">
                            Last updated {formatBankUpdateTime(account.lastUpdated)}
                          </p>
                        </div>
                      </div>

                      {/* Right balance & menu actions */}
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-[#C3C6CE]/40 rounded-xl overflow-hidden bg-white">
                              <span className="bg-gray-50 px-3 py-1.5 border-r border-[#C3C6CE]/40 text-sm font-semibold text-orelio-navy">
                                ₹
                              </span>
                              <input
                                type="text"
                                value={editBalanceValue}
                                onChange={(e) => setEditBalanceValue(e.target.value)}
                                className="px-3 py-1.5 text-sm font-bold text-orelio-navy w-32 focus:outline-none bg-transparent"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={(e) => handleSaveBalance(e, account.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E6F4EA] text-[#137333] hover:bg-[#D2EBD4] hover:scale-110 active:scale-95 transition-all"
                            >
                              <span className="material-symbols-outlined font-bold" style={{ fontSize: '20px' }}>check</span>
                            </button>
                            <button
                              onClick={handleCancelBalance}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] hover:scale-110 active:scale-95 transition-all"
                            >
                              <span className="material-symbols-outlined font-bold" style={{ fontSize: '20px' }}>close</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-extrabold text-orelio-navy group-hover:scale-105 transition-transform duration-300">
                              {f(formatCurrency(account.balance))}
                            </span>
                            <span className={`material-symbols-outlined text-[#74777F] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === account.id ? null : account.id);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                            </button>
                          </div>
                        )}

                        {/* Dropdown Menu */}
                        {activeMenuId === account.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-[#C3C6CE]/20 rounded-xl shadow-lg py-1.5 space-y-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                              onClick={() => {
                                setEditingAccountId(account.id);
                                setEditBalanceValue(account.balance.toString());
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-[#3F4945] hover:bg-gray-50"
                            >
                              Edit Balance
                            </button>
                            <button
                              onClick={() => {
                                handleEditClick(account);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-[#3F4945] hover:bg-gray-50"
                            >
                              Edit Bank Details
                            </button>
                            {/* <button
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsHistoryOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-[#3F4945] hover:bg-gray-50"
                            >
                              View Past Balances
                            </button> */}
                            <button
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsDeleteOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-[#BA1A1A] hover:bg-red-50"
                            >
                              Delete Bank Account
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details drawer */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pt-2 border-t border-[#C3C6CE]/15 flex flex-wrap gap-8 items-center text-xs">
                          <div>
                            <span className="block text-[10px] font-bold text-[#73777E] uppercase tracking-wider">Account Number</span>
                            <span className="font-bold text-orelio-navy text-sm mt-0.5 block">{account.accountNumber?.trim() ? f(account.accountNumber) : '-'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-[#73777E] uppercase tracking-wider">IFSC Code</span>
                            <span className="font-bold text-orelio-navy text-sm mt-0.5 block">{account.ifscCode?.trim() ? f(account.ifscCode) : '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-[#C3C6CE]/20 rounded-2xl">
                <span className="material-symbols-outlined text-gray-300 select-none" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                <p className="text-base font-bold text-orelio-navy mt-3">No bank accounts found</p>
                <p className="text-sm text-gray-400 mt-1">Try matching another keyword or register a new bank account.</p>
              </div>
            )}
          </div>

          {/* CONSOLIDATED INTELLIGENCE CARD */}
          {/* <div className="bg-[#00162A] text-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[#006A65]/10 to-transparent pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#006A65] flex items-center justify-center flex-shrink-0 text-white shadow-md">
                <span className="material-symbols-outlined text-[24px]">insights</span>
              </div>
              <div className="space-y-1.5 max-w-xl">
                <h4 className="text-base font-bold">Consolidated Intelligence</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  You have liquidity across {accounts.length} accounts. Consider moving under-utilized funds to high-yield FDs to <span className="text-[#00B4A9] font-bold">maximize returns</span> annually.
                </p>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-white text-orelio-navy text-xs font-bold rounded-xl hover:bg-gray-100 active:scale-97 transition-all flex-shrink-0 self-start md:self-center relative z-10 shadow-lg">
              Add FDs & RDs
            </button>
          </div> */}
        </>
      )}

      {/* ADD/EDIT BANK ACCOUNT MODAL */}
      {isAddEditOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsAddEditOpen(false)} />
          <form
            onSubmit={handleSaveAccount}
            className="relative flex flex-col bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 flex-shrink-0">
              <h3 className="text-lg font-bold text-orelio-navy">
                {selectedAccount ? 'Edit Bank Account' : accounts.length === 0 ? 'Add Your First Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Scrollable Inputs Area */}
            <div className="flex-1 flex flex-col space-y-6 py-4 overflow-y-auto min-h-0 pr-1">
              {/* Row 1: Bank Name & Account Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">
                    Bank Name <span className="text-[#BA1A1A] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="e.g. Kotak Bank Account"
                    className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">
                    Account Type <span className="text-[#BA1A1A] ml-0.5">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={formAccountType}
                      onChange={(e) => setFormAccountType(e.target.value)}
                      className="w-full pl-[11px] pr-9 py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all appearance-none cursor-pointer"
                    >
                      <option value="Savings Account">Savings</option>
                      <option value="Current Account">Current</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3.5 text-orelio-navy/70 select-none" style={{ fontSize: '18px' }}>
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Account Number & IFSC Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">Account Number (Optional)</label>
                  <input
                    type="text"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    placeholder="e.g. 1234 1234 1234"
                    className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">IFSC Code (Optional)</label>
                  <input
                    type="text"
                    value={formIfscCode}
                    onChange={(e) => setFormIfscCode(e.target.value)}
                    placeholder="e.g. KKBK0000234"
                    className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Balance */}
              <div className="space-y-2 flex-shrink-0">
                <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">
                  Balance (INR) <span className="text-[#BA1A1A] ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  placeholder="Enter current balance..."
                  className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C3C6CE]/15 flex-shrink-0">
              <CancelButton onClick={() => setIsAddEditOpen(false)} />
              <SaveButton type="submit">
                Save
              </SaveButton>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* VIEW PAST BALANCES / HISTORY MODAL */}
      {isHistoryOpen && selectedAccount && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsHistoryOpen(false)} />
          <div
            className="relative flex flex-col bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200"
            style={{ width: '40vw', height: '40vw', minWidth: '350px', minHeight: '350px' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-orelio-navy">{selectedAccount.bankName}</h3>
                <p className="text-xs text-[#73777E] mt-0.5">Historical monthly liquidity trends</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Sparkline & history list */}
            <div className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
              <div className="h-28 w-full border border-gray-100 rounded-xl bg-gray-50/50 p-2 flex flex-col justify-end relative">
                {/* SVG trend line */}
                <svg className="w-full h-16" viewBox="0 0 300 50" preserveAspectRatio="none">
                  <path
                    d="M0 45 Q 60 40, 120 30 T 240 15 T 300 5"
                    fill="none"
                    stroke="#006A65"
                    strokeWidth="2"
                  />
                  <circle cx="300" cy="5" r="4" fill="#006A65" stroke="white" strokeWidth="1.5" />
                </svg>
                <div className="flex justify-between text-[10px] font-bold text-orelio-gray px-1 pt-2">
                  <span>SEP</span>
                  <span>OCT</span>
                  <span>NOV</span>
                  <span>DEC</span>
                  <span>JAN</span>
                  <span>CURRENT</span>
                </div>
              </div>

              {/* Text list of historical data points */}
              <div className="flex-1 overflow-y-auto pr-1 text-sm font-semibold text-orelio-navy space-y-2">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#73777E]">Current Balance</span>
                  <span>{f(formatCurrency(selectedAccount.balance))}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#73777E]">1 Month Ago</span>
                  <span>{f(formatCurrency(selectedAccount.balance * 0.98))}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#73777E]">2 Months Ago</span>
                  <span>{f(formatCurrency(selectedAccount.balance * 0.95))}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-[#73777E]">3 Months Ago</span>
                  <span>{f(formatCurrency(selectedAccount.balance * 0.90))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE ACCOUNT MODAL */}
      {isDeleteOpen && selectedAccount && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-3 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Graphic */}
            <div className="mx-auto flex justify-center">
              <svg className="transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer origin-center" width="82" height="104" viewBox="0 0 82 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M35.0547 18.8154C46.2332 18.8035 58.1784 16.5893 66.9926 23.1441C76.6139 30.299 83.1824 42.0331 81.8217 53.594C80.5386 64.4953 68.7147 70.1723 60.548 77.8995C52.4369 85.5743 46.4194 96.7031 35.0547 97.8446C23.0447 99.0509 10.3675 93.1323 3.55753 83.6237C-2.59729 75.0299 3.42655 64 3.36292 53.594C3.29854 43.066 -4.05418 31.1597 3.1881 23.212C10.5057 15.1817 23.8972 18.8273 35.0547 18.8154Z" fill="#FFF0EF" />
                <path d="M33.5333 61L36.9999 57.5333L40.4666 61L42.3333 59.1333L38.8666 55.6667L42.3333 52.2L40.4666 50.3333L36.9999 53.8L33.5333 50.3333L31.6666 52.2L35.1333 55.6667L31.6666 59.1333L33.5333 61ZM30.3333 67C29.5999 67 28.9721 66.7389 28.4499 66.2167C27.9277 65.6944 27.6666 65.0667 27.6666 64.3333V47H26.3333V44.3333H32.9999V43H40.9999V44.3333H47.6666V47H46.3333V64.3333C46.3333 65.0667 46.0721 65.6944 45.5499 66.2167C45.0277 65.6944 44.3999 67 43.6666 67H30.3333Z" fill="#BA1A1A" />
              </svg>
            </div>

            {/* Content text */}
            <div className="space-y-2 mt-1">
              <h3 className="text-lg font-bold text-orelio-navy">Delete Bank Account?</h3>
              <p className="text-sm text-[#43474D] leading-relaxed font-medium">
                Once deleted, all historical records and balances for this account will be permanently removed.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-[#3F4945] bg-[#E6E8E9] rounded-xl hover:bg-[#D5D7D8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#BA1A1A] rounded-xl hover:bg-[#A61313] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
