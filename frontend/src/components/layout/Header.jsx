import React from 'react';
import { Sprout, Globe, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../common/Badge';

export const Header = ({ currentTab, onSelectTab }) => {
  const { user, switchRole } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                Agri<span className="text-emerald-700">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden md:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold capitalize">
            {t(`role_${user?.role}`)}
          </div>
          {/* Role switching is intentionally not exposed in the production UI. */}
          {false && <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => switchRole('farmer')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                user?.role === 'farmer'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Farmer View"
            >
              <Tractor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer</span>
            </button>
            <button
              onClick={() => switchRole('buyer')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                user?.role === 'buyer'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Buyer View"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buyer</span>
            </button>
            <button
              onClick={() => switchRole('transporter')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                user?.role === 'transporter'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Transporter View"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Transporter</span>
            </button>
          </div>}

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer touch-target justify-center"
            title="Toggle English / हिन्दी"
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>{lang === 'en' ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* User Profile avatar */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border transition cursor-pointer touch-target ${
              currentTab === 'profile'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-800">
              {user?.avatar || '👤'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-emerald-700 font-semibold uppercase">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
