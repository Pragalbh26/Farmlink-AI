import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle, ArrowUpDown, Store, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ListingCard } from '../components/marketplace/ListingCard';
import { OrderModal } from '../components/marketplace/OrderModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const Marketplace = ({ onNavigate, onSelectListing }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedListingForOrder, setSelectedListingForOrder] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.request('/listings/');
      if (res.success) {
        setListings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const crops = ['All', 'Tomato', 'Onion', 'Potato', 'Wheat', 'Rice'];

  const filtered = listings.filter((item) => {
    const matchesCrop = selectedCrop === 'All' || item.crop.toLowerCase() === selectedCrop.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      item.crop.toLowerCase().includes(query) ||
      item.variety.toLowerCase().includes(query) ||
      item.district.toLowerCase().includes(query) ||
      item.state.toLowerCase().includes(query) ||
      item.farmerName.toLowerCase().includes(query);
    return matchesCrop && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('marketplace')}</h1>
          <p className="text-sm text-slate-500">Direct producer-to-buyer agricultural trade</p>
        </div>

        {user?.role === 'farmer' && (
          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => onNavigate('create-listing')}
          >
            {t('list_harvest_cta')}
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              icon={Search}
              placeholder="Search by crop, variety, farmer, mandi or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={fetchListings}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Crop Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0 mr-1">Crops:</span>
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </Card>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-slate-50 border-dashed">
          <Store className="w-10 h-10 text-slate-300" />
          <h3 className="font-bold text-base text-slate-700">No crop listings match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm">Try selecting a different crop category or clearing the search terms.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setSelectedCrop('All'); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              isOwner={user?.id === item.farmerId}
              onSelect={() => onSelectListing && onSelectListing(item)}
              onPlaceOrder={(listing) => setSelectedListingForOrder(listing)}
            />
          ))}
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={!!selectedListingForOrder}
        onClose={() => setSelectedListingForOrder(null)}
        listing={selectedListingForOrder}
        onOrderSuccess={() => {
          fetchListings();
          if (user?.role === 'buyer') onNavigate('orders');
        }}
      />
    </div>
  );
};
