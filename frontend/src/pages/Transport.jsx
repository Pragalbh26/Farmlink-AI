import React, { useState, useEffect } from 'react';
import { Truck, Star, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const Transport = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Booking Form State
  const [pickupAddress, setPickupAddress] = useState('Khed Farm Gate, Pune, Maharashtra');
  const [dropoffAddress, setDropoffAddress] = useState('Vashi Wholesale Terminal, Navi Mumbai');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const res = await apiClient.request('/transport/providers');
        if (res.success) {
          setTransporters(res.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to load transport providers.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransporters();
    apiClient.request('/orders/me').then((res) => {
      if (res.success) setOrders(res.data.filter((order) => ['placed', 'confirmed'].includes(order.status)));
    }).catch(() => {});
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      setError('Place or select an order before requesting delivery.');
      return;
    }
    setBookingLoading(true);
    setError('');
    try {
      await apiClient.request('/orders/transport/requests', {
        method: 'POST',
        body: { order: selectedOrder, transporter: selectedTransporter.id, pickup_location: pickupAddress, dropoff_location: dropoffAddress }
      });
      setBookingModalOpen(false);
      addToast(`Booking request sent to ${selectedTransporter?.name}!`, 'success');
    } catch (err) {
      setError(err.message || 'Unable to create the transport request.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">Registered transport providers</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('transport')} & Rural Freight Booking
        </h1>
        <p className="text-sm text-slate-500">
          Request delivery from a registered transporter using one of your active purchase orders.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {loading && <p role="status" className="text-sm text-slate-500">Loading transport providers…</p>}
      {!loading && transporters.length === 0 && !error && <p className="text-sm text-slate-500">No transport providers are available right now.</p>}

      {/* Transporters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transporters.map((tr) => (
          <Card key={tr.id} hover className="space-y-4 flex flex-col justify-between border-2 border-slate-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
                    🚛
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{tr.name}</h3>
                    <p className="text-xs text-slate-500">{tr.vehicleType}</p>
                  </div>
                </div>

                  <Badge variant={tr.status === 'available' ? 'green' : 'amber'} size="sm">
                  {tr.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payload Capacity</span>
                  <span className="font-bold text-slate-900">{tr.capacity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Rate</span>
                  <span className="font-bold text-emerald-800">{tr.ratePerKm}</span>
                </div>
              </div>

              {tr.operationalCorridors.length > 0 && <div className="space-y-1 text-xs text-slate-600">
                <p className="font-bold text-slate-500 uppercase text-[10px]">Frequent Operational Corridors</p>
                <div className="flex flex-wrap gap-1">
                  {tr.operationalCorridors.map((c, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                {tr.rating !== 'New' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                <span className="font-bold text-slate-800">{tr.rating}</span>
                <span>{tr.experienceYears === '—' ? '' : `(${tr.experienceYears} yrs exp)`}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                disabled={tr.status !== 'available' || orders.length === 0}
                onClick={() => {
                  setSelectedTransporter(tr);
                  setError('');
                  setBookingModalOpen(true);
                }}
                icon={Truck}
              >
                Book Transport
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Delivery — ${selectedTransporter?.name}`}
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Order to deliver
            <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3">
              <option value="">Choose an order</option>
              {orders.map((order) => <option key={order.id} value={order.id}>{order.crop} — {order.quantity} {order.unit} (#{String(order.id).slice(0, 8)})</option>)}
            </select>
          </label>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
            Vehicle: <strong>{selectedTransporter?.vehicleType}</strong> (Max: {selectedTransporter?.capacity})
          </div>

          <Input
            label="Pickup Location (Farm Gate)"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            required
          />

          <Input
            label="Drop-off Destination (Mandi / Warehouse)"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
            required
          />

          <div className="pt-3 flex gap-3">
            <Button variant="outline" size="md" onClick={() => setBookingModalOpen(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={bookingLoading} fullWidth icon={CheckCircle2}>
              Send Booking Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
