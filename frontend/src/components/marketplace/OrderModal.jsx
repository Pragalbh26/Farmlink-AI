import React, { useState } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api/client';

export const OrderModal = ({ isOpen, onClose, listing, onOrderSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(10);
  const [deliveryLocation, setDeliveryLocation] = useState(user?.district ? `${user.district} Wholesale Market` : 'Vashi Terminal, Mumbai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!listing) return null;

  const unitPrice = listing.expectedPrice;
  const totalAmount = (Number(quantity) || 0) * unitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (qty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    if (qty > listing.quantity) {
      setError(`Requested quantity (${qty} ${listing.unit}) exceeds available stock (${listing.quantity} ${listing.unit})`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.request('/orders/', {
        method: 'POST',
        body: {
          listing: listing.id,
          quantity: qty,
          agreed_price: unitPrice,
        }
      });

      if (res.success) {
        addToast(t('order_success'), 'success');
        if (onOrderSuccess) onOrderSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Purchase Order — ${listing.crop}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Listing Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-900">{listing.crop} ({listing.variety})</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{listing.district}, {listing.state}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Unit Price</p>
            <p className="text-sm font-extrabold text-emerald-800">₹{unitPrice} / {listing.unit}</p>
          </div>
        </div>

        {/* Quantity Field */}
        <Input
          label={`Purchase Quantity (${listing.unit})`}
          type="number"
          min="1"
          max={listing.quantity}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError('');
          }}
          required
          helperText={`Available inventory: ${listing.quantity} ${listing.unit}`}
          error={error}
        />

        {/* Delivery Location */}
        <Input
          label="Destination / Drop-off Hub"
          value={deliveryLocation}
          onChange={(e) => setDeliveryLocation(e.target.value)}
          required
          placeholder="e.g. APMC Yard, City"
        />

        {/* Financial Summary */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
          <div className="flex justify-between text-xs text-emerald-900">
            <span>Rate</span>
            <span>₹{unitPrice} × {quantity || 0} {listing.unit}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-emerald-950 pt-2 border-t border-emerald-200">
            <span>Total Payable Amount</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Safety Note */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>Direct farmer transaction contract. Payment settled upon verified warehouse gate receipt.</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex gap-3">
          <Button variant="outline" size="md" onClick={onClose} fullWidth>
            {t('cancel')}
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading} fullWidth icon={ShoppingCart}>
            Confirm & Send Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
