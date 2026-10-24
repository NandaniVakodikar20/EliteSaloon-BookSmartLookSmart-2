// src/components/chatbot/chatbotKnowledge.js
// Multilingual knowledge base, menu options, translations, and intent keywords for EliteSalon Chatbot

export const LANGUAGES = {
  EN: "EN",
  HI: "HI",
  GU: "GU",
};

export const TRANSLATIONS = {
  EN: {
    title: "EliteSalon Assistant",
    subtitle: "Book Smart, Look Smart",
    welcome: "Welcome to EliteSalon! 👋 How can I help you today? Choose an option below or type your question.",
    inputPlaceholder: "Type a message, pincode, or question...",
    send: "Send",
    backToMenu: "🔙 Back to Main Menu",
    restartChat: "🔄 Restart Chat",
    searching: "Searching...",
    loading: "Loading information...",
    loginRequired: "You need to be logged in to access this feature.",
    loginBtn: "🔑 Login to EliteSalon",
    registerBtn: "📝 Register",
    exploreServicesBtn: "💇 Browse Services",
    bookNowBtn: "📅 Book Appointment",
    cancelBtn: "❌ Cancel Booking",
    rescheduleBtn: "🔄 Reschedule",
    downloadInvoiceBtn: "📄 Download Invoice",
    viewAllSalonsBtn: "📍 View Nearby Salons",
    noSalonsFound: "No verified salons found for pincode",
    enterPincodePrompt: "Please enter your 6-digit area pincode (e.g., 422001 or 395007) to find nearby salons:",
    invalidPincode: "Please enter a valid 6-digit Indian postal pincode.",
    salonsFoundHeader: "Here are verified salons in your area:",
    servicesHeader: "Choose a service category to view details and pricing:",
    noServicesFound: "No services currently found for this category.",
    allServicesCount: "Total services available across partner salons:",
    myAppointmentsHeader: "Here are your recent and upcoming appointments:",
    noAppointments: "You do not have any appointments yet.",
    cancelConfirmTitle: "Cancel Appointment?",
    cancelConfirmText: "Are you sure you want to cancel this appointment?",
    cancelSuccess: "Appointment cancelled successfully.",
    cancelFailed: "Failed to cancel appointment. Please try again.",
    myOrdersHeader: "Here are your recent product orders:",
    noOrders: "You have not placed any grooming product orders yet.",
    browseProductsBtn: "🛍️ Browse Products",
    faqHeader: "Frequently Asked Questions & Salon Policies:",
    unrecognizedQuery: "I'm not sure I understand that. Please select one of the common topics below or enter a 6-digit pincode:",
    serverError: "Unable to reach server. Please make sure the backend is running.",
    menuOptions: [
      { id: "find_salons", label: "📍 Find Nearby Salons" },
      { id: "services_prices", label: "💇 Services & Prices" },
      { id: "book_appointment", label: "📅 Book an Appointment" },
      { id: "my_appointments", label: "📋 My Appointments" },
      { id: "track_orders", label: "📦 Track Product Orders" },
      { id: "timings_faqs", label: "⏰ Salon Timings & FAQs" },
    ],
    faqs: [
      {
        id: "faq_timings",
        question: "⏰ Salon Working Hours",
        answer: "Standard booking hours across EliteSalon partner salons are from 10:00 AM to 08:00 PM (Monday to Sunday). Specific stylist time slots are displayed in real-time on the booking page.",
      },
      {
        id: "faq_payments",
        question: "💳 Payment Options",
        answer: "We support instant online payments powered by Razorpay (UPI, Credit/Debit cards, NetBanking, and Wallets) for product orders and online bookings. Pay-at-salon is also supported for salon visits.",
      },
      {
        id: "faq_cancellation",
        question: "❌ Cancellation Policy",
        answer: "Appointments can be cancelled free of charge prior to your scheduled start time directly from your dashboard or via this chatbot. Completed appointments cannot be cancelled.",
      },
      {
        id: "faq_booking_guide",
        question: "ℹ️ How Booking Works",
        answer: "1. Select your preferred salon by pincode or location.\n2. Choose services (haircut, facial, spa, etc.).\n3. Select your stylist and preferred date.\n4. Pick an available time slot and confirm!",
      },
      {
        id: "faq_support",
        question: "📞 Customer Support",
        answer: "Have questions or need help? You can reach the EliteSalon admin support team at elitesaloon@gmail.com or call your selected salon directly from their listing.",
      },
    ],
  },

  HI: {
    title: "एलीट सैलून सहायक",
    subtitle: "बुक स्मार्ट, लुक स्मार्ट",
    welcome: "एलीट सैलून (EliteSalon) में आपका स्वागत है! 👋 मैं आपकी क्या सहायता कर सकता हूँ? नीचे दिए गए विकल्पों में से चुनें या अपना प्रश्न टाइप करें।",
    inputPlaceholder: "संदेश, पिनकोड या प्रश्न टाइप करें...",
    send: "भेजें",
    backToMenu: "🔙 मुख्य मेनू",
    restartChat: "🔄 रीस्टार्ट करें",
    searching: "खोज रहे हैं...",
    loading: "जानकारी लोड हो रही है...",
    loginRequired: "इस सुविधा का उपयोग करने के लिए आपको लॉगिन करना होगा।",
    loginBtn: "🔑 लॉगिन करें",
    registerBtn: "📝 नया खाता बनाएं",
    exploreServicesBtn: "💇 सेवाएं देखें",
    bookNowBtn: "📅 अपॉइंटमेंट बुक करें",
    cancelBtn: "❌ अपॉइंटमेंट रद्द करें",
    rescheduleBtn: "🔄 समय बदलें (रीशेड्यूल)",
    downloadInvoiceBtn: "📄 इनवॉइस डाउनलोड करें",
    viewAllSalonsBtn: "📍 नजदीकी सैलून देखें",
    noSalonsFound: "इस पिनकोड के लिए कोई प्रमाणित सैलून नहीं मिला",
    enterPincodePrompt: "नजदीकी सैलून खोजने के लिए कृपया अपना 6 अंकों का पिनकोड (जैसे 422001) दर्ज करें:",
    invalidPincode: "कृपया एक मान्य 6 अंकों का भारतीय पिनकोड दर्ज करें।",
    salonsFoundHeader: "आपके क्षेत्र में उपलब्ध प्रमाणित सैलून:",
    servicesHeader: "सेवाएं और कीमतें देखने के लिए श्रेणी चुनें:",
    noServicesFound: "इस श्रेणी में वर्तमान में कोई सेवा उपलब्ध नहीं है।",
    allServicesCount: "सैलून में उपलब्ध कुल सेवाएं:",
    myAppointmentsHeader: "आपकी आगामी और हाल की अपॉइंटमेंट्स:",
    noAppointments: "आपने अभी तक कोई अपॉइंटमेंट बुक नहीं की है।",
    cancelConfirmTitle: "क्या आप निश्चित हैं?",
    cancelConfirmText: "क्या आप सचमुच इस अपॉइंटमेंट को रद्द करना चाहते हैं?",
    cancelSuccess: "अपॉइंटमेंट सफलतापूर्वक रद्द कर दी गई।",
    cancelFailed: "अपॉइंटमेंट रद्द करने में त्रुटि। कृपया पुनः प्रयास करें।",
    myOrdersHeader: "आपके हाल के प्रोडक्ट ऑर्डर्स:",
    noOrders: "आपने अभी तक कोई प्रोडक्ट ऑर्डर नहीं किया है।",
    browseProductsBtn: "🛍️ प्रोडक्ट्स देखें",
    faqHeader: "सामान्य प्रश्न और सैलून नीतियां:",
    unrecognizedQuery: "क्षमा करें, मैं इसे समझ नहीं पाया। कृपया नीचे दिए गए विकल्पों में से चुनें या 6 अंकों का पिनकोड दर्ज करें:",
    serverError: "सर्वर से संपर्क नहीं हो पा रहा है। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।",
    menuOptions: [
      { id: "find_salons", label: "📍 नजदीकी सैलून खोजें" },
      { id: "services_prices", label: "💇 सेवाएं और कीमतें" },
      { id: "book_appointment", label: "📅 अपॉइंटमेंट बुक करें" },
      { id: "my_appointments", label: "📋 मेरी अपॉइंटमेंट्स" },
      { id: "track_orders", label: "📦 मेरे प्रोडक्ट ऑर्डर्स" },
      { id: "timings_faqs", label: "⏰ सैलून समय और नियम" },
    ],
    faqs: [
      {
        id: "faq_timings",
        question: "⏰ सैलून का समय (Working Hours)",
        answer: "एलीट सैलून के पार्टनर सैलून सुबह 10:00 बजे से रात 08:00 बजे तक (सोमवार से रविवार) खुले रहते हैं। स्टाइलिस्ट के उपलब्ध स्लॉट बुकिंग पेज पर वास्तविक समय में दिखते हैं।",
      },
      {
        id: "faq_payments",
        question: "💳 भुगतान के विकल्प (Payments)",
        answer: "हम Razorpay के माध्यम से सुरक्षित ऑनलाइन भुगतान (UPI जैसे GPay/PhonePe, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग) स्वीकार करते हैं। आप सैलून पर भी भुगतान कर सकते हैं।",
      },
      {
        id: "faq_cancellation",
        question: "❌ कैंसिलेशन नियम",
        answer: "आप अपनी निर्धारित अपॉइंटमेंट शुरू होने से पहले डैशबोर्ड या इस चैटबॉट से निःशुल्क रद्द कर सकते हैं।",
      },
      {
        id: "faq_booking_guide",
        question: "ℹ️ बुकिंग कैसे करें",
        answer: "1. पिनकोड या लोकेशन से सैलून चुनें।\n2. अपनी पसंदीदा सेवाएं चुनें (हेयरकट, फेशियल आदि)।\n3. स्टाइलिस्ट और तारीख चुनें।\n4. उपलब्ध समय स्लॉट चुनकर बुकिंग कन्फर्म करें!",
      },
      {
        id: "faq_support",
        question: "📞 ग्राहक सहायता (Support)",
        answer: "मदद के लिए आप elitesaloon@gmail.com पर ईमेल कर सकते हैं या सैलून के संपर्क नंबर पर सीधे कॉल कर सकते हैं।",
      },
    ],
  },

  GU: {
    title: "એલિટ સલૂન સહાયક",
    subtitle: "બુક સ્માર્ટ, લુક સ્માર્ટ",
    welcome: "એલિટ સલૂન (EliteSalon) માં આપનું સ્વાગત છે! 👋 હું તમને કેવી રીતે મદદ કરી શકું? નીચેના વિકલ્પોમાંથી પસંદ કરો અથવા તમારો પ્રશ્ન લખો.",
    inputPlaceholder: "સંદેશ, પિનકોડ અથવા પ્રશ્ન લખો...",
    send: "મોકલો",
    backToMenu: "🔙 મુખ્ય મેનૂ",
    restartChat: "🔄 ફરી શરૂ કરો",
    searching: "શોધી રહ્યા છીએ...",
    loading: "માહિતી લોડ થઈ રહી છે...",
    loginRequired: "આ સુવિધા માટે તમારે લોગિન કરવું પડશે.",
    loginBtn: "🔑 લોગિન કરો",
    registerBtn: "📝 નવું એકાઉન્ટ બનાવો",
    exploreServicesBtn: "💇 સેવાઓ જુઓ",
    bookNowBtn: "📅 એપોઇન્ટમેન્ટ બુક કરો",
    cancelBtn: "❌ એપોઇન્ટમેન્ટ રદ કરો",
    rescheduleBtn: "🔄 સમય બદલો",
    downloadInvoiceBtn: "📄 બિલ / ઇનવોઇસ ડાઉનલોડ",
    viewAllSalonsBtn: "📍 નજીકના સલૂન જુઓ",
    noSalonsFound: "આ પિનકોડ માટે કોઈ સલૂન મળ્યું નથી",
    enterPincodePrompt: "નજીકનું સલૂન શોધવા માટે તમારો 6 અંકનો પિનકોડ (જેમ કે 422001) દાખલ કરો:",
    invalidPincode: "કૃપા કરીને માન્ય 6 અંકનો ભારતીય પિનકોડ દાખલ કરો.",
    salonsFoundHeader: "તમારા વિસ્તારમાં ઉપલબ્ધ સલૂન:",
    servicesHeader: "સેવાઓ અને કિંમત જોવા માટે કેટેગરી પસંદ કરો:",
    noServicesFound: "આ કેટેગરીમાં હાલ કોઈ સેવા ઉપલબ્ધ નથી.",
    allServicesCount: "ઉપલબ્ધ કુલ સેવાઓ:",
    myAppointmentsHeader: "તમારી તાજેતરની અને આગામી એપોઇન્ટમેન્ટ્સ:",
    noAppointments: "તમે હજુ સુધી કોઈ એપોઇન્ટમેન્ટ બુક કરી નથી.",
    cancelConfirmTitle: "શું તમે ખાતરી કરો છો?",
    cancelConfirmText: "શું તમે ખરેખર આ એપોઇન્ટમેન્ટ રદ કરવા માંગો છો?",
    cancelSuccess: "એપોઇન્ટમેન્ટ સફળતાપૂર્વક રદ કરવામાં આવી છે.",
    cancelFailed: "એપોઇન્ટમેન્ટ રદ કરવામાં નિષ્ફળતા. કૃપા કરી ફરી પ્રયાસ કરો.",
    myOrdersHeader: "તમારા તાજેતરના પ્રોડક્ટ ઓર્ડર્સ:",
    noOrders: "તમે હજુ સુધી કોઈ પ્રોડક્ટ ઓર્ડર કર્યો નથી.",
    browseProductsBtn: "🛍️ પ્રોડક્ટ્સ જુઓ",
    faqHeader: "વારંવાર પૂછાતા પ્રશ્નો અને સલૂન નિયમો:",
    unrecognizedQuery: "માફ કરશો, હું સમજી શક્યો નથી. કૃપા કરીને નીચેના વિકલ્પોમાંથી પસંદ કરો અથવા પિનકોડ દાખલ કરો:",
    serverError: "સર્વર સાથે કનેક્ટ થઈ શકતું નથી. કૃપા કરી બેકએન્ડ ચાલુ છે કે નહીં તે ચકાસો.",
    menuOptions: [
      { id: "find_salons", label: "📍 નજીકના સલૂન શોધો" },
      { id: "services_prices", label: "💇 સેવાઓ અને કિંમતો" },
      { id: "book_appointment", label: "📅 એપોઇન્ટમેન્ટ બુક કરો" },
      { id: "my_appointments", label: "📋 મારી એપોઇન્ટમેન્ટ્સ" },
      { id: "track_orders", label: "📦 મારા પ્રોડક્ટ ઓર્ડર્સ" },
      { id: "timings_faqs", label: "⏰ સલૂન સમય અને પ્રશ્નો" },
    ],
    faqs: [
      {
        id: "faq_timings",
        question: "⏰ સલૂન ખોલવાનો સમય",
        answer: "એલિટ સલૂન પાર્ટનર સલૂન સવારે 10:00 થી રાત્રે 08:00 વાગ્યા સુધી (સોમવારથી રવિવાર) ખુલ્લા રહે છે. સ્ટાઈલિશના સમય સ્લોટ બુકિંગ પેજ પર દર્શાવવામાં આવે છે.",
      },
      {
        id: "faq_payments",
        question: "💳 પેમેન્ટ પદ્ધતિઓ",
        answer: "અમે Razorpay દ્વારા ઓનલાઇન પેમેન્ટ (UPI, કાર્ડ, નેટ બેંકિંગ) સ્વીકારીએ છીએ. તમે સલૂન પર પણ પેમેન્ટ કરી શકો છો.",
      },
      {
        id: "faq_cancellation",
        question: "❌ કેન્સલેશન પોલિસી",
        answer: "તમે તમારા સ્લોટ સમય પહેલાં ડેશબોર્ડ અથવા આ ચેટબોટથી મફતમાં એપોઇન્ટમેન્ટ રદ કરી શકો છો.",
      },
      {
        id: "faq_booking_guide",
        question: "ℹ️ બુકિંગ કેવી રીતે કરવું",
        answer: "1. પિનકોડથી સલૂન પસંદ કરો.\n2. સેવાઓ પસંદ કરો (હેરકટ, ફેશિયલ વગેરે).\n3. સ્ટાઈલિશ અને તારીખ પસંદ કરો.\n4. સમય સ્લોટ પસંદ કરીને બુકિંગ કન્ફર્મ કરો!",
      },
      {
        id: "faq_support",
        question: "📞 ગ્રાહક સહાય (Support)",
        answer: "સહાય માટે elitesaloon@gmail.com પર ઈમેલ કરો અથવા સલૂનના નંબર પર સીધો સંપર્ક કરો.",
      },
    ],
  },
};

// Keyword and Intent Matching Dictionary for English, Hinglish, Hindi, and Gujarati
export const INTENT_KEYWORDS = {
  find_salons: [
    "salon", "salons", "saloon", "shop", "parlour", "near me", "nearby", "pincode", "pin code",
    "location", "address", "where", "dukan", "aas paas", "najdik", "pata", "kahan", "kahan hai",
    "सैलून", "दुकान", "नजदीक", "नजदीकी", "पता", "कहाँ है", "પિનકોડ", "સલૂન", "દુકાન", "નજીક",
    "ક્યાં છે", "સરનામું", "શોધો"
  ],

  services_prices: [
    "service", "services", "price", "prices", "cost", "rate", "charge", "haircut", "facial",
    "beard", "shave", "spa", "hairspa", "keratin", "cleanup", "hairwash", "coloring", "colour",
    "hair cut", "baal", "katna", "daam", "kimat", "keemat", "rate list", "kitna lagega", "haircut ka price",
    "कीमत", "दाम", "हेयरकट", "दाढ़ी", "फेशियल", "हेयर स्पा", "ભાવ", "કિંમત", "વાળ", "દાઢી",
    "હેયરકટ", "કેટલા રૂપિયા", "ચાર્જ"
  ],

  book_appointment: [
    "book", "booking", "appointment", "reserve", "slot", "book appointment", "appointment book",
    "book karna hai", "appointment lena hai", "slot book", "slot chahiye", "appointment leni hai",
    "बुकिंग", "अपॉइंटमेंट", "स्लॉट", "બુકિંગ", "એપોઇન્ટમેન્ટ", "સ્લોટ બુકિંગ", "બુક કરવું છે"
  ],

  my_appointments: [
    "my appointment", "my appointments", "my booking", "my bookings", "appointment status",
    "booking status", "check appointment", "status", "upcoming", "meri booking", "mera appointment",
    "kab hai", "status kya hai", "meri booking kab hai", "appointment kab hai", "मेरी बुकिंग",
    "अपॉइंटमेंट स्टेटस", "મારી એપોઇન્ટમેન્ટ", "સ્ટેટસ", "ક્યારે છે"
  ],

  cancel_reschedule: [
    "cancel", "cancellation", "reschedule", "change time", "change date", "postpone", "radd",
    "cancel appointment", "cancel karna hai", "appointment cancel", "time change", "date change",
    "રદ", "કેન્સલ", "સમય બદલવો", "તારીખ બદલવી", "रद्द", "कैंसिल"
  ],

  track_orders: [
    "order", "orders", "my order", "my orders", "product", "products", "track order", "tracking",
    "delivery", "shipping", "purchase", "purchases", "invoice", "receipt", "mera order", "order status",
    "product kahan hai", "order kab aayega", "सामान", "ऑर्डर", "ઓર્ડર", "પ્રોડક્ટ", "ઇનવોઇસ"
  ],

  timings_faqs: [
    "timing", "timings", "hours", "working hours", "open", "close", "opening time", "closing time",
    "kab khulta hai", "kab band hota hai", "samay", "time kya hai", "kitne baje", "faq", "faqs",
    "help", "support", "contact", "phone", "email", "payment", "razorpay", "upi", "cash",
    "समय", "टाइमिंग", "मदદ", "સહાય", "સલૂન સમય", "ક્યારે ખુલે", "ક્યારે બંધ થાય"
  ],

  greeting: [
    "hi", "hello", "hey", "hii", "helo", "hola", "namaste", "pranam", "kem cho", "kemcho",
    "good morning", "good afternoon", "good evening", "नमस्ते", "કેમ છો"
  ],
};

// Detect user intent based on typed string
export const detectIntent = (text) => {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.trim().toLowerCase();

  // 1. Direct 6-digit Pincode detection (e.g., 422001, 395007)
  const pincodeMatch = cleaned.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    return { intent: "pincode_detected", pincode: pincodeMatch[0] };
  }

  // 2. Check each intent category
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      // Word boundary or substring check
      if (cleaned.includes(kw.toLowerCase())) {
        return { intent };
      }
    }
  }

  return { intent: "unknown" };
};
