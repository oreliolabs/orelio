import React, { useState } from 'react';
import { /* Search, */ Eye, EyeOff, ChevronDown, Menu, Users } from 'lucide-react';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface TopbarProps {
  isPrivate: boolean;
  setIsPrivate: (val: boolean) => void;
  onMenuClick: () => void;
  members: FamilyMember[];
  selectedMemberId?: string | 'all';
  onSelectMemberId?: (id: string | 'all') => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  isPrivate, 
  setIsPrivate, 
  onMenuClick,
  members,
  selectedMemberId: controlledSelectedMemberId,
  onSelectMemberId
}) => {
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [internalSelectedMemberId, setInternalSelectedMemberId] = useState<string | 'all'>('all');

  const selectedMemberId = controlledSelectedMemberId !== undefined ? controlledSelectedMemberId : internalSelectedMemberId;

  const allOption = `All Members (${members.length})`;

  // Build dropdown options from live members list
  const familyOptions: { id: string | 'all'; label: string }[] = [
    { id: 'all', label: allOption },
    ...members.map(m => ({
      id: m.id,
      label: `${m.role} (${m.firstName})`
    }))
  ];

  // If selected member was removed, reset to "All"
  React.useEffect(() => {
    if (selectedMemberId !== 'all' && !members.find(m => m.id === selectedMemberId)) {
      if (onSelectMemberId) {
        onSelectMemberId('all');
      } else {
        setInternalSelectedMemberId('all');
      }
    }
  }, [members, selectedMemberId, onSelectMemberId]);

  const selectedLabel = familyOptions.find(o => o.id === selectedMemberId)?.label ?? allOption;

  const handleFamilySelect = (id: string | 'all') => {
    if (onSelectMemberId) {
      onSelectMemberId(id);
    } else {
      setInternalSelectedMemberId(id);
    }
    setFamilyDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-[64px] px-4 sm:px-6 md:px-8 bg-white/80 backdrop-blur-md border-b border-[#C3C6CE]/20 min-w-0">
      
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center flex-1 max-w-md gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-orelio-text hover:bg-orelio-light-gray hover:text-orelio-navy lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar (Commented out)
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-orelio-gray">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search assets, banks, policies..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-orelio-light-gray/60 border border-[#C3C6CE]/15 font-medium text-sm text-orelio-navy placeholder-orelio-gray focus:outline-none focus:bg-white focus:border-orelio-darkgreen/40 transition-all"
          />
        </div>
        */}
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 pl-2 sm:pl-4 shrink-0">
        
        {/* Privacy eye toggle with tooltip */}
        <button 
          onClick={() => setIsPrivate(!isPrivate)}
          className="p-2 sm:p-2.5 rounded-xl border border-[#C3C6CE]/20 bg-white text-orelio-navy hover:bg-orelio-light-gray transition-all duration-200 cursor-pointer shrink-0"
          title={isPrivate ? "Show financial figures" : "Hide financial figures (Privacy Mode)"}
        >
          {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {/* Dark/Light mode toggle
        <button 
          className="hidden sm:block p-2.5 rounded-xl border border-[#C3C6CE]/20 bg-white text-orelio-navy hover:bg-orelio-light-gray transition-all cursor-pointer"
          title="Toggle Dark/Light Mode"
          aria-label="Toggle Dark/Light Mode"
        >
          <Moon size={18} />
        </button> */}

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-[#C3C6CE]/35" />

        {/* Interactive Family Selector Dropdown */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setFamilyDropdownOpen(!familyDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#C3C6CE]/25 bg-white text-orelio-navy text-xs sm:text-sm font-semibold hover:bg-orelio-light-gray/40 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Users size={16} className="text-orelio-darkgreen shrink-0" />
            <span className="whitespace-nowrap">{selectedLabel}</span>
            <ChevronDown size={14} className="text-orelio-gray shrink-0" />
          </button>

          {familyDropdownOpen && (
            <>
              {/* Dropdown Backdrop to close on click outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setFamilyDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#C3C6CE]/30 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-1.5 text-xs font-bold text-orelio-gray tracking-wider uppercase border-b border-[#C3C6CE]/15 mb-1.5">
                  Select Profile
                </div>
                {familyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFamilySelect(option.id)}
                    className={`
                      w-full text-left px-4 py-2 text-[13px] font-medium transition-colors
                      ${selectedMemberId === option.id 
                        ? 'text-orelio-darkgreen bg-orelio-lightgreen/20 font-bold' 
                        : 'text-orelio-text hover:bg-orelio-light-gray hover:text-orelio-navy'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
