import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, CheckCircle2, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ImageUpload } from '../components/marketplace/ImageUpload';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const CreateListing = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [crop, setCrop] = useState('Tomato');
  const [variety, setVariety] = useState('Abhinav Hybrid');
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('Quintal');
  const [expectedPrice, setExpectedPrice] = useState(1800);
  const [state, setState] = useState(user?.state || 'Maharashtra');
  const [district, setDistrict] = useState(user?.district || 'Pune');
  const [market, setMarket] = useState('Pune APMC');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Freshly harvested Grade-A produce, cleaned, sorted, ready for immediate dispatch.');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const crops = [
    { name: 'Tomato', defaultVar: 'Abhinav Hybrid', defaultPrice: 1800, modalRef: 1780, sampleImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
    { name: 'Onion', defaultVar: 'Nashik Red', defaultPrice: 1600, modalRef: 1580, sampleImg: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80' },
    { name: 'Potato', defaultVar: 'Kufri Jyoti', defaultPrice: 1350, modalRef: 1320, sampleImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80' },
    { name: 'Wheat', defaultVar: 'Sharbati HD-2967', defaultPrice: 2400, modalRef: 2380, sampleImg: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80' },
    { name: 'Rice', defaultVar: 'BPT 5204 Samba', defaultPrice: 3200, modalRef: 3100, sampleImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleCropChange = (cName) => {
    const matched = crops.find(c => c.name === cName);
    if (matched) {
      setCrop(matched.name);
      setVariety(matched.defaultVar);
      setExpectedPrice(matched.defaultPrice);
      setImage(matched.sampleImg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || !expectedPrice) {
      setError('Please fill in quantity and expected price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.request('/listings/', {
        method: 'POST',
        body: {
          crop,
          variety,
          quantity: Number(quantity),
          unit,
          expected_price: Number(expectedPrice),
          location: `${district}, ${state}${market ? ` - ${market}` : ''}`,
          image_url: image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        }
      });

      if (res.success) {
        addToast('Crop listing posted to marketplace successfully!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')} to Dashboard</span>
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('list_harvest_cta')}
        </h1>
        <p className="text-sm text-slate-500">
          Offer your harvest directly to registered buyers with verified mandi price reference
        </p>
      </div>

      <Card className="space-y-6 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Selector Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Crop Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {crops.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCropChange(c.name)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition cursor-pointer ${
                    crop === c.name
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-lg">
                    {c.name === 'Tomato' ? '🍅' : c.name === 'Onion' ? '🧅' : c.name === 'Potato' ? '🥔' : c.name === 'Wheat' ? '🌾' : '🍚'}
                  </span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Component */}
          <ImageUpload
            label="Harvest Photo"
            helperText="Clear photo of the harvested lot or crop field"
            previewUrl={image}
            onImageSelected={(url) => setImage(url)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Variety / Grade"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              required
              placeholder="e.g. Abhinav Hybrid Grade-A"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label={`Quantity (${unit})`}
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 min-h-[48px] text-base focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Quintal">Quintal</option>
                  <option value="Kg">Kg</option>
                  <option value="Ton">Ton</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expected Price & Mandi Helper */}
          <div className="space-y-2">
            <Input
              label={`Expected Selling Price (₹ per ${unit})`}
              type="number"
              min="100"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              required
            />
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
              <span className="text-emerald-800 font-medium">
                Current {district} APMC Modal Benchmark:
              </span>
              <span className="font-extrabold text-emerald-950">
                ₹{crops.find(c => c.name === crop)?.modalRef || 1780} / {unit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              label="Nearest Mandi"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              required
            />
          </div>

          <Input
            label="Harvest Date"
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Description / Lot Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 text-base focus:border-emerald-600 focus:outline-none"
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
            Publish Harvest Listing
          </Button>
        </form>
      </Card>
    </div>
  );
};
