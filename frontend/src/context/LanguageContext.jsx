import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation & Common
    app_name: 'AgriConnect',
    tagline: 'Direct Farmer Marketplace & Grounded AI Intelligence',
    home: 'Home',
    marketplace: 'Marketplace',
    price_prediction: 'Mandi Prices',
    disease_detection: 'Crop Health',
    schemes: 'Govt Schemes',
    weather: 'Weather',
    transport: 'Transport',
    chat: 'AI Assistant',
    profile: 'Profile',
    orders: 'Orders',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search...',
    filter: 'Filter',
    loading: 'Loading...',
    role_farmer: 'Farmer',
    role_buyer: 'Buyer',
    role_transporter: 'Transporter',
    
    // Farmer Dashboard
    welcome_back: 'Welcome back',
    quick_actions: 'Quick Actions',
    scan_crop_cta: 'Scan Leaf for Disease',
    check_mandi_cta: 'Check Mandi Prices',
    list_harvest_cta: 'List New Harvest',
    ask_ai_cta: 'Ask Krishi AI Assistant',
    check_schemes_cta: 'Check Scheme Eligibility',
    book_transport_cta: 'Book Harvest Transport',
    recent_listings: 'Your Active Harvest Listings',
    no_listings_yet: 'No crop listings yet. Tap "List New Harvest" to sell directly to verified buyers.',
    active_orders: 'Active Orders',
    
    // AI Disclaimers
    ai_disclaimer_price: 'Price forecasts are statistical estimates based on AGMARKNET trends and do not guarantee final mandi quotes.',
    ai_disclaimer_disease: 'AI diagnosis provides preliminary decision support based on leaf imagery. Consult your local KVK or extension officer for critical field confirmation.',
    ai_disclaimer_schemes: 'Scheme eligibility is calculated using deterministic rules. Final sanction rests with the respective Ministry/Department.',
    ai_abstention_notice: 'Verified official documentation is not available for this query. The assistant will not provide unverified claims.',
    
    // States
    state_loading: 'Analyzing data...',
    state_empty: 'No records found',
    state_uncertain: 'Low Confidence / Uncertain Prediction',
    state_error: 'Service temporarily unavailable. Please retry.',
    
    // Marketplace & Orders
    expected_price: 'Expected Price',
    quantity: 'Quantity',
    mandi_modal_ref: 'Avg Mandi Modal Price',
    place_order: 'Place Purchase Order',
    order_success: 'Order placed successfully!',
    unit_quintal: 'Quintal',
    unit_kg: 'Kg',
    unit_ton: 'Ton',
    
    // Disease
    upload_photo: 'Upload or Capture Leaf Photo',
    drag_drop_photo: 'Click or drop a clear leaf photo here',
    healthy: 'Healthy Crop',
    disease_detected: 'Possible Condition Detected',
    confidence_level: 'Confidence Level',
    recommended_action: 'Recommended Management Steps',
    retake_photo: 'Retake with better lighting',
    consult_expert: 'Consult Local KVK Extension Officer',
    
    // Price Prediction
    select_commodity: 'Select Commodity',
    select_market: 'Select Mandi Market',
    forecast_horizon: 'Forecast Horizon',
    horizon_1day: '1-Day Forecast',
    horizon_7day: '7-Day Forecast',
    predicted_modal: 'Predicted Modal Price',
    historical_trend: 'Historical & Forecasted Price Trend',
    model_metadata: 'Model Metadata',
    
    // Schemes
    check_eligibility: 'Check Eligibility',
    eligible: 'Eligible',
    potentially_eligible: 'Potentially Eligible',
    not_eligible: 'Not Eligible',
    insufficient_info: 'Insufficient Information',
    view_official_portal: 'Visit Official Scheme Portal',
    verified_at: 'Verified by Official Sources on',
    
    // Weather
    farming_advisory: 'Agrometeorological Advisories',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall_chance: 'Rainfall Probability',
    wind: 'Wind Speed',
    source_imd: 'Source: India Meteorological Department (IMD)',
    
    // Transport
    available_transporters: 'Available Verified Transporters',
    vehicle_capacity: 'Capacity',
    request_booking: 'Request Transport Booking',
  },
  hi: {
    // Navigation & Common
    app_name: 'एग्रीकनेक्ट',
    tagline: 'सीधा किसान बाज़ार एवं प्रमाणित एआई कृषि सहायता',
    home: 'होम',
    marketplace: 'फसल बाज़ार',
    price_prediction: 'मंडी भाव व अनुमान',
    disease_detection: 'फसल स्वास्थ्य व रोग',
    schemes: 'सरकारी योजनाएं',
    weather: 'मौसम व सलाह',
    transport: 'परिवहन सेवा',
    chat: 'कृषि सहायक',
    profile: 'प्रोफ़ाइल',
    orders: 'ऑर्डर',
    logout: 'लॉगआउट',
    login: 'लॉग इन',
    register: 'पंजीकरण',
    back: 'पीछे जाएं',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    search: 'खोजें...',
    filter: 'फ़िल्टर',
    loading: 'लोड हो रहा है...',
    role_farmer: 'किसान',
    role_buyer: 'खरीदार / व्यापारी',
    role_transporter: 'ट्रांसपोर्टर',
    
    // Farmer Dashboard
    welcome_back: 'नमस्ते एवं स्वागत',
    quick_actions: 'मुख्य सुविधाएं',
    scan_crop_cta: 'पत्ती स्कैन करें (रोग जांच)',
    check_mandi_cta: 'मंडी भाव व भविष्य अनुमान',
    list_harvest_cta: 'फसल बिक्री के लिए जोड़ें',
    ask_ai_cta: 'कृषि एआई सहायक से पूछें',
    check_schemes_cta: 'सरकारी योजना पात्रता जांचें',
    book_transport_cta: 'फसल परिवहन बुक करें',
    recent_listings: 'आपकी सक्रिय फसल लिस्टिंग',
    no_listings_yet: 'अभी कोई फसल लिस्टिंग नहीं है। सीधे खरीदारों को बेचने के लिए "फसल बिक्री के लिए जोड़ें" दबाएं।',
    active_orders: 'सक्रिय ऑर्डर',
    
    // AI Disclaimers
    ai_disclaimer_price: 'मूल्य अनुमान AGMARKNET मंडी रुझानों पर आधारित सांख्यिकीय अनुमान हैं, यह अंतिम गारंटीकृत खरीद मूल्य नहीं है।',
    ai_disclaimer_disease: 'एआई रोग जांच पत्ती की फोटो पर आधारित प्राथमिक सहायता है। गंभीर लक्षण होने पर नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
    ai_disclaimer_schemes: 'योजना पात्रता आधिकारिक नियमों के आधार पर परखी गई है। अंतिम स्वीकृति संबंधित विभाग के अधीन है।',
    ai_abstention_notice: 'इस प्रश्न के लिए आधिकारिक सत्यापित जानकारी उपलब्ध नहीं है। बिना प्रमाण कोई सुझाव नहीं दिया गया है।',
    
    // States
    state_loading: 'डेटा का विश्लेषण किया जा रहा है...',
    state_empty: 'कोई रिकॉर्ड नहीं मिला',
    state_uncertain: 'कम सटीकता / अनिश्चित अनुमान',
    state_error: 'सेवा अस्थायी रूप से उपलब्ध नहीं है। कृपया पुनः प्रयास करें।',
    
    // Marketplace & Orders
    expected_price: 'अपेक्षित मूल्य',
    quantity: 'मात्रा',
    mandi_modal_ref: 'औसत मंडी मॉडल भाव',
    place_order: 'खरीद ऑर्डर भेजें',
    order_success: 'ऑर्डर सफलतापूर्वक भेजा गया!',
    unit_quintal: 'क्विंटल',
    unit_kg: 'किग्रा',
    unit_ton: 'टन',
    
    // Disease
    upload_photo: 'पत्ती की फोटो अपलोड या खींचें',
    drag_drop_photo: 'साफ़ पत्ती की फोटो यहां डालें या क्लिक करें',
    healthy: 'स्वस्थ फसल',
    disease_detected: 'संभावित लक्षण पाए गए',
    confidence_level: 'सटीकता स्तर',
    recommended_action: 'अनुशंसित उपचार व प्रबंधन',
    retake_photo: 'अच्छी रोशनी में दोबारा फोटो लें',
    consult_expert: 'नजदीकी केवीके कृषि वैज्ञानिक से सलाह लें',
    
    // Price Prediction
    select_commodity: 'फसल चुनें',
    select_market: 'मंडी चुनें',
    forecast_horizon: 'अनुमान अवधि',
    horizon_1day: '1-दिन का अनुमान',
    horizon_7day: '7-दिन का अनुमान',
    predicted_modal: 'अनुमानित मॉडल भाव',
    historical_trend: 'ऐतिहासिक एवं अनुमानित भाव रुझान',
    model_metadata: 'मॉडल विवरण',
    
    // Schemes
    check_eligibility: 'पात्रता जांचें',
    eligible: 'पात्र हैं',
    potentially_eligible: 'संभावित पात्र',
    not_eligible: 'पात्र नहीं हैं',
    insufficient_info: 'अधूरी जानकारी',
    view_official_portal: 'आधिकारिक पोर्टल पर जाएं',
    verified_at: 'आधिकारिक स्रोतों द्वारा सत्यापित तिथि:',
    
    // Weather
    farming_advisory: 'कृषि मौसम सलाह',
    temperature: 'तापमान',
    humidity: 'नमी (आर्द्रता)',
    rainfall_chance: 'बारिश की संभावना',
    wind: 'हवा की गति',
    source_imd: 'स्रोत: भारत मौसम विज्ञान विभाग (IMD)',
    
    // Transport
    available_transporters: 'उपलब्ध सत्यापित ट्रांसपोर्टर',
    vehicle_capacity: 'क्षमता',
    request_booking: 'परिवहन बुकिंग का अनुरोध करें',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('agriconnect_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agriconnect_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
