import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate} from "react-router-dom";

const CustomerProfile = ({ customer, setCustomer }) => {

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

   if (!token) {
    navigate("/unauthorized");
   }

  // ================= STATE =================
  const [formData, setFormData] = useState({
    name: customer.customerName || "",
    email: customer.customerEmail || "",
    phone: customer.customerMobile || "",
    customerProfileImage: customer.customerProfileImage || "",

    street: customer.customerStreet || "",
    pincode: customer.customerPincode || "",
    block: customer.customerBlock || "",
    city: customer.customerCity || "",
    district: customer.customerDistrict || "",
    state: customer.customerState || "",
  });

 


  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.customerName || "",
        email: customer.customerEmail || "",
        phone: customer.customerMobile || "",
        customerProfileImage: customer.customerProfileImage || "",
        street: customer.customerStreet || "",
        pincode: customer.customerPincode || "",
        block: customer.customerBlock || "",
        city: customer.customerCity || "",
        district: customer.customerDistrict || "",
        state: customer.customerState || "",
      });
    }
  }, [customer]);

  const [postOffices, setPostOffices] = useState([]);

useEffect(() => {
  if (formData.pincode && formData.pincode.length === 6) {
    fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data[0].Status === "Success") {
          setPostOffices(data[0].PostOffice);
        }
      })
      .catch(() => {
        console.log("Pincode fetch failed");
      });
  }
}, [formData.pincode]);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "pincode" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // PINCODE API
    if (name === "pincode") {
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

            setFormData((prev) => ({
              ...prev,
              district: first?.District || "",
              state: first?.State || "",
              city: "",
              block: "",
            }));
          } else {
            setPostOffices([]);

            setFormData((prev) => ({
              ...prev,
              district: "",
              state: "",
              city: "",
              block: "",
            }));

            Swal.fire("Invalid Pincode", "No data found", "error");
          }
        } catch {
          Swal.fire("Error", "Pincode API failed", "error");
        }
      } else {
        setPostOffices([]);

        setFormData((prev) => ({
          ...prev,
          district: "",
          state: "",
          city: "",
          block: "",
        }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= IMAGE CLICK =================
  const handleImageClick = () => {
    document.getElementById("imageUpload").click();
  };

  // ================= IMAGE UPLOAD =================
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImg = new FormData();
    formDataImg.append("customerProfileImage", file);
    formDataImg.append("customerEmail", customer.customerEmail);
    try {
      const res = await axios.post(
        "http://localhost:5000/customer/uploadprofile",
        formDataImg,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.status === 200) {
       const imageUrl = res.data.customerProfileImage;

        setFormData((prev) => ({ ...prev, avatar: imageUrl }));
        setCustomer((prev) => ({
          ...prev,
          customerProfileImage: imageUrl,
        }));
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Image upload failed",
      });
    }
  };

 const validateProfile = () => {
  // Name
  if (!formData.name.trim()) {
    Swal.fire("Error", "Full Name is required", "error");
    return false;
  }

  if (formData.name.length < 3) {
    Swal.fire("Error", "Name must be at least 3 characters", "error");
    return false;
  }

  // Email
  if (!formData.email.trim()) {
    Swal.fire("Error", "Email is required", "error");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    Swal.fire("Error", "Enter valid email", "error");
    return false;
  }

  // Phone (FIXED 🔥)
  const phone = formData.phone.slice(-10);

  if (!/^\d{10}$/.test(phone)) {
    Swal.fire("Error", "Enter valid 10-digit phone number", "error");
    return false;
  }

  if (!/^[6-9]/.test(phone)) {
    Swal.fire("Error", "Phone must start from 6–9", "error");
    return false;
  }

  // Street
  if (!formData.street.trim()) {
    Swal.fire("Error", "Street is required", "error");
    return false;
  }

  // Pincode
  if (!/^\d{6}$/.test(formData.pincode)) {
    Swal.fire("Error", "Enter valid 6-digimmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmt pincode", "error");
    return false;
  }

  // Block
  if (!formData.block.trim()) {
    Swal.fire("Error", "Please select block", "error");
    return false;
  }

  // City
  if (!formData.city.trim()) {
    Swal.fire("Error", "City is required", "error");
    return false;
  }

  // District
  if (!formData.district.trim()) {
    Swal.fire("Error", "District is required", "error");
    return false;
  }

  // State
  if (!formData.state.trim()) {
    Swal.fire("Error", "State is required", "error");
    return false;
  }

  return true;
};
  // ================= PROFILE UPDATE =================
  const handleSubmit = async (e) => {
    
     if (!token) {
    navigate("/unauthorized");
    return;
   }

    e.preventDefault();

    if (!validateProfile()) return;
    if (!formData.email.trim()) {
      Swal.fire("Error", "Email is required", "error");
      return;
    }

    try {
      setLoading(true);
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.put(
        `http://localhost:5000/customer/update-profile`,
        {
          customerName: formData.name,
          customerEmail: formData.email,
          customerMobile: formData.phone,

          customerStreet: formData.street,
          customerPincode: formData.pincode,
          customerBlock: formData.block,
          customerCity: formData.city,
          customerDistrict: formData.district,
          customerState: formData.state,
        },    
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        console.log("Successful Profile Update Response:", res.data);
        setCustomer(res.data.data);
      }else if (res.status === 401) {
        console.log("Unauthorized access. Redirecting to /unauthorized.");
        localStorage.removeItem("token");
        navigate("/unauthorized");
        return;
      }

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Profile update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= PASSWORD UPDATE =================

  const validatePassword = () => {
    if (!passwordData.currentPassword) {
      Swal.fire("Error", "Current password required", "error");
      return false;
    }

    if (!passwordData.newPassword) {
      Swal.fire("Error", "New password required", "error");
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters", "error");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return false;
    }

    return true;
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const res = await axios.post(
        `http://localhost:5000/customer/change-password`,
        passwordData,
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
      }
      );
      Swal.close();
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }else if (res.status === 401) {
        console.log("Unauthorized access. Redirecting to /unauthorized.");
        localStorage.removeItem("token");
        navigate("/unauthorized");
        return;
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Password update failed",
      });
    }
  };

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Profile Settings</h2>
      </div>

      <div className="profile-section">
        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={
                !formData.customerProfileImage ||
                formData.customerProfileImage === "default/defaultProfile.png"
                  ? "http://localhost:5000/uploads/default/defaultProfile.png"
                  : `http://localhost:5000/uploads/customerProfile/${formData.customerProfileImage}`
              }
              alt="profile"
              className="profile-avatar"
              onClick={handleImageClick}
              style={{ cursor: "pointer" }}
            />

            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <h3 className="section-title">Personal Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  readOnly
                  value={formData.email}
                  onChange={handleChange}
                  style={{ background: "#f5f5f5", cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <PhoneInput
                  country="in"
                  value={formData.phone}
                  countryCodeEditable={false}
                  onChange={(phone) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone,
                    }))
                  }
                />
              </div>
            </div>

            <h3 className="section-title">Address</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Street</label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Block</label>
                <select
                  name="block"
                  value={formData.block}
                  onChange={(e) => {
                    const selectedPO = postOffices.find(
                      (po) => po.Name === e.target.value,
                    );

                    if (!selectedPO) return;

                    setFormData((prev) => ({
                      ...prev,
                      block: selectedPO.Name,
                      city: selectedPO.Block,
                      district: selectedPO.District,
                      state: selectedPO.State,
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
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  value={formData.city}
                  readOnly
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>District</label>
                <input
                  name="district"
                  value={formData.district}
                  readOnly
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  value={formData.state}
                  readOnly
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  setFormData({
                    name: customer.customerName || "",
                    email: customer.customerEmail || "",
                    phone: customer.customerMobile || "",
                    avatar: customer.customerProfileImage || "",

                    street: customer.customerStreet || "",
                    pincode: customer.customerPincode || "",
                    block: customer.customerBlock || "",
                    city: customer.customerCity || "",
                    district: customer.customerDistrict || "",
                    state: customer.customerState || "",
                  })
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* PASSWORD */}
        <div className="profile-card">
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <h3 className="section-title">Change Password</h3>

            <div className="form-group password-field">
              <label>Current Password</label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />

                <span
                  onClick={() =>
                    setShowPassword((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group password-field">
                <label>New Password</label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />

                  <span
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="form-group password-field">
                <label>Confirm Password</label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />

                  <span
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
