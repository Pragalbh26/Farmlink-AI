import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { TransporterDashboard } from './pages/TransporterDashboard';
import { Marketplace } from './pages/Marketplace';
import { ListingDetail } from './pages/ListingDetail';
import { CreateListing } from './pages/CreateListing';
import { Orders } from './pages/Orders';
import { PricePrediction } from './pages/PricePrediction';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { Chatbot } from './pages/Chatbot';
import { Weather } from './pages/Weather';
import { Schemes } from './pages/Schemes';
import { EligibilityCheck } from './pages/EligibilityCheck';
import { Transport } from './pages/Transport';
import { Profile } from './pages/Profile';

const AppContent = () => {
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { lang } = useLanguage();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedListing, setSelectedListing] = useState(null);
  const [authView, setAuthView] = useState('landing');

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600" role="status">
        {lang === 'hi' ? 'आपका सुरक्षित सत्र बहाल हो रहा है...' : 'Restoring your secure session...'}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div key={lang}>
        {authView === 'landing' && (
          <Landing
            onGoLogin={() => setAuthView('login')}
            onGoRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'login' && (
          <Login
            onGoRegister={() => setAuthView('register')}
            onLoginSuccess={() => setCurrentTab('dashboard')}
          />
        )}
        {authView === 'register' && (
          <Register
            onGoLogin={() => setAuthView('login')}
            onRegisterSuccess={() => setCurrentTab('dashboard')}
          />
        )}
        {authView !== 'landing' && authView !== 'login' && authView !== 'register' && (
          <Onboarding
            onSelectRole={() => setCurrentTab('dashboard')}
            onGoLogin={() => setAuthView('login')}
          />
        )}
      </div>
    );
  }

  const roleDashboard = () => {
    if (user?.role === 'buyer') return <BuyerDashboard onNavigate={setCurrentTab} />;
    if (user?.role === 'transporter') return <TransporterDashboard onNavigate={setCurrentTab} />;
    return <FarmerDashboard onNavigate={setCurrentTab} />;
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return roleDashboard();
      case 'marketplace':
        if (user?.role === 'transporter') return roleDashboard();
        return (
          <Marketplace
            onNavigate={setCurrentTab}
            onSelectListing={(listing) => {
              setSelectedListing(listing);
              setCurrentTab('listing-detail');
            }}
          />
        );
      case 'listing-detail':
        if (user?.role === 'transporter') return roleDashboard();
        return (
          <ListingDetail
            listing={selectedListing}
            onBack={() => setCurrentTab('marketplace')}
            onOrderSuccess={() => setCurrentTab('orders')}
          />
        );
      case 'create-listing':
        if (user?.role !== 'farmer') return roleDashboard();
        return (
          <CreateListing
            onBack={() => setCurrentTab('dashboard')}
            onSuccess={() => setCurrentTab('marketplace')}
          />
        );
      case 'orders':
        if (user?.role === 'transporter') return roleDashboard();
        return <Orders onNavigate={setCurrentTab} />;
      case 'prices':
        if (user?.role === 'transporter') return roleDashboard();
        return <PricePrediction />;
      case 'disease':
        if (user?.role === 'transporter') return roleDashboard();
        return <DiseaseDetection />;
      case 'chat':
        if (user?.role === 'transporter') return roleDashboard();
        return <Chatbot />;
      case 'weather':
        if (user?.role === 'transporter') return roleDashboard();
        return <Weather />;
      case 'schemes':
        if (user?.role !== 'farmer') return roleDashboard();
        return (
          <Schemes
            onStartEligibilityCheck={() => setCurrentTab('eligibility-check')}
          />
        );
      case 'eligibility-check':
        if (user?.role !== 'farmer') return roleDashboard();
        return (
          <EligibilityCheck
            onBack={() => setCurrentTab('schemes')}
          />
        );
      case 'transport':
        if (user?.role === 'transporter') return roleDashboard();
        return <Transport />;
      case 'profile':
        return <Profile onLogout={() => setAuthView('landing')} />;
      default:
        return roleDashboard();
    }
  };

  return (
    <AppLayout key={lang} currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderScreen()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}