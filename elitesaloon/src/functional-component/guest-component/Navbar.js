import React, { useState, useEffect, useRef } from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { FaSearch, FaUser, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const [showServices, setShowServices] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef(); 

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to redirect any sub-service click straight to booking action
  const handleServiceClick = () => {
    setMobileMenuOpen(false);
    setShowServices(false);
    navigate("/", { state: { scrollTo: "services" } });
  };

  return (
    <>
      {/* ===== TOP STRIP ===== */}
      <div className="top-strip">
        <div className="top-strip-content">
          <span>Welcome To EliteSalon</span>
          <div className="top-strip-contact">
            <p>elitesaloon18@gmail.com</p>
          </div>
        </div>
      </div>

      {/* ===== MAIN NAVBAR ===== */}
      <nav className="main-navbar">
        {/* BRAND LOGO */}
        <div className="brand">
          <Link to="/" className="brand-text">
            Elite<span className="brand-highlight">Salon</span>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <ul className={`menu ${mobileMenuOpen ? "menu-open" : ""}`}>
          <li
            className={isActive("/") && !location.state?.scrollTo ? "active" : ""}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/", { state: { scrollTo: "home" } });
            }}
          >
            <Link to="/">Home</Link>
          </li>

          <li
            className={`menu-item ${showServices ? "dropdown-active" : ""}`}
            onMouseEnter={() => setShowServices(true)}
            onMouseLeave={() => setShowServices(false)}
          >
            <span
              className="menu-link"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/", { state: { scrollTo: "services" } });
              }}
            >
              Services <FaChevronDown className="dropdown-arrow-icon" />
            </span>

            {showServices && (
              <div className="dropdown">
                <div className="dropdown-column">
                  <h4>For Her</h4>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Hair Styling</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Hair Coloring</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Facial Treatment</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Manicure & Pedicure</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Body Spa</span>
                </div>

                <div className="dropdown-column">
                  <h4>For Him</h4>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Haircut & Styling</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Beard Styling</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Hair Coloring</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Facial Treatment</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Body Massage</span>
                  <span className="dropdown-item-text" onClick={handleServiceClick}>Beard Shave</span>
                </div>

                <div className="dropdown-column dropdown-image">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"
                    alt="Salon Premium Services Panel View"
                  />
                  <Link to="/customerlogin" className="dropdown-cta">
                    Book Appointment
                  </Link>
                </div>
              </div>
            )}
          </li>

          <li 
            className={location.state?.scrollTo === "products" ? "active" : ""}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/", { state: { scrollTo: "products" } });
            }}
          >
            <span className="menu-link">Product</span>
          </li>

          {/* 🔥 NEW: ABOUT US SECTION LINK DISPATCHER */}
          <li 
            className={location.state?.scrollTo === "about" ? "active" : ""}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/", { state: { scrollTo: "about" } });
            }}
          >
            <span className="menu-link">About Us</span>
          </li>

          {/* 🔥 NEW: CONTACT US SECTION LINK DISPATCHER */}
          <li 
            className={location.state?.scrollTo === "contact" ? "active" : ""}
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/", { state: { scrollTo: "contact" } });
            }}
          >
            <span className="menu-link">Contact Us</span>
          </li>
        </ul>

        {/* SYSTEM CONTROL TARGETS */}
        <div className="right-section">
          
          {/* CAPSULE PROFILE TRIGGERS */}
          <div className="account-wrapper" ref={accountRef}>
            <button 
              className="login-trigger-btn"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <FaUser style={{ fontSize: "12px" }} />
              <span>Login </span>
            </button>

            {showAccountMenu && (
              <div className="account-dropdown">
                <Link to="/adminlogin" onClick={() => setShowAccountMenu(false)}>Admin Login</Link>
                <Link to="/customerlogin" onClick={() => setShowAccountMenu(false)}>Customer Login</Link>
                <Link to="/ownerlogin" onClick={() => setShowAccountMenu(false)}>Owner Login</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation map layer"
          > 
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;