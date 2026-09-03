import React, { useState } from 'react';
import { Search, Eye, EyeOff, ChevronDown, Menu, Users } from 'lucide-react';

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
}

export const Topbar: React.FC<TopbarProps> = ({ 
  isPrivate, 
  setIsPrivate, 
  onMenuClick,
  members
}) => {
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');

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
      setSelectedMemberId('all');
    }
  }, [members, selectedMemberId]);

  const selectedLabel = familyOptions.find(o => o.id === selectedMemberId)?.label ?? allOption;

  const handleFamilySelect = (id: string | 'all') => {
    setSelectedMemberId(id);
    setFamilyDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-[80px] px-6 md:px-8 bg-white/80 backdrop-blur-md border-b border-[#C3C6CE]/20">
      
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center flex-1 max-w-md gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-orelio-text hover:bg-orelio-light-gray hover:text-orelio-navy lg:hidden"
        >
          <Menu size={20} />
        </button>

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
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 md:gap-4 pl-4">
        
        {/* Privacy eye toggle with tooltip */}
        <button 
          onClick={() => setIsPrivate(!isPrivate)}
          className={`
            p-2.5 rounded-xl border border-[#C3C6CE]/20 transition-all duration-200
            ${isPrivate 
              ? 'bg-orelio-darkgreen text-white border-orelio-darkgreen hover:bg-orelio-darkgreen/90' 
              : 'bg-white text-orelio-navy hover:bg-orelio-light-gray'
            }
          `}
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
        <div className="relative">
          <button 
            onClick={() => setFamilyDropdownOpen(!familyDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C3C6CE]/25 bg-white text-orelio-navy text-sm font-semibold hover:bg-orelio-light-gray/40 active:scale-98 transition-all"
          >
            <Users size={16} className="text-orelio-darkgreen" />
            <span className="max-w-[120px] truncate">{selectedLabel}</span>
            <ChevronDown size={14} className="text-orelio-gray" />
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
