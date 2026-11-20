import React, { useState } from 'react';
import { Phone, Lock, LogIn, Sprout } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Login = ({ onGoRegister, onLoginSuccess }) => {
  const { loginUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
        body: { phone, password }
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
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to FarmLink AI</h2>
          <p className="text-sm text-slate-500">Access your farm listings, orders, and AI tools</p>
        </div>

        <Card className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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