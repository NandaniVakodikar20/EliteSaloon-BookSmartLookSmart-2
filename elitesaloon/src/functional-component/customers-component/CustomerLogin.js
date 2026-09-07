import React, { useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash,FaTimes  } from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../../components/Form.css";
import useLoader from "../../hooks/useLoader";
import CommonLoader from "../../components/CommonLoader";

const CustomerLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerUsername: "",
    customerPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  const { loading, startLoading, stopLoading } = useLoader();

  const validate = () => {
    let err = {};

    if (!form.customerUsername) {
      err.customerUsername = "Username is required";
    }

    if (!form.customerPassword) {
      err.customerPassword = "Password is required";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please fix the errors",
      });

      return;
    }

    try {
      startLoading();

      const response = await fetch("http://localhost:5000/customer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerUsername: form.customerUsername,
          customerPassword: form.customerPassword,
        }),
      });

      const data = await response.json();
      
      const token = jwtDecode(data.token);
      const customerUsername = token.customerUsername;
      // console.log("Customer Data:", customer);

      // console.log("Find customer :", data.message);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        // localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("customerId", token.customerId);
        // localStorage.setItem("customer", JSON.stringify(customer));

       await Swal.fire({
  icon: "success",
  title: "Login Successful 🎉",
  text: "Welcome " + customerUsername,
  confirmButtonText: "Continue",
});

console.log("Login Success:", token.customerUsername);

navigate("/customerdashboard", {
  replace: true,
});
        // navigate("/customerdashboard", { state: { customer }, replace: true  });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect to server",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="form-wrapper login-wrapper">
      <CommonLoader loading={loading} />
<FaTimes 
  className="close-btn"
  onClick={() => navigate(-1)}
/>
      <h2>EliteSalon Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Account Login</h3>

          <div className="form-group">
            <input
              type="text"
              name="customerUsername"
              placeholder="Username"
              value={form.customerUsername}
              onChange={handleChange}
            />

            <small className="error-text">{errors.customerUsername}</small>
          </div>

          <div className="form-group password-field">
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

          <div className="forgot-link">
            <span onClick={() => navigate("/forgotpassword")}>
              Forgot Password?
            </span>
          </div>
        </div>

        <button className="submit-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="form-links">
        Don’t have an account?{" "}
        <span onClick={() => navigate("/customerregister")}>Register</span>
      </div>
    </div>
  );
};

export default CustomerLogin;
