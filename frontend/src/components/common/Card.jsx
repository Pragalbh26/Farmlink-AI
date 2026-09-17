import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'p-5 sm:p-6',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${padding} ${
        hover ? 'hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
