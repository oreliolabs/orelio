import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrimaryButton } from '../common/PrimaryButton';

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

  // Add/Edit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

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
    setFormTitle(note.title);
    setFormContent(note.content);
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
    setFormTitle('');
    setFormContent('');
    setIsAddEditOpen(true);
  };

  // Form Save
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (selectedNote) {
      // Edit mode
      setNotes(notes.map(n => n.id === selectedNote.id ? {
        ...n,
        title: formTitle,
        content: formContent,
        lastUpdated: currentTime
      } : n));
    } else {
      // Add mode - alternate colors
      const newColor = '#00162A';
      const newNote: Note = {
        id: Date.now().toString(),
        title: formTitle,
        content: formContent,
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
      {isViewOpen && selectedNote && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsViewOpen(false)} />
          <div
            className="relative flex flex-col bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200"
            style={{ width: '40vw', height: '40vw', minWidth: '350px', minHeight: '350px' }}
          >
            {/* Topbar inside View Modal */}
            <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#73777E] uppercase tracking-wider">
                <span className="material-symbols-outlined select-none" style={{ fontSize: '14px' }}>schedule</span>
                Last updated {selectedNote.lastUpdated.toLowerCase()}
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Note Details */}
            <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
              <h3 className="text-xl font-bold text-[#006A65] leading-snug flex-shrink-0">
                {selectedNote.title}
              </h3>
              <div className="text-sm text-orelio-navy font-medium leading-relaxed flex-1 overflow-y-auto pr-1 whitespace-pre-line min-h-0">
                {selectedNote.content}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ADD/EDIT NOTE MODAL */}
      {isAddEditOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsAddEditOpen(false)} />
          <form
            onSubmit={handleSaveNote}
            className="relative flex flex-col bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200"
            style={{ width: '40vw', height: '40vw', minWidth: '350px', minHeight: '350px' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 flex-shrink-0">
              <h3 className="text-lg font-bold text-orelio-navy">
                {selectedNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 flex flex-col space-y-4 py-4 min-h-0">
              <div className="space-y-1.5 flex-shrink-0">
                <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all"
                />
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">Description</label>
                <textarea
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write something here...."
                  className="w-full px-[11px] py-[7px] rounded-xl bg-orelio-light-gray/60 border-2 border-[#C3C6CE]/15 hover:border-[#C3C6CE]/35 text-sm text-orelio-navy font-semibold focus:outline-none focus:bg-white focus:border-[#006A65] transition-all resize-none leading-relaxed flex-1 min-h-0"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C3C6CE]/15 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="px-4 py-2 text-sm font-bold text-[#3F4945] bg-transparent rounded-xl hover:bg-orelio-light-gray transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formTitle.trim() || !formContent.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-[#006A65] rounded-xl hover:bg-[#006A65]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* DELETE NOTE MODAL */}
      {isDeleteOpen && selectedNote && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-3 text-center z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Graphic */}
            <div className="mx-auto flex justify-center">
              <svg className="transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer origin-center" width="82" height="104" viewBox="0 0 82 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M35.0547 18.8154C46.2332 18.8035 58.1784 16.5893 66.9926 23.1441C76.6139 30.299 83.1824 42.0331 81.8217 53.594C80.5386 64.4953 68.7147 70.1723 60.548 77.8995C52.4369 85.5743 46.4194 96.7031 35.0547 97.8446C23.0447 99.0509 10.3675 93.1323 3.55753 83.6237C-2.59729 75.0299 3.42655 64 3.36292 53.594C3.29854 43.066 -4.05418 31.1597 3.1881 23.212C10.5057 15.1817 23.8972 18.8273 35.0547 18.8154Z" fill="#FFF0EF" />
                <path d="M33.5333 61L36.9999 57.5333L40.4666 61L42.3333 59.1333L38.8666 55.6667L42.3333 52.2L40.4666 50.3333L36.9999 53.8L33.5333 50.3333L31.6666 52.2L35.1333 55.6667L31.6666 59.1333L33.5333 61ZM30.3333 67C29.5999 67 28.9721 66.7389 28.4499 66.2167C27.9277 65.6944 27.6666 65.0667 27.6666 64.3333V47H26.3333V44.3333H32.9999V43H40.9999V44.3333H47.6666V47H46.3333V64.3333C46.3333 65.0667 46.0721 65.6944 45.5499 66.2167C45.0277 66.7389 44.3999 67 43.6666 67H30.3333Z" fill="#BA1A1A" />
              </svg>
            </div>

            {/* Content text */}
            <div className="space-y-2 mt-1">
              <h3 className="text-lg font-bold text-orelio-navy">Delete Note?</h3>
              <p className="text-sm text-[#43474D] leading-relaxed font-medium">
                Once deleted, this note cannot be recovered.
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
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#BA1A1A] rounded-xl hover:bg-[#9E1414] transition-colors shadow-sm"
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
