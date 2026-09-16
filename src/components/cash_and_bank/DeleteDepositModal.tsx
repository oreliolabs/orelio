import React from 'react';
import type { Deposit } from './Deposits';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface DeleteDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletingDeposit: Deposit | null;
  onConfirmDelete: () => void;
}

export const DeleteDepositModal: React.FC<DeleteDepositModalProps> = ({
  isOpen,
  onClose,
  deletingDeposit,
  onConfirmDelete,
}) => {
  if (!deletingDeposit) return null;

  const depositType = deletingDeposit.type === 'FD' ? 'FD' : 'RD';

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirmDelete}
      title={`Delete ${depositType}?`}
      subtitle={
        <>
          Are you sure you want to delete{' '}
          <span className="font-bold text-[#00162A]">{deletingDeposit.nickname}</span>? This action cannot be undone.
        </>
      }
      confirmText="Delete"
    />
  );
};

export default DeleteDepositModal;
