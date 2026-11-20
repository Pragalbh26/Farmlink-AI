import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  Package,
  RefreshCw,
  Power,
  XCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';

export const TransporterDashboard = () => {
  const { user, loginUser } = useAuth();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(
    user?.transporter_profile?.is_available ?? user?.is_available ?? true
  );
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.request('/orders/transport/requests');
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch (err) {
      setError(err.message || 'Unable to load transport requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleToggleAvailability = async () => {
    const nextState = !isAvailable;
    setTogglingAvailability(true);
    try {
      const res = await apiClient.request('/auth/profile', {
        method: 'PUT',
        body: {
          transporter_profile: {
            is_available: nextState,
          },
        },
      });
      setIsAvailable(nextState);
      if (res?.data && loginUser) {
        const token = localStorage.getItem('agriconnect_token');
        loginUser(res.data, token);
      }
      addToast(
        nextState ? 'You are now AVAILABLE for bookings.' : 'Status set to BUSY.',
        'success'
      );
    } catch (err) {
      addToast(err.message || 'Unable to update availability.', 'error');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleUpdateTripStatus = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    try {
      await apiClient.request(`/orders/transport/requests/${requestId}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      const labelMap = {
        accepted: 'Transport request accepted!',
        in_transit: 'Trip marked as In Transit.',
        completed: 'Delivery marked as Completed!',
        cancelled: 'Transport request declined.',
      };
      addToast(labelMap[nextStatus] || `Status updated to ${nextStatus}`, 'success');
      await fetchRequests();
    } catch (err) {
      addToast(err.message || 'Failed to update transport request status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'requested').toLowerCase();
    if (s === 'completed') return { variant: 'green', label: 'COMPLETED' };
    if (s === 'in_transit') return { variant: 'blue', label: 'IN TRANSIT' };
    if (s === 'accepted') return { variant: 'green', label: 'ACCEPTED' };
    if (s === 'cancelled' || s === 'rejected') return { variant: 'red', label: s.toUpperCase() };
    return { variant: 'amber', label: 'REQUESTED' };
  };

  const vehicleType =
    user?.transporter_profile?.vehicle_type || user?.vehicle_type || 'Cargo Vehicle';
  const capacity =
    user?.transporter_profile?.capacity || user?.capacity || '—';

  const pendingCount = requests.filter((r) =>
    ['requested', 'pending'].includes(String(r.status || '').toLowerCase())
  ).length;
  const activeCount = requests.filter((r) =>
    ['accepted', 'in_transit'].includes(String(r.status || '').toLowerCase())
  ).length;
  const completedCount = requests.filter(
    (r) => String(r.status || '').toLowerCase() === 'completed'
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Transporter Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200">
                Verified Rural Transporter
              </span>
              <Badge variant={isAvailable ? 'green' : 'amber'} size="sm">
                {isAvailable ? 'AVAILABLE' : 'BUSY'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name || 'Transporter'}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>
                {vehicleType} · Capacity: {capacity} Tons
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={isAvailable ? 'outline' : 'primary'}
              size="md"
              loading={togglingAvailability}
              onClick={handleToggleAvailability}
              icon={Power}
              className={
                isAvailable
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  : ''
              }
            >
              {isAvailable ? 'Set Status: Busy' : 'Set Status: Available'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              loading={loading}
              onClick={fetchRequests}
              icon={RefreshCw}
            >
              Refresh Trips
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">New Requests</p>
            <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Deliveries</p>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Completed Trips</p>
            <p className="text-2xl font-black text-emerald-700">{completedCount}</p>
          </div>
        </Card>
      </div>

      {/* Transport Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Incoming & Assigned Delivery Requests
            </h2>
            <p className="text-xs text-slate-500">
              Accept new requests and update trip progress from pickup to drop-off
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}

        {loading ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            Loading transport requests...
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-10 text-center space-y-2 bg-slate-50 border-dashed">
            <Truck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800">No transport requests yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              When a farmer or buyer books your vehicle for an active order, it will appear here with an Accept button.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const status = String(req.status || 'requested').toLowerCase();
              const badge = getStatusBadge(status);
              const pickup = req.pickup_location || req.pickupLocation || 'Farm Gate';
              const dropoff = req.dropoff_location || req.dropoffLocation || 'Mandi / Warehouse';
              const crop = req.crop || req.order_crop || 'Agricultural Produce';
              const quantity = req.quantity || req.order_quantity || '';
              const unit = req.unit || 'Quintal';
              const orderRef = String(req.order || req.order_id || req.id || '').slice(0, 8);
              const isBusy = updatingId === req.id;

              return (
                <Card key={req.id} className="p-5 space-y-4 border-2 border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-lg text-slate-900">
                          {crop} {quantity ? `— ${quantity} ${unit}` : ''}
                        </h3>
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Request #{String(req.id).slice(0, 8)} · Order #{orderRef}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(status === 'requested' || status === 'pending') && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isBusy}
                            onClick={() => handleUpdateTripStatus(req.id, 'accepted')}
                            icon={CheckCircle2}
                          >
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleUpdateTripStatus(req.id, 'cancelled')}
                            icon={XCircle}
                          >
                            Decline
                          </Button>
                        </>
                      )}

                      {status === 'accepted' && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={isBusy}
                          onClick={() => handleUpdateTripStatus(req.id, 'in_transit')}
                          icon={Navigation}
                        >
                          Start Transit
                        </Button>
                      )}

                      {status === 'in_transit' && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={isBusy}
                          onClick={() => handleUpdateTripStatus(req.id, 'completed')}
                          icon={CheckCircle2}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Pickup Location
                        </span>
                        <span className="font-semibold text-slate-800">{pickup}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Drop-off Destination
                        </span>
                        <span className="font-semibold text-slate-800">{dropoff}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};