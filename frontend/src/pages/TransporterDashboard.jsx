import React, { useState } from 'react';
import { Truck, MapPin, Phone, Star, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TransporterDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [availability, setAvailability] = useState('available');
  const [requests, setRequests] = useState([
    {
      id: 'req_01',
      orderId: 'ord_901',
      crop: 'Tomato (80 Quintals)',
      farmerName: 'Ramesh Patel',
      farmerPhone: '+91 98765 43210',
      pickup: 'Khed Farm Gate, Pune, Maharashtra',
      dropoff: 'Vashi Wholesale Terminal, Navi Mumbai',
      distance: '142 km',
      offeredFare: '₹ 6,200',
      status: 'pending'
    },
    {
      id: 'req_02',
      orderId: 'ord_902',
      crop: 'Onion (50 Quintals)',
      farmerName: 'Suresh Patil',
      farmerPhone: '+91 98223 99881',
      pickup: 'Lasalgaon Mandi Yard, Nashik',
      dropoff: 'APMC Market, Vashi, Navi Mumbai',
      distance: '185 km',
      offeredFare: '₹ 8,400',
      status: 'accepted'
    }
  ]);

  const handleAction = (reqId, newStatus) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    addToast(`Delivery trip request ${newStatus === 'accepted' ? 'Accepted' : 'Declined'}`, newStatus === 'accepted' ? 'success' : 'info');
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
                Verified Logistics Partner
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Kishan Grewal Logistics'}</h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Vehicle: {user?.vehicleType || 'Eicher 14ft Covered Truck'} • Payload: {user?.capacity || '5.5 Tons'}</span>
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Trip Status:</span>
            <button
              onClick={() => setAvailability(prev => prev === 'available' ? 'busy' : 'available')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                availability === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {availability === 'available' ? 'Ready for Bookings' : 'Currently on Trip'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Requests List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Direct Farm-Gate Booking Requests</h3>

        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="space-y-4 border-2 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900">{req.crop}</span>
                  <Badge variant={req.status === 'accepted' ? 'green' : 'amber'} size="sm">
                    {req.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right font-black text-emerald-800 text-lg">
                  {req.offeredFare}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Pickup Location</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    {req.pickup}
                  </p>
                  <p className="text-xs text-slate-500 pl-5.5">Farmer: {req.farmerName} ({req.farmerPhone})</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Delivery Destination</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                    {req.dropoff}
                  </p>
                  <p className="text-xs text-slate-500 pl-5.5">Est Distance: {req.distance}</p>
                </div>
              </div>

              {req.status === 'pending' && (
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
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleAction(req.id, 'declined')}
                    icon={XCircle}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
