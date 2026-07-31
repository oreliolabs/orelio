import React from 'react';

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional Material Symbol icon name to display (e.g. 'add', 'edit', 'delete') */
  icon?: string;
  /** Icon placement: 'left' (default) or 'right' */
  iconPosition?: 'left' | 'right';
  /** Button visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Button text/content */
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  icon,
  iconPosition = 'left',
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const paddingStyles = icon
    ? iconPosition === 'left'
      ? 'pl-3.5 pr-5'
      : 'pl-5 pr-3.5'
    : 'px-5';

  const baseStyles =
    `inline-flex items-center justify-center gap-1.5 ${paddingStyles} py-2.5 text-sm font-bold rounded-2xl hover:scale-103 active:scale-98 transition-all duration-200 shadow-sm flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:transform-none`;

  const variantStyles = {
    primary: 'bg-[#006A65] text-white',
    secondary: 'bg-[#F2F4F5] hover:bg-[#E6E8EA] text-[#00162A]',
    outline: 'bg-transparent border border-[#C3C6CE]/40 hover:bg-[#F2F4F5] text-[#00162A]',
    danger: 'bg-[#BA1A1A] hover:bg-[#931313] text-white'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined select-none flex-shrink-0" style={{ fontSize: '20px' }}>
          {icon}
        </span>
      )}
      <span className="leading-none">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined select-none flex-shrink-0" style={{ fontSize: '20px' }}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default PrimaryButton;
