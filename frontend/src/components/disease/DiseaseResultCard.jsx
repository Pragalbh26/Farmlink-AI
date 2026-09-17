import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, BookOpen, Building2, HelpCircle, Activity } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { useLanguage } from '../../context/LanguageContext';

export const DiseaseResultCard = ({ result }) => {
  const { t } = useLanguage();

  if (!result) return null;

  const confidencePct = Math.round((result.confidence || 0) * 100);
  const isHealthy = result.diseaseName?.toLowerCase().includes('healthy');
  const isConfident = result.status === 'confident';
  const isUncertain = result.status === 'uncertain';

  return (
    <Card className="space-y-5 border-2 border-emerald-500/30 overflow-hidden">
      {/* Result Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isConfident ? (isHealthy ? 'green' : 'amber') : 'red'}
              size="lg"
              icon={isConfident ? CheckCircle2 : AlertTriangle}
            >
              {isHealthy ? t('healthy') : t('disease_detected')}
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              Model: {result.modelVersion}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {result.crop} — {result.diseaseName}
          </h3>
        </div>

        {/* Confidence Gauge */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 shrink-0">
          <Activity className={`w-5 h-5 ${confidencePct >= 80 ? 'text-emerald-700' : 'text-amber-600'}`} />
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{t('confidence_level')}</p>
            <p className="text-lg font-black text-slate-900">{confidencePct}%</p>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Diagnostic Characteristics & Visual Symptoms</span>
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          {result.symptoms}
        </p>
      </div>

      {/* Recommended Agronomic Management Steps */}
      {result.management && result.management.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{t('recommended_action')} (ICAR / KVK Verified)</span>
          </h4>
          <ul className="space-y-2">
            {result.management.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-sm text-emerald-950"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verified Authority & Responsible AI Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5 text-xs text-amber-950">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Responsible AI Guidance & Provenance</span>
        </div>
        <p className="leading-relaxed">
          {t('ai_disclaimer_disease')}
        </p>
        <p className="text-[11px] text-amber-800 font-semibold pt-1">
          Source Baseline: {result.sourceAuthority || 'ICAR Extension Guidelines & PlantVillage Benchmark'}
        </p>
      </div>
    </Card>
  );
};
