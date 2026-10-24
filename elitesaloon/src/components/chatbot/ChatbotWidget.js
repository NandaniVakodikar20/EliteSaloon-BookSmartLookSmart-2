// src/components/chatbot/ChatbotWidget.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaRedo,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaFileInvoice,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import {
  LANGUAGES,
  TRANSLATIONS,
  detectIntent,
} from "./chatbotKnowledge";
import { downloadInvoicePDF } from "../../utils/invoiceGenerator";
import "./ChatbotWidget.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState(LANGUAGES.EN);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFlow, setCurrentFlow] = useState("IDLE"); // 'IDLE', 'AWAITING_PINCODE', 'SERVICES', 'FAQS'
  const messagesEndRef = useRef(null);

  // Helper for translated strings
  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.EN[key] || "";
  };

  // Helper to format timestamps
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Initial welcome message when widget is opened for the first time
  useEffect(() => {
    if (messages.length === 0) {
      initWelcomeMessage(LANGUAGES.EN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initWelcomeMessage = (activeLang) => {
    const langStrings = TRANSLATIONS[activeLang] || TRANSLATIONS.EN;
    setMessages([
      {
        id: "msg_welcome",
        sender: "bot",
        text: langStrings.welcome,
        options: langStrings.menuOptions,
        timestamp: getCurrentTime(),
      },
    ]);
    setCurrentFlow("IDLE");
  };

  // Change Language and notify in chat
  const handleLanguageChange = (newLang) => {
    if (newLang === lang) return;
    setLang(newLang);
    const langStrings = TRANSLATIONS[newLang];

    setMessages((prev) => [
      ...prev,
      {
        id: "lang_changed_" + Date.now(),
        sender: "bot",
        text: langStrings.welcome,
        options: langStrings.menuOptions,
        timestamp: getCurrentTime(),
      },
    ]);
    setCurrentFlow("IDLE");
  };

  // Restart Conversation
  const handleRestartChat = () => {
    initWelcomeMessage(lang);
  };

  // Append a user message
  const addUserMessage = (text) => {
    const newMsg = {
      id: "user_" + Date.now(),
      sender: "user",
      text,
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  // Append a bot message
  const addBotMessage = (text, options = null, type = "text", data = null) => {
    const newMsg = {
      id: "bot_" + Date.now(),
      sender: "bot",
      text,
      options,
      type,
      data,
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  // ==========================================
  // FLOW 1: FIND NEARBY SALONS BY PINCODE
  // ==========================================
  const startFindSalonsFlow = () => {
    setCurrentFlow("AWAITING_PINCODE");
    addBotMessage(
      t("enterPincodePrompt"),
      [
        { id: "pincode_394620", label: "📍 394620 (Bardoli)" },
        { id: "pincode_394212", label: "📍 394212 (Surat)" },
        { id: "main_menu", label: t("backToMenu") },
      ]
    );
  };

  const handleSearchSalonsByPincode = async (pincode) => {
    const cleanPin = pincode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      addBotMessage(t("invalidPincode"), [
        { id: "main_menu", label: t("backToMenu") },
      ]);
      return;
    }

    setLoading(true);
    setCurrentFlow("IDLE");

    try {
      const res = await axios.get(`${API_BASE_URL}/appointment/get-salon/${cleanPin}`);
      setLoading(false);

      if (res.data && res.data.data && res.data.data.length > 0) {
        const salons = res.data.data;
        addBotMessage(
          `${t("salonsFoundHeader")} (${salons.length})`,
          [
            { id: "find_salons", label: "🔍 Search Another Pincode" },
            { id: "services_prices", label: t("exploreServicesBtn") },
            { id: "main_menu", label: t("backToMenu") },
          ],
          "salons",
          salons
        );
      } else {
        addBotMessage(
          `${t("noSalonsFound")} ${cleanPin}.`,
          [
            { id: "find_salons", label: "🔍 Try Another Pincode" },
            { id: "main_menu", label: t("backToMenu") },
          ]
        );
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 404) {
        addBotMessage(
          `${t("noSalonsFound")} ${cleanPin}.`,
          [
            { id: "find_salons", label: "🔍 Try Another Pincode" },
            { id: "main_menu", label: t("backToMenu") },
          ]
        );
      } else {
        addBotMessage(
          t("serverError"),
          [{ id: "main_menu", label: t("backToMenu") }]
        );
      }
    }
  };

  // ==========================================
  // FLOW 2: SERVICES AND PRICES
  // ==========================================
  const startServicesFlow = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/guest/allservices`);
      setLoading(false);

      if (res.data && res.data.data && res.data.data.length > 0) {
        const allServices = res.data.data;

        // Group services or show category chips
        addBotMessage(
          t("servicesHeader"),
          [
            { id: "service_cat_HAIRCUT", label: "💇 Haircut & Styling" },
            { id: "service_cat_BEARD", label: "🧔 Beard & Shave" },
            { id: "service_cat_FACIAL", label: "✨ Facial & Skin Care" },
            { id: "service_cat_HAIRSPA", label: "💆 Hair Spa & Treatment" },
            { id: "service_cat_ALL", label: "🔍 View All Services" },
            { id: "main_menu", label: t("backToMenu") },
          ],
          "services_categories",
          allServices
        );
      } else {
        addBotMessage(
          t("noServicesFound"),
          [{ id: "main_menu", label: t("backToMenu") }]
        );
      }
    } catch (err) {
      setLoading(false);
      addBotMessage(
        t("serverError"),
        [{ id: "main_menu", label: t("backToMenu") }]
      );
    }
  };

  const handleFilterServices = async (category) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/guest/allservices`);
      setLoading(false);

      if (res.data && res.data.data) {
        let filtered = res.data.data;
        if (category !== "ALL") {
          filtered = res.data.data.filter((s) => s.serviceType === category);
        }

        if (filtered.length === 0) {
          addBotMessage(
            t("noServicesFound"),
            [
              { id: "services_prices", label: "💇 Other Categories" },
              { id: "main_menu", label: t("backToMenu") },
            ]
          );
        } else {
          // Take first 5 for readable card display
          const displayServices = filtered.slice(0, 5);
          addBotMessage(
            `Found ${filtered.length} service(s) for ${category === "ALL" ? "All Categories" : category}:`,
            [
              { id: "book_appointment", label: t("bookNowBtn") },
              { id: "services_prices", label: "💇 Other Categories" },
              { id: "main_menu", label: t("backToMenu") },
            ],
            "services",
            displayServices
          );
        }
      }
    } catch (err) {
      setLoading(false);
      addBotMessage(t("serverError"), [{ id: "main_menu", label: t("backToMenu") }]);
    }
  };

  // ==========================================
  // FLOW 3: BOOK AN APPOINTMENT
  // ==========================================
  const startBookAppointmentFlow = () => {
    const token = localStorage.getItem("token");

    const guideText =
      "📅 Booking with EliteSalon is easy:\n" +
      "1. Find a salon near you or pick a service.\n" +
      "2. Choose your stylist and convenient date.\n" +
      "3. Select your time slot and confirm!\n\n" +
      (token
        ? "You are currently logged in. Would you like to proceed to the booking interface?"
        : "Please log in to your EliteSalon customer account to complete your booking.");

    const options = token
      ? [
          { id: "goto_booking", label: "📅 Proceed to Book Appointment" },
          { id: "find_salons", label: "📍 Choose Salon First" },
          { id: "main_menu", label: t("backToMenu") },
        ]
      : [
          { id: "goto_login", label: t("loginBtn") },
          { id: "goto_register", label: t("registerBtn") },
          { id: "main_menu", label: t("backToMenu") },
        ];

    addBotMessage(guideText, options);
  };

  // ==========================================
  // FLOW 4: MY APPOINTMENTS
  // ==========================================
  const startMyAppointmentsFlow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      addBotMessage(t("loginRequired"), [
        { id: "goto_login", label: t("loginBtn") },
        { id: "goto_register", label: t("registerBtn") },
        { id: "main_menu", label: t("backToMenu") },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment/customer-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);

      const appointments = res.data?.appointments || [];
      if (appointments.length === 0) {
        addBotMessage(t("noAppointments"), [
          { id: "book_appointment", label: t("bookNowBtn") },
          { id: "main_menu", label: t("backToMenu") },
        ]);
      } else {
        // Show recent 4 appointments
        const recentApts = [...appointments].reverse().slice(0, 4);
        addBotMessage(
          t("myAppointmentsHeader"),
          [
            { id: "book_appointment", label: "📅 Book Another Appointment" },
            { id: "main_menu", label: t("backToMenu") },
          ],
          "appointments",
          recentApts
        );
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 401) {
        addBotMessage("Your session has expired. Please log in again.", [
          { id: "goto_login", label: t("loginBtn") },
          { id: "main_menu", label: t("backToMenu") },
        ]);
      } else {
        addBotMessage(t("serverError"), [{ id: "main_menu", label: t("backToMenu") }]);
      }
    }
  };

  // Handle Cancel Appointment Action
  const handleCancelAppointment = (aptId) => {
    Swal.fire({
      title: t("cancelConfirmTitle"),
      text: t("cancelConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Cancel It",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await axios.put(`${API_BASE_URL}/customer/cancel-appointment`, {
            appointmentId: aptId,
            status: "CANCELLED",
          });
          setLoading(false);
          Swal.fire("Cancelled!", t("cancelSuccess"), "success");
          // Re-fetch appointments list
          startMyAppointmentsFlow();
        } catch (error) {
          setLoading(false);
          Swal.fire("Error", t("cancelFailed"), "error");
        }
      }
    });
  };

  // ==========================================
  // FLOW 5: TRACK PRODUCT ORDERS
  // ==========================================
  const startTrackOrdersFlow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      addBotMessage(t("loginRequired"), [
        { id: "goto_login", label: t("loginBtn") },
        { id: "main_menu", label: t("backToMenu") },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);

      const orders = res.data?.orders || [];
      if (orders.length === 0) {
        addBotMessage(t("noOrders"), [
          { id: "goto_products", label: t("browseProductsBtn") },
          { id: "main_menu", label: t("backToMenu") },
        ]);
      } else {
        // Display top 3 recent orders
        const recentOrders = orders.slice(0, 3);
        addBotMessage(
          t("myOrdersHeader"),
          [
            { id: "goto_products", label: t("browseProductsBtn") },
            { id: "main_menu", label: t("backToMenu") },
          ],
          "orders",
          recentOrders
        );
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 401) {
        addBotMessage("Your session has expired. Please log in again.", [
          { id: "goto_login", label: t("loginBtn") },
          { id: "main_menu", label: t("backToMenu") },
        ]);
      } else {
        addBotMessage(t("serverError"), [{ id: "main_menu", label: t("backToMenu") }]);
      }
    }
  };

  // ==========================================
  // FLOW 6: SALON TIMINGS & FAQS
  // ==========================================
  const startFaqFlow = () => {
    const faqOptions = (TRANSLATIONS[lang]?.faqs || TRANSLATIONS.EN.faqs).map((f) => ({
      id: f.id,
      label: f.question,
    }));

    addBotMessage(t("faqHeader"), [
      ...faqOptions,
      { id: "main_menu", label: t("backToMenu") },
    ]);
  };

  const handleFaqAnswer = (faqId) => {
    const activeFaqs = TRANSLATIONS[lang]?.faqs || TRANSLATIONS.EN.faqs;
    const selectedFaq = activeFaqs.find((f) => f.id === faqId);

    if (selectedFaq) {
      addBotMessage(
        `**${selectedFaq.question}**\n\n${selectedFaq.answer}`,
        [
          { id: "timings_faqs", label: "❓ Other FAQs" },
          { id: "main_menu", label: t("backToMenu") },
        ]
      );
    }
  };

  // ==========================================
  // DISPATCHER: HANDLE BUTTON CLICKS
  // ==========================================
  const handleOptionClick = (option) => {
    addUserMessage(option.label);

    // Flow Routing
    if (option.id === "main_menu") {
      initWelcomeMessage(lang);
      return;
    }

    if (option.id === "find_salons") {
      startFindSalonsFlow();
      return;
    }

    if (option.id.startsWith("pincode_")) {
      const pin = option.id.replace("pincode_", "");
      handleSearchSalonsByPincode(pin);
      return;
    }

    if (option.id === "services_prices") {
      startServicesFlow();
      return;
    }

    if (option.id.startsWith("service_cat_")) {
      const cat = option.id.replace("service_cat_", "");
      handleFilterServices(cat);
      return;
    }

    if (option.id === "book_appointment") {
      startBookAppointmentFlow();
      return;
    }

    if (option.id === "my_appointments") {
      startMyAppointmentsFlow();
      return;
    }

    if (option.id === "track_orders") {
      startTrackOrdersFlow();
      return;
    }

    if (option.id === "timings_faqs") {
      startFaqFlow();
      return;
    }

    if (option.id.startsWith("faq_")) {
      handleFaqAnswer(option.id);
      return;
    }

    // Direct Navigations
    if (option.id === "goto_login") {
      setIsOpen(false);
      navigate("/customerlogin");
      return;
    }

    if (option.id === "goto_register") {
      setIsOpen(false);
      navigate("/customerregister");
      return;
    }

    if (option.id === "goto_booking") {
      setIsOpen(false);
      navigate("/customerdashboard", { state: { activeSection: "bookappointments" } });
      return;
    }

    if (option.id === "goto_products") {
      setIsOpen(false);
      navigate("/products");
      return;
    }
  };

  // ==========================================
  // DISPATCHER: HANDLE TEXT SUBMIT
  // ==========================================
  const handleSendText = (e) => {
    e?.preventDefault();
    const query = inputVal.trim();
    if (!query || loading) return;

    addUserMessage(query);
    setInputVal("");

    // 1. If currently awaiting pincode or user typed a 6-digit number
    const pinMatch = query.match(/\b\d{6}\b/);
    if (currentFlow === "AWAITING_PINCODE" || pinMatch) {
      const pinToSearch = pinMatch ? pinMatch[0] : query;
      handleSearchSalonsByPincode(pinToSearch);
      return;
    }

    // 2. Keyword & Intent detection
    const { intent, pincode } = detectIntent(query);

    if (intent === "pincode_detected" && pincode) {
      handleSearchSalonsByPincode(pincode);
      return;
    }

    switch (intent) {
      case "greeting":
        addBotMessage(t("welcome"), TRANSLATIONS[lang]?.menuOptions || TRANSLATIONS.EN.menuOptions);
        break;

      case "find_salons":
        startFindSalonsFlow();
        break;

      case "services_prices":
        startServicesFlow();
        break;

      case "book_appointment":
        startBookAppointmentFlow();
        break;

      case "my_appointments":
      case "cancel_reschedule":
        startMyAppointmentsFlow();
        break;

      case "track_orders":
        startTrackOrdersFlow();
        break;

      case "timings_faqs":
        startFaqFlow();
        break;

      default:
        // Polite fallback message with full menu
        addBotMessage(
          t("unrecognizedQuery"),
          TRANSLATIONS[lang]?.menuOptions || TRANSLATIONS.EN.menuOptions
        );
        break;
    }
  };

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <button
        className={`elitesalon-chatbot-launcher ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="EliteSalon Customer Assistant"
        aria-label="Open EliteSalon Chatbot"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="elitesalon-chatbot-window">
          {/* Header */}
          <div className="elitesalon-chat-header">
            <div className="elitesalon-chat-header-info">
              <div className="elitesalon-chat-avatar">ES</div>
              <div>
                <h4 className="elitesalon-chat-header-title">{t("title")}</h4>
                <p className="elitesalon-chat-header-subtitle">{t("subtitle")}</p>
              </div>
            </div>

            <div className="elitesalon-chat-header-actions">
              {/* Language Switcher */}
              <div className="elitesalon-lang-group">
                <button
                  className={`elitesalon-lang-btn ${lang === LANGUAGES.EN ? "active" : ""}`}
                  onClick={() => handleLanguageChange(LANGUAGES.EN)}
                >
                  EN
                </button>
                <button
                  className={`elitesalon-lang-btn ${lang === LANGUAGES.HI ? "active" : ""}`}
                  onClick={() => handleLanguageChange(LANGUAGES.HI)}
                >
                  HI
                </button>
                <button
                  className={`elitesalon-lang-btn ${lang === LANGUAGES.GU ? "active" : ""}`}
                  onClick={() => handleLanguageChange(LANGUAGES.GU)}
                >
                  GU
                </button>
              </div>

              <button
                className="elitesalon-chat-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="elitesalon-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`elitesalon-msg-wrap ${msg.sender}`}>
                <div className="elitesalon-msg-bubble">
                  {msg.text}

                  {/* Render Salons Cards */}
                  {msg.type === "salons" && msg.data && (
                    <div className="elitesalon-cards-stack">
                      {msg.data.map((salon) => (
                        <div key={salon._id} className="elitesalon-item-card">
                          <div className="elitesalon-card-title">
                            <span>{salon.ownerShopName}</span>
                          </div>
                          <div className="elitesalon-card-detail">
                            <FaMapMarkerAlt style={{ color: "#d4af37", marginRight: 4 }} />
                            {salon.ownerShopStreet}, {salon.ownerShopCity} ({salon.ownerShopPincode})
                          </div>
                          {salon.ownerMobile && (
                            <div className="elitesalon-card-detail">
                              <FaPhoneAlt style={{ color: "#0ca678", marginRight: 4 }} />
                              {salon.ownerMobile}
                            </div>
                          )}
                          <div className="elitesalon-card-actions">
                            <button
                              className="elitesalon-card-btn action-primary"
                              onClick={() => {
                                setIsOpen(false);
                                const token = localStorage.getItem("token");
                                if (token) {
                                  navigate("/customerdashboard", {
                                    state: { activeSection: "bookappointments", selectedSalonId: salon._id },
                                  });
                                } else {
                                  navigate("/customerlogin");
                                }
                              }}
                            >
                              📅 Book Now
                            </button>
                            <button
                              className="elitesalon-card-btn action-secondary"
                              onClick={() => {
                                setIsOpen(false);
                                navigate("/services");
                              }}
                            >
                              💇 View Services
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Services Cards */}
                  {msg.type === "services" && msg.data && (
                    <div className="elitesalon-cards-stack">
                      {msg.data.map((service) => (
                        <div key={service._id} className="elitesalon-item-card">
                          <div className="elitesalon-card-title">
                            <span>{service.serviceName}</span>
                            <span className="elitesalon-card-price">₹{service.servicePrice}</span>
                          </div>
                          <div className="elitesalon-card-detail">
                            <FaClock style={{ color: "#94a3b8", marginRight: 4 }} />
                            {service.serviceDuration} mins • {service.servicePreferredGender || "UNISEX"}
                          </div>
                          {service.ownerId?.ownerShopName && (
                            <div className="elitesalon-card-detail">
                              🏪 {service.ownerId.ownerShopName}
                            </div>
                          )}
                          <div className="elitesalon-card-actions">
                            <button
                              className="elitesalon-card-btn action-primary"
                              onClick={() => {
                                setIsOpen(false);
                                const token = localStorage.getItem("token");
                                if (token) {
                                  navigate("/customerdashboard", {
                                    state: { activeSection: "bookappointments" },
                                  });
                                } else {
                                  navigate("/customerlogin");
                                }
                              }}
                            >
                              📅 Book This
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Appointments Cards */}
                  {msg.type === "appointments" && msg.data && (
                    <div className="elitesalon-cards-stack">
                      {msg.data.map((apt) => (
                        <div key={apt._id} className="elitesalon-item-card">
                          <div className="elitesalon-card-title">
                            <span>
                              <FaCalendarAlt style={{ color: "#d4af37", marginRight: 6 }} />
                              {apt.appointmentDate}
                            </span>
                            <span
                              className={`elitesalon-card-badge status-${apt.appointmentStatus?.toLowerCase()}`}
                            >
                              {apt.appointmentStatus}
                            </span>
                          </div>
                          <div className="elitesalon-card-detail">
                            <FaClock style={{ marginRight: 4 }} />
                            {apt.startTime} - {apt.endTime || "End"}
                          </div>
                          <div className="elitesalon-card-detail">
                            ✂️ {apt.services?.map((s) => s.serviceName).join(", ") || "Services"}
                          </div>
                          <div className="elitesalon-card-detail elitesalon-card-price">
                            Total: ₹{apt.totalPrice}
                          </div>

                          {/* Cancellation and Reschedule Actions */}
                          {apt.appointmentStatus !== "CANCELLED" &&
                            apt.appointmentStatus !== "COMPLETED" && (
                              <div className="elitesalon-card-actions">
                                <button
                                  className="elitesalon-card-btn action-danger"
                                  onClick={() => handleCancelAppointment(apt._id)}
                                >
                                  ❌ Cancel
                                </button>
                                <button
                                  className="elitesalon-card-btn action-secondary"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate("/customerdashboard", {
                                      state: {
                                        activeSection: "bookappointments",
                                        openReschedule: true,
                                      },
                                    });
                                  }}
                                >
                                  🔄 Reschedule
                                </button>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Orders Cards */}
                  {msg.type === "orders" && msg.data && (
                    <div className="elitesalon-cards-stack">
                      {msg.data.map((ord) => (
                        <div key={ord._id} className="elitesalon-item-card">
                          <div className="elitesalon-card-title">
                            <span>{ord.orderNumber}</span>
                            <span
                              className={`elitesalon-card-badge status-${ord.paymentStatus?.toLowerCase()}`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </div>
                          <div className="elitesalon-card-detail">
                            🛍️ {ord.items?.map((it) => `${it.productName} (x${it.quantity})`).join(", ")}
                          </div>
                          <div className="elitesalon-card-detail elitesalon-card-price">
                            Total: ₹{ord.totalAmount}
                          </div>
                          {ord.paymentStatus === "PAID" && (
                            <div className="elitesalon-card-actions">
                              <button
                                className="elitesalon-card-btn action-primary"
                                onClick={() => downloadInvoicePDF(ord)}
                              >
                                <FaFileInvoice style={{ marginRight: 4 }} />
                                {t("downloadInvoiceBtn")}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Reply Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="elitesalon-options-container">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        className={`elitesalon-option-chip ${
                          opt.id === "main_menu" ? "primary" : ""
                        }`}
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="elitesalon-msg-time">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="elitesalon-msg-wrap bot">
                <div className="elitesalon-typing-indicator">
                  <span className="elitesalon-typing-dot"></span>
                  <span className="elitesalon-typing-dot"></span>
                  <span className="elitesalon-typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="elitesalon-chat-footer">
            <form className="elitesalon-chat-footer-controls" onSubmit={handleSendText}>
              <button
                type="button"
                className="elitesalon-restart-btn"
                onClick={handleRestartChat}
                title={t("restartChat")}
              >
                <FaRedo />
              </button>
              <input
                type="text"
                className="elitesalon-chat-input"
                placeholder={t("inputPlaceholder")}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="elitesalon-send-btn"
                disabled={loading || !inputVal.trim()}
                title={t("send")}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
