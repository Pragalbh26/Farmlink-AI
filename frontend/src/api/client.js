import {
  mockUsers,
  mockListings,
  mockOrders,
  mockPriceDatasets,
  mockDiseaseCatalogue,
  mockSchemes,
  mockTransporters,
  mockWeatherData,
  mockChatCorpus
} from './mockData';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

// Mock state storage in memory / localStorage
const getStoredListings = () => {
  const saved = localStorage.getItem('agriconnect_listings');
  return saved ? JSON.parse(saved) : mockListings;
};

const saveStoredListings = (listings) => {
  localStorage.setItem('agriconnect_listings', JSON.stringify(listings));
};

const getStoredOrders = () => {
  const saved = localStorage.getItem('agriconnect_orders');
  const orders = saved ? JSON.parse(saved) : mockOrders;
  return orders.map((order) => ({
    ...order,
    status: ({ pending: 'placed', accepted: 'confirmed', dispatched: 'confirmed', delivered: 'fulfilled' })[order.status] || order.status,
    transport_status: order.transport_status || order.transportStatus || null,
    unitPrice: order.unitPrice ?? order.unit_price ?? order.agreed_price,
    totalAmount: Number(order.totalAmount ?? order.total_amount ?? (order.quantity * (order.unitPrice ?? order.agreed_price ?? 0))),
    farmerName: order.farmerName || order.farmer_name || '',
    buyerName: order.buyerName || order.buyer_name || '',
    listing_location: order.listing_location || order.pickupLocation || '',
    createdAt: order.createdAt || order.created_at || '',
  }));
};

const saveStoredOrders = (orders) => {
  localStorage.setItem('agriconnect_orders', JSON.stringify(orders));
};

const getStoredTransportBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('agriconnect_transport_bookings') || '[]');
  } catch {
    return [];
  }
};

const saveStoredTransportBookings = (bookings) => {
  localStorage.setItem('agriconnect_transport_bookings', JSON.stringify(bookings));
};

const normalizeListing = (listing) => ({
  ...listing,
  farmerId: listing.farmerId || listing.farmer,
  farmerName: listing.farmerName || listing.farmer_name || '',
  farmerPhone: listing.farmerPhone || listing.farmer_phone || '',
  expectedPrice: listing.expectedPrice ?? listing.expected_price,
  image: listing.image || listing.image_url || '/crop-placeholder.svg',
  district: listing.district || listing.location || '',
  state: listing.state || '',
});
const normalizeWeather = (data) => ({ ...data, verifiedTimestamp: data.verifiedTimestamp || data.timestamp, currentTemp: data.currentTemp ?? data.temperature_celsius, humidity: data.humidity || `${data.humidity_percent ?? 0}%`, rainfallChance: data.rainfallChance || '—', windSpeed: data.windSpeed || '—', advisories: data.advisories || [], fiveDayForecast: data.fiveDayForecast || [] });
const normalizeScheme = (scheme) => ({ ...scheme, name: scheme.name || scheme.scheme_name, ministry: scheme.ministry || scheme.jurisdiction || 'Government of India', benefit: scheme.benefit || 'See official scheme details', verifiedAt: scheme.verifiedAt || 'Not verified by a live service', sourceUrl: scheme.sourceUrl || scheme.source_url || '#' });
const normalizePrice = (data, meta) => ({ ...data, commodity: data.commodity || data.crop, forecastPrice: data.forecastPrice ?? data.predicted_price, lowerBound: data.lowerBound ?? data.interval_min, upperBound: data.upperBound ?? data.interval_max, currentModal: data.currentModal ?? data.current_price, modelMetadata: data.modelMetadata || { modelVersion: meta?.model_version || 'baseline', trainingCutoffDate: '—', dataFreshness: 'Latest available', mae: '—', rmse: '—' }, chartData: data.chartData || [] });

export const apiClient = {
  isMockMode: USE_MOCKS,

  setMockMode(val) {
    this.isMockMode = val;
  },

  async request(endpoint, options = {}) {
    if (this.isMockMode) {
      // Simulate slight network latency for realistic UX state testing
      await new Promise(r => setTimeout(r, 400));
      return this.mockRouter(endpoint, options);
    }

    try {
      const token = localStorage.getItem('agriconnect_token');
      const isFormData = options.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        body: options.body && !isFormData && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
        headers,
      });

      const contentType = res.headers.get('content-type') || '';
      const json = res.status === 204 ? { success: true, data: null } : contentType.includes('application/json') ? await res.json() : { success: false, error: { message: `Server returned ${res.status} without a JSON response. Check the API route and server logs.` } };
      if (!res.ok) {
        const error = json?.error;
        const message = typeof error === 'string' ? error : error?.message || Object.values(error || {}).flat().join(' ') || 'API request failed';
        throw new Error(message);
      }
      if (json?.success === false) {
        const error = json.error;
        throw new Error(typeof error === 'string' ? error : error?.message || 'Request could not be completed');
      }
      if (endpoint.replace(/\/$/, '') === '/listings' && Array.isArray(json?.data)) json.data = json.data.map(normalizeListing);
      if (endpoint.replace(/\/$/, '') === '/listings' && json?.data && !Array.isArray(json.data)) json.data = normalizeListing(json.data);
      if (endpoint === '/weather/current' && json?.data) json.data = normalizeWeather(json.data);
      if (endpoint === '/schemes' && Array.isArray(json?.data)) json.data = json.data.map(normalizeScheme);
      if (endpoint === '/prices/predict' && json?.data) json.data = normalizePrice(json.data, json.meta);
      if (endpoint === '/schemes/eligibility' && json?.data && !Array.isArray(json.data)) json.data = [json.data];
      if (endpoint === '/chat' && json?.data) json.data = {
        ...json.data,
        answer: json.data.answer || json.data.message,
        sources: (json.data.sources || json.data.citations || []).map((source) => typeof source === 'string' ? { title: source } : source),
        isAbstention: Boolean(json.data.isAbstention),
      };
      if (endpoint === '/disease/predict' && json?.data) json.data = {
        ...json.data,
        crop: json.data.crop || json.data.sampleType || 'Crop',
        diseaseName: json.data.diseaseName || json.data.predicted_class || 'Classification unavailable',
        status: json.data.status || (Number(json.data.confidence) >= 0.8 ? 'confident' : 'uncertain'),
        symptoms: json.data.symptoms || json.data.predicted_class || 'No symptom details provided by the inference service.',
        management: json.data.management || [json.data.treatmentSuggestion || json.data.treatment_suggestion].filter(Boolean),
        treatmentSuggestion: json.data.treatmentSuggestion || json.data.treatment_suggestion,
        modelVersion: json.data.modelVersion || json.meta?.model_version || 'unavailable',
      };
      if (endpoint === '/orders/me' && Array.isArray(json?.data)) json.data = json.data.map((o) => ({ ...o, unitPrice: o.unitPrice ?? o.unit_price ?? o.agreed_price, totalAmount: Number(o.totalAmount ?? o.total_amount ?? (o.quantity * o.agreed_price)), farmerName: o.farmerName || o.farmer_name || '', buyerName: o.buyerName || o.buyer_name || '', image: o.image || o.image_url || '', createdAt: o.createdAt || o.created_at }));
      return json;
    } catch (err) {
      throw new Error(err.message || 'The service is unavailable. Please try again.');
    }
  },

  mockRouter(endpoint, options) {
    endpoint = endpoint.replace(/\/$/, '');
    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

    // Auth
    if (endpoint === '/auth/login' && method === 'POST') {
      const user = mockUsers.find(u => u.phone === body.phone || u.role === body.role) || mockUsers[0];
      return {
        success: true,
        data: { user, token: 'mock_jwt_token_sample_12345' },
        meta: { timestamp: new Date().toISOString() }
      };
    }

    if (endpoint === '/auth/register' && method === 'POST') {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: body.name || 'New User',
        phone: body.phone,
        role: body.role || 'farmer',
        state: body.state || 'Maharashtra',
        district: body.district || 'Pune',
        transporter_profile: body.role === 'transporter' ? { vehicle_type: body.vehicle_type || 'Not specified', capacity: body.capacity || 0, is_available: true } : undefined,
        avatar: body.role === 'farmer' ? '👨‍🌾' : (body.role === 'buyer' ? '🏢' : '🚛')
      };
      return {
        success: true,
        data: { user: newUser, token: 'mock_jwt_token_sample_registered' },
        meta: { timestamp: new Date().toISOString() }
      };
    }

    if (endpoint === '/auth/profile' && method === 'GET') {
      let user = null;
      try { user = JSON.parse(localStorage.getItem('agriconnect_user') || 'null'); } catch { user = null; }
      return { success: true, data: user || mockUsers[0] };
    }

    if (endpoint === '/auth/profile' && method === 'PUT') {
      let currentUser = {};
      try { currentUser = JSON.parse(localStorage.getItem('agriconnect_user') || '{}'); } catch { currentUser = {}; }
      const updatedUser = { ...currentUser, ...body };
      for (const key of ['farmer_profile', 'buyer_profile', 'transporter_profile']) {
        if (body[key]) updatedUser[key] = { ...(currentUser[key] || {}), ...body[key] };
      }
      localStorage.setItem('agriconnect_user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    }

    // Listings
    if (endpoint === '/listings' && method === 'GET') {
      return {
        success: true,
        data: getStoredListings(),
        meta: { total: getStoredListings().length }
      };
    }

    if (endpoint === '/listings' && method === 'POST') {
      const current = getStoredListings();
      const newListing = {
        id: `lst_${Date.now()}`,
        ...body,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [newListing, ...current];
      saveStoredListings(updated);
      return {
        success: true,
        data: newListing,
        meta: { message: 'Listing created successfully' }
      };
    }

    if (endpoint.startsWith('/listings/') && method === 'GET') {
      const id = endpoint.replace('/listings/', '');
      const item = getStoredListings().find(l => l.id === id);
      if (!item) {
        return { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } };
      }
      return { success: true, data: item };
    }

    // Orders
    if ((endpoint === '/orders' || endpoint === '/orders/me') && method === 'GET') {
      let orders = getStoredOrders();
      let currentUser = null;
      try { currentUser = JSON.parse(localStorage.getItem('agriconnect_user') || 'null'); } catch { currentUser = null; }
      if (currentUser?.role === 'farmer') orders = orders.filter((order) => (order.farmerId || order.farmer_id) === currentUser.id);
      if (currentUser?.role === 'buyer') orders = orders.filter((order) => (order.buyerId || order.buyer_id) === currentUser.id);
      return {
        success: true,
        data: orders
      };
    }

    if (endpoint === '/orders/transport/requests' && method === 'GET') {
      return { success: true, data: getStoredTransportBookings() };
    }

    if (endpoint === '/orders/transport/requests' && method === 'POST') {
      const bookings = getStoredTransportBookings();
      if (bookings.some((booking) => booking.order === body.order)) {
        return { success: false, error: { message: 'Transport has already been requested for this order.' } };
      }
      const order = getStoredOrders().find((item) => item.id === body.order);
      if (!order) return { success: false, error: { message: 'Order not found.' } };
      const booking = {
        ...body,
        id: `trb_${Date.now()}`,
        status: 'requested',
        crop: order.crop,
        quantity: order.quantity,
        unit: order.unit,
        farmer_name: order.farmerName || order.farmer_name || '',
        farmer_phone: '',
      };
      saveStoredTransportBookings([booking, ...bookings]);
      const orders = getStoredOrders();
      const orderIndex = orders.findIndex((item) => item.id === body.order);
      if (orderIndex >= 0) {
        orders[orderIndex].transport_status = 'requested';
        saveStoredOrders(orders);
      }
      return { success: true, data: booking };
    }

    const transportAction = endpoint.match(/^\/orders\/transport\/requests\/([^/]+)$/);
    if (transportAction && method === 'PATCH') {
      const bookings = getStoredTransportBookings();
      const booking = bookings.find((item) => item.id === transportAction[1]);
      if (!booking) return { success: false, error: { message: 'Transport request not found.' } };
      booking.status = body.status;
      if (body.status === 'accepted') {
        try { booking.transporter = JSON.parse(localStorage.getItem('agriconnect_user') || '{}').id; } catch { booking.transporter = null; }
      }
      saveStoredTransportBookings(bookings);
      const orders = getStoredOrders();
      const orderIndex = orders.findIndex((item) => item.id === booking.order);
      if (orderIndex >= 0) {
        orders[orderIndex].transport_status = booking.status;
        saveStoredOrders(orders);
      }
      return { success: true, data: booking };
    }

    const orderAction = endpoint.match(/^\/orders\/([^/]+)$/);
    if (orderAction && method === 'PATCH') {
      const orders = getStoredOrders();
      const order = orders.find((item) => item.id === orderAction[1]);
      if (!order) return { success: false, error: { message: 'Order not found.' } };
      let currentUser = null;
      try { currentUser = JSON.parse(localStorage.getItem('agriconnect_user') || 'null'); } catch { currentUser = null; }
      if (currentUser?.role !== 'farmer' || (order.farmerId || order.farmer_id) !== currentUser.id) {
        return { success: false, error: { message: 'Only the listing farmer can update this order.' } };
      }
      const nextStatus = { placed: 'confirmed', confirmed: 'fulfilled' }[order.status];
      if (nextStatus !== body.status) return { success: false, error: { message: 'This order status transition is not allowed.' } };
      order.status = body.status;
      saveStoredOrders(orders);
      return { success: true, data: order };
    }

    if (endpoint === '/orders' && method === 'POST') {
      const currentOrders = getStoredOrders();
      const listing = getStoredListings().find((item) => item.id === body.listing);
      if (!listing || Number(body.quantity) <= 0 || Number(body.quantity) > Number(listing.quantity)) {
        return { success: false, error: { message: 'The requested crop or quantity is not available.' } };
      }
      listing.quantity = Number(listing.quantity) - Number(body.quantity);
      if (listing.quantity === 0) listing.status = 'sold';
      saveStoredListings(getStoredListings().map((item) => item.id === listing.id ? listing : item));
      const newOrder = {
        id: `ord_${Date.now()}`,
        ...body,
        crop: listing.crop,
        variety: listing.variety,
        unit: listing.unit,
        listing_location: listing.location || listing.district,
        farmerName: listing.farmerName || listing.farmer_name,
        quantity: Number(body.quantity),
        agreed_price: Number(body.agreed_price),
        unitPrice: Number(body.agreed_price),
        totalAmount: Number(body.quantity) * Number(body.agreed_price),
        status: 'placed',
        transport_status: null,
        createdAt: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [newOrder, ...currentOrders];
      saveStoredOrders(updated);
      return {
        success: true,
        data: newOrder,
        meta: { message: 'Purchase order placed successfully' }
      };
    }

    // Mandi Price Prediction
    if (endpoint.startsWith('/prices/predict') || (endpoint === '/prices' && method === 'POST')) {
      const commodity = body.commodity || 'Tomato';
      const cropData = mockPriceDatasets[commodity] || mockPriceDatasets['Tomato'];
      return {
        success: true,
        data: {
          commodity,
          market: body.market || cropData.markets[0],
          horizon: body.horizon || '7day',
          forecastPrice: body.horizon === '1day' ? cropData.forecast1Day : cropData.forecast7Day,
          lowerBound: cropData.lowerBound7Day,
          upperBound: cropData.upperBound7Day,
          currentModal: cropData.currentModal,
          unit: cropData.unit,
          trend: cropData.trend,
          chartData: cropData.chartData,
          modelMetadata: {
            modelVersion: cropData.modelVersion,
            trainingCutoffDate: cropData.trainingCutoff,
            dataFreshness: cropData.dataFreshness,
            mae: cropData.mae,
            rmse: cropData.rmse
          }
        },
        meta: { model_version: cropData.modelVersion }
      };
    }

    // Disease Prediction
    if (endpoint === '/disease/predict' && method === 'POST') {
      const selectedSample = body.sampleType || 'Tomato';
      const sample = mockDiseaseCatalogue.find(d => d.crop.toLowerCase() === selectedSample.toLowerCase()) || mockDiseaseCatalogue[0];
      return {
        success: true,
        data: sample,
        meta: { model_version: sample.modelVersion }
      };
    }

    // Chat / RAG
    if (endpoint === '/chat' && method === 'POST') {
      const q = (body.message || '').toLowerCase();
      const match = mockChatCorpus.find(c => q.includes(c.query.slice(0, 10))) || mockChatCorpus[0];
      return {
        success: true,
        data: {
          answer: match.reply,
          sources: match.sources,
          isAbstention: match.isAbstention,
          routeIntent: match.routeIntent
        }
      };
    }

    // Weather
    if (endpoint.startsWith('/weather')) {
      return {
        success: true,
        data: mockWeatherData
      };
    }

    // Schemes & Eligibility
    if (endpoint === '/schemes' && method === 'GET') {
      return {
        success: true,
        data: mockSchemes
      };
    }

    if (endpoint === '/schemes/eligibility' && method === 'POST') {
      const { landHectares, isGovtEmployee, isTaxPayer, state, crop } = body;
      
      const results = mockSchemes.map(sch => {
        let status = 'eligible';
        let reasons = [];

        if (sch.id === 'sch_01') { // PM-KISAN
          if (isGovtEmployee || isTaxPayer) {
            status = 'not_eligible';
            reasons.push('Excluded due to government employment or tax-paying status under PM-KISAN Clause 2.');
          } else if (landHectares <= 0) {
            status = 'not_eligible';
            reasons.push('Requires cultivable agricultural land title in applicant name.');
          } else {
            reasons.push('Satisfies all criteria for landholding family benefit of ₹6,000/yr.');
          }
        } else if (sch.id === 'sch_05') { // YSR Rythu Bharosa
          if (state !== 'Andhra Pradesh') {
            status = 'not_eligible';
            reasons.push('State-specific scheme for Andhra Pradesh resident cultivators only.');
          } else {
            reasons.push('Eligible for Andhra Pradesh input assistance grant.');
          }
        } else {
          status = 'potentially_eligible';
          reasons.push('Criteria match standard landholding and crop category guidelines.');
        }

        return {
          schemeId: sch.id,
          schemeName: sch.name,
          status,
          reasons,
          benefit: sch.benefit,
          sourceUrl: sch.sourceUrl,
          verifiedAt: sch.verifiedAt
        };
      });

      return {
        success: true,
        data: results
      };
    }

    // Transporters
    if (endpoint === '/transport/providers' && method === 'GET') {
      return {
        success: true,
        data: mockTransporters
      };
    }

    return {
      success: true,
      data: {}
    };
  }
};
