import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomerServices from "./CustomerServices";

import CustomerProducts from "./CustomerProducts";

import {
  FaCalendarAlt,
  FaCheck,
  FaStar,
  FaRupeeSign,
   FaHourglassHalf,
  FaPlus,
  FaClock,
} from "react-icons/fa";

const CustomerOverview = ({ customer, navigate, setActiveSection }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // const fetchAppointments = async () => {
    //   try {
    //     const customerId = localStorage.getItem("customerId");

    //     const res = await axios.get(
    //       `http://localhost:5000/appointment/customer-appointments/${customerId}`,
    //     );

    //     setAppointments(res.data.appointments || []);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };

     const fetchAppointments = async () => {

    const token = localStorage.getItem("token");
   
    if (!token) {
        navigate("/unauthorized");
        return;
    }

    fetch("http://localhost:5000/appointment/customer-appointments", {
       method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(async response => {

        const data = await response.json();
        console.log("Protected Appointment API Response:", data);
        console.log("Protected Appointment API Response:", response.status);
        if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/unauthorized");
            return;
        }
        
        console.log("Appointment API Response:", data);
        if(data.appointments != null){
           setAppointments(data.appointments || []);
          // setMyAppointments(data.appointments || []);
          // setLoading(false);    
        }

        return data;

    })
    .catch(error => {
        console.error(error);
        // setLoading(false);
        navigate("/error");
    });

  };
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter(
    (a) => a.appointmentStatus?.toLowerCase() === "confirmed",
  );

  const completed = appointments.filter(
    (a) => a.appointmentStatus?.toLowerCase() === "completed",
  );

  const pending = appointments.filter(
    (a) => a.appointmentStatus?.toLowerCase() === "pending",
  );

  const totalSpent = appointments.reduce(
  (sum, a) => sum + (a.totalPrice || 0),
  0
);
  return (
    <div className="dashboard-content">
      {/* ✅ Header with Button */}
      <div
        className="content-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px", //
        }}
      >
        <h2 style={{ margin: 0 }}>
          Welcome back, {customer?.customerName || "User"}!
        </h2>

        <button
          className="action-btn-primary"
          onClick={() =>
            navigate("/bookappointment", {
              state: {
                customerPincode: customer?.customerPincode || "",
              },
            })
          }
        >
          <FaPlus /> Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <span className="stat-value">{upcoming.length}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheck />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completed.length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            < FaHourglassHalf />
          </div>

          <div className="stat-info">
            <span className="stat-value">{pending.length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
  <div className="stat-icon points">
    <FaRupeeSign />
  </div>

  <div className="stat-info">
    <span className="stat-value">₹{totalSpent}</span>
    <span className="stat-label">Total Spent</span>
  </div>
</div>
      </div>

      {/* Upcoming Appointments */}
      <div className="section-card">
        <div className="section-header">
          <h3>Upcoming Appointments</h3>
          <button
            className="view-all-btn"
            onClick={() => setActiveSection("bookappointments")}
          >
            View All
          </button>
        </div>

        <div className="appointments-list">
          {upcoming.length > 0 ? (
            upcoming.slice(0, 2).map((apt) => (
              <div key={apt._id} className="appointment-item">
                <div className="appointment-info">
                  <h4>{apt.services?.map((s) => s.serviceName).join(", ")}</h4>

                  <div className="appointment-details">
                    <span>
                      <FaCalendarAlt /> {apt.appointmentDate}
                    </span>
                    <span>
                      <FaClock /> {apt.startTime} - {apt.endTime}
                    </span>
                  </div>
                </div>

                <div className="appointment-actions">
                  <span className="appointment-price">₹{apt.totalPrice}</span>
                  <span className="status-badge upcoming">Upcoming</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">
              No appointments yet 😔 <br />
              Book your first appointment!
            </p>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Popular Services</h3>

          <button
            className="view-all-btn"
            onClick={() => setActiveSection("services")}
          >
            See More
          </button>
        </div>

        <CustomerServices customer={customer} isPreview={true} />
      </div>
      {/* Products Preview */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recommended Products</h3>

          <button
            className="view-all-btn"
            onClick={() => setActiveSection("products")}
          >
            See More
          </button>
        </div>

        <CustomerProducts customer={customer} isPreview={true} />
      </div>
    </div>
  );
};

export default CustomerOverview;
