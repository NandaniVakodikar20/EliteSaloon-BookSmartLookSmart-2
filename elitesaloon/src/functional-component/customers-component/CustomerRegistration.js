import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import "react-phone-input-2/lib/style.css";
import "../../components/Form.css";
import { useNavigate } from "react-router-dom";
import useLoader from "../../hooks/useLoader";
import CommonLoader from "../../components/CommonLoader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomerRegistration = () => {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerMobile: "",
    customerGender: "",
    customerDob: "",
    customerStreet: "",
    customerPincode: "",
    customerCity: "",
    customerblock: "",
    customerDistrict: "",
    customerState: "",
    customerUsername: "",
    customerPassword: "",
    customerConfirmPassword: "",
  });

  const { loading, startLoading, stopLoading } = useLoader();

  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showCpwd, setShowCpwd] = useState(false);
  const [postOffices, setPostOffices] = useState([]);

  const navigate = useNavigate();

  /* ================= VALIDATION ================= */

  const validate = () => {
    let err = {};

    if (!form.customerName.trim()) {
      err.customerName = "Customer name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.customerName)) {
      err.customerName = "Name should contain only letters";
    }

    if (!form.customerEmail) {
      err.customerEmail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) {
      err.customerEmail = "Enter valid email";
    }

    if (!form.customerMobile || form.customerMobile.length < 10) {
      err.customerMobileNo = "Valid mobile number required";
    }

    if (!form.customerGender) {
      err.customerGender = "Gender is required";
    }

 if (!form.customerDob) {
  err.customerDob = "Date of birth is required";
} else {
  const today = new Date();
  const birthDate = new Date(form.customerDob);


  if (birthDate > today) {
    err.customerDob = "Future date is not allowed";
  } else {
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

  
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 10) {
      err.customerDob = "Minimum age should be 10 years";
    }

    
    else if (age > 100) {
      err.customerDob = "Invalid age";
    }
  }
}

    if (!form.customerStreet) {
      err.customerStreet = "Street is required";
    }

    if (!form.customerPincode || form.customerPincode.length !== 6) {
      err.customerPincode = "Valid pincode required";
    }

    if (!form.customerblock) {
      err.customerblock = "Village/Block required";
    }

    if (!form.customerUsername) {
      err.customerUsername = "Username is required";
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

    if (!form.customerPassword) {
      err.customerPassword = "Password is required";
    } else if (!strongPassword.test(form.customerPassword)) {
      err.customerPassword =
        "Password must contain uppercase, lowercase, number & special character";
    }

    if (!form.customerConfirmPassword) {
      err.confirmPassword = "Confirm password required";
    } else if (form.customerPassword !== form.customerConfirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    setErrors(err);

    // console.log("Validation Errors:", err);

    return Object.keys(err).length === 0;
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "customerName" && !/^[A-Za-z\s]*$/.test(value)) return;
    if (name === "customerPincode" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    /* PINCODE API */

    if (name === "customerPincode") {
      if (value.length === 6) {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${value}`,
          );

          const data = await res.json();

          if (data[0].Status === "Success") {
            const offices = data[0].PostOffice;

            setPostOffices(offices);

            const first = offices[0];

            setForm((prev) => ({
              ...prev,
              customerDistrict: first?.District || "",
              customerState: first?.State || "",
              customerCity: "",
              customerblock: "",
            }));
          } else {
            setPostOffices([]);

            setForm((prev) => ({
              ...prev,
              customerDistrict: "",
              customerState: "",
              customerCity: "",
              customerblock: "",
            }));

            Swal.fire("Invalid Pincode", "No data found", "error");
          }
        } catch {
          Swal.fire("Error", "Pincode API failed", "error");
        }
      } else {
        setPostOffices([]);

        setForm((prev) => ({
          ...prev,
          customerDistrict: "",
          customerState: "",
          customerCity: "",
          customerblock: "",
        }));
      }
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      Swal.fire("Validation Error", "Please fix all fields", "error");
      return;
    }

    try {
      // FIELD MAPPING FOR BACKEND
      const customer = {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerMobile: form.customerMobile,
        customerGender: form.customerGender,
        customerDOB: form.customerDob,
        customerStreet: form.customerStreet,
        customerPincode: form.customerPincode,
        customerCity: form.customerCity,
        customerBlock: form.customerblock,
        customerDistrict: form.customerDistrict,
        customerState: form.customerState,
        customerUsername: form.customerUsername,
        customerPassword: form.customerPassword,
        customerProfileImage: "default.jpg",
      };

      console.log("customer:", customer);

      if (loading) return; //  prevent double click
      startLoading();

      const response = await fetch("http://localhost:5000/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const data = await response.json();

      const customerEmailReceived = data.customerEmail;

      console.log(
        "Response Email Handle For OTP Confirmaion : " + customerEmailReceived,
      );

      if (response.ok) {
        Swal.fire({
          title: "OTP Sent Successfully",
          text: "OTP Sent Successfully",
          icon: "success",
        }).then(() => {
          sessionStorage.removeItem("otpFlow");

          navigate("/customerotpverify", {
            replace: true,
            state: { customerEmail: customerEmailReceived },
          });
        });
      } else {
        Swal.fire("Registration Failed", data.message || "Try again", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Server Error", "Backend not responding", "error");
    } finally {
      stopLoading(); // ⏹ stop spinner
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <CommonLoader loading={loading} />
      <div className="form-wrapper">
        <FaTimes 
  className="close-btn"
  onClick={() => navigate(-1)}
/>
        <h2>EliteSalon Customer Registration</h2>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL DETAILS */}

          <div className="form-section">
            <h3>Personal Details</h3>

            <div className="form-grid">
              <div className="form-group">
                  <label>Customer Name</label>
                <input
                  name="customerName"
                  placeholder="Customer Name"
                  value={form.customerName}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.customerName}</small>
              </div>

              <div className="form-group">
                  <label>Email Address</label>
                <input
                  name="customerEmail"
                  placeholder="Email"
                  value={form.customerEmail}
                  onChange={handleChange}
                />
                <small className="error-text">{errors.customerEmail}</small>
              </div>

              <div className="form-group">
                 <label>Mobile Number</label>
                <PhoneInput
                  country="in"
                  value={form.customerMobile}
                  onChange={(phone) =>
                    setForm((prev) => ({
                      ...prev,
                      customerMobile: phone,
                    }))
                  }
                />
                <small className="error-text">{errors.customerMobileNo}</small>
              </div>

              <div className="form-group">
                 <label>Gender</label>
                <select
                  name="customerGender"
                  value={form.customerGender}
                  onChange={handleChange}
                >
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <small className="error-text">{errors.customerGender}</small>
              </div>

              <div className="form-group">
                 <label>Date of Birth</label>
             <DatePicker
  selected={form.customerDob ? new Date(form.customerDob) : null}
  onChange={(date) =>
    setForm((prev) => ({
      ...prev,
      customerDob: date,
    }))
  }
  dateFormat="dd/MM/yyyy"
  placeholderText="Select Date of Birth"
  maxDate={new Date()}
  showYearDropdown
  scrollableYearDropdown
  yearDropdownItemNumber={80}
  className="custom-date-input"
/>
                <small className="error-text">{errors.customerDob}</small>
              </div>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="form-section">
            <h3>Address</h3>

            <div className="form-grid">
              
              <input
                name="customerStreet"
                placeholder="Street"
                value={form.customerStreet}
                onChange={handleChange}
              />
              <small className="error-text">{errors.customerStreet}</small>

              <input
                name="customerPincode"
                placeholder="Pincode"
                maxLength="6"
                value={form.customerPincode}
                onChange={handleChange}
              />

              <select
                name="customerblock"
                value={form.customerblock}
                onChange={(e) => {
                  const selectedPO = postOffices.find(
                    (po) => po.Name === e.target.value,
                  );

                  if (!selectedPO) return;

                  setForm((prev) => ({
                    ...prev,
                    customerblock: selectedPO.Name,
                    customerCity: selectedPO.Block,
                    customerDistrict: selectedPO.District,
                    customerState: selectedPO.State,
                  }));
                }}
              >
                <option value="">Select Village / Block</option>
                {postOffices.map((po, index) => (
                  <option key={index} value={po.Name}>
                    {po.Name}
                  </option>
                ))}
              </select>

              <input value={form.customerCity} readOnly />
              <input value={form.customerDistrict} readOnly />
              <input value={form.customerState} readOnly />
            </div>
          </div>

          {/* CREDENTIALS */}

          <div className="form-section">
            <h3>Credentials</h3>

            <div className="form-grid">
              <div className="form-group">
                  <label>Username</label>
                <input
                  name="customerUsername"
                  placeholder="Username"
                  value={form.customerUsername}
                  onChange={handleChange}
                />

                <small className="error-text">{errors.customerUsername}</small>
              </div>

              <div className="password-group">
                 <label>Password</label>
                <input
                  type={showPwd ? "text" : "password"}
                  name="customerPassword"
                  placeholder="Password"
                  value={form.customerPassword}
                  onChange={handleChange}
                />

                <span onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </span>

                <small className="error-text">{errors.customerPassword}</small>
              </div>

              <div className="password-group">
                  <label>Confirm Password</label>
                <input
                  type={showCpwd ? "text" : "password"}
                  name="customerConfirmPassword"
                  placeholder="Confirm Password"
                  value={form.customerConfirmPassword}
                  onChange={handleChange}
                />

                <span onClick={() => setShowCpwd(!showCpwd)}>
                  {showCpwd ? <FaEyeSlash /> : <FaEye />}
                </span>

                <small className="error-text">{errors.confirmPassword}</small>
              </div>
            </div>
          </div>

          <button className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Please wait...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default CustomerRegistration;
