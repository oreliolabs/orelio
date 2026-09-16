import React from 'react';

export interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text to render inside the button, defaults to 'Save' */
  children?: React.ReactNode;
  /** Optional Material Symbol icon name to display on the left */
  icon?: string;
  /** Loading/saving state indicator */
  isSaving?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  children = 'Save',
  type = 'submit',
  isSaving = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  const activeIcon = isSaving ? 'check' : icon;

  return (
    <button
      type={type}
      disabled={disabled || isSaving}
      className={`inline-flex items-center justify-center gap-2 h-9 px-5 text-sm font-bold text-white bg-[#006A65] hover:bg-[#00524E] rounded-xl shadow-sm transition-colors duration-150 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {activeIcon && (
        <span className="material-symbols-outlined select-none flex-shrink-0" style={{ fontSize: '18px' }}>
          {activeIcon}
        </span>
      )}
      <span className="leading-none">{isSaving ? 'Saving...' : children}</span>
    </button>
  );
};

export default SaveButton;
