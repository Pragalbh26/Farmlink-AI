import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, Truck, MapPin, User, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const fetchOrders = async () => {
    try {
      const res = await apiClient.request('/orders/me');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.request(`/orders/${orderId}`, { method: 'PATCH', body: { status: newStatus } });
      addToast(`Order status updated to: ${newStatus.toUpperCase()}`, 'success');
      await fetchOrders();
    } catch (err) {
      addToast(err.message || 'Unable to update the order.', 'error');
    }
  };

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('orders')}</h1>
          <p className="text-sm text-slate-500">
            {isFarmer ? 'Incoming buyer orders on your harvest lots' : 'Purchase orders placed with farm producers'}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-slate-50 border-dashed">
          <Package className="w-10 h-10 text-slate-300" />
          <h3 className="font-bold text-base text-slate-700">No active orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {isFarmer ? 'Buyer orders for your listed harvests will appear here.' : 'Browse the marketplace and place purchase orders directly with farmers.'}
          </p>
          {!isFarmer && (
            <Button variant="primary" size="sm" onClick={() => onNavigate('marketplace')}>
              Browse Marketplace
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isPending = ord.status === 'placed';
            const isAccepted = ord.status === 'confirmed';
            const isDelivered = ord.status === 'fulfilled';

            return (
              <Card key={ord.id} className="space-y-4 border-2 border-slate-200">
                {/* Order Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900">
                        {ord.crop} — {ord.variety}
                      </h3>
                      <Badge
                        variant={isDelivered ? 'green' : (isAccepted ? 'amber' : 'blue')}
                        size="md"
                      >
                        {ord.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Order ID: {ord.id} • {ord.createdAt}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total Order Amount</p>
                    <p className="text-xl font-black text-emerald-800">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Logistics & Location Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Volume & Rate</p>
                    <p className="font-semibold">{ord.quantity} {ord.unit} @ ₹{ord.unitPrice}/{ord.unit}</p>
                    <p className="text-xs text-slate-500">
                        {isFarmer ? `Buyer: ${ord.buyer_name}` : `Producer: ${ord.farmerName}`}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Pickup Origin</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{ord.listing_location}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Delivery Hub</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Destination is set when transport is requested</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons depending on role */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!ord.transport_status && <Button
                      variant="outline"
                      size="sm"
                      icon={Truck}
                      onClick={() => onNavigate('transport')}
                    >
                      Arrange Transport
                    </Button>}
                    {ord.transport_status && <span className="text-xs font-semibold text-slate-600">Delivery: {ord.transport_status.replace('_', ' ')}</span>}
                  </div>

                  {isFarmer && (
                    <div className="flex gap-2">
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(ord.id, 'accepted')}
                          icon={CheckCircle2}
                        >
                          Accept Order
                        </Button>
                      )}
                      {isAccepted && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(ord.id, 'fulfilled')}
                          icon={CheckCircle2}
                        >
                          Mark Fulfilled
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
