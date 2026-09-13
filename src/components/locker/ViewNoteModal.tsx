import React from 'react';
import { createPortal } from 'react-dom';
import { formatNoteTime, type Note } from './Notes';

export interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  isOpen,
  onClose,
  note,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div
        className="relative flex flex-col w-full max-w-[360px] sm:max-w-lg h-[75vh] max-h-[500px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-[#C3C6CE]/30"
      >
        {/* Topbar inside View Modal */}
        <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#73777E] uppercase tracking-wider">
            <span className="material-symbols-outlined select-none" style={{ fontSize: '14px' }}>
              schedule
            </span>
            Last updated {formatNoteTime(note.lastUpdated).toLowerCase()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        {/* Note Details */}
        <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-[#006A65] leading-snug shrink-0">
            {note.title}
          </h3>
          <div className="text-sm text-orelio-navy font-medium leading-relaxed flex-1 overflow-y-auto pr-1 whitespace-pre-line min-h-0">
            {note.content}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewNoteModal;
