import React, { useState, useEffect } from 'react';
import { Landmark, Search, CheckCircle2, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const Schemes = ({ onStartEligibilityCheck }) => {
  const { t } = useLanguage();

  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await apiClient.request('/schemes');
        if (res.success) {
          setSchemes(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filtered = schemes.filter((s) => {
    const matchJur = selectedJurisdiction === 'All' || s.jurisdiction.includes(selectedJurisdiction);
    const query = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(query) ||
      s.ministry.toLowerCase().includes(query) ||
      s.benefit.toLowerCase().includes(query);
    return matchJur && matchSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              Official GOI / myScheme Registry
            </Badge>
            <span className="text-xs text-blue-300">Deterministic Rule Grounded</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {t('schemes')} & Financial Grants
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Verified central and state government agricultural subsidies, income support, crop insurance, and subsidized credit schemes.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={CheckCircle2}
          onClick={onStartEligibilityCheck}
        >
          {t('check_eligibility')} (4-Step Wizard)
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 space-y-3">
        <Input
          icon={Search}
          placeholder="Search by scheme name (PM-KISAN, PMFBY, KCC, Rythu Bharosa)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 pt-1 overflow-x-auto">
          {['All', 'Central', 'State'].map((jur) => (
            <button
              key={jur}
              onClick={() => setSelectedJurisdiction(jur)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedJurisdiction === jur
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {jur} Jurisdiction
            </button>
          ))}
        </div>
      </Card>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((sch) => (
          <SchemeCard
            key={sch.id}
            scheme={sch}
            onCheckEligibility={onStartEligibilityCheck}
          />
        ))}
      </div>
    </div>
  );
};
