import React, { useState } from 'react';
import { Phone, Lock, LogIn, Sprout, UserCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Login = ({ onGoRegister, onLoginSuccess }) => {
  const { loginUser, loginAs } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your mobile phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.request('/auth/login', {
        method: 'POST',
        body: { phone, password, role }
      });

      if (res.success) {
        loginUser(res.data.user, res.data.tokens?.access || res.data.token);
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-900/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to AgriConnect</h2>
          <p className="text-sm text-slate-500">Access your farm listings, orders, and AI tools</p>
        </div>

        {apiClient.isMockMode && <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
          <p className="font-bold text-emerald-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Fast Evaluator Demo Access</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAs('farmer');
                if (onLoginSuccess) onLoginSuccess();
              }}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-emerald-700 hover:text-white border border-emerald-300 font-bold text-emerald-800 transition text-center cursor-pointer"
            >
              👨‍🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => {
                loginAs('buyer');
                if (onLoginSuccess) onLoginSuccess();
              }}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-emerald-700 hover:text-white border border-emerald-300 font-bold text-emerald-800 transition text-center cursor-pointer"
            >
              🏢 Buyer
            </button>
            <button
              type="button"
              onClick={() => {
                loginAs('transporter');
                if (onLoginSuccess) onLoginSuccess();
              }}
              className="py-1.5 px-2 rounded-lg bg-white hover:bg-emerald-700 hover:text-white border border-emerald-300 font-bold text-emerald-800 transition text-center cursor-pointer"
            >
              🚛 Transporter
            </button>
          </div>
        </div>}

        <Card className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Select Role</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                {['farmer', 'buyer', 'transporter'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg capitalize transition cursor-pointer ${
                      role === r ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Phone Number"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />

            <Input
              label="Password / PIN"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={error}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={LogIn}
            >
              {t('login')}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onGoRegister}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
