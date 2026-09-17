import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const EligibilityCheck = ({ onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [landHectares, setLandHectares] = useState(user?.landSize || 1.8);
  const [state, setState] = useState(user?.state || 'Maharashtra');
  const [crop, setCrop] = useState('Tomato');
  const [isGovtEmployee, setIsGovtEmployee] = useState(false);
  const [isTaxPayer, setIsTaxPayer] = useState(false);
  const [hasAadhaarLinkedAccount, setHasAadhaarLinkedAccount] = useState(true);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.request('/schemes/eligibility', {
        method: 'POST',
        body: {
          landHectares: Number(landHectares),
          state,
          crop,
          isGovtEmployee,
          isTaxPayer,
          hasAadhaarLinkedAccount
        }
      });
      if (res.success) {
        setResults(res.data);
        setStep(5); // Show results screen
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')} to Schemes Directory</span>
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">Deterministic Rule Engine</Badge>
          <span className="text-xs text-slate-500 font-mono">Module: Knowledge 06 §3</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Government Scheme Eligibility Engine
        </h1>
        <p className="text-sm text-slate-500">
          Deterministic evaluation against official eligibility guidelines without LLM speculation.
        </p>
      </div>

      {step < 5 ? (
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                    step === s
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : step > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {s === 1 ? 'Landholding' : s === 2 ? 'Location' : s === 3 ? 'Crops' : 'Exclusions'}
                </span>
              </div>
            ))}
          </div>

          {/* Wizard Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 1: Agricultural Landholding Size</h3>
              <p className="text-xs text-slate-500">Enter the total cultivable land area owned or leased in applicant's name.</p>
              
              <Input
                label="Cultivable Land Size (in Hectares)"
                type="number"
                step="0.1"
                min="0"
                value={landHectares}
                onChange={(e) => setLandHectares(e.target.value)}
                required
                helperText="1 Hectare ≈ 2.47 Acres. Small/marginal farmer threshold is ≤ 2.0 Hectares."
              />

              <div className="pt-4 flex justify-end">
                <Button variant="primary" size="md" onClick={() => setStep(2)}>
                  Next: State of Cultivation →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 2: State & Jurisdiction</h3>
              <p className="text-xs text-slate-500">Select your state of permanent agricultural residence.</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">State / Union Territory</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 focus:border-emerald-600 focus:outline-none min-h-[48px]"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(3)}>
                  Next: Crop Details →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 3: Primary Crop Cultivation</h3>
              <p className="text-xs text-slate-500">Specify primary seasonal crop cultivated this season.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Cotton'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrop(c)}
                    className={`p-3 rounded-xl border text-sm font-bold transition cursor-pointer ${
                      crop === c
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(4)}>
                  Next: Exclusion Criteria →
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 4: Statutory Exclusion Criteria</h3>
              <p className="text-xs text-slate-500">PM-KISAN and Central welfare schemes explicitly exclude certain categories.</p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={isTaxPayer}
                    onChange={(e) => setIsTaxPayer(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-700 mt-0.5"
                  />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-slate-800">Income Tax Payee in last Assessment Year</p>
                    <p className="text-xs text-slate-500">Any family member who paid income tax in the last financial year.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={isGovtEmployee}
                    onChange={(e) => setIsGovtEmployee(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-700 mt-0.5"
                  />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-slate-800">Serving / Retired Government Employee</p>
                    <p className="text-xs text-slate-500">Regular employees of Central/State Govt (excluding Multi-Tasking / Class IV staff).</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(3)}>
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleEvaluate}
                  loading={loading}
                  icon={CheckCircle2}
                >
                  Run Eligibility Rules
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <span className="font-bold">Evaluated for: Land {landHectares} Ha • {state} • Crop: {crop}</span>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Re-run with new parameters
            </Button>
          </div>

          <div className="space-y-4">
            {results?.map((res, idx) => {
              const isEligible = res.status === 'eligible';
              const isPotentially = res.status === 'potentially_eligible';
              const isNot = res.status === 'not_eligible';

              return (
                <Card key={idx} className="space-y-4 border-2 border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">{res.schemeName}</h3>
                      <p className="text-xs text-slate-500">Benefit: {res.benefit}</p>
                    </div>
                    <Badge
                      variant={isEligible ? 'green' : (isPotentially ? 'amber' : 'red')}
                      size="lg"
                      icon={isEligible ? CheckCircle2 : (isPotentially ? AlertTriangle : XCircle)}
                    >
                      {isEligible ? t('eligible') : (isPotentially ? t('potentially_eligible') : t('not_eligible'))}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-500">Deterministic Rule Output</p>
                    <ul className="space-y-1">
                      {res.reasons.map((r, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Verified on {res.verifiedAt}
                    </span>
                    <a
                      href={res.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Responsible AI Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <p className="font-bold text-amber-900">Legal & Departmental Disclaimer:</p>
            <p className="mt-1">{t('ai_disclaimer_schemes')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
