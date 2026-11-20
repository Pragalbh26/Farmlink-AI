import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Truck, Store, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Orders = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request('/orders/me');
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await apiClient.request(`/orders/${orderId}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      addToast(`Order marked as ${nextStatus}!`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.message || 'Unable to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusVariant = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'fulfilled' || s === 'completed' || s === 'confirmed') return 'green';
    if (s === 'cancelled') return 'red';
    return 'amber';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('orders')}
          </h1>
          <p className="text-sm text-slate-500">
            Track purchase orders from confirmation to farm-gate delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} loading={loading} icon={RefreshCw}>
            Refresh
          </Button>
          {onNavigate && (
            <Button variant="primary" size="sm" onClick={() => onNavigate('transport')} icon={Truck}>
              Book Transport
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading orders...
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center space-y-3 bg-slate-50 border-dashed">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800">No orders yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {user?.role === 'buyer'
              ? 'Browse the Marketplace to place your first direct farm purchase order.'
              : 'Incoming buyer orders for your harvest listings will appear here.'}
          </p>
          {onNavigate && (
            <Button variant="primary" size="md" onClick={() => onNavigate('marketplace')} icon={Store}>
              Go to Marketplace
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const qty = Number(ord.quantity ?? 0) || 0;
            const unitPrice = Number(ord.unitPrice ?? ord.agreed_price ?? 0) || 0;
            const total = Number(ord.totalAmount ?? ord.total_amount ?? qty * unitPrice) || 0;
            const status = String(ord.status || 'placed').toLowerCase();
            const crop = ord.crop || ord.listing_crop || 'Crop';
            const variety = ord.variety || ord.listing_variety || '';
            const unit = ord.unit || 'Quintal';

            return (
              <Card key={ord.id} className="p-5 space-y-4 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-lg text-slate-900">
                        {crop} {variety ? `(${variety})` : ''}
                      </h3>
                      <Badge variant={getStatusVariant(status)} size="sm">
                        {status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Order #{String(ord.id || '').slice(0, 8)} · Qty: {qty} {unit} · Rate: ₹{unitPrice.toLocaleString('en-IN')}/{unit}
                    </p>
                    <p className="text-xs text-slate-600">
                      {user?.role === 'farmer'
                        ? `Buyer: ${ord.buyerName || ord.buyer_name || 'Registered Buyer'}`
                        : `Farmer: ${ord.farmerName || ord.farmer_name || 'Registered Farmer'}`}
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-xs text-slate-400 uppercase font-bold">Total Amount</p>
                    <p className="text-2xl font-black text-emerald-800">
                      ₹{total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {ord.createdAt || ord.created_at || ''}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {user?.role === 'farmer' && status === 'placed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={updatingId === ord.id}
                        onClick={() => handleStatusUpdate(ord.id, 'confirmed')}
                        icon={CheckCircle2}
                      >
                        Confirm Order
                      </Button>
                    )}
                    {user?.role === 'farmer' && status === 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={updatingId === ord.id}
                        onClick={() => handleStatusUpdate(ord.id, 'fulfilled')}
                        icon={CheckCircle2}
                      >
                        Mark Fulfilled
                      </Button>
                    )}
                    {['placed', 'confirmed'].includes(status) && onNavigate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('transport')}
                        icon={Truck}
                      >
                        Book Transport
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};