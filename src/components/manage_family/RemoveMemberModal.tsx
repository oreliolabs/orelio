import React from 'react';
import type { FamilyMember } from './ManageFamily';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: FamilyMember;
  onConfirm: () => void;
}

export const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  onConfirm,
}) => {
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Remove ${selectedMember.firstName}?`}
      subtitle="Removing this profile will permanently delete all the associated data. This action cannot be undone."
      confirmText="Remove"
    />
  );
};

export default RemoveMemberModal;
