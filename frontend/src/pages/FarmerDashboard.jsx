import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ScanLine,
  PlusCircle,
  MessageSquareText,
  Landmark,
  Truck,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Store,
  Sprout
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/marketplace/ListingCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const FarmerDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listRes, wRes] = await Promise.all([
          apiClient.request('/listings/'),
          apiClient.request('/weather/current')
        ]);
        if (listRes.success) {
          // Filter listings owned by this farmer
          const myListings = listRes.data.filter(l => l.farmerId === user?.id || l.farmerId === 'usr_farmer_01');
          setListings(myListings);
        }
        if (wRes.success) setWeather(wRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const quickActions = [
    {
      id: 'prices',
      title: t('check_mandi_cta'),
      desc: 'AGMARKNET live prices & 7-day AI forecast',
      icon: TrendingUp,
      accent: 'bg-emerald-700 text-white',
      badge: 'Price AI',
    },
    {
      id: 'disease',
      title: t('scan_crop_cta'),
      desc: 'Instant leaf photo scan & ICAR advice',
      icon: ScanLine,
      accent: 'bg-emerald-600 text-white',
      badge: 'Vision CV',
    },
    {
      id: 'create-listing',
      title: t('list_harvest_cta'),
      desc: 'Sell directly to buyers with zero middleman',
      icon: PlusCircle,
      accent: 'bg-amber-600 text-white',
      badge: 'Marketplace',
    },
    {
      id: 'chat',
      title: t('ask_ai_cta'),
      desc: 'Grounded assistant for farming & schemes',
      icon: MessageSquareText,
      accent: 'bg-slate-800 text-white',
      badge: 'RAG LLM',
    },
    {
      id: 'schemes',
      title: t('check_schemes_cta'),
      desc: 'Deterministic eligibility for PM-KISAN & more',
      icon: Landmark,
      accent: 'bg-blue-700 text-white',
      badge: 'Schemes',
    },
    {
      id: 'transport',
      title: t('book_transport_cta'),
      desc: 'Find verified trucks & tractor delivery',
      icon: Truck,
      accent: 'bg-amber-700 text-white',
      badge: 'Logistics',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Farmer Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user?.avatar || '👨‍🌾'}</span>
              <span className="text-xs uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-600/60 border border-emerald-400/30">
                Verified Farmer Member
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('welcome_back')}, {user?.name || 'Ramesh Patel'}!
            </h1>
            <p className="text-sm text-emerald-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>{user?.village || 'Khed'}, {user?.district || 'Pune'}, {user?.state || 'Maharashtra'} • Land: {user?.landSize || 4.5} Acres</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="amber"
              size="md"
              icon={PlusCircle}
              onClick={() => onNavigate('create-listing')}
            >
              {t('list_harvest_cta')}
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={ScanLine}
              onClick={() => onNavigate('disease')}
            >
              Scan Leaf
            </Button>
          </div>
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Sprout className="w-64 h-64" />
        </div>
      </div>

      {/* Weather & Agromet Advisory Alert Widget */}
      {weather && weather.advisories && weather.advisories.length > 0 && (
        <div
          onClick={() => onNavigate('weather')}
          className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-300/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-amber-500/20 transition shadow-xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                  IMD Agromet Advisory
                </span>
                <span className="text-xs text-amber-800">{weather.location}</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base mt-1">{weather.advisories[0].hazard}</h4>
              <p className="text-xs text-slate-700 line-clamp-1 mt-0.5">{weather.advisories[0].message}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-900 shrink-0">
            <span>View 5-Day Forecast</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Quick Action Tiles */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>{t('quick_actions')}</span>
          <span className="text-xs font-normal text-slate-500">(1-Tap Agricultural Tools)</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                hover
                onClick={() => onNavigate(action.id)}
                className="flex flex-col justify-between p-4 sm:p-5 group border hover:border-emerald-500 transition-all cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl ${action.accent} flex items-center justify-center shadow-xs group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="default" size="sm">
                      {action.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mandi Price Spotlight Widget */}
      <Card className="space-y-4 bg-gradient-to-br from-white to-emerald-50/40">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="green" size="sm">Live AGMARKNET Stream</Badge>
              <span className="text-xs text-slate-500">Updated Today, 06:00 AM IST</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Tomato (Abhinav) — Pune APMC Market</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prices')}
            icon={TrendingUp}
          >
            Explore AI Price Models
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Current Mandi Modal Price</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹1,780 <span className="text-xs font-normal text-slate-500">/ Qtl</span></p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-800">AI 7-Day Predicted Modal</p>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">₹1,940 <span className="text-xs font-bold text-emerald-700">(+₹160 ▲)</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Recommended Farmer Action</p>
            <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">
              Prices expected to rise next week. Consider holding well-cured harvest for 3-5 days.
            </p>
          </div>
        </div>
      </Card>

      {/* Active Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('recent_listings')}</h2>
            <p className="text-xs text-slate-500">Your direct-to-buyer crop listings</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => onNavigate('create-listing')}
          >
            {t('list_harvest_cta')}
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-slate-50 border-dashed">
            <Store className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 max-w-md">{t('no_listings_yet')}</p>
            <Button variant="primary" size="md" onClick={() => onNavigate('create-listing')}>
              {t('list_harvest_cta')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                isOwner
                onSelect={() => onNavigate('marketplace')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
