import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Note } from './Notes';
import { SaveButton } from '../common/SaveButton';
import { CancelButton } from '../common/CancelButton';

export interface AddEditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNote: Note | null;
  onSave: (title: string, content: string) => void;
  isFirstNote?: boolean;
}

export const AddEditNoteModal: React.FC<AddEditNoteModalProps> = ({
  isOpen,
  onClose,
  selectedNote,
  onSave,
  isFirstNote = false,
}) => {
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setFormTitle(selectedNote.title);
      setFormContent(selectedNote.content);
    } else {
      setFormTitle('');
      setFormContent('');
    }
  }, [selectedNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;
    onSave(formTitle.trim(), formContent.trim());
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200"
        style={{ width: '40vw', height: '40vw', minWidth: '350px', minHeight: '350px' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#C3C6CE]/15 pb-3 flex-shrink-0">
          <h3 className="text-lg font-bold text-orelio-navy">
            {selectedNote ? 'Edit Note' : (isFirstNote ? 'Add Your First Note' : 'Add Note')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#73777E] hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        {/* Inputs */}
        <div className="flex-1 flex flex-col space-y-4 py-4 min-h-0">
          <div className="space-y-1.5 flex-shrink-0">
            <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">
              Title
            </label>
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
            <label className="block text-[11px] font-bold text-[#3F4945] tracking-wider uppercase">
              Description
            </label>
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
          <CancelButton onClick={onClose} />
          <SaveButton type="submit" disabled={!formTitle.trim() || !formContent.trim()}>
            Save
          </SaveButton>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default AddEditNoteModal;
