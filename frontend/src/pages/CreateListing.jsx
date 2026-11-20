import React, { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Search } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ImageUpload } from '../components/marketplace/ImageUpload';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { INDIAN_CROPS, INDIAN_MANDIS_BY_STATE } from '../data/indianAgriCatalog';

export const CreateListing = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const allStates = useMemo(() => Object.keys(INDIAN_MANDIS_BY_STATE).sort(), []);
  const initialState = INDIAN_MANDIS_BY_STATE[user?.state] ? user.state : 'Andhra Pradesh';

  const [cropSearch, setCropSearch] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Tomato');
  const [customCropName, setCustomCropName] = useState('');
  const [variety, setVariety] = useState(INDIAN_CROPS[0].defaultVar);
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState('Quintal');
  const [expectedPrice, setExpectedPrice] = useState(INDIAN_CROPS[0].defaultPrice);
  const [state, setState] = useState(initialState);
  const [district, setDistrict] = useState(user?.district || '');
  const [market, setMarket] = useState(INDIAN_MANDIS_BY_STATE[initialState][0]);
  const [customMarket, setCustomMarket] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Freshly harvested Grade-A produce, cleaned, sorted, ready for immediate dispatch.');
  const [image, setImage] = useState(INDIAN_CROPS[0].sampleImg);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCrops = useMemo(() => {
    const q = cropSearch.trim().toLowerCase();
    if (!q) return INDIAN_CROPS;
    return INDIAN_CROPS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [cropSearch]);

  const handleCropChange = (cName) => {
    setSelectedPreset(cName);
    const matched = INDIAN_CROPS.find((c) => c.name === cName);
    if (matched) {
      setVariety(matched.defaultVar);
      setExpectedPrice(matched.defaultPrice);
      setImage(matched.sampleImg);
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    const list = INDIAN_MANDIS_BY_STATE[newState] || [];
    setMarket(list[0] || '__CUSTOM__');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCrop = selectedPreset === '__CUSTOM__' ? customCropName.trim() : selectedPreset;
    const finalMarket = market === '__CUSTOM__' ? customMarket.trim() : market;
    if (!finalCrop) {
      setError('Please enter a crop name');
      return;
    }
    if (!quantity || !expectedPrice) {
      setError('Please fill in quantity and expected price');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const locationParts = [district.trim(), state, finalMarket].filter(Boolean);
      const res = await apiClient.request('/listings/', {
        method: 'POST',
        body: {
          crop: finalCrop,
          variety,
          quantity: Number(quantity),
          unit,
          expected_price: Number(expectedPrice),
          location: locationParts.join(', '),
          image_url: image || '/crop-placeholder.svg',
        },
      });
      if (res.success !== false) {
        addToast('Crop listing posted to marketplace successfully!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const currentPreset = INDIAN_CROPS.find((c) => c.name === selectedPreset);
  const stateMandis = INDIAN_MANDIS_BY_STATE[state] || [];

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
          Offer any Indian crop directly to registered buyers with APMC mandi price benchmarks
        </p>
      </div>

      <Card className="space-y-6 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Crop Type (65+ Indian Crops or Custom)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder="Search crop by name or category (e.g., Mango, Wheat, Chili, Turmeric)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <select
              value={selectedPreset}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 min-h-[48px] text-base font-semibold focus:border-emerald-600 focus:outline-none"
            >
              {filteredCrops.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} — {c.category}
                </option>
              ))}
              <option value="__CUSTOM__">+ Other / Custom Crop</option>
            </select>
          </div>

          {selectedPreset === '__CUSTOM__' && (
            <Input
              label="Custom Crop Name"
              value={customCropName}
              onChange={(e) => setCustomCropName(e.target.value)}
              placeholder="Enter any crop name (e.g., Dragon Fruit, Saffron, Millets)"
              required
            />
          )}

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
              placeholder="e.g. Grade-A Hybrid"
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

          <div className="space-y-2">
            <Input
              label={`Expected Selling Price (₹ per ${unit})`}
              type="number"
              min="1"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              required
            />
            {currentPreset?.defaultPrice && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <span className="text-emerald-800 font-medium">
                  Reference APMC Benchmark ({currentPreset.name}):
                </span>
                <span className="font-extrabold text-emerald-950">
                  ₹{currentPreset.defaultPrice.toLocaleString('en-IN')} / Quintal
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">State / UT</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 min-h-[48px] text-sm font-semibold focus:border-emerald-600 focus:outline-none"
              >
                {allStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <Input
              label="District / Village"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Guntur"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Nearest Mandi</label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 min-h-[48px] text-sm font-semibold focus:border-emerald-600 focus:outline-none"
              >
                {stateMandis.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__CUSTOM__">+ Other Local Mandi</option>
              </select>
            </div>
          </div>

          {market === '__CUSTOM__' && (
            <Input
              label="Custom Mandi Name"
              value={customMarket}
              onChange={(e) => setCustomMarket(e.target.value)}
              placeholder="Enter nearest APMC / local market name"
              required
            />
          )}

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