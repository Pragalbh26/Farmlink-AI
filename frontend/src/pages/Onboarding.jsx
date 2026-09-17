import React from 'react';
import { Tractor, ShoppingCart, Truck, ArrowRight, ShieldCheck, Sparkles, Sprout } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Onboarding = ({ onSelectRole, onGoLogin }) => {
  const { loginAs } = useAuth();
  const { t } = useLanguage();

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer (किसान)',
      desc: 'Sell crops directly to buyers, get AI price forecasts, diagnose leaf diseases & check government scheme eligibility.',
      icon: Tractor,
      accent: 'border-emerald-500 bg-emerald-50/50',
      badgeColor: 'bg-emerald-700 text-white',
      demoAction: 'Enter as Demo Farmer (Ramesh Patel)'
    },
    {
      id: 'buyer',
      title: 'Buyer / Trader (खरीदार)',
      desc: 'Browse harvest listings directly from verified farmers, compare live mandi rates, and place purchase orders without middlemen.',
      icon: ShoppingCart,
      accent: 'border-blue-500 bg-blue-50/50',
      badgeColor: 'bg-blue-700 text-white',
      demoAction: 'Enter as Demo Buyer (GreenFresh Foods)'
    },
    {
      id: 'transporter',
      title: 'Transporter (परिवहन सेवा)',
      desc: 'List your rural transport vehicles (Eicher, Bolero, Tractor-Trolley), accept farm gate delivery requests and track routes.',
      icon: Truck,
      accent: 'border-amber-500 bg-amber-50/50',
      badgeColor: 'bg-amber-700 text-white',
      demoAction: 'Enter as Demo Transporter (Kishan Logistics)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full space-y-8 py-8 text-center">
        {/* Brand Header */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-xl shadow-emerald-900/20">
            <Sprout className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Agri<span className="text-emerald-700">Connect</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto mt-2">
              India's Direct Agricultural Marketplace with Grounded AI Price Intelligence, Disease Diagnostics & Scheme Eligibility
            </p>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Card
                key={r.id}
                hover
                onClick={() => {
                  loginAs(r.id);
                  onSelectRole(r.id);
                }}
                className={`flex flex-col justify-between p-6 border-2 transition-all group ${r.accent}`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-slate-300 font-bold text-xs text-slate-800 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                    <span>{r.demoAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Official AGMARKNET & ICAR Verified
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            60-Day Capstone Demonstration Ready
          </span>
        </div>
      </div>
    </div>
  );
};
