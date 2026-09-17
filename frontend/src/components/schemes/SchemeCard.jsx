import React from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck, FileText, Calendar, Building } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export const SchemeCard = ({ scheme, onCheckEligibility }) => {
  const { t } = useLanguage();

  return (
    <Card hover className="space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header with Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="blue" size="sm">
              {scheme.jurisdiction}
            </Badge>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
              {scheme.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{scheme.ministry}</span>
            </p>
          </div>
        </div>

        {/* Benefit Summary */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Direct Scheme Benefit</p>
          <p className="text-sm font-semibold text-emerald-950 mt-1 leading-snug">
            {scheme.benefit}
          </p>
        </div>

        {/* Required Documents */}
        {scheme.requiredDocs && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Required Application Documents</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scheme.requiredDocs.map((doc, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Provenance & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            {t('verified_at')} {scheme.verifiedAt}
          </span>
          <a
            href={scheme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
          >
            Official Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {onCheckEligibility && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onCheckEligibility(scheme)}
            icon={CheckCircle2}
          >
            {t('check_eligibility')}
          </Button>
        )}
      </div>
    </Card>
  );
};
