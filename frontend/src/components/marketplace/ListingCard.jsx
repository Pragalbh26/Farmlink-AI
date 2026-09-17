import React from 'react';
import { MapPin, TrendingUp, TrendingDown, User, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export const ListingCard = ({ listing, onSelect, onPlaceOrder, isOwner = false }) => {
  const { t } = useLanguage();

  const priceDiff = listing.expectedPrice - listing.mandiModalPrice;
  const isAboveModal = priceDiff > 0;

  return (
    <Card hover padding="p-0" className="overflow-hidden flex flex-col justify-between group">
      {/* Image & Badges */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={listing.image}
          alt={listing.crop}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="green" size="md">
            {listing.crop}
          </Badge>
          <Badge variant="default" size="sm" className="bg-slate-900/80 text-white border-none backdrop-blur-xs">
            {listing.quantity} {listing.unit}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div>
            <h4 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
              {listing.crop} — {listing.variety}
            </h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{listing.district}, {listing.state} ({listing.market})</span>
            </p>
          </div>

          {/* Pricing Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">{t('expected_price')}</p>
              <p className="text-lg font-extrabold text-slate-900">
                ₹{listing.expectedPrice.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500"> / {listing.unit}</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-medium text-slate-500">Mandi Modal</p>
              <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                isAboveModal ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {isAboveModal ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>₹{listing.mandiModalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
            <span className="font-medium truncate">{listing.farmerName}</span>
          </div>

          <div className="flex items-center gap-2">
            {onPlaceOrder && !isOwner && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaceOrder(listing);
                }}
              >
                {t('place_order')}
              </Button>
            )}
            {onSelect && (
              <button
                onClick={() => onSelect(listing)}
                className="p-2 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="View Details"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
