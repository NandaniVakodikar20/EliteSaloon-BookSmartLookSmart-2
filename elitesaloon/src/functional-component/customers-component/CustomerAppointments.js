import React, { useState, useEffect } from "react";
import { FaClock, FaCalendarAlt, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import RescheduleModal from "./RescheduleModal"; 

const CustomerAppointments = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [initialServices, setInitialServices] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 1. Auto-open Modal Logic
  // Jab SelectServices se wapas aayenge, location.state mein 'openReschedule' milega
  useEffect(() => {
    if (location.state?.openReschedule && location.state?.appointmentData) {
      const { appointmentData, selectedServices } = location.state;
      
      setSelectedAppointment(appointmentData);
      setInitialServices(selectedServices || []);
      setShowRescheduleModal(true); // Modal khul jayega

      // State saaf karein taaki refresh karne par modal baar-baar na khule
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // ✅ 2. Fetch All Appointments
  // const fetchAppointments = async () => {
  //   try {
  //     const customerId = localStorage.getItem("customerId");
  //     const res = await axios.get(
  //       `http://localhost:5000/appointment/customer-appointments/${customerId}`
  //     );
  //     setMyAppointments(res.data.appointments || []);
  //   } catch (error) {
  //     console.error("Error fetching appointments:", error);
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
          setMyAppointments(data.appointments || []);
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✅ 3. Cancel Appointment logic
  const handleCancel = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put("http://localhost:5000/customer/cancel-appointment", {
            appointmentId: id,
            status: "CANCELLED",
          });
          Swal.fire("Cancelled!", "Appointment has been cancelled.", "success");
          fetchAppointments();
        } catch (error) {
          Swal.fire("Error", "Could not cancel appointment", "error");
        }
      }
    });
  };

  return (
    <div className="dashboard-content">
     <div className="content-header">
  <h2>My Booking History</h2>

  <button
    className="action-btn-primary"
    onClick={() => navigate("/bookappointment")}
  >
    <FaPlus /> Book Appointment
  </button>
</div>

      <div className="section-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SR NO</th>
                <th>APPOINTMENT DATE</th>
                <th>SERVICES</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th style={{ textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {myAppointments.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>No appointments found</td></tr>
              ) : (
                myAppointments.map((apt, index) => (
                  <tr key={apt._id} className="table-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className="td-info">
                        <span className="main-text"><FaCalendarAlt /> {apt.appointmentDate}</span>
                        <span className="sub-text"><FaClock /> {apt.startTime}</span>
                      </div>
                    </td>
                    <td>
                      <div className="service-tags">
                        {apt.services?.map((s, i) => (
                          <span key={i} className="tag">{s.serviceName}</span>
                        ))}
                      </div>
                    </td>
                    <td className="price-text">₹{apt.totalPrice}</td>
                    <td>
                      <span className={`status-pill ${apt.appointmentStatus?.toLowerCase()}`}>
                        {apt.appointmentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {apt.appointmentStatus !== "CANCELLED" && apt.appointmentStatus !== "COMPLETED" ? (
                        <>
                          <button className="cancel-action-btn" onClick={() => handleCancel(apt._id)}>CANCEL</button>
                          <button
                            className="cancel-action-btn"
                            style={{ marginLeft: "10px", background: "#e6fcf5", color: "#0ca678", border: "1px solid #b2f2bb" }}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setInitialServices(apt.services || []);
                              setShowRescheduleModal(true);
                            }}
                          >
                            RESCHEDULE
                          </button>
                        </>
                      ) : <span className="cancelled-text">No Action</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ CHILD MODAL */}
      {showRescheduleModal && (
        <RescheduleModal
          selectedAppointment={selectedAppointment}
          initialServices={initialServices}
          onClose={() => setShowRescheduleModal(false)}
          fetchAppointments={fetchAppointments}
        />
      )}
    </div>
  );
};

export default CustomerAppointments;