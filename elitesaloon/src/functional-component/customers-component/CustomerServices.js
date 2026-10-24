import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";
import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomerDashboard.css";

const CustomerServices = ({ customer, isPreview }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const customerData = location.state?.customer;

  const storedCustomer = (() => {
    try {
      const stored = localStorage.getItem("customer");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const effectiveCustomer = customer || customerData || location.state?.customer || storedCustomer;

  const pincode = effectiveCustomer?.customerPincode
    ? Number(effectiveCustomer.customerPincode)
    : location.state?.pincode
      ? Number(location.state.pincode)
      : "";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(location.state?.salonName || "");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
  };

  // FETCH SERVICES
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        const locationData = localStorage.getItem("customerLocation");

        if (locationData) {
          const parsedLocation = JSON.parse(locationData);
          const latitude = Number(parsedLocation.latitude);
          const longitude = Number(parsedLocation.longitude);

          if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
            const response = await fetch("http://localhost:5000/customer/get-service", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setServices(data.services || []);
              setLoading(false);
              return;
            }
          }
        }

        if (pincode) {
          const response = await axios.get(
            `http://localhost:5000/customer/get-service-customer/${pincode}`
          );
          setServices(response.data.services || []);
          setLoading(false);
          return;
        }

        // Fallback for direct /services navigation or guests:
        // Fetch all verified active services from guest API so the page is never empty!
        const response = await axios.get("http://localhost:5000/guest/allservices");
        if (response.data && response.data.success) {
          let list = response.data.data || [];
          if (location.state?.salonId) {
            const filteredBySalon = list.filter(
              (s) =>
                s.ownerId &&
                (String(s.ownerId._id) === String(location.state.salonId) ||
                  s.ownerId.ownerShopName?.toLowerCase() === location.state?.salonName?.toLowerCase())
            );
            if (filteredBySalon.length > 0) {
              list = filteredBySalon;
            }
          }
          setServices(list);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Error fetching services in CustomerServices:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [customer, pincode, location.state]);

  // BOOK NOW
  const handleBookNow = (service) => {
    navigate("/bookappointment", {
      state: {
        serviceId: service._id,
        serviceName: service.serviceName,
        servicePrice: service.servicePrice,
        serviceDuration: service.serviceDuration,

        ownerId: service.ownerId?._id,
        shopName: service.ownerId?.ownerShopName,
        ownerEmail: service.ownerId?.ownerEmail,
        address: `${service.ownerId?.ownerShopStreet}, ${service.ownerId?.ownerShopDistrict}`,
      },
    });
  };

  // FILTER LOGIC
  const filteredServices = services.filter((service) => {
    const matchSearch =
      service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.ownerId?.ownerShopName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchLocation =
      locationFilter === "" ||
      service.ownerId?.ownerShopDistrict
        ?.toLowerCase()
        .includes(locationFilter.toLowerCase());

    const matchPrice =
      priceFilter === "" ||
      (priceFilter === "low" && service.servicePrice <= 300) ||
      (priceFilter === "mid" &&
        service.servicePrice > 300 &&
        service.servicePrice <= 800) ||
      (priceFilter === "high" && service.servicePrice > 800);

    return matchSearch && matchLocation && matchPrice;
  });

  // PREVIEW MODE (ONLY 4 ITEMS)
  const displayServices = isPreview
    ? filteredServices.slice(0, 4)
    : filteredServices;

  if (loading) {
    return <p className="no-data">Loading services...</p>;
  }

  return (
    <div className="dashboard-content">
      {/* HEADER */}
      {!isPreview && (
        <div className="content-header">
          <h2> Our Services</h2>
        </div>
      )}

      {/* FILTERS (HIDE IN PREVIEW) */}
      {!isPreview && (
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search service or salon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <input
            type="text"
            placeholder="Filter by district..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">All Prices</option>
            <option value="low">₹0 - ₹300</option>
            <option value="mid">₹300 - ₹800</option>
            <option value="high">₹800+</option>
          </select>
        </div>
      )}

      {/* NO DATA */}
      {displayServices.length === 0 ? (
        <p className="no-data">No services available</p>
      ) : (
        <div className="customer-service-grid">
          {displayServices.map((service) => (
            <div key={service._id} className="customer-service-card">
              <div className="service-slider">
                <Slider {...sliderSettings}>
                  {service.serviceImages?.length > 0 ? (
                    service.serviceImages.map((img, index) => (
                      <div key={index}>
                        <img
                          src={`http://localhost:5000/uploads/serviceImages/${img}`}
                          alt={service.serviceName}
                          className="slider-image"
                        />
                      </div>
                    ))
                  ) : (
                    <div>
                      <img
                        src="http://localhost:5000/uploads/default/defaultService.jpg"
                        alt="default"
                        className="slider-image"
                      />
                    </div>
                  )}
                </Slider>
              </div>

              <div className="service-body">
                <div className="service-salon-info">
                  <span className="shop-name">
                    {service.ownerId?.ownerShopName || "Elite Salon"}
                  </span>

                  <div className="salon-meta-details">
                    {service.ownerId?.ownerEmail && (
                      <span className="owner-email" title={service.ownerId.ownerEmail}>
                        <FaEnvelope /> {service.ownerId.ownerEmail}
                      </span>
                    )}

                    <span
                      className="service-address"
                      title={`${service.ownerId?.ownerShopStreet || ""}, ${service.ownerId?.ownerShopDistrict || ""}`}
                    >
                      <FaMapMarkerAlt />{" "}
                      {service.ownerId?.ownerShopStreet
                        ? `${service.ownerId.ownerShopStreet}, `
                        : ""}
                      {service.ownerId?.ownerShopDistrict || "Location N/A"}
                    </span>
                  </div>
                </div>

                <h3>{service.serviceName}</h3>

                <p className="desc">{service.serviceDescription}</p>

                <div className="service-meta">
                  <span className="service-duration-badge">
                    <FaClock /> {service.serviceDuration} min
                  </span>
                  <span className="service-price-tag">
                    <FaRupeeSign /> {service.servicePrice}
                  </span>
                </div>

                <div className="service-actions">
                  <button
                    className="book-btn"
                    onClick={() => handleBookNow(service)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEE MORE (ONLY PREVIEW MODE) */}
      {isPreview && (
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <button
            className="view-all-btn"
            onClick={() => navigate("/services")}
          >
            View All Services
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerServices;
