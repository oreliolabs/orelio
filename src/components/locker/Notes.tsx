import React, { useState, useMemo, useEffect } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { AddEditNoteModal } from './AddEditNoteModal';
import { ViewNoteModal } from './ViewNoteModal';
import { DeleteNoteModal } from './DeleteNoteModal';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: string; // e.g., "12:00 PM"
  accentColor: string; // "#006A65" or "#00162A"
}

export const Notes: React.FC = () => {
  // Mock default notes based on reference design
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'The Art of Small Beginnings',
      content: 'Not every meaningful change arrives with a grand announcement. Sometimes, the most enduring habits, the most solid financial portfolios, and the deepest personal reflections start in the quietest way imaginable. A single rupee set aside, a single sentence written, or a single moment of quiet alignment can lay the foundation for a lifetime of growth.',
      lastUpdated: '12:00 PM',
      accentColor: '#00162A'
    },
    {
      id: '2',
      title: 'Conversations in Silence',
      content: 'Some of the best conversations happen in silence. When we quiet the noise around us, we can finally hear the underlying currents of our thoughts, goals, and strategies. Writing down these quiet insights helps transform brief ideas into permanent systems, ensuring we stay focused on long-term values rather than short-term market noises.',
      lastUpdated: '11:30 AM',
      accentColor: '#00162A'
    },
    {
      id: '3',
      title: 'Quarterly Asset Allocation Checklist',
      content: 'Review cash reserves, equity weightings across portfolios, and ensure Locker records (wills, digital passwords) are updated. Balance target ratios when stocks rise past their threshold. Maintain safety margins for loans.',
      lastUpdated: 'YESTERDAY',
      accentColor: '#00162A'
    },
    {
      id: '4',
      title: 'Retirement Vision Board',
      content: 'Mapping out passive income milestones for age 60. Core streams include dividend stocks, EPF accumulations, and rental yielding real estate. Focus on stability over raw growth in later stages. Regularly audit health cover limits.',
      lastUpdated: '3 DAYS AGO',
      accentColor: '#00162A'
    },
    {
      id: '5',
      title: 'Emergency Fund Rules',
      content: 'Emergency reserves must cover 6 months of fixed family expenses. Keep cash strictly in savings accounts or short-term liquid FDs. Never deploy emergency funds into volatile equity assets.',
      lastUpdated: '1 WEEK AGO',
      accentColor: '#00162A'
    }
  ]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'alphabetical'>('latest');

  // Active Dropdown state (stores note ID)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  // Modal States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Handle Note Actions
  const handleView = (note: Note) => {
    setSelectedNote(note);
    setIsViewOpen(true);
    setActiveMenuId(null);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsAddEditOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteOpen(true);
    setActiveMenuId(null);
  };

  const handleAddClick = () => {
    setSelectedNote(null);
    setIsAddEditOpen(true);
  };

  // Form Save
  const handleSaveNote = (title: string, content: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (selectedNote) {
      // Edit mode
      setNotes(notes.map(n => n.id === selectedNote.id ? {
        ...n,
        title,
        content,
        lastUpdated: currentTime
      } : n));
    } else {
      // Add mode - alternate colors
      const newColor = '#00162A';
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        lastUpdated: currentTime,
        accentColor: newColor
      };
      setNotes([newNote, ...notes]);
      setCurrentPage(1); // Go back to first page to see the new note
    }

    setIsAddEditOpen(false);
  };

  // Delete Confirm
  const handleConfirmDelete = () => {
    if (selectedNote) {
      setNotes(notes.filter(n => n.id !== selectedNote.id));
      setIsDeleteOpen(false);
      setSelectedNote(null);
      // Adjust page if we deleted the last item on current page
      const totalFiltered = filteredAndSortedNotes.length - 1;
      const totalPages = Math.ceil(totalFiltered / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    }
  };

  // Scroll Lock when any modal is open
  const isAnyModalOpen = isViewOpen || isAddEditOpen || isDeleteOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Process Notes: Filter & Sort
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'oldest') {
      // To simulate sorting mock timestamps: we'll reverse them
      result.reverse();
    } // 'latest' is the default order (newest first/current state order)

    return result;
  }, [notes, searchQuery, sortBy]);

  // Paginated Notes
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedNotes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedNotes, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedNotes.length / itemsPerPage);

  // Close dropdown on clicking elsewhere
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="space-y-6 fade-in p-2">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-orelio-navy tracking-tight">My Notes</h2>
            <span className="flex items-center justify-center bg-orelio-navy text-white text-xs font-bold w-5 h-5 rounded-full">
              {notes.length}
            </span>
          </div>
          <p className="text-sm text-orelio-gray mt-1 font-medium">
            Jot down your personal investment thoughts and important logs.
          </p>
        </div>
        <div>
          <PrimaryButton
            onClick={handleAddClick}
            icon="add"
          >
            Add New Note
          </PrimaryButton>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div className="flex flex-col sm:flex-row gap-3 my-8">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#73777E] select-none" style={{ fontSize: '18px' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#C3C6CE]/30 focus:outline-none text-sm font-medium transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white border border-[#C3C6CE]/30 text-sm font-semibold text-[#3F4945] focus:outline-none  transition-all cursor-pointer w-full sm:w-auto"
          >
            <option value="latest">Sort by Latest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="alphabetical">Title A-Z</option>
          </select>
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#73777E] pointer-events-none select-none text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
            keyboard_arrow_down
          </span>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {paginatedNotes.length > 0 ? (
          paginatedNotes.map((note) => {
            const isHovered = hoveredNoteId === note.id;
            const isMenuOpen = activeMenuId === note.id;
            const currentAccentColor = note.accentColor === '#00162A' && isHovered ? '#006A65' : note.accentColor;

            return (
              <div
                key={note.id}
                onClick={() => handleView(note)}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(null)}
                className={`group relative flex items-start justify-between p-5 bg-white border border-[#C3C6CE]/20 rounded-[8px] border-l-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isMenuOpen ? 'z-30' : 'z-10'}`}
                style={{
                  borderLeftColor: currentAccentColor,
                  boxShadow: isHovered
                    ? '0px 4px 20px 0px rgba(0, 106, 101, 0.1)'
                    : '0px 4px 20px 0px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0 pr-8">
                  {/* Accent Icon Background Square */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-colors duration-300"
                    style={{ backgroundColor: currentAccentColor }}
                  >
                    <span className="material-symbols-outlined text-[20px] select-none">description</span>
                  </div>
                  {/* Title & snippet */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-base font-bold text-orelio-navy truncate transition-colors group-hover:text-black">
                      {note.title}
                    </h3>
                    <p className="text-sm text-[#3F4945] line-clamp-2 leading-relaxed font-medium">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#73777E] font-bold uppercase tracking-wider pt-0.5">
                      <span className="material-symbols-outlined select-none" style={{ fontSize: '13px' }}>schedule</span>
                      LAST UPDATED {note.lastUpdated}
                    </div>
                  </div>
                </div>

                {/* Three dot actions */}
                <div
                  className="relative"
                  onClick={(e) => e.stopPropagation()} // Stop triggering view note click
                >
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === note.id ? null : note.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-[#3F4945] transition-colors"
                  >
                    <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === note.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-[#C3C6CE]/20 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        onClick={() => handleEdit(note)}
                        className="w-full px-4 py-1.5 text-left text-sm font-medium text-[#3F4945] hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>edit</span>
                        Edit Note
                      </button>
                      <hr className="border-[#C3C6CE]/10 my-1" />
                      <button
                        onClick={() => handleDeleteClick(note)}
                        className="w-full px-4 py-1.5 text-left text-sm font-medium text-[#BA1A1A] hover:bg-red-50 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined select-none" style={{ fontSize: '15px' }}>delete</span>
                        Delete Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white border border-[#C3C6CE]/20 rounded-2xl">
            <span className="material-symbols-outlined text-gray-300 select-none" style={{ fontSize: '48px' }}>note_stack</span>
            <p className="text-lg font-bold text-orelio-navy mt-3">No notes found</p>
            <p className="text-sm text-gray-400 mt-1">Try matching another keyword or create a new note.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-0.5 px-3 py-2 text-sm font-bold text-[#3F4945] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '18px', verticalAlign: 'middle' }}>chevron_left</span>
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-[38px] h-[38px] rounded-[12px] text-sm font-bold flex items-center justify-center transition-all ${isActive
                  ? 'bg-[#00162A] text-white shadow-sm'
                  : 'border border-[#E5E7EB] bg-white text-[#3F4945] hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-0.5 px-3 py-2 text-sm font-bold text-[#3F4945] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Next
            <span className="material-symbols-outlined select-none" style={{ fontSize: '18px', verticalAlign: 'middle' }}>chevron_right</span>
          </button>
        </div>
      )}

      {/* VIEW NOTE MODAL */}
      <ViewNoteModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        note={selectedNote}
      />

      {/* ADD/EDIT NOTE MODAL */}
      <AddEditNoteModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        selectedNote={selectedNote}
        onSave={handleSaveNote}
      />

      {/* DELETE NOTE MODAL */}
      <DeleteNoteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
