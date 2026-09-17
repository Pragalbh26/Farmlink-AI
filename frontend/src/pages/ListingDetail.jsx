import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, User, Phone, TrendingUp, ShieldCheck, ShoppingCart, Truck, Share2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { OrderModal } from '../components/marketplace/OrderModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const ListingDetail = ({ listing, onBack, onOrderSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  if (!listing) return null;

  const isOwner = user?.id === listing.farmerId;
  const isAboveModal = listing.expectedPrice > listing.mandiModalPrice;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')} to Marketplace</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Gallery */}
        <div className="space-y-3">
          <div className="h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={listing.image}
              alt={listing.crop}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details Column */}
        <div className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="green" size="md">{listing.crop}</Badge>
                <Badge variant="default" size="sm">Harvested {listing.harvestDate}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {listing.crop} — {listing.variety}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{listing.district}, {listing.state} (Local Mandi: {listing.market})</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">{t('expected_price')}</p>
                  <p className="text-3xl font-black text-slate-900">
                    ₹{listing.expectedPrice.toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-slate-500"> / {listing.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Lot</p>
                  <p className="text-lg font-bold text-slate-800">{listing.quantity} {listing.unit}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Mandi Benchmark Modal:</span>
                <span className="font-bold text-slate-900">₹{listing.mandiModalPrice} / {listing.unit}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Crop Specifications</h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                {listing.description}
              </p>
            </div>

            {/* Farmer Contact Info */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  👨‍🌾
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-semibold">Listed by Verified Farmer</p>
                  <p className="text-sm font-extrabold text-emerald-950">{listing.farmerName}</p>
                </div>
              </div>
              <a
                href={`tel:${listing.farmerPhone}`}
                className="p-2.5 bg-white text-emerald-800 rounded-xl border border-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1.5 text-xs font-bold"
              >
                <Phone className="w-4 h-4" />
                <span>Call Farmer</span>
              </a>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-slate-200">
            {!isOwner ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={ShoppingCart}
                onClick={() => setIsOrderModalOpen(true)}
              >
                {t('place_order')}
              </Button>
            ) : (
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-center text-xs font-bold">
                This is your active harvest listing.
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        listing={listing}
        onOrderSuccess={onOrderSuccess}
      />
    </div>
  );
};
