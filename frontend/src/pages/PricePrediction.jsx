import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ShieldCheck, Search } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { PriceTrendChart } from '../components/price/PriceTrendChart';
import { AIStateCard } from '../components/common/AIStateCard';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { INDIAN_CROPS, INDIAN_MANDIS_BY_STATE } from '../data/indianAgriCatalog';

export const PricePrediction = () => {
  const { t, lang } = useLanguage();
  const allStates = useMemo(() => Object.keys(INDIAN_MANDIS_BY_STATE).sort(), []);

  const [cropSearch, setCropSearch] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [customCommodity, setCustomCommodity] = useState('');
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [selectedMandi, setSelectedMandi] = useState(INDIAN_MANDIS_BY_STATE['Andhra Pradesh'][0]);
  const [customMandi, setCustomMandi] = useState('');
  const [horizon, setHorizon] = useState('7day');
  const [predictionData, setPredictionData] = useState(null);
  const [aiState, setAiState] = useState('loading');

  const filteredCrops = useMemo(() => {
    const q = cropSearch.trim().toLowerCase();
    if (!q) return INDIAN_CROPS;
    return INDIAN_CROPS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [cropSearch]);

  const stateMandis = INDIAN_MANDIS_BY_STATE[selectedState] || [];
  const activeCommodity =
    selectedCommodity === '__CUSTOM__' ? customCommodity.trim() || 'Tomato' : selectedCommodity;
  const activeMarket =
    selectedMandi === '__CUSTOM__'
      ? `${customMandi.trim() || selectedState} (${selectedState})`
      : `${selectedMandi} (${selectedState})`;

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const list = INDIAN_MANDIS_BY_STATE[newState] || [];
    setSelectedMandi(list[0] || '__CUSTOM__');
  };

  const fetchPrediction = async (commodity, horiz, market) => {
    setAiState('loading');
    try {
      const res = await apiClient.request('/prices/predict', {
        method: 'POST',
        body: { commodity, horizon: horiz, market, lang },
      });
      if (res.success) {
        setPredictionData(res.data);
        setAiState('success');
      } else {
        setAiState('error');
      }
    } catch {
      setAiState('error');
    }
  };

  useEffect(() => {
    if (activeCommodity && activeMarket) {
      fetchPrediction(activeCommodity, horizon, activeMarket);
    }
  }, [activeCommodity, horizon, activeMarket, lang]);

  const loadingMessage =
    lang === 'hi'
      ? `${activeCommodity} के भाव का पूर्वानुमान लोड हो रहा है...`
      : `Forecasting modal price for ${activeCommodity} at ${activeMarket}...`;

  const handleRetry = () => {
    fetchPrediction(activeCommodity, horizon, activeMarket);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            Live Market Intelligence
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Model: {predictionData?.modelMetadata?.modelVersion || 'FarmLink-XGB-v1.4'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('price_prediction')} &amp; AI Market Forecasts
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Track APMC modal prices and short-term price trajectories across all Indian states, mandis, and crops.
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('select_commodity')}</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Filter 65+ crops..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none mb-1.5"
              />
            </div>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 min-h-[44px] focus:border-emerald-600 focus:outline-none"
            >
              {filteredCrops.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.category})
                </option>
              ))}
              <option value="__CUSTOM__">+ Other / Custom Crop</option>
            </select>
            {selectedCommodity === '__CUSTOM__' && (
              <input
                type="text"
                value={customCommodity}
                onChange={(e) => setCustomCommodity(e.target.value)}
                placeholder="Type any Indian crop name..."
                className="mt-1 rounded-xl border border-emerald-400 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">State / UT</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 min-h-[44px] focus:border-emerald-600 focus:outline-none mt-auto"
            >
              {allStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('select_market')}</label>
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 min-h-[44px] focus:border-emerald-600 focus:outline-none mt-auto"
            >
              {stateMandis.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__CUSTOM__">+ Enter Local / Custom Mandi</option>
            </select>
            {selectedMandi === '__CUSTOM__' && (
              <input
                type="text"
                value={customMandi}
                onChange={(e) => setCustomMandi(e.target.value)}
                placeholder="Type local mandi name..."
                className="mt-1 rounded-xl border border-emerald-400 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('forecast_horizon')}</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold mt-auto">
              <button
                type="button"
                onClick={() => setHorizon('1day')}
                className={`py-2.5 rounded-lg transition cursor-pointer ${
                  horizon === '1day' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-Day Ahead
              </button>
              <button
                type="button"
                onClick={() => setHorizon('7day')}
                className={`py-2.5 rounded-lg transition cursor-pointer ${
                  horizon === '7day' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Trajectory
              </button>
            </div>
          </div>
        </div>
      </Card>

      {aiState === 'loading' && (
        <AIStateCard state="loading" message={loadingMessage} />
      )}
      {aiState === 'error' && (
        <AIStateCard state="error" onRetry={handleRetry} />
      )}

      {aiState === 'success' && predictionData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 bg-slate-900 text-white space-y-1 shadow-sm border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase">Current Modal Price</span>
              <p className="text-3xl font-black text-white">
                ₹{predictionData.currentModal}
                <span className="text-xs font-normal text-slate-300"> / Quintal</span>
              </p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5" />
                Latest APMC arrival rate
              </p>
            </div>

            <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-300 text-emerald-950 space-y-1 shadow-sm">
              <span className="text-xs font-bold text-emerald-800 uppercase">
                Predicted {horizon === '1day' ? '1-Day' : '7-Day'} Price
              </span>
              <p className="text-3xl font-black text-emerald-900">
                ₹{predictionData.forecastPrice}
                <span className="text-xs font-normal text-emerald-700"> / Quintal</span>
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                Expected range: ₹{predictionData.lowerBound} – ₹{predictionData.upperBound}
              </p>
            </div>

            <Card className="p-5 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Forecast Confidence</span>
                <div className="flex items-center gap-3 pt-1">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">MAE</p>
                    <p className="text-sm font-bold text-slate-800">{predictionData.modelMetadata?.mae || '₹35/Qtl'}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <p className="text-[10px] text-slate-400 uppercase">RMSE</p>
                    <p className="text-sm font-bold text-slate-800">{predictionData.modelMetadata?.rmse || '₹48/Qtl'}</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Time-Series Gradient Boosting Engine
              </p>
            </Card>
          </div>

          <Card className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t('historical_trend')} ({activeCommodity} — {activeMarket})
                </h3>
                <p className="text-xs text-slate-500">
                  Observed modal prices alongside projected market movement.
                </p>
              </div>
              <Badge variant="green" size="sm">
                Active Forecast
              </Badge>
            </div>
            <PriceTrendChart data={predictionData.chartData} unit={predictionData.unit} />
          </Card>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Market Data Provenance</span>
            </div>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-600 font-medium">
              <span>Data Stream: <strong>{predictionData.modelMetadata?.dataFreshness || 'AGMARKNET Daily Feed'}</strong></span>
              <span>Model Version: <strong>{predictionData.modelMetadata?.modelVersion || 'FarmLink-XGB-v1.4'}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};