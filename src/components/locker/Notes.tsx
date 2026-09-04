import React, { useState, useMemo, useEffect } from 'react';
import { PrimaryButton } from '../common/PrimaryButton';
import { AddEditNoteModal } from './AddEditNoteModal';
import { ViewNoteModal } from './ViewNoteModal';
import { DeleteNoteModal } from './DeleteNoteModal';
import { getNotes, saveNotes } from '../../data/orelioStore';
import type { Note } from '../../data/types';
export type { Note } from '../../data/types';

export function formatNoteTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) {
    return 'YESTERDAY';
  }

  if (diffDays >= 2 && diffDays < 7) {
    return `${diffDays} DAYS AGO`;
  }

  if (diffDays >= 7 && diffDays < 14) {
    return '1 WEEK AGO';
  }

  if (diffDays >= 14 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} WEEKS AGO`;
  }

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => getNotes());

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

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
    const currentTime = new Date().toISOString();

    if (selectedNote) {
      // Edit mode
      setNotes(notes.map(n => n.id === selectedNote.id ? {
        ...n,
        title,
        content,
        lastUpdated: currentTime
      } : n));
    } else {
      // Add mode
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        lastUpdated: currentTime
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
      result.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
    } else {
      // 'latest' newest first
      result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

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
      {notes.length > 0 && (
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
      )}

      {notes.length === 0 ? (
        <div className="text-center py-20 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#006A65]/10 text-[#006A65] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined select-none text-[36px]">
              edit_note
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#00162A] tracking-tight">No Notes Yet</h3>
          <p className="text-sm text-[#707975] font-medium max-w-md mt-2 leading-relaxed">
            Jot down your personal investment ideas, financial strategies, and important reminders.
          </p>
          <div className="mt-6">
            <PrimaryButton
              onClick={handleAddClick}
              icon="add"
            >
              Add Your First Note
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <>
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
                const currentAccentColor = isHovered ? '#006A65' : (note.accentColor || '#00162A');

                return (
                  <div
                    key={note.id}
                    onClick={() => handleView(note)}
                    onMouseEnter={() => setHoveredNoteId(note.id)}
                    onMouseLeave={() => setHoveredNoteId(null)}
                    className="p-5 rounded-2xl bg-white border border-[#C3C6CE]/25 hover:border-2 hover:border-[#006A65] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Left icon badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-colors duration-200"
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
                          LAST UPDATED {formatNoteTime(note.lastUpdated)}
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
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] transition-colors"
                      >
                        <span className="material-symbols-outlined select-none text-[20px]">more_vert</span>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-[#C3C6CE]/20 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
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
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[#73777E] select-none text-[40px] mb-2">search_off</span>
                <p className="text-base font-bold text-orelio-navy">No matching notes found</p>
                <p className="text-sm text-[#707975] mt-1">Try matching another keyword or clearing your search.</p>
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
        </>
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
        isFirstNote={notes.length === 0}
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
