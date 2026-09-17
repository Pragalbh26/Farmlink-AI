import React from 'react';
import {
  LayoutDashboard,
  Store,
  ScanLine,
  TrendingUp,
  Landmark,
  CloudSun,
  MessageSquareText,
  Truck,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role || 'farmer';

  const menuSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: t('home'), icon: LayoutDashboard, roles: ['farmer', 'buyer', 'transporter'] },
        { id: 'marketplace', label: t('marketplace'), icon: Store, roles: ['farmer', 'buyer', 'transporter'] },
        { id: 'orders', label: t('orders'), icon: ShoppingBag, roles: ['farmer', 'buyer'] },
      ]
    },
    {
      title: 'AGRI AI INTELLIGENCE',
      items: [
        { id: 'prices', label: t('price_prediction'), icon: TrendingUp, roles: ['farmer', 'buyer'] },
        { id: 'disease', label: t('disease_detection'), icon: ScanLine, roles: ['farmer'] },
        { id: 'chat', label: t('chat'), icon: MessageSquareText, roles: ['farmer', 'buyer', 'transporter'] },
      ]
    },
    {
      title: 'ECOSYSTEM & SUPPORT',
      items: [
        { id: 'schemes', label: t('schemes'), icon: Landmark, roles: ['farmer'] },
        { id: 'weather', label: t('weather'), icon: CloudSun, roles: ['farmer', 'buyer'] },
        { id: 'transport', label: t('transport'), icon: Truck, roles: ['farmer', 'buyer', 'transporter'] },
      ]
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-65px)] p-4 shrink-0 justify-between">
      <div className="space-y-6">
        {/* Farmer Quick Sell CTA */}
        {role === 'farmer' && (
          <button
            onClick={() => onSelectTab('create-listing')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 hover:from-emerald-800 hover:to-emerald-900 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('list_harvest_cta')}</span>
          </button>
        )}

        {/* Navigation Categories */}
        {menuSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              <p className="text-[11px] font-bold tracking-wider text-slate-400 px-3 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grounded AI Badge Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Grounded Intelligence</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Powered by AGMARKNET, PlantVillage & official GOI portals with deterministic safety bounds.
        </p>
      </div>
    </aside>
  );
};
