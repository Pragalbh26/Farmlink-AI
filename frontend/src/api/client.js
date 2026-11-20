const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

const normalizeListing = (listing) => ({
  ...listing,
  farmerId: listing.farmerId || listing.farmer,
  farmerName: listing.farmerName || listing.farmer_name || '',
  farmerPhone: listing.farmerPhone || listing.farmer_phone || '',
  expectedPrice: Number(listing.expectedPrice ?? listing.expected_price ?? 0) || 0,
  quantity: Number(listing.quantity ?? 0) || 0,
  unit: listing.unit || 'Quintal',
  image: listing.image || listing.image_url || '/crop-placeholder.svg',
  district: listing.district || listing.location || '',
  state: listing.state || '',
});

const normalizeOrder = (order) => {
  const quantity = Number(order.quantity ?? 0) || 0;
  const unitPrice = Number(order.unitPrice ?? order.agreed_price ?? order.unit_price ?? 0) || 0;
  const totalAmount = Number(order.totalAmount ?? order.total_amount ?? quantity * unitPrice) || 0;
  return {
    ...order,
    crop: order.crop || order.listing_crop || order.listing?.crop || 'Crop',
    variety: order.variety || order.listing_variety || order.listing?.variety || '',
    unit: order.unit || order.listing?.unit || 'Quintal',
    quantity,
    unitPrice,
    totalAmount,
    farmerName: order.farmerName || order.farmer_name || '',
    buyerName: order.buyerName || order.buyer_name || '',
    status: order.status || 'placed',
    createdAt: order.createdAt || order.created_at || '',
  };
};

const normalizeWeather = (data) => ({
  ...data,
  verifiedTimestamp: data.verifiedTimestamp || data.timestamp,
  currentTemp: data.currentTemp ?? data.temperature_celsius,
  humidity: data.humidity || `${data.humidity_percent ?? 0}%`,
  rainfallChance: data.rainfallChance || '—',
  windSpeed: data.windSpeed || '—',
  advisories: data.advisories || [],
  fiveDayForecast: data.fiveDayForecast || [],
});

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('agriconnect_token');
    const lang = localStorage.getItem('agriconnect_lang') || 'en';
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'X-App-Language': lang,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      body:
        options.body && !isFormData && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const json =
      res.status === 204
        ? { success: true, data: null }
        : contentType.includes('application/json')
        ? await res.json()
        : {
            success: false,
            error: { message: `Server returned ${res.status} without a JSON response.` },
          };

    if (!res.ok || json?.success === false) {
      const error = json?.error;
      const message =
        typeof error === 'string'
          ? error
          : error?.message || Object.values(error || {}).flat().join(' ') || 'API request failed';
      throw new Error(message);
    }

    const cleanPath = endpoint.split('?')[0].replace(/\/$/, '');
    if (cleanPath === '/listings' && Array.isArray(json?.data)) {
      json.data = json.data.map(normalizeListing);
    }
    if (cleanPath === '/orders/me' && Array.isArray(json?.data)) {
      json.data = json.data.map(normalizeOrder);
    }
    if (cleanPath === '/weather/current' && json?.data) {
      json.data = normalizeWeather(json.data);
    }
    return json;
  },
};