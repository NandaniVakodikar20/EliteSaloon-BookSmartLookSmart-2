import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaShoppingBag,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserCheck,
} from "react-icons/fa";
import "../../css/CustomerCheckout.css";

const CustomerCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isBuyNow = Boolean(location.state?.buyNow);
  const buyNowProduct = location.state?.product;
  const buyNowQty = location.state?.quantity || 1;

  // Items to checkout
  const [items] = useState(() => {
    if (isBuyNow && buyNowProduct) {
      return [{ ...buyNowProduct, quantity: buyNowQty }];
    }
    if (location.state?.items) {
      return location.state.items;
    }
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [customer, setCustomer] = useState(null);

  const getCustomerId = () => {
    let id = localStorage.getItem("customerId") || customer?._id;
    if (!id) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          id = decoded.customerId;
        } catch {
          // ignore
        }
      }
    }
    return id || "";
  };

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Address Form State
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerMobile: "",
    customerStreet: "",
    customerCity: "",
    customerDistrict: "",
    customerState: "",
    customerPincode: "",
  });

  const [errors, setErrors] = useState({});

  // 1. Authenticate & Fetch Profile
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to proceed with checkout.",
        confirmButtonColor: "#800020",
      }).then(() => {
        navigate("/customerlogin", { state: { returnUrl: "/checkout" } });
      });
      return;
    }

    const fetchCustomerProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get("http://localhost:5000/customer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.customer) {
          const c = res.data.customer;
          setCustomer(c);
          setForm({
            customerName: c.customerName || "",
            customerEmail: c.customerEmail || "",
            customerMobile: c.customerMobile || "",
            customerStreet: c.customerStreet || "",
            customerCity: c.customerCity || "",
            customerDistrict: c.customerDistrict || "",
            customerState: c.customerState || "",
            customerPincode: c.customerPincode ? String(c.customerPincode) : "",
          });
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchCustomerProfile();
  }, [navigate]);

  // Price calculations
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.productPrice) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  const shipping = subtotal >= 500 || items.length === 0 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const grandTotal = Math.round(subtotal + shipping + tax);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.customerName.trim()) newErrors.customerName = "Name is required";
    if (!form.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.customerEmail)) {
      newErrors.customerEmail = "Invalid email address";
    }

    if (!form.customerMobile.trim()) {
      newErrors.customerMobile = "Phone number is required";
    } else if (form.customerMobile.length < 10) {
      newErrors.customerMobile = "Enter a valid 10-digit mobile number";
    }

    if (!form.customerStreet.trim()) newErrors.customerStreet = "Street address is required";
    if (!form.customerCity.trim()) newErrors.customerCity = "City is required";
    if (!form.customerState.trim()) newErrors.customerState = "State is required";
    if (!form.customerPincode.trim()) {
      newErrors.customerPincode = "Pincode is required";
    } else if (form.customerPincode.length < 6) {
      newErrors.customerPincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Payment Execution using existing Razorpay
  const handleProceedPayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Required Fields Missing",
        text: "Please fill in all shipping details correctly.",
        confirmButtonColor: "#800020",
      });
      return;
    }

    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Checkout",
        text: "You have no products to purchase.",
        confirmButtonColor: "#800020",
      });
      return;
    }

    if (!window.Razorpay) {
      Swal.fire({
        icon: "error",
        title: "Payment Gateway Error",
        text: "Razorpay Checkout script could not be loaded. Please check your network and refresh.",
        confirmButtonColor: "#800020",
      });
      return;
    }

    try {
      setSubmittingPayment(true);

      // Step 1: Create Product Order on backend with Authoritative Pricing
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId || item._id,
          quantity: item.quantity || 1,
          productName: item.productName,
        })),
        customerId: getCustomerId(),
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerMobile: form.customerMobile,
        shippingAddress: {
          street: form.customerStreet,
          city: form.customerCity,
          district: form.customerDistrict || form.customerCity,
          state: form.customerState,
          pincode: form.customerPincode,
        },
      };

      const token = localStorage.getItem("token");
      const { data: orderRes } = await axios.post(
        "http://localhost:5000/payment/create-product-order",
        orderPayload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || "Failed to create payment order");
      }

      // Step 2: Open Razorpay Checkout modal
      const options = {
        key: "rzp_test_SPZsgkIqFM9JER",
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "EliteSalon",
        description: `Order Payment #${orderRes.orderNumber}`,
        order_id: orderRes.orderId,
        prefill: {
          name: form.customerName,
          email: form.customerEmail,
          contact: form.customerMobile,
        },
        notes: {
          dbOrderId: orderRes.dbOrderId,
          orderNumber: orderRes.orderNumber,
        },
        theme: {
          color: "#800020",
        },
        handler: async function (response) {
          try {
            // Step 3: Authoritative HMAC SHA256 Signature Verification on Backend
            const verifyPayload = {
              dbOrderId: orderRes.dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await axios.post(
              "http://localhost:5000/payment/verify-product-payment",
              verifyPayload
            );

            if (verifyRes.data?.success) {
              // If purchased from cart, clean cart
              if (!isBuyNow) {
                localStorage.removeItem("cart");
              }

              await Swal.fire({
                icon: "success",
                title: "Payment Confirmed! 🎉",
                text: `Your order ${orderRes.orderNumber} has been placed successfully.`,
                confirmButtonColor: "#800020",
              });

              // Navigate to Order Confirmation Page
              navigate("/order-confirmation", {
                state: {
                  order: verifyRes.data.order,
                },
                replace: true,
              });
            } else {
              throw new Error(verifyRes.data?.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Payment Verification Error:", verifyErr);
            Swal.fire({
              icon: "error",
              title: "Verification Problem",
              text:
                verifyErr.response?.data?.message ||
                "Your payment could not be verified automatically. Please contact elitesaloon18@gmail.com with your payment reference.",
              confirmButtonColor: "#800020",
            });
          } finally {
            setSubmittingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmittingPayment(false);
            Swal.fire({
              icon: "info",
              title: "Payment Window Closed",
              text: "You cancelled the payment. Your cart and details remain safely saved.",
              confirmButtonColor: "#800020",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (failResponse) {
        setSubmittingPayment(false);
        console.error("Razorpay Failure:", failResponse.error);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            failResponse.error?.description ||
            "Transaction declined. Please try again with another payment method.",
          confirmButtonColor: "#800020",
        });
      });

      rzp.open();
    } catch (err) {
      setSubmittingPayment(false);
      console.error("Order creation error:", err);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: err.response?.data?.message || err.message || "Failed to initiate payment. Please retry.",
        confirmButtonColor: "#800020",
      });
    }
  };

  if (loadingProfile) {
    return (
      <div className="checkout-page-wrapper" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h3>Loading your checkout details...</h3>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page-wrapper">
        <div className="checkout-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="cart-empty-icon" style={{ fontSize: "4rem", color: "#800020" }}>
            <FaShoppingBag />
          </div>
          <h2>Your Checkout is Empty</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            You haven't selected any products for purchase.
          </p>
          <button className="btn-continue-shopping" onClick={() => navigate("/products")}>
            Browse Our Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        {/* TOP BAR */}
        <div className="checkout-top-nav">
          <button className="back-to-shop-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Products
          </button>

          <h1 className="checkout-brand-title">
            Elite<span style={{ color: "var(--primary-gold)" }}>Salon</span> Checkout
          </h1>

          <div style={{ width: "120px" }} />
        </div>

        {isBuyNow && (
          <div
            style={{
              background: "#faf4ef",
              border: "1px solid #ebd9c8",
              borderRadius: "8px",
              padding: "10px 18px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--burgundy)",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            <FaCheckCircle /> Direct Buy Now Checkout for: "{items[0]?.productName}" (Your existing
            cart items are safe and untouched)
          </div>
        )}

        <form onSubmit={handleProceedPayment}>
          <div className="checkout-grid">
            {/* LEFT COLUMN: CUSTOMER & ADDRESS DETAILS */}
            <div>
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <div className="header-icon-badge">
                    <FaUserCheck />
                  </div>
                  <h3>Customer Contact Information</h3>
                </div>

                <div className="form-group-custom">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={errors.customerName ? "has-error" : ""}
                  />
                  {errors.customerName && (
                    <span className="error-text-msg">{errors.customerName}</span>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-group-custom">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={form.customerEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className={errors.customerEmail ? "has-error" : ""}
                    />
                    {errors.customerEmail && (
                      <span className="error-text-msg">{errors.customerEmail}</span>
                    )}
                  </div>

                  <div className="form-group-custom">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="customerMobile"
                      value={form.customerMobile}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={errors.customerMobile ? "has-error" : ""}
                    />
                    {errors.customerMobile && (
                      <span className="error-text-msg">{errors.customerMobile}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <div className="header-icon-badge">
                    <FaMapMarkerAlt />
                  </div>
                  <h3>Shipping / Delivery Address</h3>
                </div>

                <div className="form-group-custom">
                  <label>Street Address / Apartment / Flat No *</label>
                  <input
                    type="text"
                    name="customerStreet"
                    value={form.customerStreet}
                    onChange={handleInputChange}
                    placeholder="e.g. 102, Gold Crest Apartments, MG Road"
                    className={errors.customerStreet ? "has-error" : ""}
                  />
                  {errors.customerStreet && (
                    <span className="error-text-msg">{errors.customerStreet}</span>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-group-custom">
                    <label>City *</label>
                    <input
                      type="text"
                      name="customerCity"
                      value={form.customerCity}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      className={errors.customerCity ? "has-error" : ""}
                    />
                    {errors.customerCity && (
                      <span className="error-text-msg">{errors.customerCity}</span>
                    )}
                  </div>

                  <div className="form-group-custom">
                    <label>District / Area</label>
                    <input
                      type="text"
                      name="customerDistrict"
                      value={form.customerDistrict}
                      onChange={handleInputChange}
                      placeholder="e.g. Bandra West"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group-custom">
                    <label>State *</label>
                    <input
                      type="text"
                      name="customerState"
                      value={form.customerState}
                      onChange={handleInputChange}
                      placeholder="e.g. Maharashtra"
                      className={errors.customerState ? "has-error" : ""}
                    />
                    {errors.customerState && (
                      <span className="error-text-msg">{errors.customerState}</span>
                    )}
                  </div>

                  <div className="form-group-custom">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      name="customerPincode"
                      value={form.customerPincode}
                      onChange={handleInputChange}
                      placeholder="6-digit PIN"
                      maxLength={6}
                      className={errors.customerPincode ? "has-error" : ""}
                    />
                    {errors.customerPincode && (
                      <span className="error-text-msg">{errors.customerPincode}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY & PAYMENT */}
            <div>
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <div className="header-icon-badge">
                    <FaShoppingBag />
                  </div>
                  <h3>Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})</h3>
                </div>

                {/* Items List */}
                <div className="summary-items-list">
                  {items.map((item) => {
                    const id = item.productId || item._id;
                    const price = Number(item.productPrice) || 0;
                    const qty = Number(item.quantity) || 1;
                    const imgUrl =
                      item.productImages && item.productImages.length > 0
                        ? `http://localhost:5000/uploads/productImages/${item.productImages[0]}`
                        : item.productImage
                        ? `http://localhost:5000/uploads/productImages/${item.productImage}`
                        : "https://via.placeholder.com/100";

                    return (
                      <div key={id} className="summary-item-row">
                        <img src={imgUrl} alt={item.productName} className="summary-item-thumb" />
                        <div className="summary-item-info">
                          <h5 className="summary-item-name">{item.productName}</h5>
                          <div className="summary-item-qty">
                            Qty: {qty} × ₹{price.toFixed(2)}
                          </div>
                        </div>
                        <div className="summary-item-total">₹{(price * qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Breakdown */}
                <div className="order-breakdown-box">
                  <div className="breakdown-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="breakdown-row">
                    <span>Delivery Charges:</span>
                    <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : "FREE (Above ₹500)"}</span>
                  </div>

                  <div className="breakdown-row">
                    <span>GST (18% included):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="breakdown-row grand-total-row">
                    <span>Payable Amount:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Razorpay Payment */}
                <button
                  type="submit"
                  className="checkout-action-btn"
                  disabled={submittingPayment}
                >
                  <FaLock />
                  {submittingPayment
                    ? "Opening Razorpay..."
                    : `Pay ₹${grandTotal.toFixed(2)} with Razorpay`}
                </button>

                <div className="razorpay-badge-banner">
                  <FaShieldAlt /> 256-Bit SSL Encrypted Razorpay Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCheckout;
