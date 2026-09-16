import React from 'react';
import type { Policy } from './InsuranceTypes';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface DeletePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onConfirm: () => void;
}

export const DeletePolicyModal: React.FC<DeletePolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  onConfirm
}) => {
  if (!policy) return null;

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
      title="Delete Policy?"
      subtitle={
        <>
          Are you sure you want to delete policy{' '}
          <span className="font-bold text-[#00162A]">"{policy.policyName}"</span> ({policy.policyNumber})?
          This action cannot be undone.
        </>
      }
      confirmText="Delete Policy"
    />
  );
};

export default DeletePolicyModal;
