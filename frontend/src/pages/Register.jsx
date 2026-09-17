import React, { useState } from 'react';
import { User, Phone, MapPin, Building, Tractor, ShoppingCart, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Register = ({ onGoLogin, onRegisterSuccess }) => {
  const { loginUser } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      setError(password.length < 6 ? 'Password must be at least 6 characters' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.request('/auth/register', {
        method: 'POST',
        body: { role, name, phone, password, state, district }
      });

      if (res.success) {
        loginUser(res.data.user, res.data.tokens?.access || res.data.token);
        addToast(`Account created for ${res.data.user.name}!`, 'success');
        if (onRegisterSuccess) onRegisterSuccess();
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Create AgriConnect Account</h2>
          <p className="text-sm text-slate-500">Register as a Farmer, Wholesale Buyer, or Transporter</p>
        </div>

        <Card className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'farmer', label: 'Farmer', icon: Tractor },
                  { id: 'buyer', label: 'Buyer', icon: ShoppingCart },
                  { id: 'transporter', label: 'Transport', icon: Truck },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                        role === r.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Full Name / Business Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              required
            />

            <Input
              label="Mobile Number (for SMS & verification)"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />

            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="State"
                icon={MapPin}
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="District / APMC"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={CheckCircle2}
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoLogin}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
