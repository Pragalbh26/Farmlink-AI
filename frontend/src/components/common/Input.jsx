import React from 'react';

export const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  icon: Icon,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  min,
  max,
  step,
  name,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 min-h-[48px] text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100 disabled:text-slate-500 ${
            Icon ? 'pl-11' : ''
          } ${
            error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-600'
          }`}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
