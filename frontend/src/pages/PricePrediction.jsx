import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Building2,
  ShieldCheck,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PriceTrendChart } from '../components/price/PriceTrendChart';
import { AIStateCard } from '../components/common/AIStateCard';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { mockPriceDatasets } from '../api/mockData';

export const PricePrediction = () => {
  const { t } = useLanguage();

  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [horizon, setHorizon] = useState('7day');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiState, setAiState] = useState('success'); // 'loading' | 'success' | 'uncertain' | 'error'

  const commodities = ['Tomato', 'Onion', 'Potato', 'Wheat'];

  const fetchPrediction = async (commodity, horiz) => {
    setLoading(true);
    setAiState('loading');
    try {
      const res = await apiClient.request('/prices/predict', {
        method: 'POST',
        body: { commodity, horizon: horiz }
      });
      if (res.success) {
        setPredictionData(res.data);
        setAiState('success');
      }
    } catch (err) {
      setAiState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const markets = mockPriceDatasets[selectedCommodity]?.markets || [];
    setSelectedMarket(markets[0] || '');
    fetchPrediction(selectedCommodity, horizon);
  }, [selectedCommodity, horizon]);

  const activeCropConfig = mockPriceDatasets[selectedCommodity] || mockPriceDatasets['Tomato'];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            Mandi Price AI Engine
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Model: {predictionData?.modelMetadata?.modelVersion || 'v1.4-xgboost-timeseries'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('price_prediction')} & AGMARKNET Forecasting
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Multi-horizon modal mandi price predictions generated using chronological time-series machine learning over official AGMARKNET daily observations.
        </p>
      </div>

      {/* Parameter Selection Controls */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Commodity Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('select_commodity')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {commodities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCommodity(c)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    selectedCommodity === c
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c === 'Tomato' ? '🍅' : c === 'Onion' ? '🧅' : c === 'Potato' ? '🥔' : '🌾'} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mandi Market Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('select_market')}</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 min-h-[44px] focus:border-emerald-600 focus:outline-none"
            >
              {activeCropConfig.markets.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Forecast Horizon Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">{t('forecast_horizon')}</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setHorizon('1day')}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  horizon === '1day' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-Day Ahead
              </button>
              <button
                type="button"
                onClick={() => setHorizon('7day')}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  horizon === '7day' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Trajectory
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* AI State Handling */}
      {aiState === 'loading' && (
        <AIStateCard
          state="loading"
          message={`Forecasting future modal price for ${selectedCommodity} at ${selectedMarket}...`}
        />
      )}

      {aiState === 'error' && (
        <AIStateCard
          state="error"
          onRetry={() => fetchPrediction(selectedCommodity, horizon)}
        />
      )}

      {aiState === 'success' && predictionData && (
        <div className="space-y-6">
          {/* Price Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-slate-900 text-white space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Observed AGMARKNET Modal</span>
              <p className="text-3xl font-black">
                ₹{predictionData.currentModal}
                <span className="text-xs font-normal text-slate-400"> / Quintal</span>
              </p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                <Clock className="w-3.5 h-3.5" />
                Latest daily arrival record
              </p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-emerald-300 text-emerald-950 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">
                AI {horizon === '1day' ? '1-Day' : '7-Day'} Predicted Modal
              </span>
              <p className="text-3xl font-black text-emerald-900">
                ₹{predictionData.forecastPrice}
                <span className="text-xs font-normal text-emerald-700"> / Quintal</span>
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                95% Confidence Band: ₹{predictionData.lowerBound} – ₹{predictionData.upperBound}
              </p>
            </Card>

            <Card className="p-5 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Model Validation Quality</span>
                <div className="flex items-center gap-3 pt-1">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">MAE Error</p>
                    <p className="text-sm font-bold text-slate-800">{predictionData.modelMetadata.mae}</p>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <p className="text-[10px] text-slate-400 uppercase">RMSE Error</p>
                    <p className="text-sm font-bold text-slate-800">{predictionData.modelMetadata.rmse}</p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Evaluated with temporal cross-validation
              </p>
            </Card>
          </div>

          {/* Interactive Recharts Graph */}
          <Card className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t('historical_trend')} ({selectedCommodity} — {selectedMarket})
                </h3>
                <p className="text-xs text-slate-500">
                  Green curve shows recorded AGMARKNET modal rates; Gold dashed curve shows time-series forecast with confidence intervals.
                </p>
              </div>
              <Badge variant="green" size="sm">
                Leakage-Free Validation
              </Badge>
            </div>

            <PriceTrendChart data={predictionData.chartData} unit={predictionData.unit} />
          </Card>

          {/* Responsible AI Notice & Data Provenance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Responsible AI Governance & Data Provenance</span>
            </div>
            <p className="leading-relaxed">
              {t('ai_disclaimer_price')} Mandi rates fluctuate based on unobserved real-time arrivals, localized weather disruptions, quality variances, and interstate logistics.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-600 font-medium">
              <span>Data Stream: <strong>{predictionData.modelMetadata.dataFreshness}</strong></span>
              <span>Model Cutoff Date: <strong>{predictionData.modelMetadata.trainingCutoffDate}</strong></span>
              <span>Algorithm: <strong>Gradient Boosted Lag Regressor (XGBoost)</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
