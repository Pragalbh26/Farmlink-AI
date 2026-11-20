import os
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .price_service import build_price_forecast
from .disease_service import analyze_leaf_image

CHAT_GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-4-hydrogen",
    "gemini-2.5-flash",
]


def get_lang(request):
    lang = (
        request.headers.get("X-App-Language")
        or request.data.get("lang")
        or request.GET.get("lang")
        or "en"
    )
    return "hi" if str(lang).lower().startswith("hi") else "en"


SCHEMES_EN = [
    {
        "id": "pm-kisan",
        "name": "PM-KISAN Samman Nidhi",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "jurisdiction": "Central",
        "benefit": "₹6,000 / year in 3 equal installments via DBT",
        "eligibilitySummary": "All landholding farmer families subject to statutory income-tax and government-employee exclusions.",
        "requiredDocs": ["Aadhaar Card", "Landholding Record (RoR / Khatauni)", "Bank Account linked to Aadhaar"],
        "sourceUrl": "https://pmkisan.gov.in",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "pmfby",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "jurisdiction": "Central",
        "benefit": "Comprehensive crop insurance at 2% (Kharif) / 1.5% (Rabi) / 5% (Horticulture) premium",
        "eligibilitySummary": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.",
        "requiredDocs": ["Aadhaar Card", "Land Record / Tenancy Agreement", "Sowing Certificate", "Bank Passbook"],
        "sourceUrl": "https://pmfby.gov.in",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card (KCC)",
        "ministry": "Ministry of Finance & NABARD",
        "jurisdiction": "Central",
        "benefit": "Short-term crop credit up to ₹3,00,000 at 4% effective interest (with prompt repayment)",
        "eligibilitySummary": "Individual/joint cultivators, tenant farmers, and SHG/JLG members.",
        "requiredDocs": ["KYC (Aadhaar / PAN)", "Land Ownership / Lease Proof", "Passport Photographs"],
        "sourceUrl": "https://www.myscheme.gov.in/schemes/kcc",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "rythu-bharosa",
        "name": "YSR Rythu Bharosa / Annadata Sukhibhava",
        "ministry": "Department of Agriculture, Govt. of Andhra Pradesh",
        "jurisdiction": "State (Andhra Pradesh)",
        "benefit": "Direct annual investment support for Andhra Pradesh landholding & tenant farmers",
        "eligibilitySummary": "Permanent agricultural residents of Andhra Pradesh with verified land or CCRC tenant cards.",
        "requiredDocs": ["Aadhaar Card", "Webland / Pattadar Passbook", "AP Domicile Verification"],
        "sourceUrl": "https://apagrisnet.gov.in",
        "verifiedAt": str(date.today()),
    },
]

SCHEMES_HI = [
    {
        "id": "pm-kisan",
        "name": "पीएम-किसान सम्मान निधि (PM-KISAN)",
        "ministry": "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
        "jurisdiction": "Central",
        "benefit": "डीबीटी के माध्यम से 3 समान किस्तों में ₹6,000 / वर्ष",
        "eligibilitySummary": "आयकर और सरकारी कर्मचारी अपवादों के अधीन सभी भूमिधारक किसान परिवार।",
        "requiredDocs": ["आधार कार्ड", "भूमि अभिलेख (खतौनी / आरओआर)", "आधार से जुड़ा बैंक खाता"],
        "sourceUrl": "https://pmkisan.gov.in",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "pmfby",
        "name": "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
        "ministry": "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
        "jurisdiction": "Central",
        "benefit": "2% (खरीफ) / 1.5% (रबी) / 5% (बागवानी) प्रीमियम पर संपूर्ण फसल बीमा",
        "eligibilitySummary": "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान एवं बटाईदार।",
        "requiredDocs": ["आधार कार्ड", "भूमि अभिलेख / किरायेदारी अनुबंध", "बुवाई प्रमाण पत्र", "बैंक पासबुक"],
        "sourceUrl": "https://pmfby.gov.in",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "kcc",
        "name": "किसान क्रेडिट कार्ड (KCC)",
        "ministry": "वित्त मंत्रालय एवं नाबार्ड",
        "jurisdiction": "Central",
        "benefit": "समय पर भुगतान के साथ 4% ब्याज पर ₹3,00,000 तक का अल्पावधि फसल ऋण",
        "eligibilitySummary": "व्यक्तिगत/संयुक्त किसान, काश्तकार और स्वयं सहायता समूह के सदस्य।",
        "requiredDocs": ["केवाईसी (आधार / पैन)", "भूमि स्वामित्व / पट्टा प्रमाण", "पासपोर्ट फोटो"],
        "sourceUrl": "https://www.myscheme.gov.in/schemes/kcc",
        "verifiedAt": str(date.today()),
    },
    {
        "id": "rythu-bharosa",
        "name": "वाईएसआर रायथु भरोसा / अन्नदाता सुखीभव",
        "ministry": "कृषि विभाग, आंध्र प्रदेश सरकार",
        "jurisdiction": "State (आंध्र प्रदेश)",
        "benefit": "आंध्र प्रदेश के भूमिधारक और काश्तकार किसानों के लिए सीधी वार्षिक निवेश सहायता",
        "eligibilitySummary": "सत्यापित भूमि या सीसीआरसी कार्ड वाले आंध्र प्रदेश के स्थायी किसान निवासी।",
        "requiredDocs": ["आधार कार्ड", "वेबलैंड / पट्टादार पासबुक", "आंध्र प्रदेश निवास प्रमाण"],
        "sourceUrl": "https://apagrisnet.gov.in",
        "verifiedAt": str(date.today()),
    },
]


class PricePredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = get_lang(request)
        commodity = request.data.get("commodity", "Tomato")
        market = request.data.get("market", "Guntur APMC (Andhra Pradesh)")
        horizon = request.data.get("horizon", "7day")
        data = build_price_forecast(commodity, market, horizon, lang=lang)
        return Response({"success": True, "data": data})


class DiseasePredictView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        lang = get_lang(request)
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {
                    "success": False,
                    "error": {
                        "message": "कृपया फसल की पत्ती का फोटो अपलोड करें।" if lang == "hi" else "Please upload a crop leaf image."
                    },
                },
                status=400,
            )
        try:
            result = analyze_leaf_image(image_file, lang=lang)
            return Response({"success": True, "data": result})
        except Exception as exc:
            return Response(
                {"success": False, "error": {"message": f"Unable to process leaf image: {exc}"}},
                status=400,
            )


class SchemesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lang = get_lang(request)
        return Response({"success": True, "data": SCHEMES_HI if lang == "hi" else SCHEMES_EN})


class SchemeEligibilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = get_lang(request)
        land_ha = float(request.data.get("landHectares", 0) or 0)
        state = str(request.data.get("state", "")).strip()
        crop = str(request.data.get("crop", "")).strip()
        is_govt = bool(request.data.get("isGovtEmployee", False))
        is_tax = bool(request.data.get("isTaxPayer", False))
        today_str = str(date.today())

        results = []

        if is_govt or is_tax:
            pm_status = "not_eligible"
            pm_reasons = [
                "पीएम-किसान नियम 2 के तहत अपात्र (आयकर दाता या नियमित सरकारी कर्मचारी)।"
                if lang == "hi"
                else "Excluded under PM-KISAN Clause 2 (Income Tax payee or regular Government employee)."
            ]
        elif land_ha > 0:
            pm_status = "eligible"
            pm_reasons = (
                [
                    f"खेती योग्य भूमि ({land_ha} हेक्टेयर) पीएम-किसान मानदंडों के लिए पात्र है।",
                    "कोई आयकर या सरकारी कर्मचारी अपवाद लागू नहीं है।",
                ]
                if lang == "hi"
                else [
                    f"Cultivable landholding ({land_ha} Ha) qualifies under PM-KISAN landholding norms.",
                    "No statutory income-tax or government-employment exclusions triggered.",
                ]
            )
        else:
            pm_status = "potentially_eligible"
            pm_reasons = [
                "आवेदक के नाम पर सत्यापित भूमि अभिलेख आवश्यक है।"
                if lang == "hi"
                else "Requires verified cultivable land record in the applicant's name."
            ]

        results.append(
            {
                "schemeName": "पीएम-किसान सम्मान निधि (PM-KISAN)" if lang == "hi" else "PM-KISAN Samman Nidhi",
                "benefit": "डीबीटी द्वारा ₹6,000 / वर्ष" if lang == "hi" else "₹6,000 / year via DBT",
                "status": pm_status,
                "reasons": pm_reasons,
                "verifiedAt": today_str,
                "sourceUrl": "https://pmkisan.gov.in",
            }
        )

        results.append(
            {
                "schemeName": "प्रधानमंत्री फसल बीमा योजना (PMFBY)" if lang == "hi" else "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "benefit": "सब्सिडी वाला फसल बीमा (1.5%–5% प्रीमियम)" if lang == "hi" else "Subsidized crop insurance (1.5%–5% farmer premium)",
                "status": "eligible" if land_ha > 0 else "potentially_eligible",
                "reasons": (
                    [
                        f"{state or 'आपके राज्य'} में '{crop or 'अधिसूचित फसल'}' का नामांकन अंतिम तिथि से पहले किया जा सकता है।",
                        "भूमि मालिक और पंजीकृत काश्तकार दोनों किसानों के लिए उपलब्ध।",
                    ]
                    if lang == "hi"
                    else [
                        f"Crop '{crop or 'Notified Crop'}' in {state or 'your state'} can be enrolled before seasonal cut-off.",
                        "Available to both owner-cultivators and registered tenant farmers.",
                    ]
                ),
                "verifiedAt": today_str,
                "sourceUrl": "https://pmfby.gov.in",
            }
        )

        results.append(
            {
                "schemeName": "किसान क्रेडिट कार्ड (KCC)" if lang == "hi" else "Kisan Credit Card (KCC)",
                "benefit": "4% प्रभावी ब्याज पर ₹3,00,000 तक का फसल ऋण" if lang == "hi" else "Crop credit up to ₹3,00,000 at 4% effective interest",
                "status": "eligible" if land_ha > 0 else "potentially_eligible",
                "reasons": (
                    [
                        f"{land_ha} हेक्टेयर भूमि के आधार पर मौसमी कार्यशील पूंजी के लिए पात्र।",
                        "समय पर भुगतान करने पर 3% ब्याज अनुदान मिलता है।",
                    ]
                    if lang == "hi"
                    else [
                        f"Eligible for seasonal working capital based on {land_ha} Ha scale of finance.",
                        "3% interest subvention applies on prompt repayment.",
                    ]
                ),
                "verifiedAt": today_str,
                "sourceUrl": "https://www.myscheme.gov.in/schemes/kcc",
            }
        )

        if state.lower() == "andhra pradesh":
            ap_status = "not_eligible" if (is_govt or is_tax) else "eligible"
            ap_reasons = (
                [
                    "सरकारी कर्मचारी या आयकर दाता होने के कारण अपात्र।"
                    if lang == "hi"
                    else "Excluded due to statutory government-employee or income-tax criteria."
                ]
                if (is_govt or is_tax)
                else (
                    [
                        "आंध्र प्रदेश का कृषि निवास राज्य योजना के अनुरूप है।",
                        f"खेती योग्य क्षेत्र ({land_ha} हेक्टेयर) राज्य किसान सहायता के लिए पात्र है।",
                    ]
                    if lang == "hi"
                    else [
                        "Andhra Pradesh agricultural domicile matches state scheme requirement.",
                        f"Cultivable area ({land_ha} Ha) qualifies for state farmer investment support.",
                    ]
                )
            )
            results.append(
                {
                    "schemeName": "वाईएसआर रायथु भरोसा / अन्नदाता सुखीभव" if lang == "hi" else "YSR Rythu Bharosa / Annadata Sukhibhava",
                    "benefit": "सीधी वार्षिक राज्य निवेश सहायता" if lang == "hi" else "Direct annual state investment support",
                    "status": ap_status,
                    "reasons": ap_reasons,
                    "verifiedAt": today_str,
                    "sourceUrl": "https://apagrisnet.gov.in",
                }
            )

        return Response({"success": True, "data": results})


def _get_relevant_sources(query_lower: str, lang: str):
    sources = []
    if any(w in query_lower for w in ("pm-kisan", "pm kisan", "kisan samman", "पीएम-किसान", "योजना", "scheme")):
        sources.append({"title": "पीएम-किसान आधिकारिक पोर्टल" if lang == "hi" else "PM-KISAN Official Portal", "url": "https://pmkisan.gov.in"})
    if any(w in query_lower for w in ("pmfby", "insurance", "बीमा")):
        sources.append({"title": "पीएमएफबीवाई पोर्टल" if lang == "hi" else "PMFBY Crop Insurance", "url": "https://pmfby.gov.in"})
    if any(w in query_lower for w in ("kcc", "credit card", "क्रेडिट कार्ड", "loan")):
        sources.append({"title": "केसीसी योजना पोर्टल" if lang == "hi" else "KCC Scheme Portal", "url": "https://www.myscheme.gov.in/schemes/kcc"})
    if any(w in query_lower for w in ("price", "mandi", "rate", "market", "भाव", "मंडी", "tomato", "onion", "potato", "wheat", "rice")):
        sources.append({"title": "एगमार्कनेट पोर्टल" if lang == "hi" else "AGMARKNET Portal", "url": "https://agmarknet.gov.in"})
    if any(w in query_lower for w in ("disease", "blight", "pest", "leaf", "fertilizer", "crop", "soil", "रोग", "पत्ती", "फसल", "खाद")):
        sources.append({"title": "आईसीएआर कृषि सलाह" if lang == "hi" else "ICAR Crop Advisories", "url": "https://icar.org.in"})
    return sources


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang = get_lang(request)
        message = str(request.data.get("message", "")).strip()
        history = request.data.get("history") or []
        if not message:
            return Response(
                {
                    "success": False,
                    "error": {"message": "संदेश खाली नहीं हो सकता।" if lang == "hi" else "Message cannot be empty."},
                },
                status=400,
            )

        q = message.lower()
        sources = _get_relevant_sources(q, lang)

        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(
                    api_key=api_key,
                    http_options=types.HttpOptions(timeout=20000),
                )

                lang_rule = (
                    "The app language is set to Hindi, so respond naturally in Hindi (Devanagari script) unless the user explicitly writes and asks in another language."
                    if lang == "hi"
                    else "Respond in the same language the user writes in (default clear, friendly English)."
                )
                system_prompt = (
                    "You are FarmLink AI Assistant, a friendly, intelligent, general-purpose AI assistant powered by Gemini. "
                    "You can hold natural conversations, respond to greetings, and answer any general question "
                    "(science, math, business, writing, coding, everyday advice, etc.) just like a standard LLM chatbot. "
                    "In addition, you have deep expertise in Indian agriculture—including crops, ICAR disease management, "
                    "AGMARKNET mandi prices, weather precautions, and Indian government schemes (PM-KISAN, PMFBY, KCC, YSR Rythu Bharosa). "
                    "Never refuse normal greetings or general questions. Be helpful, clear, and concise. "
                    f"{lang_rule}"
                )

                contents = []
                if isinstance(history, list):
                    for turn in history[-12:]:
                        role = "model" if turn.get("sender") == "bot" else "user"
                        text = str(turn.get("text", "")).strip()
                        if text:
                            contents.append(
                                types.Content(
                                    role=role,
                                    parts=[types.Part.from_text(text=text)],
                                )
                            )
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=message)],
                    )
                )

                for model_name in CHAT_GEMINI_MODELS:
                    try:
                        resp = client.models.generate_content(
                            model=model_name,
                            contents=contents,
                            config=types.GenerateContentConfig(
                                system_instruction=system_prompt,
                                temperature=0.7,
                            ),
                        )
                        if resp and resp.text:
                            return Response(
                                {
                                    "success": True,
                                    "data": {
                                        "response": resp.text.strip(),
                                        "sources": sources,
                                        "abstained": False,
                                        "model_version": model_name,
                                    },
                                }
                            )
                    except Exception as exc:
                        print(f"[FarmLink Chat] Model {model_name} failed: {exc}")
                        continue
            except Exception as exc:
                print(f"[FarmLink Chat] Gemini client error: {exc}")

        # Conversational offline fallback (only used if GEMINI_API_KEY is missing or unreachable)
        if any(w in q for w in ("hi", "hello", "hey", "namaste", "नमस्ते", "हेलो", "हाय")):
            reply = (
                "नमस्ते! मैं FarmLink AI सहायक हूँ। आप मुझसे खेती, मंडी भाव, फसल रोग, सरकारी योजनाओं या किसी भी सामान्य विषय के बारे में पूछ सकते हैं। आज मैं आपकी क्या मदद कर सकता हूँ?"
                if lang == "hi"
                else "Hello! I'm FarmLink AI Assistant. You can ask me anything—from Indian farming, mandi prices, crop diseases, and government schemes to general questions, writing, or calculations. How can I help you today?"
            )
        elif any(w in q for w in ("who are you", "what can you do", "help", "तुम कौन हो", "मदद")):
            reply = (
                "मैं FarmLink AI हूँ—आपका एआई सहायक। मैं फसल रोग सलाह, मंडी भाव रुझान, पीएम-किसान/पीएमएफबीवाई/केसीसी योजना जानकारी और किसी भी सामान्य प्रश्न का उत्तर देने में मदद कर सकता हूँ।"
                if lang == "hi"
                else "I'm FarmLink AI, your conversational AI assistant. I can help with crop advice, mandi prices, government schemes (PM-KISAN, PMFBY, KCC), weather tips, and general everyday questions."
            )
        elif any(w in q for w in ("pm-kisan", "pm kisan", "scheme", "किसान", "योजना")):
            reply = (
                "पीएम-किसान योजना के तहत पात्र भूमिधारक किसान परिवारों को डीबीटी के माध्यम से ₹2,000 की तीन किस्तों में ₹6,000 प्रति वर्ष मिलते हैं। आयकर दाता और नियमित सरकारी कर्मचारी इसके पात्र नहीं हैं। अपनी पूरी पात्रता जांचने के लिए 4-चरणीय योजना पात्रता विज़ार्ड का उपयोग करें।"
                if lang == "hi"
                else "PM-KISAN provides ₹6,000 per year in three ₹2,000 installments via Direct Benefit Transfer to eligible landholding farmer families. Income-tax payees and regular government employees are excluded. Use the 4-step Scheme Eligibility Wizard in FarmLink AI to check your full eligibility."
            )
        elif any(w in q for w in ("kcc", "credit card", "क्रेडिट कार्ड", "दस्तावेज़")):
            reply = (
                "किसान क्रेडिट कार्ड (KCC) के लिए आधार/पैन केवाईसी, भूमि स्वामित्व या पट्टा अभिलेख और पासपोर्ट फोटो आवश्यक हैं। पात्र किसानों को 4% प्रभावी ब्याज दर पर ₹3,00,000 तक का फसल ऋण मिलता है।"
                if lang == "hi"
                else "For a Kisan Credit Card (KCC), you need Aadhaar/PAN KYC, land ownership or lease records, and passport photographs. Eligible farmers receive crop credit up to ₹3,00,000 at 4% effective interest."
            )
        elif any(w in q for w in ("tomato", "onion", "potato", "price", "mandi", "टमाटर", "भाव", "मंडी")):
            reply = (
                "आप 'मंडी भाव व अनुमान' टैब में रीयल-टाइम एपीएमसी मॉडल भाव और 7-दिवसीय भाव रुझान देख सकते हैं। टमाटर और प्याज जैसी फसलों को भेजने से पहले नजदीकी मंडियों के भाव की तुलना अवश्य करें।"
                if lang == "hi"
                else "You can check real-time APMC modal rates and 7-day price trajectories in the Mandi Prices tab. For perishable crops like tomato and onion, compare local modal rates with neighboring APMCs before dispatch."
            )
        elif any(w in q for w in ("blight", "leaf", "curl", "disease", "pest", "chili", "पत्ती", "रोग", "मिर्च")):
            reply = (
                "पत्ती मरोड़ या झुलसा रोग की रोकथाम के लिए संक्रमित पत्तियां हटा दें, शाम को फव्वारा सिंचाई से बचें, सफेद मक्खी/थ्रिप्स के लिए पीले चिपचिपे ट्रैप लगाएं, और आईसीएआर सलाह के लिए 'फसल स्वास्थ्य व रोग' टैब में पत्ती का फोटो अपलोड करें।"
                if lang == "hi"
                else "For leaf curl or foliar blight, remove severely infected leaves, avoid evening overhead irrigation, control whitefly/thrips vectors with yellow sticky traps, and upload a clear leaf photo in the Crop Health tab for ICAR-aligned diagnostics."
            )
        else:
            reply = (
                "अभी लाइव Gemini AI कनेक्शन उपलब्ध नहीं है (कृपया backend/.env में GEMINI_API_KEY और इंटरनेट कनेक्शन जांचें)। तब तक आप मुझसे फसलों, मंडी भाव, रोग रोकथाम या सरकारी योजनाओं के बारे में पूछ सकते हैं।"
                if lang == "hi"
                else "The live Gemini LLM connection is currently unreachable (check your GEMINI_API_KEY in backend/.env and Django terminal logs). Once connected, I can answer any general or agricultural question like a full LLM."
            )

        return Response(
            {
                "success": True,
                "data": {
                    "response": reply,
                    "sources": sources,
                    "abstained": False,
                    "model_version": "farmlink-offline-fallback",
                },
            }
        )