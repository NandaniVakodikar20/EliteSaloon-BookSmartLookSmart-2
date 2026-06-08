import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";
import "./GuestServices.css";

const GuestServices = ({ handleProtectedNavigation }) => {
  // 1. Initial tab ko "all" par set kiya
  const [activeTab, setActiveTab] = useState("all");

  const [femaleServices, setFemaleServices] = useState([]);
  const [maleServices, setMaleServices] = useState([]);
  const [bothServices, setBothServices] = useState([]);
  // Saari services ko ek saath store karne ke liye state
  const [allServices, setAllServices] = useState([]);

  const [showAllServices, setShowAllServices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuestServices = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "http://localhost:5000/guest/allservices",
        );

        if (response.data && response.data.success) {
          const rawServicesList = response.data.data;

          // Saari services ko state mein save kiya
          setAllServices(rawServicesList);

          // FEMALE ONLY
          const femaleList = rawServicesList.filter(
            (item) =>
              item.servicePreferredGender &&
              item.servicePreferredGender.trim().toUpperCase() === "FEMALE",
          );

          // MALE ONLY
          const maleList = rawServicesList.filter(
            (item) =>
              item.servicePreferredGender &&
              item.servicePreferredGender.trim().toUpperCase() === "MALE",
          );

          // BOTH ONLY
          const bothList = rawServicesList.filter(
            (item) =>
              item.servicePreferredGender &&
              item.servicePreferredGender.trim().toUpperCase() === "BOTH",
          );

          setFemaleServices(femaleList);
          setMaleServices(maleList);
          setBothServices(bothList);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error retrieving dynamic guest services:", err);
        setError("Failed to load salon services from database.");
        setLoading(false);
      }
    };

    fetchGuestServices();
  }, []);

  // TAB FILTERING LOGIC
  let currentServices = [];

  if (activeTab === "all") {
    currentServices = allServices; // Agar 'all' active hai toh saari services dikhao
  } else if (activeTab === "female") {
    currentServices = femaleServices;
  } else if (activeTab === "male") {
    currentServices = maleServices;
  } else if (activeTab === "both") {
    currentServices = bothServices;
  }

  // SHOW ONLY 6 INITIALLY
  const displayedServices = showAllServices
    ? currentServices
    : currentServices.slice(0, 6);

  if (loading) {
    return (
      <div className="services-loading-state">
        <p>Loading premium salon services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-error-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="guest-services-page">
      {/* HEADER */}
      <div className="guest-services-header">
        <h2 className="guest-services-title">Premium Salon Services</h2>
        <p className="guest-services-subtitle">
          Experience luxury beauty & grooming services
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="filters-container">
        <div className="filter-bar">
          {/* Naya 'All' Button */}
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => {
              setActiveTab("all");
              setShowAllServices(false);
            }}
          >
            All
          </button>
          <button
            className={activeTab === "male" ? "active" : ""}
            onClick={() => {
              setActiveTab("male");
              setShowAllServices(false);
            }}
          >
            Male
          </button>
          <button
            className={activeTab === "female" ? "active" : ""}
            onClick={() => {
              setActiveTab("female");
              setShowAllServices(false);
            }}
          >
            Female
          </button>

          {/* <button
            className={activeTab === "both" ? "active" : ""}
            onClick={() => {
              setActiveTab("both");
              setShowAllServices(false);
            }}
          >
            Both
          </button> */}
        </div>
      </div>

      {/* SERVICES */}
      <div className="cards">
        {displayedServices.length > 0 ? (
          displayedServices.map((service) => (
            <div key={service._id} className="card">
              {/* IMAGE */}
              <div className="image-wrapper">
                <img
                  src={
                    service.serviceImages?.length > 0
                      ? `http://localhost:5000/uploads/serviceImages/${service.serviceImages[0]}`
                      : "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={service.serviceName}
                />
                <span className="badge">{service.servicePreferredGender}</span>
              </div>

              {/* BODY */}
              <div className="card-body">
                <span className="badge-category">
                  {service.serviceType || "General"}
                </span>

                <h3>{service.serviceName}</h3>

                <div className="info">
                  <FaClock />
                  <span>{service.serviceDuration} min</span>
                </div>

                <p className="service-description">
                  {service.serviceDescription}
                </p>

                {service.ownerId && (
                  <p className="service-shop-location">
                    📍 {service.ownerId.ownerShopName} (
                    {service.ownerId.ownerShopCity})
                  </p>
                )}

                <div className="bottom">
                  <span className="price">₹{service.servicePrice}</span>
                  <button
                    className="add"
                    onClick={() =>
                      handleProtectedNavigation("/bookappointment")
                    }
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-services">No services available</div>
        )}
      </div>

      {/* VIEW MORE */}
      {currentServices.length > 6 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            className="add"
            onClick={() => setShowAllServices(!showAllServices)}
          >
            {showAllServices ? "Show Less" : "View More Services"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestServices;
