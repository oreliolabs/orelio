import React from 'react';

export interface CancelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text to display inside the cancel button, defaults to 'Cancel' */
  children?: React.ReactNode;
  /** Visual variant: 'primary' (light grey background) or 'secondary' (default) */
  variant?: 'primary' | 'secondary';
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  children = 'Cancel',
  type = 'button',
  variant = 'secondary',
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const bgStyles =
    variant === 'primary'
      ? 'bg-[#E6E8E9] hover:bg-[#D5D7D8]'
      : 'bg-transparent hover:bg-[#F2F4F5]';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center h-9 px-5 text-sm font-bold text-[#3F4945] ${bgStyles} rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <span className="leading-none">{children}</span>
    </button>
  );
};

export default CancelButton;
