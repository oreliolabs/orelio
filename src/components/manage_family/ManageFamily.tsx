import React from 'react';
// import {
//   PiggyBank,
//   ShieldCheck,
//   Check
// } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
export { EditMemberModal } from './EditMemberModal';
export { RemoveMemberModal } from './RemoveMemberModal';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  dob: string;
  age?: number;
  isDependent: boolean;
  gender: 'Male' | 'Female' | 'Other';
  avatarColor?: string;
}

export const calculateAge = (dobString?: string): number => {
  if (!dobString) return 0;
  try {
    let day = 0, month = 0, year = 0;
    if (dobString.includes('-')) {
      const parts = dobString.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }
    } else if (dobString.includes('/')) {
      const parts = dobString.split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }
    if (!year) return 0;

    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return Math.max(0, age);
  } catch {
    return 0;
  }
};

interface ManageFamilyProps {
  isPrivate: boolean;
  members: FamilyMember[];
  onEditClick: (member: FamilyMember) => void;
  onRemoveClick: (member: FamilyMember) => void;
  onAddClick: () => void;
}

export const ManageFamily: React.FC<ManageFamilyProps> = ({
  isPrivate: _isPrivate,
  members,
  onEditClick,
  onRemoveClick,
  onAddClick
}) => {
  // Dynamic style calculation for avatars matching the reference SVG colors
  const getAvatarStyle = (role: string) => {
    if (role === 'Self') {
      return { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' };
    } else if (role === 'Spouse') {
      return { bg: 'bg-[#FFF1F2]', text: 'text-[#E11D48]' };
    } else if (role === 'Child') {
      return { bg: 'bg-[#F0FDFA]', text: 'text-[#0D9488]' };
    } else if (role === 'Mother' || role === 'Father') {
      return { bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]' };
    }
    else {
      return { bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]' };
    }
  };

  return (
    <div className="space-y-8 fade-in px-1 pb-2">

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-orelio-navy mt-1">Manage Family</h2>
          <p className="text-sm text-orelio-gray font-medium mt-1">Manage your inner circle to optimise your joint financial goals.</p>
        </div>
        <PrimaryButton
          onClick={onAddClick}
          icon="person_add"
        >
          Add Members
        </PrimaryButton>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: 'rgba(191, 201, 196, 0.3)' }} />

      {/* Main Family Cards List: Full width single column layout */}
      <div className="flex flex-col gap-4">
        {members.map((member) => {
          const avatarStyle = getAvatarStyle(member.role);
          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl py-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between border border-[#C3C6CE]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Square Avatar Badge with First Letter */}
                <div className={`w-[45px] h-[45px] rounded-[15px] ${avatarStyle.bg} ${avatarStyle.text} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
                  {member.firstName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orelio-navy text-base truncate">
                      {[member.firstName, member.lastName].filter(Boolean).join(' ')}
                    </span>

                    {member.isDependent && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-orelio-darkgreen text-[9px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orelio-darkgreen"></span>
                        Dependent
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-orelio-gray font-medium mt-1">
                    DOB: {member.dob}
                    <span className="mx-1.5">•</span>
                    Age: {calculateAge(member.dob)} yrs
                    <span className="mx-1.5">•</span>
                    Role: {member.role}
                  </div>
                </div>
              </div>

              {/* Actions Panel with Text and Icons matching SVG (visible only on hover) */}
              <div className="flex items-center gap-5 mt-3 sm:mt-0 ml-16 sm:ml-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEditClick(member)}
                  className="flex flex-col items-center gap-0 text-[9px] font-extrabold text-[#3F4945] hover:text-[#2a322e] tracking-widest uppercase transition-colors"
                  title="Edit member details"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                  </span>
                  <span>EDIT</span>
                </button>
                {member.role !== 'Self' && (
                  <button
                    onClick={() => onRemoveClick(member)}
                    className="flex flex-col items-center gap-0 text-[9px] font-extrabold text-[#BA1A1A] hover:text-[#9B1414] tracking-widest uppercase transition-colors"
                    title="Remove family member"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-50 transition-colors duration-200">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                    </span>
                    <span>REMOVE</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid: Family Tax Optimization & Privacy Info (Commented out)
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        Tax Optimization card
        <div className="lg:col-span-2 glass-card-dark p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 text-emerald-800/10 opacity-30 transform -rotate-12 group-hover:scale-105 transition-transform duration-300">
            <PiggyBank size={180} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <PiggyBank size={16} />
              </span>
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Family Tax Optimization</span>
            </div>

            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl font-bold text-white leading-snug">Maximize family tax exemptions</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                By linking family portfolios, you could potentially save up to <strong className="text-white font-bold">{f('₹1.2L')}</strong> in joint tax deductions this fiscal year.
              </p>
            </div>
          </div>

          <button className="relative z-10 w-full sm:w-auto self-start mt-6 px-5 py-2.5 rounded-xl border border-white text-white text-xs font-bold shadow-md hover:bg-white hover:text-forest-900 active:scale-97 transition-all">
            View Insights
          </button>
        </div>

        Privacy Info Card
        <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col items-center text-center justify-between border border-[#C3C6CE]/35 relative overflow-hidden group shadow-sm">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-orelio-darkgreen flex items-center justify-center border border-teal-100 mb-2">
              <ShieldCheck size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-orelio-navy leading-snug">Data Privacy</h3>
              <p className="text-xs text-orelio-gray leading-relaxed font-medium max-w-[240px]">
                Family data is encrypted and only accessible by authorized members.
              </p>
            </div>
          </div>

          <div className="w-full mt-6 flex items-center justify-center gap-2 text-xs font-bold text-orelio-navy">
            <Check size={14} className="text-orelio-darkgreen" />
            <span>GDPR & ISO Compliant</span>
          </div>
        </div>

      </div>
      */}

    </div>
  );
};
