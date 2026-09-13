import React, { useState, useEffect } from 'react';
import type { Policy, PolicyFormData, PolicyType } from './InsuranceTypes';
import { getPolicies, savePolicies, getPrimaryMemberId } from '../../data/orelioStore';
import { AddEditPolicyModal } from './AddEditPolicyModal';
import { DeletePolicyModal } from './DeletePolicyModal';
import { PrimaryButton } from '../common/PrimaryButton';

interface InsuranceProps {
  isPrivate: boolean;
  selectedMemberId?: string | 'all';
}

export const Insurance: React.FC<InsuranceProps> = ({ isPrivate, selectedMemberId = 'all' }) => {
  const [policies, setPolicies] = useState<Policy[]>(() => getPolicies(selectedMemberId));

  useEffect(() => {
    savePolicies(policies, selectedMemberId);
  }, [policies, selectedMemberId]);

  // Modal & Menu states
  const [activeMenuPolicyId, setActiveMenuPolicyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<Policy | null>(null);

  // Close More menu on click outside or Escape key
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.policy-menu-container')) {
        setActiveMenuPolicyId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuPolicyId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Formatting helpers
  const formatCurrency = (val: number | undefined | null) => {
    return '₹ ' + (val || 0).toLocaleString('en-IN');
  };

  const formatDate = (dateVal: number | string) => {
    if (!dateVal) return 'N/A';
    try {
      const num = typeof dateVal === 'number' ? dateVal : Number(dateVal);
      const d = !isNaN(num) ? new Date(num) : new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  const toEpoch = (dateVal: string | number): number => {
    if (!dateVal) return Date.now();
    if (typeof dateVal === 'number') return dateVal;
    const trimmed = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return Date.UTC(y, m - 1, d);
    }
    const parsed = Date.parse(trimmed);
    return !isNaN(parsed) ? parsed : Date.now();
  };

  const getPolicyIcon = (type: PolicyType) => {
    switch (type) {
      case 'Property Insurance':
        return 'home';
      case 'Health Insurance':
        return 'health_and_safety';
      case 'Motor Insurance':
        return 'directions_car';
      case 'Life Insurance':
      case 'Term Insurance':
        return 'shield';
      case 'Travel Insurance':
        return 'flight';
      default:
        return 'verified_user';
    }
  };

  // Calculations
  const activeCount = policies.length;
  // Calculate monthly premium estimate ($3,045 when 3 annual policies of 15200 => (15200*3)/12 = 3800, or exact sum / 12)
  const monthlyPremiumEstimate = policies.reduce((acc, pol) => {
    const prem = pol.premiumAmount ?? (pol as any).annualPremium ?? 0;
    switch (pol.premiumFrequency) {
      case 'Monthly':
        return acc + prem;
      case 'Quarterly':
        return acc + prem / 3;
      case 'Half-Yearly':
        return acc + prem / 6;
      case 'Annual':
      default:
        return acc + prem / 12;
    }
  }, 0);

  // Save policy handler (Create or Edit)
  const handleSavePolicy = (formData: PolicyFormData) => {
    const premAmount = parseFloat(formData.premiumAmount || '0') || 0;
    const startEpoch = toEpoch(formData.startDate);
    const expiryEpoch = toEpoch(formData.expiryDate);
    if (editingPolicy) {
      setPolicies(prev =>
        prev.map(p =>
          p.id === editingPolicy.id
            ? {
              ...p,
              policyType: formData.policyType,
              provider: formData.provider,
              policyName: formData.policyName,
              policyNumber: formData.policyNumber,
              premiumAmount: premAmount,
              premiumFrequency: formData.premiumFrequency,
              sumInsured: parseFloat(formData.sumInsured) || 0,
              startDate: startEpoch,
              expiryDate: expiryEpoch,
              memberId: p.memberId || (selectedMemberId === 'all' ? getPrimaryMemberId() : selectedMemberId)
            }
            : p
        )
      );
    } else {
      const targetMemberId = selectedMemberId === 'all' ? getPrimaryMemberId() : selectedMemberId;
      const newPolicy: Policy = {
        id: 'pol-' + Date.now(),
        policyType: formData.policyType,
        provider: formData.provider,
        policyName: formData.policyName,
        policyNumber: formData.policyNumber,
        premiumAmount: premAmount,
        premiumFrequency: formData.premiumFrequency,
        sumInsured: parseFloat(formData.sumInsured) || 0,
        startDate: startEpoch,
        expiryDate: expiryEpoch,
        memberId: targetMemberId
      };
      setPolicies(prev => [...prev, newPolicy]);
    }
  };

  // Delete policy handler
  const handleDeletePolicy = () => {
    if (deletingPolicy) {
      setPolicies(prev => prev.filter(p => p.id !== deletingPolicy.id));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-4 sm:pb-6">
      {/* Page Header */}
      {policies.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#00162A] tracking-tight">Insurance Portfolio</h1>
            <p className="text-xs sm:text-sm font-medium text-[#707975] mt-1">
              Manage your risk coverage and active policies.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <PrimaryButton
              onClick={() => {
                setEditingPolicy(null);
                setIsAddModalOpen(true);
              }}
              icon="add"
              className="w-full sm:w-auto justify-center"
            >
              Add New Policy
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Content Area: Empty State OR KPI Cards + Active Coverage */}
      {policies.length === 0 ? (
        <div className="text-center py-12 sm:py-20 px-4 sm:px-6 flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[32px] sm:text-[36px]">
              shield
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#00162A] tracking-tight">No Insurance Policies Yet</h3>
          <p className="text-xs sm:text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Track your life, health, vehicle, and property insurance coverage all in one secure place.
          </p>
          <div className="mt-6 w-full sm:w-auto">
            <PrimaryButton
              onClick={() => {
                setEditingPolicy(null);
                setIsAddModalOpen(true);
              }}
              icon="add"
              className="w-full sm:w-auto justify-center"
            >
              Add Your First Policy
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal Divider */}
          <div className="w-full h-[1px] bg-[#C3C6CE]/30" />

          {/* Summary KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Active Policies Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-[0_12px_28px_0_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
                ACTIVE POLICIES
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#00162A] mt-2 sm:mt-3">
                {String(activeCount).padStart(2, '0')}
              </span>
            </div>

            {/* Estimated Premium Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#C3C6CE]/30 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-[0_12px_28px_0_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-[#006A65] uppercase">
                ESTIMATED PREMIUM FOR THIS MONTH
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#00162A] mt-2 sm:mt-3 break-words">
                {isPrivate ? '••••••' : formatCurrency(Math.round(monthlyPremiumEstimate))}
              </span>
            </div>
          </div>

          {/* Active Coverage Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 sm:gap-4 w-full pt-1 sm:pt-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[#00162A] tracking-tight whitespace-nowrap">
                Active Coverage
              </h2>
              <div className="flex-1 h-[1px] bg-[#C3C6CE]/30" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold text-[#74777F] bg-[#F2F4F5] uppercase tracking-wider whitespace-nowrap">
                {policies.length} {policies.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Policy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {policies.map((policy) => {
                const isMenuOpen = activeMenuPolicyId === policy.id;
                const isExpired = policy.expiryDate ? policy.expiryDate < Date.now() : false;

                return (
                  <div
                    key={policy.id}
                    className={`
                      rounded-2xl sm:rounded-3xl bg-white border border-[#C3C6CE]/30 p-4 sm:p-6 space-y-3.5 sm:space-y-4 transition-all duration-300
                      hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:border-[#006A65]/40 hover:shadow-[0_12px_28px_-2px_rgba(0,106,101,0.05)]
                      group relative
                      ${isMenuOpen ? 'z-50' : 'z-0'}
                    `}
                  >
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E6F4F1] group-hover:bg-[#006A65] text-[#006A65] group-hover:text-white flex items-center justify-center transition-all duration-300 shrink-0">
                          <span className="material-symbols-outlined select-none text-[20px] sm:text-[24px]">
                            {getPolicyIcon(policy.policyType)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="block text-[9px] sm:text-[10px] font-extrabold tracking-widest text-[#006A65] uppercase truncate">
                              {policy.policyType}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isExpired ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]' : 'bg-[#006A65]/10 text-[#006A65]'
                              }`}
                            >
                              {isExpired ? 'Expired' : 'Active'}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#00162A] group-hover:text-[#006A65] transition-colors leading-tight truncate mt-0.5">
                            {policy.policyName}
                          </h3>
                          {policy.policyNumber && (
                            <span className="block text-[11px] sm:text-xs font-semibold text-[#707975] mt-0.5 truncate">
                              {policy.policyNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Context Menu Trigger & Popover */}
                      <div className="relative policy-menu-container shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveMenuPolicyId(isMenuOpen ? null : policy.id)}
                          className="w-9 h-9 rounded-full hover:bg-[#F2F4F5] flex items-center justify-center text-[#707975] transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <span className="material-symbols-outlined select-none text-[20px]">more_vert</span>
                        </button>

                        {/* Popover Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-[#C3C6CE]/30 py-1.5 z-50 overflow-hidden animate-in fade-in duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuPolicyId(null);
                                setEditingPolicy(policy);
                                setIsAddModalOpen(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#3F4945] hover:bg-[#F2F4F5] transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined select-none text-[18px]">edit</span>
                              <span>Edit Policy</span>
                            </button>
                            <div className="border-t border-[#C3C6CE]/20" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuPolicyId(null);
                                setDeletingPolicy(policy);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#BA1A1A] hover:bg-[#FFF8F7] transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined select-none text-[18px]">delete</span>
                              <span>Delete Policy</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sum Insured / Assured Block */}
                    <div className="pt-2 sm:pt-3 border-t border-[#C3C6CE]/20 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-[#707975]">Sum Insured</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-[#00162A] truncate">
                        {isPrivate ? '••••••' : formatCurrency(policy.sumInsured)}
                      </span>
                    </div>

                    {/* 2x2 Key-Value Data Grid */}
                    <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6 pt-1">
                      <div>
                        <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-[#73777E] uppercase">
                          PREMIUM AMOUNT
                        </span>
                        <span className="block text-xs sm:text-sm font-medium text-[#00162A] mt-0.5 truncate">
                          {isPrivate ? '••••' : formatCurrency(policy.premiumAmount ?? (policy as any).annualPremium ?? 0)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-[#73777E] uppercase">
                          FREQUENCY
                        </span>
                        <span className="block text-xs sm:text-sm font-medium text-[#00162A] mt-0.5 truncate">
                          {policy.premiumFrequency}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-[#73777E] uppercase">
                          START DATE
                        </span>
                        <span className="block text-xs sm:text-sm font-medium text-[#00162A] mt-0.5 truncate">
                          {formatDate(policy.startDate)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-[#73777E] uppercase">
                          RENEWAL DATE
                        </span>
                        <span className="block text-xs sm:text-sm font-medium text-[#00162A] mt-0.5 truncate">
                          {formatDate(policy.expiryDate)}
                        </span>
                      </div>
                    </div>

                    {/* Footer Provider */}
                    <div className="pt-2.5 sm:pt-3 border-t border-[#C3C6CE]/15 text-xs flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[#707975]">Provider: </span>
                        <span className="font-bold text-[#00162A] truncate">{policy.provider || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AddEditPolicyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingPolicy={editingPolicy}
        onSave={handleSavePolicy}
        isFirstPolicy={policies.length === 0}
      />

      <DeletePolicyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        policy={deletingPolicy}
        onConfirm={handleDeletePolicy}
      />
    </div>
  );
};
