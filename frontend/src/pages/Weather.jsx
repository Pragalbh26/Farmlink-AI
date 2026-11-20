import React, { useState, useEffect, useCallback } from 'react';
import { CloudSun, CloudRain, Droplets, Wind, ShieldCheck, MapPin, RefreshCw, Crosshair } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WeatherAlertBanner } from '../components/weather/WeatherAlertBanner';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const Weather = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async (overrideCoords = null) => {
    setLoading(true);
    setError('');
    try {
      const target = overrideCoords || coords;
      const endpoint = target
        ? `/weather/current?lat=${target.lat}&lon=${target.lon}`
        : '/weather/current';
      const res = await apiClient.request(endpoint);
      if (res.success) {
        setWeather(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load weather information.');
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCoords = {
          lat: pos.coords.latitude.toFixed(4),
          lon: pos.coords.longitude.toFixed(4),
        };
        setCoords(nextCoords);
        setLocating(false);
        fetchWeather(nextCoords);
      },
      () => {
        setLocating(false);
        setError('Location permission denied. Showing forecast for your saved profile location.');
      },
      { timeout: 8000 }
    );
  };

  if (loading && !weather) {
    return <div className="p-12 text-center text-slate-500" role="status">Loading agrometeorological advisories...</div>;
  }

  if (error && !weather) {
    return (
      <div className="p-12 text-center space-y-3">
        <p role="alert" className="text-rose-700">{error}</p>
        <Button variant="outline" onClick={() => fetchWeather()} icon={RefreshCw}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="md">Live Agromet Feed</Badge>
            <span className="text-xs text-slate-500 font-mono">Updated: {weather?.verifiedTimestamp}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {t('weather')} &amp; Farming Advisories
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{weather?.location}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUseDeviceLocation}
            loading={locating}
            icon={Crosshair}
          >
            Use Device Location
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchWeather()}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Forecast
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-amber-800">{error}</p>}

      {weather && (
        <>
          <WeatherAlertBanner alerts={weather.advisories} location={weather.location} timestamp={weather.verifiedTimestamp} />

          <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Current Field Conditions</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-black">{weather.currentTemp}°C</span>
                  <span className="text-lg text-slate-300 font-medium">{weather.condition}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 sm:pt-0">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-300 font-bold">{t('humidity')}</p>
                  <p className="text-base font-extrabold">{weather.humidity}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <CloudRain className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-300 font-bold">Rain Prob</p>
                  <p className="text-base font-extrabold">{weather.rainfallChance}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                  <Wind className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-[10px] uppercase text-slate-300 font-bold">{t('wind')}</p>
                  <p className="text-base font-extrabold">{weather.windSpeed}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">5-Day District Agrometeorological Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(weather.fiveDayForecast || []).map((day, idx) => (
                <Card key={idx} className="p-4 text-center space-y-2 border hover:border-emerald-500 transition">
                  <p className="text-xs font-extrabold text-slate-900">{day.day} ({day.date})</p>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{day.tempMax}° / {day.tempMin}°</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{day.condition}</p>
                  </div>
                  <div className="pt-1 text-[10px] font-bold text-blue-700 bg-blue-50 py-0.5 rounded-md">
                    Rain: {day.rainProb}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              {weather.source || 'Open-Meteo / IMD Agromet Advisory'}
            </span>
            <span className="font-semibold text-emerald-700">Active Feed</span>
          </div>
        </>
      )}
    </div>
  );
};