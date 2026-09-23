import React, { useCallback, useEffect, useState } from 'react';
import { Truck, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const TransporterDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(Boolean(user?.transporter_profile?.is_available));
  const vehicleProfileReady = Boolean(user?.transporter_profile?.vehicle_type && user.transporter_profile.vehicle_type !== 'Not specified' && Number(user.transporter_profile.capacity) > 0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request('/orders/transport/requests');
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load delivery requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const toggleAvailability = async () => {
    if (!vehicleProfileReady) {
      addToast('Add your vehicle type and positive capacity before accepting trips.', 'info');
      onNavigate?.('profile');
      return;
    }
    const nextAvailability = !availability;
    try {
      await apiClient.request('/auth/profile', {
        method: 'PUT',
        body: { transporter_profile: { is_available: nextAvailability } }
      });
      setAvailability(nextAvailability);
      addToast(nextAvailability ? 'You are accepting transport requests.' : 'You are unavailable for new requests.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to update availability.', 'error');
    }
  };

  const handleAction = async (reqId, newStatus) => {
    try {
      await apiClient.request(`/orders/transport/requests/${reqId}`, { method: 'PATCH', body: { status: newStatus } });
      addToast(newStatus === 'accepted' ? 'Delivery request accepted.' : `Trip marked ${newStatus.replace('_', ' ')}.`, 'success');
      await fetchRequests();
    } catch (err) {
      addToast(err.message || 'Unable to update this delivery request.', 'error');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Transporter Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚛</span>
                <Badge variant="amber" size="sm">
                Transporter account
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Kishan Grewal Logistics'}</h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Vehicle: {user?.transporter_profile?.vehicle_type || 'Vehicle details not set'} • Payload: {Number(user?.transporter_profile?.capacity) || 0} tonnes</span>
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Booking availability:</span>
            <button
              onClick={toggleAvailability}
              aria-pressed={availability && vehicleProfileReady}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                availability && vehicleProfileReady
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {availability && vehicleProfileReady ? 'Ready for Bookings' : vehicleProfileReady ? 'Unavailable for Bookings' : 'Vehicle details required'}
            </button>
            {!vehicleProfileReady && <Button variant="outline" size="sm" onClick={() => onNavigate?.('profile')}>Add vehicle details</Button>}
          </div>
        </div>
      </div>

      {/* Booking Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Available delivery requests and your trips</h3>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchRequests} loading={loading}>Refresh</Button>
        </div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {!loading && requests.length === 0 && <Card className="p-8 text-center text-sm text-slate-500">No delivery requests yet. New bookings will appear here.</Card>}

        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="space-y-4 border-2 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900">{req.crop} ({req.quantity} {req.unit})</span>
                  <Badge variant={req.status === 'accepted' || req.status === 'completed' ? 'green' : 'amber'} size="sm">
                    {req.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right font-black text-emerald-800 text-lg">
                  {req.status.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Pickup Location</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    {req.pickup_location}
                  </p>
                  <p className="text-xs text-slate-500 pl-5.5">Farmer: {req.farmer_name} ({req.farmer_phone})</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Delivery Destination</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    {req.dropoff_location}
                  </p>
                </div>
              </div>

              {req.status === 'requested' && !req.transporter && (
                <div className="pt-3 border-t border-slate-100 flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleAction(req.id, 'accepted')}
                    icon={CheckCircle2}
                  >
                    Accept Trip & Dispatch
                  </Button>
                </div>
              )}
              {req.transporter === user?.id && req.status === 'accepted' && <Button variant="primary" size="sm" onClick={() => handleAction(req.id, 'in_transit')} icon={Truck}>Start Trip</Button>}
              {req.transporter === user?.id && req.status === 'in_transit' && <Button variant="primary" size="sm" onClick={() => handleAction(req.id, 'completed')} icon={CheckCircle2}>Complete Delivery</Button>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
