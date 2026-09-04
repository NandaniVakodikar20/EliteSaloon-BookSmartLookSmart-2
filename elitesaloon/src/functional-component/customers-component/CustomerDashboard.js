import React, { useState, useEffect } from "react";
import "./CustomerDashboard.css";
import CustomerOverview from "./CustomerOverview";
import CustomerProfile from "./CustomerProfile";
import CustomerAppointments from "./CustomerAppointments";
import CustomerServices from "./CustomerServices";
import CustomerProducts from "./CustomerProducts";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaUser,
  FaCalendarAlt,
  FaShoppingBag,
  FaSignOutAlt,
  FaCog,
  FaMapMarkerAlt,
} from "react-icons/fa";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initial state check: Agar reschedule se aa rahe hain toh direct 'bookappointments' tab khule
  const [activeSection, setActiveSection] = useState(
    location.state?.activeSection ||
    (location.state?.openReschedule
      ? "bookappointments"
      : "overview")
  );

  // const [customer, setCustomer] = useState(() => {
  //   const stored = localStorage.getItem("customer");
  //   return location.state?.customer || (stored ? JSON.parse(stored) : {});
  // });

  const [customer, setCustomer] = useState({});

  // const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
const [showLocationPrompt, setShowLocationPrompt] = useState(false);
const [locationLoading, setLocationLoading] = useState(false);
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/unauthorized");
      return;
    }

    fetch("http://localhost:5000/customer/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async response => {

        const data = await response.json();
        console.log("Protected API Response:", data);
        console.log("Protected API Response:", response.status);
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/unauthorized");
          return;
        }

        console.log("Customer API Response:", data);
        if (data.customer != null) {
          setCustomer(data.customer);
          setLoading(false);
        }

        return data;

      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        navigate("/error");
      });

  }, [navigate]);

const handleEnableLocation = () => {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    alert("Your browser does not support location services.");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log("====================================");
      console.log("       CUSTOMER LOCATION");
      console.log("====================================");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("====================================");

      // Save location in localStorage
      localStorage.setItem(
        "customerLocation",
        JSON.stringify({
          latitude: latitude,
          longitude: longitude,
        })
      );

      setLocationLoading(false);
      setShowLocationPrompt(false);
    },

    (error) => {
      console.error("Location Error:", error);

      setLocationLoading(false);

      if (error.code === 1) {
        console.log("Customer denied location permission.");
      } else if (error.code === 2) {
        console.log("Location information is unavailable.");
      } else if (error.code === 3) {
        console.log("Location request timed out.");
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

useEffect(() => {
  const savedLocation = localStorage.getItem("customerLocation");

  if (!savedLocation) {
    setShowLocationPrompt(true);
  }
}, []);


  useEffect(() => {

    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
    if (location.state?.openReschedule) {
      setActiveSection("bookappointments");
    }

  }, [location.state]);

  // Session check
  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn");
  //   const customerId = localStorage.getItem("customerId");

  //   if (!isLoggedIn || !customerId) {
  //     navigate("/customerlogin");
  //   }
  // }, [navigate]);

  const feedbacks = [
    {
      id: 1,
      service: "Hair Coloring",
      rating: 5,
      comment: "Amazing service! Loved the color.",
      date: "2024-02-15",
    },
  ];

  const renderSidebar = () => {
    return (
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="customer-avatar">
            <img
              src={
                !customer?.customerProfileImage ||
                  customer.customerProfileImage === "default/defaultProfile.png"
                  ? "http://localhost:5000/uploads/default/defaultProfile.png"
                  : `http://localhost:5000/uploads/customerProfile/${customer.customerProfileImage}?t=${Date.now()}`
              }
              alt={customer.customerName}
            />
          </div>
          <h3>{customer.customerName}</h3>
          <p>{customer.customerEmail}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <FaUser /> Overview
          </button>
          <button
            className={`nav-item ${activeSection === "bookappointments" ? "active" : ""}`}
            onClick={() => setActiveSection("bookappointments")}
          >
            <FaCalendarAlt /> My Bookings
          </button>

          <button
            className={`nav-item ${activeSection === "services" ? "active" : ""}`}
            onClick={() => setActiveSection("services")}
          >
            <FaShoppingBag /> Services
          </button>

          <button
            className={`nav-item ${activeSection === "products" ? "active" : ""}`}
            onClick={() => setActiveSection("products")}
          >
            <FaShoppingBag /> Products
          </button>


          <button
            className={`nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <FaCog /> Profile Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/", { replace: true });
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <CustomerOverview
            customer={customer}
            appointments={[]}
            navigate={navigate}
            setActiveSection={setActiveSection}
          />
        );
      case "bookappointments":
        // Jab activeSection 'bookappointments' hogi, tabhi ye component load hoga
        // Aur load hote hi iska useEffect Modal khol dega
        return <CustomerAppointments />;
      case "services":
        return <CustomerServices customer={customer} />;
      case "products":
        return <CustomerProducts customer={customer} />;
      case "profile":
        return <CustomerProfile customer={customer} setCustomer={setCustomer} />;
      default:
        return <CustomerOverview />;
    }
  };

  return (
  <div className="customer-dashboard">

    {renderSidebar()}

    <div className="dashboard-main">
      {renderContent()}
    </div>

    {/* ================= LOCATION POPUP ================= */}
    {showLocationPrompt && (
      <div className="location-modal-overlay">

        <div className="location-modal">

          <div className="location-modal-icon">
            <FaMapMarkerAlt />
          </div>

          <h2>Find Salons Near You</h2>

          <p>
            Allow your location to find nearby salons
            and services available around you.
          </p>

          <div className="location-modal-buttons">

            {/* DENY */}
            <button
              type="button"
              className="location-deny-btn"
              onClick={() => {
                console.log("Customer denied location access.");
                setShowLocationPrompt(false);
              }}
            >
              Deny
            </button>

            {/* ALLOW */}
            <button
              type="button"
              className="location-allow-btn"
              onClick={handleEnableLocation}
              disabled={locationLoading}
            >
              {locationLoading
                ? "Getting Location..."
                : "Allow"}
            </button>

          </div>

        </div>

      </div>
    )}

  </div>
);

};

export default CustomerDashboard;