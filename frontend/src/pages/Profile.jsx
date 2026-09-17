import React, { useState } from 'react';
import { User, Phone, MapPin, Globe, ShieldCheck, LogOut, CheckCircle2, Moon, Eye } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Profile = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || 'Maharashtra');
  const [district, setDistrict] = useState(user?.district || 'Pune');
  const [village, setVillage] = useState(user?.village || 'Khed');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const profileKey = user?.role === 'farmer' ? 'farmer_profile' : user?.role === 'buyer' ? 'buyer_profile' : 'transporter_profile';
      const profile = user?.role === 'farmer' ? { state, district, village } : user?.role === 'buyer' ? { location: district } : {};
      const res = await apiClient.request('/auth/profile', { method: 'PUT', body: { name, [profileKey]: profile } });
      if (!res.success) throw new Error('Unable to save profile');
      setSaved(true);
      addToast('Profile & regional preferences updated!', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      addToast(err.message || 'Unable to save profile changes', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('profile')} & Preferences</h1>
        <p className="text-sm text-slate-500">Manage your farm location, contact details, and regional settings</p>
      </div>

      <Card className="space-y-6 p-6 sm:p-8">
        {/* User Summary Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 text-3xl flex items-center justify-center font-bold shadow-xs">
            {user?.avatar || '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <Badge variant="green" size="sm">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.phone}</p>
          </div>
        </div>

        {/* Form Details */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name / Trader Entity"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
            <Input
              label="Village / Yard"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          {/* Language & Accessibility */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Language & Accessibility Preferences</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`p-3.5 rounded-2xl border text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  lang === 'en'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`p-3.5 rounded-2xl border text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  lang === 'hi'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇮🇳 हिन्दी (Hindi)</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              icon={CheckCircle2}
            >
              {saved ? 'Preferences Saved!' : 'Save Profile Changes'}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => {
                logout();
                if (onLogout) onLogout();
              }}
              icon={LogOut}
            >
              {t('logout')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
