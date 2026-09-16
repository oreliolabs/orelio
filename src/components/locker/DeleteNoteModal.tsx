import React from 'react';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

export interface DeleteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Note?"
      subtitle="Once deleted, this note cannot be recovered."
      confirmText="Delete"
    />
  );
};

export default DeleteNoteModal;
