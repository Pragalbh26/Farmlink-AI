import React, { useState, useEffect } from 'react';
import { ShoppingCart, Store, TrendingUp, Package, ShieldCheck, ArrowRight, MapPin, Truck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/marketplace/ListingCard';
import { OrderModal } from '../components/marketplace/OrderModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const BuyerDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedListingForOrder, setSelectedListingForOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBuyerData = async () => {
    try {
      const [lRes, oRes] = await Promise.all([
        apiClient.request('/listings/'),
        apiClient.request('/orders/me')
      ]);
      if (lRes.success) setListings(lRes.data);
      if (oRes.success) setOrders(oRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Buyer Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user?.avatar || '🏢'}</span>
              <span className="text-xs uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-600/50 border border-emerald-400/30">
                Verified Wholesale Buyer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.organization || 'GreenFresh Agri Commodities'}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{user?.district || 'Mumbai Terminal'}, {user?.state || 'Maharashtra'} • Direct Farm Procurement</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              icon={Store}
              onClick={() => onNavigate('marketplace')}
            >
              Browse All Harvests
            </Button>
            <Button
              variant="outline"
              size="md"
              className="border-slate-600 text-white bg-slate-800 hover:bg-slate-700"
              icon={Package}
              onClick={() => onNavigate('orders')}
            >
              My Orders ({orders.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Available Fresh Harvests</p>
            <p className="text-2xl font-black text-slate-900">{listings.length} Lots</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Purchase Orders</p>
            <p className="text-2xl font-black text-slate-900">{orders.length} Active</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Mandi Price Index</p>
            <p className="text-2xl font-black text-emerald-700">Fair Rate Assured</p>
          </div>
        </Card>
      </div>

      {/* Active Purchase Orders Widget */}
      {orders.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Live order status from farm gate to delivery</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Order History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 3).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{ord.crop} ({ord.variety})</span>
                    <Badge variant="green" size="sm">
                      {ord.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farmer: {ord.farmerName} • Qty: {ord.quantity} {ord.unit} • Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400">{ord.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fresh Harvest Listings Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Featured Direct Farm Harvests</h3>
            <p className="text-xs text-slate-500">Direct producer listings with verified modal price comparison</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('marketplace')}
          >
            Explore All Crops
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.slice(0, 3).map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onPlaceOrder={(listing) => setSelectedListingForOrder(listing)}
              onSelect={() => onNavigate('marketplace')}
            />
          ))}
        </div>
      </div>

      <OrderModal
        isOpen={!!selectedListingForOrder}
        onClose={() => setSelectedListingForOrder(null)}
        listing={selectedListingForOrder}
        onOrderSuccess={() => fetchBuyerData()}
      />
    </div>
  );
};
