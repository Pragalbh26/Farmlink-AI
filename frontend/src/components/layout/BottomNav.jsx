import React from 'react';
import { LayoutDashboard, Store, ScanLine, TrendingUp, Landmark, CloudSun, MessageSquareText, Truck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role || 'farmer';

  let navItems = [];

  if (role === 'farmer') {
    navItems = [
      { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
      { id: 'marketplace', label: t('marketplace'), icon: Store },
      { id: 'disease', label: t('disease_detection'), icon: ScanLine },
      { id: 'prices', label: t('price_prediction'), icon: TrendingUp },
      { id: 'schemes', label: t('schemes'), icon: Landmark },
      { id: 'chat', label: t('chat'), icon: MessageSquareText },
    ];
  } else if (role === 'buyer') {
    navItems = [
      { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
      { id: 'marketplace', label: t('marketplace'), icon: Store },
      { id: 'orders', label: t('orders'), icon: ShoppingBag },
      { id: 'prices', label: t('price_prediction'), icon: TrendingUp },
      { id: 'transport', label: t('transport'), icon: Truck },
    ];
  } else {
    // transporter
    navItems = [
      { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
      { id: 'transport', label: t('transport'), icon: Truck },
      { id: 'marketplace', label: t('marketplace'), icon: Store },
      { id: 'chat', label: t('chat'), icon: MessageSquareText },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all touch-target cursor-pointer flex-1 ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-transform ${
                  isActive ? 'bg-emerald-100/90 text-emerald-800 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px] text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
