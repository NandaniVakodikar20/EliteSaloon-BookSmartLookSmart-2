import React, { useEffect, useState } from "react";
import "./CustomerDashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


const CustomerBookingForm = () => {
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [prevSalonId, setPrevSalonId] = useState("");
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    salonId: "",
    serviceId: [],
    staffId: "",
    date: "",
    time: "",
  });

  // const customer = JSON.parse(localStorage.getItem("customer"));
//   const customerPincode = customer?.customerPincode;

//   const customerData = location.state?.customer;

// const pincode = customer?.customerPincode
//   ? Number(customer.customerPincode)
//   : customerData?.customerPincode
//     ? Number(customerData.customerPincode)
//     : "";
//   console.log("Customer Pincode:", pincode);

  //serive
  useEffect(() => {
    if (location.state?.selectedServices) {
      setSelectedServices(location.state.selectedServices);
    }

    if (location.state?.salonId) {
      setForm((prev) => ({ ...prev, salonId: location.state.salonId }));
      setPrevSalonId(location.state.salonId);
    }
  }, [location.state?.selectedServices, location.state?.salonId]); // ✅ stable

  // ===============================
  // ✅ FETCH SALONS
  // ===============================
  useEffect(() => {

    const location = localStorage.getItem("customerLocation");


    const fetchSalons = async () => {
      try {

          if(location){
            const parsedLocation = JSON.parse(location);
            const latitude = Number(parsedLocation.latitude);
            const longitude = Number(parsedLocation.longitude);
            
            if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
              console.error("Invalid customer coordinates.");
              return;
            }

              const response = await fetch("http://localhost:5000/customer/nearby-salons", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Server error: ${response.status}`
              );
            }

            const data = await response.json();
            console.log("Nearby Salon Product:", data);
            console.log("Id Print :",data.owners.map(owner => owner._id));
            setSalons(data.owners || []);
            
        }else{

            setLocationLoading(true);

    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     const latitude = position.coords.latitude;
    //     const longitude = position.coords.longitude;

    //     console.log("***CUSTOMER LOCATION On Dshboard***");
    //     console.log("Latitude:", latitude);
    //     console.log("Longitude:", longitude);
       
    //     // Save location in localStorage
    //     localStorage.setItem(
    //       "customerLocation",
    //       JSON.stringify({
    //         latitude: latitude,
    //         longitude: longitude,
    //       })
    //     );

    //     setLocationLoading(false);
    //     setShowLocationPrompt(false);
    //   },

    //   (error) => {
    //     console.error("Location Error:", error);

    //     setLocationLoading(false);

    //     if (error.code === 1) {
    //       console.log("Customer denied location permission.");
    //     } else if (error.code === 2) {
    //       console.log("Location information is unavailable.");
    //     } else if (error.code === 3) {
    //       console.log("Location request timed out.");
    //     }
    //   },

    //   {
    //     enableHighAccuracy: true,
    //     timeout: 10000,
    //     maximumAge: 0,
    //   }
    // );
              // console.log("Customer location not found . get salons by pincode");
              // const res = await fetch(
              //   `http://localhost:5000/appointment/get-salon/${pincode}`,
              // );

              // const data = await res.json();

              // console.log("Saloons Available :", data);
              // setSalons(data.data || []);


              // if (data.success) {
              //   setSalons(data.data);
              // } else {
              //   setSalons([]);
              // }

        }

      } catch (err) {
        console.log("Salon fetch error:", err);
        setSalons([]);
      }
    };

    fetchSalons();
  }, []);

  // ===============================
  // FETCH SERVICES + STAFF
  // ===============================

  useEffect(() => {
    // ✅ Run only when salon actually changes
    if (form.salonId) {
      // ✅ Reset only if salon really changed by user
      if (
        prevSalonId &&
        form.salonId !== prevSalonId &&
        selectedServices.length === 0
      ) {
        setServices([]);
        setStaff([]);
        setSelectedServices([]);
        setForm((prev) => ({
          ...prev,
          serviceId: [],
          staffId: "",
          time: "",
        }));
      }

      // console.log("Salon Id :", form.salonId);
      //  console.log("Salon :", form);
      const fetchData = async () => {
        try {

          console.log();
          // 👉 Fetch Services
          const serviceResponse = await fetch(
            `http://localhost:5000/owner/allservices/${form.salonId}`,
          );
          const serviceData = await serviceResponse.json();

          console.log("Get Services:", serviceData);
          setServices(serviceData.services || []);

          // 👉 Fetch Staff (same pattern)
          const staffResponse = await fetch(
            `http://localhost:5000/owner/staff-list/${form.salonId}`,
          );
          const staffData = await staffResponse.json();

          //   console.log("Get Staff:", staffData);
          // console.log("Get Staff:", JSON.stringify(staffData, null, 2));
          //   setStaff(staffData || []);
          setStaff(staffData.staff || []);
        } catch (err) {
          console.log("Fetch error:", err);
          setServices([]);
          setStaff([]);
        }
      };

      fetchData();

      
      setPrevSalonId(form.salonId);
    }
  }, [form.salonId]); 

  //slote
  useEffect(() => {
    setTimeSlots([]);
  }, [selectedServices]);

  // ===============================
  // FETCH SLOTS
  // ===============================

  useEffect(() => {
    if (form.staffId && form.date && selectedServices.length > 0) {
      setTimeSlots([]);

      fetch("http://localhost:5000/appointment/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  
          staffId: form.staffId,
          date: form.date,
          serviceIds: selectedServices.map((s) => s._id), // multiple services
        }),
      })
        .then((res) => res.json())
        .then((data) => setTimeSlots(data.availableSlots || []))
        .catch(() => setTimeSlots([]));
    }
  }, [form.staffId, form.date, selectedServices]);
  // ===============================
  // INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //   const onPrint = () => {
  //     console.log("Enterd Data :", form);
  //   };

  // ===============================
  // BOOK APPOINTMENT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    //validation
    if (
      !form.salonId ||
      !form.staffId ||
      selectedServices.length === 0 ||
      !form.date ||
      !form.time
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields and select at least one service",
      });
      return;
    }

    // 🔥 Customer ID fetch and safety check
    const customerId = localStorage.getItem("customerId");

    if (!customerId || customerId === "null" || customerId === "undefined") {
      Swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Booking ke liye kripya login karein ya apna account check karein.",
      });
      return;
    }

    // ✅ Updated: Only send serviceIds array to backend
    const appointmentDetails = {
      customerId: customerId,
      ownerId: form.salonId,
      staffId: form.staffId,
      serviceIds: selectedServices.map((s) => s._id),
      date: form.date,
      startTime: form.time,
    };

    console.log("FINAL DATA TO SEND:", appointmentDetails);

    try {
      const res = await fetch("http://localhost:5000/appointment/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentDetails),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Appointment Booked 🎉",
          text: "Your appointment has been successfully booked!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/customerdashboard", {
            state: { activeSection: "bookappointments" },
          });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: data.message || "Something went wrong, please try again.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="booking-modal">
      <div className="booking-card wide">
        <div className="card-header">
          <button className="back-arrow" onClick={() => navigate(-1)}>
            ← <span>Back</span>
          </button>
          <h2>Book Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="profile-form grid-form"></form>

        <form onSubmit={handleSubmit} className="profile-form grid-form">
          {/* Salon */}
          <div className="form-group">
            <label>Select Salon</label>
            <select
              name="salonId"
              value={form.salonId}
              onChange={handleChange}
              required
            >
              <option value="">Select Salon</option>
              {salons.length > 0 ? (
                salons.map((s) => (
                  <option key={s.ownerId} value={s.ownerId}>
                    {s.ownerShopName} - {s.ownerName}
                  </option>
                ))
              ) : (
                <option disabled>No salons found</option>
              )}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Select Services</label>

            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                if (!form.salonId) {
                  Swal.fire({
                    icon: "warning",
                    title: "Select Salon First",
                    text: "Please select a salon before choosing services",
                  });
                  return;
                }

                navigate("/selectservices", {
                  state: {
                    salonId: form.salonId,
                    selectedServices,
                  },
                });
              }}
            >
              Choose Services ({selectedServices.length})
            </button>

            {/* ✅ Selected Services Summary */}
            {selectedServices.length > 0 && (
              <div
                className="selected-services-summary"
                style={{ padding: "10px", gap: "8px" }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {selectedServices.map((s) => (
                    <div
                      key={s._id}
                      className="selected-item"
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      {s.serviceName}
                    </div>
                  ))}
                </div>
                <div
                  className="total"
                  style={{ fontSize: "14px", marginTop: "5px" }}
                >
                  Total: ₹
                  {selectedServices.reduce((sum, s) => sum + s.servicePrice, 0)}
                </div>
              </div>
            )}
          </div>

          {/* Staff */}
          <div className="form-group">
            <label>Select Staff</label>
            <select
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              required
              disabled={selectedServices.length === 0}
            >
              <option value="">Select Staff</option>
              {staff.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.staffName}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Select Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                if (!date) return;

                // Local date banate hain jo backend expect kar raha hai
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const formattedDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD

                setSelectedDate(date);
                setForm({ ...form, date: formattedDate, time: "" });
              }}
              minDate={new Date()}
              placeholderText="Select Date"
              className="custom-datepicker"
              dateFormat="dd/MM/yyyy"
              withPortal // ✅ FIX jump issue
            />
          </div>

          {/* Time Slots */}
          <div className="form-group full-width">
            <label>Select Time Slot</label>
            <select
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            >
              <option value="">Select Time</option>
              {timeSlots.map((t, i) => (
                <option key={i} value={t.startTime}>
                  {t.startTime} - {t.endTime}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions full-width">
            {/* <button className="btn-primary" onClick={onPrint}>  */}
            <button className="btn-primary">Book Appointment</button>
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate("/customerdashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerBookingForm;
