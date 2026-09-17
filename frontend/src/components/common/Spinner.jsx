import React from 'react';
import { Sprout } from 'lucide-react';

export const Spinner = ({ size = 'md', message = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className={`${sizes[size]} rounded-full border-3 border-emerald-200 border-t-emerald-700 animate-spin`} />
        <Sprout className="w-4 h-4 text-emerald-700 absolute" />
      </div>
      {message && <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );
};
