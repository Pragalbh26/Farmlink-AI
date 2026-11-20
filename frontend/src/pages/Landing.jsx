import React from 'react';
import { Sprout, TrendingUp, ScanLine, Landmark, Store, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';

export const Landing = ({ onGoLogin, onGoRegister }) => {
  const { lang, toggleLanguage } = useLanguage();

  const features = [
    {
      title: 'Direct Marketplace',
      desc: 'Connect directly with buyers and transporters. Zero middlemen, better margins.',
      icon: Store,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'AI Price Forecasts',
      desc: 'Predict future mandi prices using advanced machine learning models.',
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Crop Disease Scan',
      desc: 'Instantly diagnose leaf diseases using computer vision and get verified ICAR treatments.',
      icon: ScanLine,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Scheme Eligibility',
      desc: 'Check your eligibility for PM-KISAN and state grants instantly.',
      icon: Landmark,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop")',
          filter: 'blur(8px)',
          transform: 'scale(1.05)'
        }}
      />
      {/* Dark/Gradient Overlay for Readability */}
      <div className="absolute inset-0 z-0 bg-slate-900/60 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-50" />

      {/* Navbar */}
      <nav className="relative z-10 p-4 sm:px-8 sm:py-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-md">
            FarmLink<span className="text-emerald-400"> AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoLogin}
            className="text-white hover:bg-white/20 hover:text-white"
          >
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={onGoRegister}>
            Register
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-10 py-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md text-emerald-300 text-sm font-bold border border-emerald-400/30 shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Empowering Indian Agriculture with Grounded AI</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
            <span>The Digital OS for </span>
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
              Modern Farming
            </span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            FarmLink AI integrates direct farm-to-buyer commerce, mandi price intelligence, computer vision crop diagnostics, and government scheme eligibility in one platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onGoRegister}
            icon={ArrowRight}
            className="shadow-xl shadow-emerald-900/40"
          >
            Get Started Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onGoLogin}
            className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50"
          >
            Sign into your Account
          </Button>
        </div>
      </main>

      {/* Feature Grid matching app theme */}
      <div className="relative z-10 bg-slate-50 pt-16 pb-24 px-6 rounded-t-[3rem] mt-12 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Everything you need in one platform
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-left hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};