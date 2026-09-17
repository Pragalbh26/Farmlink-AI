import React from 'react';
import { AlertTriangle, AlertCircle, Sparkles, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { Spinner } from './Spinner';

/**
 * AIStateCard implements the 4 required AI states from Member 3 Plan §5:
 * 1. Loading: Clear branded loading indicator
 * 2. Empty / Not yet used: Friendly first-use guidance
 * 3. Low-confidence / Uncertain: Distinct visual state advising expert validation
 * 4. Error / Unavailable: Plain-language error with retry button
 */
export const AIStateCard = ({
  state = 'empty', // 'loading' | 'empty' | 'uncertain' | 'error' | 'unsupported'
  title,
  message,
  onRetry,
  actionText,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}) => {
  if (state === 'loading') {
    return (
      <div className={`p-8 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
        <Spinner size="lg" message={message || 'AI Inference Engine analyzing data...'} />
        <p className="text-xs text-emerald-800/80 font-medium">Validating bounds & ground truth features</p>
      </div>
    );
  }

  if (state === 'uncertain') {
    return (
      <div className={`p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col gap-3 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                Low Confidence / Uncertain Result
              </span>
            </div>
            <h4 className="font-bold text-base text-amber-950">{title || 'Uncertain Prediction'}</h4>
            <p className="text-sm text-amber-900 leading-relaxed">
              {message || 'The AI model could not reach a high confidence threshold for this input. Do not treat this as a definitive conclusion.'}
            </p>
          </div>
        </div>
        
        <div className="pt-2 flex flex-wrap gap-2.5 items-center">
          {onAction && (
            <Button variant="amber" size="sm" onClick={onAction} icon={ActionIcon || RefreshCw}>
              {actionText || 'Retake with Better Lighting'}
            </Button>
          )}
          <span className="text-xs text-amber-800 font-medium">
            💡 Recommended: Consult your local Krishi Vigyan Kendra (KVK) extension officer.
          </span>
        </div>
      </div>
    );
  }

  if (state === 'unsupported') {
    return (
      <div className={`p-6 rounded-2xl bg-slate-50 border border-slate-300 text-slate-800 flex flex-col gap-3 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
              Out of Model Scope
            </span>
            <h4 className="font-bold text-base text-slate-900">{title || 'Unsupported Category'}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message || 'The submitted query or image is outside the supported benchmark classes.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col gap-3 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-200 text-rose-800 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-rose-900">{title || 'Service Temporarily Unavailable'}</h4>
            <p className="text-sm text-rose-800">
              {message || 'Could not communicate with the inference service or external government data adapter.'}
            </p>
          </div>
        </div>
        {onRetry && (
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
              Retry Analysis
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default: Empty / First Use
  return (
    <div className={`p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="p-3 bg-emerald-100/60 text-emerald-800 rounded-2xl">
        <Sparkles className="w-7 h-7" />
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="font-bold text-base text-slate-800">{title || 'Ready for Analysis'}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">
          {message || 'Select your parameters or upload inputs to generate grounded agricultural intelligence.'}
        </p>
      </div>
      {onAction && (
        <Button variant="primary" size="md" onClick={onAction} icon={ActionIcon}>
          {actionText || 'Get Started'}
        </Button>
      )}
    </div>
  );
};
