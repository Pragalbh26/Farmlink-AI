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
  return saved ? JSON.parse(saved) : mockOrders;
};

const saveStoredOrders = (orders) => {
  localStorage.setItem('agriconnect_orders', JSON.stringify(orders));
};

const normalizeListing = (listing) => ({
  ...listing,
  farmerId: listing.farmerId || listing.farmer,
  farmerName: listing.farmerName || listing.farmer_name || '',
  farmerPhone: listing.farmerPhone || listing.farmer_phone || '',
  expectedPrice: listing.expectedPrice ?? listing.expected_price,
  image: listing.image || listing.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  district: listing.district || listing.location || '',
  state: listing.state || '',
});
const normalizeWeather = (data) => ({ ...data, verifiedTimestamp: data.verifiedTimestamp || data.timestamp, currentTemp: data.currentTemp ?? data.temperature_celsius, humidity: data.humidity || `${data.humidity_percent ?? 0}%`, rainfallChance: data.rainfallChance || '—', windSpeed: data.windSpeed || '—', advisories: data.advisories || [], fiveDayForecast: data.fiveDayForecast || [] });
const normalizeScheme = (scheme) => ({ ...scheme, name: scheme.name || scheme.scheme_name, ministry: scheme.ministry || scheme.jurisdiction || 'Government of India', benefit: scheme.benefit || 'See official scheme details', sourceUrl: scheme.sourceUrl || scheme.source_url || '#' });
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

      const json = res.status === 204 ? { success: true, data: null } : await res.json();
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
      if (endpoint === '/chat' && json?.data) json.data = { ...json.data, answer: json.data.answer || json.data.message, sources: json.data.sources || json.data.citations || [], isAbstention: Boolean(json.data.isAbstention) };
      if (endpoint === '/disease/predict' && json?.data) json.data = { ...json.data, status: json.data.status || 'success', treatmentSuggestion: json.data.treatmentSuggestion || json.data.treatment_suggestion };
      if (endpoint === '/orders/me' && Array.isArray(json?.data)) json.data = json.data.map((o) => ({ ...o, unitPrice: o.unitPrice ?? o.unit_price ?? o.agreed_price, totalAmount: Number(o.totalAmount ?? o.total_amount ?? (o.quantity * o.agreed_price)), farmerName: o.farmerName || o.farmer_name || '', createdAt: o.createdAt || o.created_at }));
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
        avatar: body.role === 'farmer' ? '👨‍🌾' : (body.role === 'buyer' ? '🏢' : '🚛')
      };
      return {
        success: true,
        data: { user: newUser, token: 'mock_jwt_token_sample_registered' },
        meta: { timestamp: new Date().toISOString() }
      };
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
      return {
        success: true,
        data: getStoredOrders()
      };
    }

    if (endpoint === '/orders' && method === 'POST') {
      const currentOrders = getStoredOrders();
      const newOrder = {
        id: `ord_${Date.now()}`,
        ...body,
        status: 'pending',
        transportStatus: 'unbooked',
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
