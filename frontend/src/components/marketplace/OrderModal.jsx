import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../api/client';

export const OrderModal = ({ isOpen, onClose, listing, onOrderSuccess }) => {
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableQty = Number(listing?.quantity ?? 0) || 0;
  const unitPrice = Number(listing?.expectedPrice ?? listing?.expected_price ?? 0) || 0;
  const unitLabel = listing?.unit || 'Quintal';
  const cropName = listing?.crop || 'Crop';
  const varietyName = listing?.variety || '';
  const farmerName = listing?.farmerName || listing?.farmer_name || 'Registered Farmer';

  useEffect(() => {
    if (isOpen && listing) {
      setQuantity(availableQty > 0 ? Math.min(10, availableQty) : 1);
      setError('');
    }
  }, [isOpen, listing, availableQty]);

  if (!isOpen || !listing) return null;

  const numericQty = Number(quantity) || 0;
  const totalAmount = numericQty * unitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numericQty <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (availableQty > 0 && numericQty > availableQty) {
      setError(`Only ${availableQty} ${unitLabel} available in this lot.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request('/orders/', {
        method: 'POST',
        body: {
          listing: listing.id,
          quantity: numericQty,
          agreed_price: unitPrice,
        },
      });
      if (res.success !== false) {
        addToast(`Order placed for ${numericQty} ${unitLabel} of ${cropName}!`, 'success');
        if (onOrderSuccess) onOrderSuccess(res.data);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Place Purchase Order — ${cropName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              {cropName} {varietyName ? `(${varietyName})` : ''}
            </span>
            <span className="font-extrabold text-emerald-700">
              ₹{unitPrice.toLocaleString('en-IN')} / {unitLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Farmer: {farmerName} · Available: {availableQty} {unitLabel}
          </p>
        </div>

        <Input
          label={`Order Quantity (${unitLabel})`}
          type="number"
          min="1"
          max={availableQty > 0 ? availableQty : undefined}
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-900 text-sm font-semibold">
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Total Payable Amount</span>
          </div>
          <span className="text-xl font-black text-emerald-900">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {error && (
          <p role="alert" className="text-xs font-semibold text-rose-600">
            {error}
          </p>
        )}

        <div className="pt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            fullWidth
            icon={CheckCircle2}
          >
            Confirm Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};