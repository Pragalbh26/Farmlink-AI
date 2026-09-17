import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

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
  const { user, isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedListing, setSelectedListing] = useState(null);
  const [authView, setAuthView] = useState('login');

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onGoRegister={() => setAuthView('register')}
          onLoginSuccess={() => setCurrentTab('dashboard')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <Register
          onGoLogin={() => setAuthView('login')}
          onRegisterSuccess={() => setCurrentTab('dashboard')}
        />
      );
    }
    return (
      <Onboarding
        onSelectRole={() => setCurrentTab('dashboard')}
        onGoLogin={() => setAuthView('login')}
      />
    );
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        if (user?.role === 'buyer') {
          return <BuyerDashboard onNavigate={setCurrentTab} />;
        }
        if (user?.role === 'transporter') {
          return <TransporterDashboard onNavigate={setCurrentTab} />;
        }
        return <FarmerDashboard onNavigate={setCurrentTab} />;

      case 'marketplace':
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
        return (
          <ListingDetail
            listing={selectedListing}
            onBack={() => setCurrentTab('marketplace')}
            onOrderSuccess={() => setCurrentTab('orders')}
          />
        );

      case 'create-listing':
        return (
          <CreateListing
            onBack={() => setCurrentTab('dashboard')}
            onSuccess={() => setCurrentTab('marketplace')}
          />
        );

      case 'orders':
        return <Orders onNavigate={setCurrentTab} />;

      case 'prices':
        return <PricePrediction />;

      case 'disease':
        return <DiseaseDetection />;

      case 'chat':
        return <Chatbot />;

      case 'weather':
        return <Weather />;

      case 'schemes':
        return (
          <Schemes
            onStartEligibilityCheck={() => setCurrentTab('eligibility-check')}
          />
        );

      case 'eligibility-check':
        return (
          <EligibilityCheck
            onBack={() => setCurrentTab('schemes')}
          />
        );

      case 'transport':
        return <Transport />;

      case 'profile':
        return <Profile onLogout={() => setAuthView('login')} />;

      default:
        return <FarmerDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
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
