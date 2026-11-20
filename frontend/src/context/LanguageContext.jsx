import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    app_name: 'FarmLink AI',
    tagline: 'Direct Agricultural Marketplace & Grounded AI Platform',
    home: 'Home',
    marketplace: 'Marketplace',
    orders: 'Orders',
    price_prediction: 'Mandi Prices',
    disease_detection: 'Crop Health',
    chat: 'AI Assistant',
    schemes: 'Govt Schemes',
    weather: 'Weather',
    transport: 'Transport',
    profile: 'Profile',
    welcome_back: 'Welcome back',
    quick_actions: 'Quick Actions',
    recent_listings: 'Your Active Listings',
    no_listings_yet: 'You have not listed any crops yet. Post your first harvest to reach buyers directly.',
    list_harvest_cta: 'List New Harvest',
    check_mandi_cta: 'Mandi Price & Forecast',
    scan_crop_cta: 'Scan Crop Leaf',
    ask_ai_cta: 'Ask AI Krishi Assistant',
    check_schemes_cta: 'Check Scheme Eligibility',
    book_transport_cta: 'Book Crop Transport',
    select_commodity: 'Select Commodity',
    select_market: 'Select Mandi Market',
    forecast_horizon: 'Forecast Horizon',
    historical_trend: 'Historical & Predicted Price Trend',
    check_eligibility: 'Check Eligibility',
    eligible: 'Eligible',
    potentially_eligible: 'Potentially Eligible',
    not_eligible: 'Not Eligible',
    humidity: 'Humidity',
    wind: 'Wind Speed',
    back: 'Back',
    login: 'Sign In',
    register: 'Register',
    role_farmer: 'Farmer',
    role_buyer: 'Buyer',
    role_transporter: 'Transporter',
    disease_detected: 'Disease Detected',
    healthy_leaf: 'Healthy Leaf',
    confidence_level: 'Confidence Level',
    ai_disclaimer_disease: 'AI visual diagnostics assist field scouting. Always verify severe outbreaks or chemical dosages with your local Krishi Vigyan Kendra (KVK) agronomist.',
    symptoms: 'Diagnostic Characteristics & Visual Symptoms',
    management: 'Recommended ICAR Management Steps',
  },
  hi: {
    app_name: 'FarmLink AI',
    tagline: 'सीधा किसान बाज़ार एवं प्रमाणित एआई कृषि सहायता',
    home: 'होम',
    marketplace: 'फसल बाज़ार',
    orders: 'ऑर्डर',
    price_prediction: 'मंडी भाव व अनुमान',
    disease_detection: 'फसल स्वास्थ्य व रोग',
    chat: 'कृषि सहायक',
    schemes: 'सरकारी योजनाएं',
    weather: 'मौसम व सलाह',
    transport: 'परिवहन सेवा',
    profile: 'प्रोफ़ाइल',
    welcome_back: 'नमस्ते एवं स्वागत',
    quick_actions: 'मुख्य सुविधाएं',
    recent_listings: 'आपकी सक्रिय फसल लिस्टिंग',
    no_listings_yet: 'आपने अभी तक कोई फसल सूचीबद्ध नहीं की है। सीधे खरीदारों तक पहुंचने के लिए अपनी पहली फसल जोड़ें।',
    list_harvest_cta: 'फसल बिक्री के लिए जोड़ें',
    check_mandi_cta: 'मंडी भाव व भविष्य अनुमान',
    scan_crop_cta: 'पत्ती स्कैन करें (रोग जांच)',
    ask_ai_cta: 'कृषि एआई सहायक से पूछें',
    check_schemes_cta: 'सरकारी योजना पात्रता जांचें',
    book_transport_cta: 'फसल परिवहन बुक करें',
    select_commodity: 'फसल चुनें',
    select_market: 'मंडी चुनें',
    forecast_horizon: 'अनुमान अवधि',
    historical_trend: 'ऐतिहासिक एवं अनुमानित भाव रुझान',
    check_eligibility: 'पात्रता जांचें',
    eligible: 'पात्र',
    potentially_eligible: 'संभावित पात्र',
    not_eligible: 'अपात्र',
    humidity: 'नमी (आर्द्रता)',
    wind: 'हवा की गति',
    back: 'वापस जाएं',
    login: 'लॉग इन करें',
    register: 'पंजीकरण करें',
    role_farmer: 'किसान',
    role_buyer: 'खरीदार',
    role_transporter: 'ट्रांसपोर्टर',
    disease_detected: 'रोग पहचाना गया',
    healthy_leaf: 'स्वस्थ पत्ती',
    confidence_level: 'विश्वसनीयता स्तर',
    ai_disclaimer_disease: 'एआई दृश्य जांच खेत निरीक्षण में सहायता करती है। गंभीर रोग या दवा की मात्रा के लिए हमेशा अपने स्थानीय कृषि विज्ञान केंद्र (केवीके) विशेषज्ञ से परामर्श लें।',
    symptoms: 'नैदानिक लक्षण एवं दृश्य संकेत',
    management: 'अनुशंसित आईसीएआर प्रबंधन चरण',
  },
};

const EXACT_HI_MAP = {
  // Landing, Login & Register
  'Sign In': 'लॉग इन करें',
  'Register': 'पंजीकरण करें',
  'Empowering Indian Agriculture with Grounded AI': 'प्रमाणित एआई के साथ भारतीय कृषि का सशक्तिकरण',
  'The Digital OS for': 'आधुनिक खेती के लिए',
  'Modern Farming': 'डिजिटल प्लेटफ़ॉर्म',
  'FarmLink AI integrates direct farm-to-buyer commerce, mandi price intelligence, computer vision crop diagnostics, and government scheme eligibility in one platform.': 'FarmLink AI एक ही प्लेटफ़ॉर्म पर सीधा किसान-खरीदार बाज़ार, मंडी भाव अनुमान, एआई फसल रोग जांच और सरकारी योजना पात्रता को एक साथ जोड़ता है।',
  'Direct Marketplace': 'सीधा फसल बाज़ार',
  'Connect directly with buyers and transporters. Zero middlemen, better margins.': 'खरीदारों और ट्रांसपोर्टरों से सीधे जुड़ें। कोई बिचौलिया नहीं, बेहतर मुनाफा।',
  'AI Price Forecasts': 'एआई भाव पूर्वानुमान',
  'Predict future mandi prices using advanced machine learning models.': 'उन्नत मशीन लर्निंग मॉडल से भविष्य के मंडी भाव का अनुमान लगाएं।',
  'Crop Disease Scan': 'फसल रोग स्कैन',
  'Instantly diagnose leaf diseases using computer vision and get verified ICAR treatments.': 'कंप्यूटर विज़न से पत्ती के रोगों की तुरंत पहचान करें और प्रमाणित आईसीएआर उपचार पाएं।',
  'Scheme Eligibility': 'योजना पात्रता',
  'Check your eligibility for PM-KISAN and state grants instantly.': 'पीएम-किसान और राज्य अनुदान के लिए अपनी पात्रता तुरंत जांचें।',
  'Get Started Now': 'अभी शुरू करें',
  'Sign into your Account': 'अपने खाते में लॉग इन करें',
  'Everything you need in one platform': 'एक ही प्लेटफ़ॉर्म में आपकी सभी आवश्यकताएं',
  'Sign in to FarmLink AI': 'FarmLink AI में लॉग इन करें',
  'Access your farm listings, orders, and AI tools': 'अपनी फसल लिस्टिंग, ऑर्डर और एआई उपकरण देखें',
  'Create FarmLink AI Account': 'FarmLink AI खाता बनाएं',
  'Phone Number': 'मोबाइल नंबर',
  'Mobile Number (for SMS & verification)': 'मोबाइल नंबर (एसएमएस और सत्यापन के लिए)',
  'Full Name': 'पूरा नाम',
  'Password': 'पासवर्ड',
  'Confirm Password': 'पासवर्ड की पुष्टि करें',
  'Enter your password': 'अपना पासवर्ड दर्ज करें',
  'State': 'राज्य',
  'State / UT': 'राज्य / केंद्र शासित प्रदेश',
  'District / APMC': 'जिला / मंडी (APMC)',
  'District / Village': 'जिला / गाँव',
  'Nearest Mandi': 'नजदीकी मंडी',
  'Complete Registration': 'पंजीकरण पूरा करें',
  'Already have an account?': 'पहले से खाता है?',
  "Don't have an account yet?": 'अभी तक खाता नहीं है?',
  'Register here': 'यहाँ पंजीकरण करें',
  'Select your role': 'अपनी भूमिका चुनें',

  // Navigation & Dashboards
  'CORE PLATFORM': 'मुख्य प्लेटफ़ॉर्म',
  'FARMLINK AI TOOLS': 'फार्मलिक एआई उपकरण',
  'AGRI AI INTELLIGENCE': 'एग्री एआई इंटेलिजेंस',
  'ECOSYSTEM & SUPPORT': 'इकोसिस्टम और सहायता',
  'Verified Farmer Member': 'प्रमाणित किसान सदस्य',
  'VERIFIED FARMER MEMBER': 'प्रमाणित किसान सदस्य',
  'Verified Wholesale Buyer': 'प्रमाणित थोक खरीदार',
  'Verified Rural Transporter': 'प्रमाणित ग्रामीण ट्रांसपोर्टर',
  'Scan Leaf': 'पत्ती स्कैन करें',
  'Open Tool': 'उपकरण खोलें',
  'View 5-Day Forecast': '5-दिवसीय पूर्वानुमान देखें',
  '(1-Tap Agricultural Tools)': '(1-टैप कृषि उपकरण)',
  'Agromet Advisory': 'कृषि-मौसम सलाह',
  'AGROMET ADVISORY': 'कृषि-मौसम सलाह',
  'AGROMET NOTICE': 'कृषि-मौसम सूचना',
  'Market Intelligence': 'बाज़ार जानकारी',
  'AGMARKNET Market Feed': 'एगमार्कनेट बाज़ार फीड',
  'Explore Price Forecasts': 'भाव पूर्वानुमान देखें',
  'Current Modal Price': 'वर्तमान मॉडल भाव',
  'CURRENT MODAL PRICE': 'वर्तमान मॉडल भाव',
  '7-Day AI Forecast': '7-दिवसीय एआई अनुमान',
  'Recommended Action': 'सुझाया गया कदम',
  'Your direct-to-buyer crop listings': 'आपकी सीधी खरीदार फसल लिस्टिंग',
  'Connected to live marketplace, weather, and AI advisory services.': 'लाइव बाज़ार, मौसम और एआई सलाह सेवाओं से जुड़ा है।',
  'Price AI': 'भाव एआई',
  'Vision CV': 'विज़न सीवी',
  'Marketplace': 'बाज़ार',
  'AI Assistant': 'एआई सहायक',
  'Schemes': 'योजनाएं',
  'Logistics': 'परिवहन',
  'Live mandi rates and 7-day AI price forecasts': 'लाइव मंडी भाव और 7-दिन का एआई पूर्वानुमान',
  'Instant leaf photo scan & ICAR treatment advice': 'तुरंत पत्ती फोटो स्कैन और आईसीएआर उपचार सलाह',
  'Sell directly to buyers with zero middlemen': 'बिना बिचौलियों के सीधे खरीदारों को बेचें',
  'AI assistant for farming, prices & schemes': 'खेती, भाव और योजनाओं के लिए एआई सहायक',
  'Check eligibility for PM-KISAN & state grants': 'पीएम-किसान और राज्य अनुदान की पात्रता जांचें',
  'Find registered transporters and request delivery': 'पंजीकृत ट्रांसपोर्टर खोजें और डिलीवरी बुक करें',
  'Tomato (Abhinav) — APMC Market Outlook': 'टमाटर (अभिनव) — एपीएमसी बाज़ार दृष्टिकोण',
  'Prices are trending upward over the next week. Consider holding well-cured harvest for 3–5 days.': 'अगले सप्ताह भाव बढ़ने की संभावना है। अच्छी फसल को 3–5 दिन रोककर बेचने पर विचार करें।',

  // Price Prediction
  'Live Market Intelligence': 'लाइव बाज़ार जानकारी',
  'Track APMC modal prices and short-term price trajectories across all Indian states, mandis, and crops.': 'सभी भारतीय राज्यों, मंडियों और फसलों के एपीएमसी मॉडल भाव और अल्पकालिक रुझान ट्रैक करें।',
  'Filter 65+ crops...': '65+ फसलें खोजें...',
  '+ Other / Custom Crop': '+ अन्य / कस्टम फसल',
  '+ Enter Local / Custom Mandi': '+ स्थानीय / कस्टम मंडी दर्ज करें',
  'Type any Indian crop name...': 'किसी भी भारतीय फसल का नाम लिखें...',
  'Type local mandi name...': 'स्थानीय मंडी का नाम लिखें...',
  '1-Day Ahead': '1 दिन आगे',
  '7-Day Trajectory': '7-दिवसीय रुझान',
  'Latest APMC arrival rate': 'नवीनतम एपीएमसी आवक दर',
  'Predicted 1-Day Price': 'अनुमानित 1-दिन का भाव',
  'Predicted 7-Day Price': 'अनुमानित 7-दिन का भाव',
  'PREDICTED 1-DAY PRICE': 'अनुमानित 1-दिन का भाव',
  'PREDICTED 7-DAY PRICE': 'अनुमानित 7-दिन का भाव',
  'Forecast Confidence': 'पूर्वानुमान विश्वसनीयता',
  'FORECAST CONFIDENCE': 'पूर्वानुमान विश्वसनीयता',
  'Time-Series Gradient Boosting Engine': 'टाइम-सीरीज़ ग्रेडिएंट बूस्टिंग इंजन',
  'Observed modal prices alongside projected market movement.': 'अनुमानित बाज़ार गतिविधि के साथ वास्तविक मॉडल भाव।',
  'Active Forecast': 'सक्रिय पूर्वानुमान',
  'Market Data Provenance': 'बाज़ार डेटा स्रोत',
  'AI Forecast (XGBoost)': 'एआई पूर्वानुमान (XGBoost)',
  'Observed AGMARKNET Modal': 'वास्तविक एगमार्कनेट मॉडल',

  // Create Listing & Orders
  'Offer any Indian crop directly to registered buyers with APMC mandi price benchmarks': 'एपीएमसी मंडी भाव मानक के साथ कोई भी भारतीय फसल सीधे पंजीकृत खरीदारों को बेचें',
  'Select Crop Type (65+ Indian Crops or Custom)': 'फसल का प्रकार चुनें (65+ भारतीय फसलें या कस्टम)',
  'Search crop by name or category (e.g., Mango, Wheat, Chili, Turmeric)...': 'नाम या श्रेणी से फसल खोजें (जैसे आम, गेहूँ, मिर्च, हल्दी)...',
  'Custom Crop Name': 'कस्टम फसल का नाम',
  'Harvest Photo': 'फसल का फोटो',
  'Clear photo of the harvested lot or crop field': 'कटी हुई फसल या खेत का स्पष्ट फोटो',
  'Variety / Grade': 'किस्म / ग्रेड',
  'Unit': 'इकाई',
  'Harvest Date': 'कटाई की तारीख',
  'Description / Lot Notes': 'विवरण / लॉट नोट्स',
  'Publish Harvest Listing': 'फसल लिस्टिंग प्रकाशित करें',
  'Place Purchase Order': 'खरीद ऑर्डर दें',
  'Total Payable Amount': 'कुल देय राशि',
  'Confirm Order': 'ऑर्डर की पुष्टि करें',
  'Mark Fulfilled': 'पूर्ण चिह्नित करें',
  'Track purchase orders from confirmation to farm-gate delivery': 'पुष्टि से लेकर खेत से डिलीवरी तक खरीद ऑर्डर ट्रैक करें',
  'No orders yet': 'अभी तक कोई ऑर्डर नहीं',
  'Refresh': 'रीफ़्रेश करें',
  'Go to Marketplace': 'फसल बाज़ार में जाएं',
  'Total Amount': 'कुल राशि',

  // Transporter Dashboard & Transport
  'Set Status: Busy': 'स्थिति बदलें: व्यस्त',
  'Set Status: Available': 'स्थिति बदलें: उपलब्ध',
  'Refresh Trips': 'यात्राएं रीफ़्रेश करें',
  'New Requests': 'नए अनुरोध',
  'Active Deliveries': 'सक्रिय डिलीवरी',
  'Completed Trips': 'पूर्ण यात्राएं',
  'Incoming & Assigned Delivery Requests': 'प्राप्त एवं सौंपे गए डिलीवरी अनुरोध',
  'Accept new requests and update trip progress from pickup to drop-off': 'नए अनुरोध स्वीकार करें और पिकअप से डिलीवरी तक स्थिति अपडेट करें',
  'No transport requests yet': 'अभी तक कोई परिवहन अनुरोध नहीं',
  'Accept Request': 'अनुरोध स्वीकार करें',
  'Decline': 'अस्वीकार करें',
  'Start Transit': 'यात्रा शुरू करें',
  'Mark Delivered': 'डिलीवर चिह्नित करें',
  'Pickup Location': 'पिकअप स्थान',
  'Drop-off Destination': 'डिलीवरी गंतव्य',
  'Registered transport providers': 'पंजीकृत परिवहन प्रदाता',
  'Request delivery from a registered transporter using one of your active purchase orders.': 'अपने किसी सक्रिय खरीद ऑर्डर के लिए पंजीकृत ट्रांसपोर्टर से डिलीवरी का अनुरोध करें।',
  'No active orders found yet.': 'अभी तक कोई सक्रिय ऑर्डर नहीं मिला।',
  'Payload Capacity': 'भार क्षमता',
  'Estimated Rate': 'अनुमानित दर',
  'Book Transport': 'परिवहन बुक करें',
  'Send Booking Request': 'बुकिंग अनुरोध भेजें',
  'Cancel': 'रद्द करें',

  // Disease Detection
  'AI Vision Diagnostics': 'एआई विज़न रोग जांच',
  'Upload or capture a clear photo of a crop leaf to identify potential diseases and view ICAR-recommended management steps.': 'संभावित रोगों की पहचान करने और आईसीएआर-अनुशंसित उपचार चरण देखने के लिए फसल की पत्ती का स्पष्ट फोटो अपलोड करें।',
  'Leaf Image Input (Camera / Gallery)': 'पत्ती का फोटो चुनें (कैमरा / गैलरी)',
  'No Leaf Image Selected': 'कोई पत्ती फोटो नहीं चुना गया',
  'Upload or capture a clear crop leaf photo above to run real-time disease classification.': 'रीयल-टाइम रोग जांच चलाने के लिए ऊपर फसल की पत्ती का स्पष्ट फोटो अपलोड करें।',
  'Analyze Another Crop Leaf': 'दूसरी फसल पत्ती की जांच करें',
  'LOW CONFIDENCE / UNCERTAIN RESULT': 'कम विश्वसनीयता / अनिश्चित परिणाम',
  'Visual features are unclear or lighting is uneven. Retake the photo in bright natural light for a clearer result.': 'दृश्य लक्षण अस्पष्ट हैं या रोशनी कम है। स्पष्ट परिणाम के लिए दिन की रोशनी में दोबारा फोटो लें।',
  'Retake Photo': 'दोबारा फोटो लें',
  'Recommended: Consult your local Krishi Vigyan Kendra (KVK) extension officer.': 'सुझाव: अपने स्थानीय कृषि विज्ञान केंद्र (केवीके) विशेषज्ञ से परामर्श करें।',
  'DIAGNOSTIC CHARACTERISTICS & VISUAL SYMPTOMS': 'नैदानिक लक्षण एवं दृश्य संकेत',
  'Responsible AI Guidance & Provenance': 'जिम्मेदार एआई मार्गदर्शन और स्रोत',
  'Source Baseline: ICAR Extension Guidelines & PlantVillage Benchmark': 'स्रोत आधार: आईसीएआर दिशानिर्देश और प्लांटविलेज मानक',

  // Weather, Schemes, Chatbot
  'Live Agromet Feed': 'लाइव कृषि-मौसम फीड',
  'Use Device Location': 'डिवाइस स्थान उपयोग करें',
  'Refresh Forecast': 'पूर्वानुमान रीफ़्रेश करें',
  'Current Field Conditions': 'वर्तमान खेत की स्थिति',
  'CURRENT FIELD CONDITIONS': 'वर्तमान खेत की स्थिति',
  'Rain Prob': 'वर्षा संभावना',
  'RAIN PROB': 'वर्षा संभावना',
  '5-Day District Agrometeorological Forecast': '5-दिवसीय जिला कृषि-मौसम पूर्वानुमान',
  'Active Feed': 'सक्रिय फीड',
  'Verified Scheme Directory': 'प्रमाणित योजना निर्देशिका',
  'Central & State Programs': 'केंद्र व राज्य योजनाएं',
  'Browse central and state agricultural welfare programs, required documents, and check your eligibility directly.': 'केंद्र और राज्य की कृषि कल्याण योजनाओं, आवश्यक दस्तावेज़ों को देखें और सीधे अपनी पात्रता जांचें।',
  'All Jurisdiction': 'सभी क्षेत्राधिकार',
  'Central Jurisdiction': 'केंद्रीय योजनाएं',
  'State Jurisdiction': 'राज्य योजनाएं',
  'DIRECT SCHEME BENEFIT': 'सीधा योजना लाभ',
  'REQUIRED APPLICATION DOCUMENTS': 'आवश्यक आवेदन दस्तावेज़',
  'Official Portal': 'आधिकारिक पोर्टल',
  'Live Connected': 'लाइव कनेक्टेड',
  'Clear Thread': 'चैट साफ़ करें',
  'GROUNDED KNOWLEDGE SOURCES': 'प्रमाणित ज्ञान स्रोत',
  'Send': 'भेजें',
  'Sign Out': 'लॉग आउट करें',
  'Save Changes': 'परिवर्तन सहेजें',
};

const TOKEN_REPLACEMENTS = [
  [/& AI Market Forecasts/g, 'और एआई बाज़ार पूर्वानुमान'],
  [/& Financial Grants/g, 'और वित्तीय अनुदान'],
  [/& Farming Advisories/g, 'और कृषि सलाह'],
  [/& Rural Freight Booking/g, 'और ग्रामीण माल ढुलाई बुकिंग'],
  [/& Diagnostics/g, 'और रोग निदान'],
  [/\(4-Step Wizard\)/g, '(4-चरणीय विज़ार्ड)'],
  [/Expected range:/g, 'अनुमानित सीमा:'],
  [/Data Stream:/g, 'डेटा स्रोत:'],
  [/Model Version:/g, 'मॉडल संस्करण:'],
  [/Model:/g, 'मॉडल:'],
  [/Updated:/g, 'अपडेट:'],
  [/Issued by:/g, 'जारीकर्ता:'],
  [/Rain:/g, 'वर्षा:'],
  [/\/ Quintal/g, '/ क्विंटल'],
  [/\/Qtl/g, '/क्विंटल'],
  [/\/ Qtl/g, '/ क्विंटल'],
  [/\bQuintal\b/g, 'क्विंटल'],
  [/\bTomato\b/g, 'टमाटर'],
  [/\bOnion\b/g, 'प्याज'],
  [/\bPotato\b/g, 'आलू'],
  [/\bWheat\b/g, 'गेहूँ'],
  [/\bRice\b/g, 'चावल'],
  [/\bChili\b/g, 'मिर्च'],
  [/\bCotton\b/g, 'कपास'],
  [/\bMaize\b/g, 'मक्का'],
  [/\bSoybean\b/g, 'सोयाबीन'],
  [/\bGroundnut\b/g, 'मूंगफली'],
  [/\bSugarcane\b/g, 'गन्ना'],
  [/\bMango\b/g, 'आम'],
  [/\bBanana\b/g, 'केला'],
  [/\bTurmeric\b/g, 'हल्दी'],
  [/\bVegetables\b/g, 'सब्जियां'],
  [/\bFruits\b/g, 'फल'],
  [/\bPulses\b/g, 'दालें'],
  [/\bOilseeds\b/g, 'तिलहन'],
  [/\bAndhra Pradesh\b/g, 'आंध्र प्रदेश'],
  [/\bMadhya Pradesh\b/g, 'मध्य प्रदेश'],
  [/\bMaharashtra\b/g, 'महाराष्ट्र'],
  [/\bKarnataka\b/g, 'कर्नाटक'],
  [/\bTelangana\b/g, 'तेलंगाना'],
  [/\bUttar Pradesh\b/g, 'उत्तर प्रदेश'],
  [/\bTamil Nadu\b/g, 'तमिलनाडु'],
  [/\bWest Bengal\b/g, 'पश्चिम बंगाल'],
  [/\bGujarat\b/g, 'गुजरात'],
  [/\bPunjab\b/g, 'पंजाब'],
  [/\bHaryana\b/g, 'हरियाणा'],
  [/\bRajasthan\b/g, 'राजस्थान'],
  [/\bDelhi\b/g, 'दिल्ली'],
  [/\bGuntur\b/g, 'गुंटूर'],
  [/\bBhopal\b/g, 'भोपाल'],
  [/\bPune\b/g, 'पुणे'],
  [/\bNashik\b/g, 'नासिक'],
  [/\bKolar\b/g, 'कोलार'],
  [/\bAVAILABLE\b/g, 'उपलब्ध'],
  [/\bBUSY\b/g, 'व्यस्त'],
  [/\bREQUESTED\b/g, 'अनुरोधित'],
  [/\bACCEPTED\b/g, 'स्वीकृत'],
  [/\bIN TRANSIT\b/g, 'मार्ग में'],
  [/\bCOMPLETED\b/g, 'पूर्ण'],
  [/\bPLACED\b/g, 'दिया गया'],
  [/\bCONFIRMED\b/g, 'पुष्ट'],
  [/\bFULFILLED\b/g, 'पूर्ण'],
];

const translateStringToHi = (raw) => {
  if (!raw || !raw.trim()) return raw;
  const trimmed = raw.trim();
  if (EXACT_HI_MAP[trimmed]) {
    return raw.replace(trimmed, EXACT_HI_MAP[trimmed]);
  }
  let out = raw;
  for (const [pattern, replacement] of TOKEN_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
};

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT']);

const applyHindiDomTranslation = () => {
  if (typeof document === 'undefined' || !document.body) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const parentTag = node.parentElement?.tagName;
    if (!parentTag || SKIP_TAGS.has(parentTag)) continue;
    const current = node.nodeValue || '';
    if (!current.trim()) continue;

    const translated = translateStringToHi(current);
    if (translated !== current) {
      node.nodeValue = translated;
    }
  }

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
    const current = el.getAttribute('placeholder') || '';
    const translated = translateStringToHi(current);
    if (translated !== current) {
      el.setAttribute('placeholder', translated);
    }
  });
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('agriconnect_lang') || 'en');

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('agriconnect_lang', next);
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('agriconnect_lang', lang);
    document.documentElement.lang = lang;

    if (lang !== 'hi') return undefined;

    const timer = setTimeout(() => applyHindiDomTranslation(), 0);
    let rafId = null;
    const observer = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => applyHindiDomTranslation());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  const contextValue = { lang, setLang, toggleLanguage, t };

  return (
    <LanguageContext.Provider value={contextValue}>
      <div key={lang}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);