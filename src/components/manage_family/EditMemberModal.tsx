import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import type { FamilyMember } from './ManageFamily';
import { SaveButton } from '../common/SaveButton';

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

  const handleSaveClick = () => {
    // Only animate if all required fields are filled
    if (!formFirstName.trim() || !formLastName.trim() || !formDob.trim()) return;
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 700);
  };

  // Sync state with selectedMember when it changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormFirstName(selectedMember?.firstName || '');
      setFormLastName(selectedMember?.lastName || '');
      setFormRole(selectedMember?.role || 'Child');
      setFormDob(selectedMember?.dob || '');
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

  const calculateAge = (dobString: string): number => {
    try {
      const parts = dobString.split('/');
      if (parts.length !== 3) return 30;
      const birthYear = parseInt(parts[2], 10);
      const currentYear = new Date().getFullYear();
      return Math.max(0, currentYear - birthYear);
    } catch {
      return 30;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim() || !formDob.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const calculatedAge = calculateAge(formDob);
    let avatarGrad = 'from-teal-500 to-cyan-600';
    if (formGender === 'Female') {
      avatarGrad = 'from-pink-500 to-purple-600';
    } else if (formRole === 'Child') {
      avatarGrad = 'from-amber-400 to-orange-500';
    }

    const memberData: FamilyMember = {
      id: selectedMember?.id || Date.now().toString(),
      firstName: formFirstName,
      lastName: formLastName,
      role: formRole,
      dob: formDob,
      age: calculatedAge,
      isDependent: formIsDependent,
      gender: formGender,
      avatarColor: selectedMember?.avatarColor || avatarGrad
    };

    onSave(memberData);
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
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">First Name</label>
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
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">Last Name</label>
              <input
                type="text"
                required
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
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">Relation</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">Date of Birth</label>
              <input
                type="text"
                required
                value={formDob}
                onChange={(e) => setFormDob(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
              />
            </div>
          </div>

          {/* Gender radio selectors */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-orelio-gray tracking-wider uppercase">Gender</label>
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-orelio-navy bg-transparent rounded-xl hover:bg-orelio-light-gray transition-colors"
            >
              Cancel
            </button>
            <SaveButton
              type="submit"
              onClick={handleSaveClick}
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
