import React from 'react';
import { AlertTriangle, Info, CloudRain, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const WeatherAlertBanner = ({ alerts = [], location, timestamp }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((adv) => {
        const isWarning = adv.severity === 'warning';
        return (
          <div
            key={adv.id}
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs ${
              isWarning
                ? 'bg-amber-500/10 border-amber-300 text-amber-950'
                : 'bg-blue-500/10 border-blue-300 text-blue-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  isWarning ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                }`}
              >
                {isWarning ? <AlertTriangle className="w-5 h-5" /> : <CloudRain className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      isWarning ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                    }`}
                  >
                    {isWarning ? 'FARMING ADVISORY HAZARD' : 'AGROMET NOTICE'}
                  </span>
                </div>
                <h4 className="font-bold text-base">{adv.hazard}</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">{adv.message}</p>
                <p className="text-[11px] text-slate-500 font-semibold pt-1">
                  Issued by: {adv.source}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
