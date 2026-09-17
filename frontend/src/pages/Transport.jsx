import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, Star, ShieldCheck, CheckCircle2, Search, Filter } from 'lucide-react';
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
  const [cargoCrop, setCargoCrop] = useState('Tomato');
  const [cargoQuantity, setCargoQuantity] = useState(40);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const res = await apiClient.request('/transport/providers');
        if (res.success) {
          setTransporters(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransporters();
  }, []);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      setBookingModalOpen(false);
      addToast(`Booking request sent to ${selectedTransporter?.name}!`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">Rural Logistics Network</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('transport')} & Rural Freight Booking
        </h1>
        <p className="text-sm text-slate-500">
          Connect directly with verified agricultural transporters for farm-gate harvest pickup and mandi delivery.
        </p>
      </div>

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
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-800">{tr.rating}</span>
                <span>({tr.experienceYears} yrs exp)</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedTransporter(tr);
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cargo Crop"
              value={cargoCrop}
              onChange={(e) => setCargoCrop(e.target.value)}
              required
            />
            <Input
              label="Quantity (Quintals)"
              type="number"
              value={cargoQuantity}
              onChange={(e) => setCargoQuantity(e.target.value)}
              required
            />
          </div>

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
