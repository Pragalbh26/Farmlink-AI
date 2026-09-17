export const mockUsers = [
  {
    id: 'usr_farmer_01',
    name: 'Ramesh Kumar Patel',
    role: 'farmer',
    phone: '+91 98765 43210',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Khed',
    landSize: 4.5,
    primaryCrops: ['Tomato', 'Onion', 'Wheat'],
    avatar: '👨‍🌾'
  },
  {
    id: 'usr_buyer_01',
    name: 'GreenFresh Agri Commodities',
    role: 'buyer',
    organization: 'GreenFresh Foods Pvt Ltd',
    phone: '+91 98111 22334',
    state: 'Maharashtra',
    district: 'Mumbai Suburbs',
    verified: true,
    avatar: '🏢'
  },
  {
    id: 'usr_trans_01',
    name: 'Kishan Grewal Logistics',
    role: 'transporter',
    phone: '+91 94123 55678',
    vehicleType: 'Eicher 14ft Covered Truck',
    capacity: '5.5 Tons',
    state: 'Maharashtra',
    district: 'Pune & Nashik Corridor',
    rating: 4.8,
    avatar: '🚛'
  }
];

export const mockListings = [
  {
    id: 'lst_101',
    farmerId: 'usr_farmer_01',
    farmerName: 'Ramesh Kumar Patel',
    farmerPhone: '+91 98765 43210',
    crop: 'Tomato',
    variety: 'Abhinav Hybrid (Grade A)',
    quantity: 80,
    unit: 'Quintal',
    expectedPrice: 1850,
    mandiModalPrice: 1780,
    state: 'Maharashtra',
    district: 'Pune',
    market: 'Pune APMC',
    harvestDate: '2026-08-15',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    description: 'Freshly harvested ripe red tomatoes, crate packed, firm skin, suitable for long-distance transport and wholesale distribution.',
    status: 'active',
    createdAt: '2026-08-14'
  },
  {
    id: 'lst_102',
    farmerId: 'usr_farmer_02',
    farmerName: 'Balwant Singh',
    farmerPhone: '+91 97112 33445',
    crop: 'Wheat',
    variety: 'Sharbati HD-2967',
    quantity: 150,
    unit: 'Quintal',
    expectedPrice: 2450,
    mandiModalPrice: 2380,
    state: 'Madhya Pradesh',
    district: 'Sehore',
    market: 'Sehore Mandi',
    harvestDate: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    description: 'Sun-dried premium golden Sharbati wheat, low moisture (<11%), machine cleaned and bagged in 50kg gunny bags.',
    status: 'active',
    createdAt: '2026-08-11'
  },
  {
    id: 'lst_103',
    farmerId: 'usr_farmer_03',
    farmerName: 'Suresh Patil',
    farmerPhone: '+91 98223 99881',
    crop: 'Onion',
    variety: 'Nashik Red (Medium-Large)',
    quantity: 200,
    unit: 'Quintal',
    expectedPrice: 1620,
    mandiModalPrice: 1580,
    state: 'Maharashtra',
    district: 'Nashik',
    market: 'Lasalgaon APMC',
    harvestDate: '2026-08-12',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    description: 'Well-cured Nashik Red onions with thick outer scales, excellent storage life of 45+ days.',
    status: 'active',
    createdAt: '2026-08-12'
  },
  {
    id: 'lst_104',
    farmerId: 'usr_farmer_04',
    farmerName: 'Gurpreet Sandhu',
    farmerPhone: '+91 98455 12098',
    crop: 'Potato',
    variety: 'Kufri Jyoti (Table Grade)',
    quantity: 120,
    unit: 'Quintal',
    expectedPrice: 1350,
    mandiModalPrice: 1320,
    state: 'Punjab',
    district: 'Jalandhar',
    market: 'Jalandhar Mandi',
    harvestDate: '2026-08-14',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    description: 'Freshly dug medium-large oval tubers, spotless, washed and air-dried.',
    status: 'active',
    createdAt: '2026-08-14'
  },
  {
    id: 'lst_105',
    farmerId: 'usr_farmer_05',
    farmerName: 'Venkat Reddy',
    farmerPhone: '+91 94401 88722',
    crop: 'Rice',
    variety: 'BPT 5204 (Samba Mahsuri)',
    quantity: 90,
    unit: 'Quintal',
    expectedPrice: 3200,
    mandiModalPrice: 3100,
    state: 'Andhra Pradesh',
    district: 'Guntur',
    market: 'Guntur Mandi',
    harvestDate: '2026-08-08',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    description: 'Fine grain paddy, single origin, harvested under optimal weather with high milling recovery rate.',
    status: 'active',
    createdAt: '2026-08-09'
  }
];

export const mockOrders = [
  {
    id: 'ord_901',
    listingId: 'lst_101',
    crop: 'Tomato',
    variety: 'Abhinav Hybrid (Grade A)',
    buyerId: 'usr_buyer_01',
    buyerName: 'GreenFresh Agri Commodities',
    farmerId: 'usr_farmer_01',
    farmerName: 'Ramesh Kumar Patel',
    quantity: 30,
    unit: 'Quintal',
    unitPrice: 1850,
    totalAmount: 55500,
    status: 'accepted', // pending, accepted, dispatched, delivered
    transportStatus: 'requested',
    pickupLocation: 'Khed Farm Gate, Pune, MH',
    deliveryLocation: 'Vashi Wholesale Terminal, Navi Mumbai',
    createdAt: '2026-08-16 09:30 AM'
  },
  {
    id: 'ord_902',
    listingId: 'lst_103',
    crop: 'Onion',
    variety: 'Nashik Red',
    buyerId: 'usr_buyer_01',
    buyerName: 'GreenFresh Agri Commodities',
    farmerId: 'usr_farmer_03',
    farmerName: 'Suresh Patil',
    quantity: 50,
    unit: 'Quintal',
    unitPrice: 1620,
    totalAmount: 81000,
    status: 'dispatched',
    transportStatus: 'in_transit',
    pickupLocation: 'Lasalgaon Storage, Nashik, MH',
    deliveryLocation: 'APMC Market, Vashi, Navi Mumbai',
    createdAt: '2026-08-15 02:15 PM'
  }
];

export const mockPriceDatasets = {
  Tomato: {
    markets: ['Pune APMC (Maharashtra)', 'Azadpur (Delhi)', 'Kolar (Karnataka)'],
    unit: '₹ / Quintal',
    currentModal: 1780,
    forecast1Day: 1810,
    forecast7Day: 1940,
    lowerBound7Day: 1840,
    upperBound7Day: 2050,
    trend: 'up',
    modelVersion: 'v1.4-xgboost-timeseries',
    trainingCutoff: '2026-08-10',
    dataFreshness: 'AGMARKNET 2026 Daily Stream (Updated today)',
    mae: '42.50 ₹/Qtl',
    rmse: '58.20 ₹/Qtl',
    chartData: [
      { date: 'Aug 04', actual: 1640, predicted: null, lower: null, upper: null },
      { date: 'Aug 06', actual: 1680, predicted: null, lower: null, upper: null },
      { date: 'Aug 08', actual: 1710, predicted: null, lower: null, upper: null },
      { date: 'Aug 10', actual: 1750, predicted: 1745, lower: null, upper: null },
      { date: 'Aug 12', actual: 1760, predicted: 1765, lower: null, upper: null },
      { date: 'Aug 14', actual: 1775, predicted: 1770, lower: null, upper: null },
      { date: 'Aug 16 (Today)', actual: 1780, predicted: 1780, lower: 1750, upper: 1810 },
      { date: 'Aug 17 (+1D)', actual: null, predicted: 1810, lower: 1760, upper: 1860 },
      { date: 'Aug 19 (+3D)', actual: null, predicted: 1860, lower: 1790, upper: 1930 },
      { date: 'Aug 21 (+5D)', actual: null, predicted: 1910, lower: 1820, upper: 1990 },
      { date: 'Aug 23 (+7D)', actual: null, predicted: 1940, lower: 1840, upper: 2050 }
    ]
  },
  Onion: {
    markets: ['Lasalgaon (Maharashtra)', 'Pune APMC (Maharashtra)', 'Mahua (Gujarat)'],
    unit: '₹ / Quintal',
    currentModal: 1580,
    forecast1Day: 1570,
    forecast7Day: 1520,
    lowerBound7Day: 1450,
    upperBound7Day: 1600,
    trend: 'down',
    modelVersion: 'v1.4-xgboost-timeseries',
    trainingCutoff: '2026-08-10',
    dataFreshness: 'AGMARKNET 2026 Daily Stream (Updated today)',
    mae: '36.80 ₹/Qtl',
    rmse: '49.10 ₹/Qtl',
    chartData: [
      { date: 'Aug 04', actual: 1690, predicted: null, lower: null, upper: null },
      { date: 'Aug 06', actual: 1660, predicted: null, lower: null, upper: null },
      { date: 'Aug 08', actual: 1640, predicted: null, lower: null, upper: null },
      { date: 'Aug 10', actual: 1620, predicted: 1625, lower: null, upper: null },
      { date: 'Aug 12', actual: 1600, predicted: 1605, lower: null, upper: null },
      { date: 'Aug 14', actual: 1590, predicted: 1595, lower: null, upper: null },
      { date: 'Aug 16 (Today)', actual: 1580, predicted: 1580, lower: 1550, upper: 1610 },
      { date: 'Aug 17 (+1D)', actual: null, predicted: 1570, lower: 1530, upper: 1610 },
      { date: 'Aug 19 (+3D)', actual: null, predicted: 1550, lower: 1500, upper: 1600 },
      { date: 'Aug 21 (+5D)', actual: null, predicted: 1530, lower: 1470, upper: 1590 },
      { date: 'Aug 23 (+7D)', actual: null, predicted: 1520, lower: 1450, upper: 1600 }
    ]
  },
  Potato: {
    markets: ['Agra (Uttar Pradesh)', 'Jalandhar (Punjab)', 'Hooghly (West Bengal)'],
    unit: '₹ / Quintal',
    currentModal: 1320,
    forecast1Day: 1325,
    forecast7Day: 1360,
    lowerBound7Day: 1300,
    upperBound7Day: 1420,
    trend: 'stable',
    modelVersion: 'v1.4-xgboost-timeseries',
    trainingCutoff: '2026-08-10',
    dataFreshness: 'AGMARKNET 2026 Daily Stream (Updated today)',
    mae: '28.40 ₹/Qtl',
    rmse: '39.80 ₹/Qtl',
    chartData: [
      { date: 'Aug 04', actual: 1290, predicted: null, lower: null, upper: null },
      { date: 'Aug 06', actual: 1300, predicted: null, lower: null, upper: null },
      { date: 'Aug 08', actual: 1310, predicted: null, lower: null, upper: null },
      { date: 'Aug 10', actual: 1315, predicted: 1310, lower: null, upper: null },
      { date: 'Aug 12', actual: 1315, predicted: 1320, lower: null, upper: null },
      { date: 'Aug 14', actual: 1320, predicted: 1320, lower: null, upper: null },
      { date: 'Aug 16 (Today)', actual: 1320, predicted: 1320, lower: 1300, upper: 1340 },
      { date: 'Aug 17 (+1D)', actual: null, predicted: 1325, lower: 1300, upper: 1350 },
      { date: 'Aug 19 (+3D)', actual: null, predicted: 1340, lower: 1305, upper: 1380 },
      { date: 'Aug 21 (+5D)', actual: null, predicted: 1350, lower: 1300, upper: 1400 },
      { date: 'Aug 23 (+7D)', actual: null, predicted: 1360, lower: 1300, upper: 1420 }
    ]
  },
  Wheat: {
    markets: ['Khanna (Punjab)', 'Sehore (Madhya Pradesh)', 'Karnal (Haryana)'],
    unit: '₹ / Quintal',
    currentModal: 2380,
    forecast1Day: 2385,
    forecast7Day: 2420,
    lowerBound7Day: 2360,
    upperBound7Day: 2480,
    trend: 'up',
    modelVersion: 'v1.4-xgboost-timeseries',
    trainingCutoff: '2026-08-10',
    dataFreshness: 'AGMARKNET 2026 Daily Stream (Updated today)',
    mae: '22.10 ₹/Qtl',
    rmse: '31.40 ₹/Qtl',
    chartData: [
      { date: 'Aug 04', actual: 2340, predicted: null, lower: null, upper: null },
      { date: 'Aug 06', actual: 2350, predicted: null, lower: null, upper: null },
      { date: 'Aug 08', actual: 2360, predicted: null, lower: null, upper: null },
      { date: 'Aug 10', actual: 2365, predicted: 2360, lower: null, upper: null },
      { date: 'Aug 12', actual: 2370, predicted: 2370, lower: null, upper: null },
      { date: 'Aug 14', actual: 2375, predicted: 2375, lower: null, upper: null },
      { date: 'Aug 16 (Today)', actual: 2380, predicted: 2380, lower: 2360, upper: 2400 },
      { date: 'Aug 17 (+1D)', actual: null, predicted: 2385, lower: 2360, upper: 2410 },
      { date: 'Aug 19 (+3D)', actual: null, predicted: 2400, lower: 2365, upper: 2440 },
      { date: 'Aug 21 (+5D)', actual: null, predicted: 2410, lower: 2360, upper: 2460 },
      { date: 'Aug 23 (+7D)', actual: null, predicted: 2420, lower: 2360, upper: 2480 }
    ]
  }
};

export const mockDiseaseCatalogue = [
  {
    id: 'dis_01',
    crop: 'Tomato',
    diseaseName: 'Early Blight (Alternaria solani)',
    confidence: 0.94,
    status: 'confident',
    symptoms: 'Concentric dark brown rings on older lower leaves forming "target board" patterns, yellowing halos around lesions, stem cankers.',
    management: [
      'Remove and safely destroy infected lower leaves to restrict spore splash.',
      'Maintain drip irrigation instead of overhead sprinklers to keep foliage dry.',
      'Apply Trichoderma harzianum bio-fungicide or copper oxychloride as per ICAR package of practices.',
      'Maintain 60cm row spacing to allow adequate aeration.'
    ],
    sourceAuthority: 'ICAR-Indian Institute of Vegetable Research (IIVR)',
    modelVersion: 'MobileNetV2-PlantVillage-v2.1'
  },
  {
    id: 'dis_02',
    crop: 'Potato',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    confidence: 0.91,
    status: 'confident',
    symptoms: 'Water-soaked irregular pale green to dark brown patches with white cottony fungal growth on the underside during humid weather.',
    management: [
      'Earthing up properly to protect underground tubers from spore wash.',
      'Apply preventive bio-control agents or recommended contact fungicide before heavy mist/rainfall.',
      'Destroy volunteer host plants in surrounding fields.'
    ],
    sourceAuthority: 'ICAR-Central Potato Research Institute (CPRI)',
    modelVersion: 'MobileNetV2-PlantVillage-v2.1'
  },
  {
    id: 'dis_03',
    crop: 'Pepper Bell',
    diseaseName: 'Bacterial Spot (Xanthomonas campestris)',
    confidence: 0.58,
    status: 'uncertain',
    symptoms: 'Small water-soaked circular lesions turning brown on foliage with slight margin chlorosis.',
    management: [
      'Prediction confidence is below the high-reliability threshold (58%).',
      'Please capture a closer photo in daylight without finger obstruction or blur.',
      'Bring a fresh leaf sample to your nearest Krishi Vigyan Kendra (KVK) for laboratory confirmation.'
    ],
    sourceAuthority: 'KVK Agronomic Extension Protocol',
    modelVersion: 'MobileNetV2-PlantVillage-v2.1'
  },
  {
    id: 'dis_04',
    crop: 'Sugarcane',
    diseaseName: 'Unsupported Crop Class',
    confidence: 0.0,
    status: 'unsupported',
    symptoms: 'The model detected a crop outside the 14 PlantVillage benchmark crops (Tomato, Potato, Corn, Pepper, Apple, Grape, Cherry, Peach, Strawberry, Citrus, Soybean, Squash, Raspberry, Blueberry).',
    management: [
      'AgriConnect vision model currently supports 14 benchmark horticultural and field crops.',
      'You can describe symptoms to the Krishi RAG AI Assistant for literature-backed advice.'
    ],
    sourceAuthority: 'AgriConnect CV Registry',
    modelVersion: 'MobileNetV2-PlantVillage-v2.1'
  }
];

export const mockSchemes = [
  {
    id: 'sch_01',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
    jurisdiction: 'Central (All States/UTs)',
    benefit: '₹6,000 per year paid in three equal installments of ₹2,000 directly into the Aadhaar-seeded bank account.',
    sourceUrl: 'https://pmkisan.gov.in',
    verifiedAt: '2026-08-01',
    eligibilityCriteria: {
      isLandholder: true,
      maxLandHectares: null, // all landholding families
      excludedOccupations: ['Institutional landholders', 'Constitutional post holders', 'Serving/retired Govt employees (Class IV/D exempted)', 'Income tax payees in last AY']
    },
    requiredDocs: ['Aadhaar Card', 'Land Ownership Records (Khata/Khatoni/7/12 extract)', 'Aadhaar-linked Bank Passbook']
  },
  {
    id: 'sch_02',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
    jurisdiction: 'Central & State Partnership',
    benefit: 'Comprehensive crop insurance from pre-sowing to post-harvest against non-preventable natural risks. Farmer premium is capped at 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.',
    sourceUrl: 'https://pmfby.gov.in',
    verifiedAt: '2026-08-04',
    eligibilityCriteria: {
      isLandholder: true,
      notifiedCropInNotifiedArea: true,
      sharecropperAllowed: true
    },
    requiredDocs: ['Land Record Document / Sowing Certificate', 'Aadhaar Card', 'Bank Account details', 'Crop Sowing Declaration']
  },
  {
    id: 'sch_03',
    name: 'Kisan Credit Card (KCC) Scheme',
    ministry: 'Department of Financial Services / RBI / NABARD',
    jurisdiction: 'Central (National)',
    benefit: 'Short-term credit limit up to ₹3 Lakhs at subsidized interest rate of 4% per annum (with prompt repayment incentive of 3%).',
    sourceUrl: 'https://myscheme.gov.in/schemes/kcc',
    verifiedAt: '2026-07-28',
    eligibilityCriteria: {
      farmerCategory: ['Owner Cultivator', 'Tenant Farmer', 'Sharecropper', 'SHG / Joint Liability Group'],
      minimumAge: 18
    },
    requiredDocs: ['Application Form', 'ID & Address Proof', 'Land Records / Sowing Pattern Proof']
  },
  {
    id: 'sch_04',
    name: 'Agriculture Infrastructure Fund (AIF)',
    ministry: 'Ministry of Agriculture & Farmers Welfare, GoI',
    jurisdiction: 'Central',
    benefit: '3% per annum interest subvention on loans up to ₹2 Crore for post-harvest management infrastructure and community farming assets.',
    sourceUrl: 'https://agriinfra.dac.gov.in',
    verifiedAt: '2026-07-20',
    eligibilityCriteria: {
      applicantType: ['Primary Agricultural Credit Societies (PACS)', 'FPOs', 'Agri-entrepreneurs', 'Startups', 'Farmers']
    },
    requiredDocs: ['DPR (Detailed Project Report)', 'Land title / lease deed', 'KYC and Financial statements']
  },
  {
    id: 'sch_05',
    name: 'YSR Rythu Bharosa (Andhra Pradesh)',
    ministry: 'Department of Agriculture, Govt of Andhra Pradesh',
    jurisdiction: 'State (Andhra Pradesh)',
    benefit: 'Financial assistance of ₹13,500 per farmer family per year (inclusive of ₹6,000 PM-KISAN component) for agricultural inputs.',
    sourceUrl: 'https://ysrrythubharosa.ap.gov.in',
    verifiedAt: '2026-08-02',
    eligibilityCriteria: {
      state: 'Andhra Pradesh',
      isCultivatorOrTenant: true,
      ccrcCardForTenants: true
    },
    requiredDocs: ['Aadhaar', 'AP Land Record (Webland Extract)', 'CCRC card for tenant farmers']
  }
];

export const mockTransporters = [
  {
    id: 'tr_01',
    name: 'Kishan Grewal Logistics',
    vehicleType: 'Eicher 14ft Covered Truck',
    capacity: '5.5 Tons',
    baseLocation: 'Pune APMC Yard, Maharashtra',
    operationalCorridors: ['Pune -> Mumbai (Vashi)', 'Pune -> Nashik', 'Pune -> Kolhapur'],
    ratePerKm: '₹ 38 / km',
    driverName: 'Sardar Kishan Singh',
    phone: '+91 94123 55678',
    rating: 4.8,
    status: 'available',
    experienceYears: 9
  },
  {
    id: 'tr_02',
    name: 'Jai Kisan Rural Transport',
    vehicleType: 'Mahindra Bolero Maxi Truck',
    capacity: '1.8 Tons',
    baseLocation: 'Khed Market, Pune, Maharashtra',
    operationalCorridors: ['Khed -> Pune APMC', 'Khed -> Chakan', 'Khed -> Narayangaon'],
    ratePerKm: '₹ 22 / km',
    driverName: 'Dnyaneshwar Jagtap',
    phone: '+91 98901 44552',
    rating: 4.9,
    status: 'available',
    experienceYears: 6
  },
  {
    id: 'tr_03',
    name: 'Sahyadri Agro Movers',
    vehicleType: 'Tata 407 LPT Heavy',
    capacity: '3.8 Tons',
    baseLocation: 'Lasalgaon Mandi, Nashik, Maharashtra',
    operationalCorridors: ['Nashik -> Mumbai', 'Nashik -> Surat', 'Nashik -> Pune'],
    ratePerKm: '₹ 32 / km',
    driverName: 'Pravin Shinde',
    phone: '+91 98230 77119',
    rating: 4.7,
    status: 'busy',
    experienceYears: 11
  }
];

export const mockWeatherData = {
  location: 'Pune District (Khed Sub-division), Maharashtra',
  currentTemp: 28,
  condition: 'Partly Cloudy with High Humidity',
  humidity: '78%',
  rainfallChance: '65%',
  windSpeed: '14 km/h',
  forecastDate: '2026-08-16',
  source: 'India Meteorological Department (IMD) Agromet Advisory Bulletin',
  verifiedTimestamp: 'Today, 06:00 AM IST',
  fiveDayForecast: [
    { day: 'Sun', date: 'Aug 16', tempMax: 29, tempMin: 22, condition: 'Scattered Showers', rainProb: '65%' },
    { day: 'Mon', date: 'Aug 17', tempMax: 30, tempMin: 23, condition: 'Moderate Rain', rainProb: '80%' },
    { day: 'Tue', date: 'Aug 18', tempMax: 28, tempMin: 22, condition: 'Heavy Rain Alert', rainProb: '90%' },
    { day: 'Wed', date: 'Aug 19', tempMax: 29, tempMin: 21, condition: 'Passing Showers', rainProb: '45%' },
    { day: 'Thu', date: 'Aug 20', tempMax: 31, tempMin: 22, condition: 'Sunny & Humid', rainProb: '20%' }
  ],
  advisories: [
    {
      id: 'adv_01',
      severity: 'warning',
      hazard: 'Heavy Rainfall Warning (Aug 17-18)',
      message: 'Provide adequate drainage channels in standing tomato and vegetable plots to prevent waterlogging and root rot. Postpone chemical spray operations until clear weather.',
      source: 'IMD Agromet Division Pune'
    },
    {
      id: 'adv_02',
      severity: 'info',
      hazard: 'High Humidity & Fungal Risk',
      message: 'Continuous relative humidity (>75%) favors Early Blight in Solanaceous crops. Monitor lower foliage regularly.',
      source: 'State Agricultural Extension'
    }
  ]
};

export const mockChatCorpus = [
  {
    query: 'am i eligible for pm kisan?',
    reply: 'Under the **PM-KISAN** guidelines, all landholding farmer families with cultivable landholding in their names are eligible for ₹6,000/year (paid in 3 installments of ₹2,000), provided they do not fall under constitutional or income tax exclusion categories.',
    sources: [
      { title: 'PM-KISAN Scheme Guidelines', url: 'https://pmkisan.gov.in', verifiedAt: '2026-08-01' },
      { title: 'myScheme Central Database', url: 'https://myscheme.gov.in/schemes/pmkisan', verifiedAt: '2026-08-01' }
    ],
    isAbstention: false,
    routeIntent: 'scheme_eligibility'
  },
  {
    query: 'why are tomato prices fluctuating in pune?',
    reply: 'AGMARKNET price intelligence indicates daily tomato arrivals at Pune APMC have increased by ~18% over the past week. Our time-series forecast anticipates a slight recovery (+₹130/Quintal) over the next 7 days due to festive wholesale demand in urban Mumbai-Pune belt.',
    sources: [
      { title: 'AGMARKNET Daily Modal Price Stream', url: 'https://data.gov.in', verifiedAt: '2026-08-16' },
      { title: 'AgriConnect Price Engine v1.4-XGB', url: '#', verifiedAt: '2026-08-10' }
    ],
    isAbstention: false,
    routeIntent: 'price_forecasting'
  },
  {
    query: 'how to prevent leaf curl in chili?',
    reply: 'Chili Leaf Curl is primarily vectored by whiteflies (Bemisia tabaci). Recommended ICAR IPM practices include: 1) Install yellow sticky traps (15-20 traps/acre); 2) Spray Neem seed kernel extract (NSKE 5%) or bio-insecticides at early infestation; 3) Rogue out heavily stunted plants; 4) Avoid excess nitrogen fertilizer.',
    sources: [
      { title: 'ICAR-IIHR Crop Protection Advisory for Solanaceous Crops', url: 'https://iihr.res.in', verifiedAt: '2026-07-15' }
    ],
    isAbstention: false,
    routeIntent: 'crop_health'
  },
  {
    query: 'what is the subsidy on helicopter farming in rajasthan?',
    reply: 'Verified official government documentation does not describe any approved subsidy for private agricultural helicopters. The assistant cannot provide unverified financial claims. Please refer to official Sub-Mission on Agricultural Mechanization (SMAM) guidelines for drone subsidies instead.',
    sources: [],
    isAbstention: true,
    routeIntent: 'unsupported_abstention'
  }
];
