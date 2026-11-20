import React, { useState, useEffect } from 'react';
import { Truck, Star, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const [pickupAddress, setPickupAddress] = useState('Farm Gate, Guntur, Andhra Pradesh');
  const [dropoffAddress, setDropoffAddress] = useState('Wholesale Mandi Terminal');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const res = await apiClient.request('/transport/providers');
        if (res.success && Array.isArray(res.data)) {
          const normalized = res.data.map((tr) => ({
            ...tr,
            id: tr.id || tr.user_id,
            name: tr.name || tr.driver_name || 'Registered Transporter',
            vehicleType: tr.vehicleType || tr.vehicle_type || 'Cargo Vehicle',
            capacity: tr.capacity ? `${tr.capacity}${String(tr.capacity).match(/[a-z]/i) ? '' : ' Tons'}` : 'Not specified',
            ratePerKm: tr.ratePerKm || tr.rate_per_km || 'Negotiable',
            status: tr.status || (tr.is_available === false ? 'busy' : 'available'),
            operationalCorridors: tr.operationalCorridors || tr.operational_corridors || [],
            rating: tr.rating ?? 'New',
            experienceYears: tr.experienceYears || tr.experience_years || ''
          }));
          setTransporters(normalized);
        }
      } catch (err) {
        setError(err.message || 'Unable to load transport providers.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransporters();

    apiClient
      .request('/orders/me')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const activeOrders = res.data.filter((order) =>
            ['placed', 'confirmed', 'pending', 'accepted'].includes(order.status)
          );
          setOrders(activeOrders);
          if (activeOrders.length > 0) setSelectedOrder(activeOrders[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenBooking = (tr) => {
    if (orders.length === 0) {
      addToast('You need an active purchase order before booking transport. Place or accept an order in the Marketplace first.', 'warning');
      return;
    }
    setSelectedTransporter(tr);
    setError('');
    setBookingModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      setError('Select an order before requesting delivery.');
      return;
    }
    setBookingLoading(true);
    setError('');
    try {
      await apiClient.request('/orders/transport/requests', {
        method: 'POST',
        body: {
          order: selectedOrder,
          transporter: selectedTransporter.id,
          pickup_location: pickupAddress,
          dropoff_location: dropoffAddress
        }
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

      {!loading && orders.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>No active orders found yet.</strong> Transport bookings must be linked to an active order. Place an order in the Marketplace (as a Buyer) or have an incoming order (as a Farmer) to enable booking.
          </span>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {loading && <p role="status" className="text-sm text-slate-500">Loading transport providers...</p>}
      {!loading && transporters.length === 0 && !error && (
        <Card className="p-8 text-center text-sm text-slate-500">
          No transport providers are registered yet. Register a Transporter account to see vehicles listed here.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transporters.map((tr) => (
          <Card key={tr.id} hover className="space-y-4 flex flex-col justify-between border-2 border-slate-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
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

              {tr.operationalCorridors.length > 0 && (
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Frequent Operational Corridors</p>
                  <div className="flex flex-wrap gap-1">
                    {tr.operationalCorridors.map((c, idx) => (
                      <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                {tr.rating !== 'New' && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                <span className="font-bold text-slate-800">{tr.rating}</span>
                {tr.experienceYears && <span>({tr.experienceYears} yrs exp)</span>}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={tr.status !== 'available'}
                onClick={() => handleOpenBooking(tr)}
                icon={Truck}
              >
                Book Transport
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Delivery — ${selectedTransporter?.name}`}
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Order to deliver
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
            >
              <option value="">Choose an order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.crop} — {order.quantity} {order.unit} (#{String(order.id).slice(0, 8)})
                </option>
              ))}
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

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

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