import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import type { FamilyMember } from './ManageFamily';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  selectedMember: FamilyMember | null;
  onSave: (updatedOrNewMember: FamilyMember) => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  selectedMember,
  onSave
}) => {
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRole, setFormRole] = useState('Child');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [formIsDependent, setFormIsDependent] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD for date input
  const toDateInputValue = (dmy: string): string => {
    if (!dmy) return '';
    if (dmy.includes('-')) return dmy;
    const parts = dmy.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dmy;
  };

  // Helper to convert YYYY-MM-DD back to DD/MM/YYYY
  const toDisplayDmy = (ymd: string): string => {
    if (!ymd) return '';
    if (ymd.includes('/')) return ymd;
    const parts = ymd.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return ymd;
  };

  // Sync state with selectedMember when it changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormFirstName(selectedMember?.firstName || '');
      setFormLastName(selectedMember?.lastName || '');
      setFormRole(selectedMember?.role || 'Child');
      setFormDob(toDateInputValue(selectedMember?.dob || ''));
      setFormGender(selectedMember?.gender || 'Female');
      setFormIsDependent(selectedMember?.isDependent ?? false);
    }
  }, [isOpen, selectedMember]);

  // Lock background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formDob.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSaving(true);

    const displayDob = toDisplayDmy(formDob);

    const memberData: FamilyMember = {
      id: selectedMember?.id || Date.now().toString(),
      firstName: formFirstName,
      lastName: formLastName,
      role: formRole,
      dob: displayDob,
      isDependent: formIsDependent,
      gender: formGender
    };

    // Brief save animation then call onSave
    setTimeout(() => {
      setIsSaving(false);
      onSave(memberData);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#C3C6CE]/25 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#C3C6CE]/15">
          <h3 className="text-base font-bold text-orelio-navy">
            {isEditing ? 'Edit Member' : 'Add Family Member'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-orelio-gray hover:bg-orelio-light-gray hover:text-orelio-navy transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">
                First Name <span className="text-[#BA1A1A] ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">
                Last Name
              </label>
              <input
                type="text"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
              />
            </div>
          </div>

          {/* Role selection & DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">
                Relation <span className="text-[#BA1A1A] ml-0.5">*</span>
              </label>
              <div className="relative flex items-center">
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full pl-3 pr-9 py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all appearance-none cursor-pointer"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 text-orelio-navy/70 select-none" style={{ fontSize: '18px' }}>
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">
                Date of Birth <span className="text-[#BA1A1A] ml-0.5">*</span>
              </label>
              <input
                type="date"
                required
                value={formDob}
                onChange={(e) => setFormDob(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch {}
                }}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 ${
                  !formDob
                    ? 'text-orelio-navy/50 [&::-webkit-datetime-edit]:text-orelio-navy/50'
                    : 'text-orelio-navy [&::-webkit-datetime-edit]:text-orelio-navy'
                }`}
              />
            </div>
          </div>

          {/* Gender radio selectors */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">
              Gender <span className="text-[#BA1A1A] ml-0.5">*</span>
            </label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm font-semibold text-orelio-navy cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formGender === g}
                    onChange={() => setFormGender(g as 'Male' | 'Female' | 'Other')}
                    className="w-4 h-4 accent-orelio-darkgreen"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dependent toggle Switch with hover tooltip info trigger */}
          <div className="flex items-center justify-between py-3.5 px-1.5">
            <div className="flex items-center gap-1.5 pr-2">
              <span className="font-bold text-orelio-navy text-xs sm:text-sm">Mark as Dependent</span>

              {/* Tooltip trigger */}
              <div
                className="relative cursor-pointer text-orelio-gray hover:text-orelio-navy"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info size={14} />

                {showTooltip && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 rounded-xl bg-orelio-navy text-white text-[10px] font-medium leading-relaxed shadow-lg z-50 text-center pointer-events-none">
                    Dependents are members whose financial ledger is managed under the main owner's tax calculations.
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormIsDependent(!formIsDependent)}
              className={`w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ${formIsDependent ? 'bg-orelio-darkgreen' : 'bg-orelio-light-gray'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formIsDependent ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C3C6CE]/15 mt-4">
            <CancelButton onClick={onClose} />
            <SaveButton
              type="submit"
              isSaving={isSaving}
            >
              Save Profile
            </SaveButton>
          </div>

        </form>
      </div>
    </div>
  );
};
