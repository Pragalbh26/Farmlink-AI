import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, outline, amber, danger, ghost
  size = 'md', // sm, md, lg
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs min-h-[38px] gap-1.5',
    md: 'px-5 py-3 text-sm sm:text-base min-h-[48px] gap-2.5', // 48px min touch target
    lg: 'px-6 py-4 text-base sm:text-lg min-h-[54px] gap-3',
  };

  const variantStyles = {
    primary: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-900/20 focus:ring-emerald-600',
    secondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 focus:ring-emerald-500',
    outline: 'border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-900/20 focus:ring-amber-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-5 h-5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
