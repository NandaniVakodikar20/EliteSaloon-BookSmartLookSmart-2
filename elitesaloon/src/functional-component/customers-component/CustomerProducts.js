import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FaRupeeSign,
  FaHeart,
  FaShoppingCart,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./CustomerDashboard.css";
import "../../css/CustomerCheckout.css";
import CartDrawer from "./CartDrawer";

const CustomerProducts = ({ customer, isPreview }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const customerData = location.state?.customer;

  const pincode = customer?.customerPincode
    ? Number(customer.customerPincode)
    : customerData?.customerPincode
      ? Number(customerData.customerPincode)
      : "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("productWishlist")) || [];
    } catch {
      return [];
    }
  });

  // Sync cart with localStorage when component mounts or updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setCart(JSON.parse(localStorage.getItem("cart")) || []);
      } catch {
        setCart([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // =========================
  // FETCH PRODUCTS
  // =========================
  useEffect(() => {
    if (!pincode) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const locationData = localStorage.getItem("customerLocation");

        if (locationData) {
          const parsedLocation = JSON.parse(locationData);

          const latitude = Number(parsedLocation.latitude);
          const longitude = Number(parsedLocation.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            console.error("Invalid customer coordinates.");
            return;
          }

          const response = await fetch(
            "http://localhost:5000/customer/get-product",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const data = await response.json();
          setProducts(data.products || []);
        } else {
          const response = await axios.get(
            `http://localhost:5000/customer/get-product-customer/${pincode}`
          );
          setProducts(response.data.products || []);
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pincode]);

  // =========================
  // PREVIEW PRODUCTS
  // =========================
  const displayProducts = isPreview ? products.slice(0, 4) : products;

  // =========================
  // ADD TO WISHLIST
  // =========================
  const handleWishlist = (product) => {
    let updatedWishlist;
    const alreadyExists = wishlist.some((item) => item._id === product._id);

    if (alreadyExists) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("productWishlist", JSON.stringify(updatedWishlist));
  };

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (product) => {
    try {
      const existingProductIndex = cart.findIndex(
        (item) => (item.productId || item._id) === product._id
      );

      let updatedCart;

      if (existingProductIndex !== -1) {
        updatedCart = [...cart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: (updatedCart[existingProductIndex].quantity || 1) + 1,
        };
      } else {
        updatedCart = [
          ...cart,
          {
            ...product,
            productId: product._id,
            quantity: 1,
          },
        ];
      }

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: `"${product.productName}" added to your cart.`,
        showCancelButton: true,
        confirmButtonColor: "#800020",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "View Cart",
        cancelButtonText: "Continue Shopping",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsCartOpen(true);
        }
      });
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // =========================
  // BUY NOW
  // =========================
  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: {
        product: { ...product, productId: product._id },
        quantity: 1,
        customer: customer || customerData,
        buyNow: true,
      },
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (loading) {
    return <p className="no-data">Loading products...</p>;
  }

  return (
    <div className="dashboard-content">
      {!isPreview && (
        <div
          className="content-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2>Our Products</h2>

          <button
            type="button"
            className="cart-header-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "#ffffff",
              border: "1.5px solid var(--burgundy)",
              color: "var(--burgundy)",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(128,0,32,0.1)",
              transition: "all 0.2s",
            }}
          >
            <FaShoppingCart />
            <span>Cart</span>
            <span
              style={{
                background: "var(--burgundy)",
                color: "#ffffff",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
              }}
            >
              {totalCartCount}
            </span>
          </button>
        </div>
      )}

      {/* NO DATA */}
      {displayProducts.length === 0 ? (
        <p className="no-data">No products available in your area</p>
      ) : (
        <div className="customer-product-grid">
          {displayProducts.map((product) => {
            const isWishlisted = wishlist.some((item) => item._id === product._id);

            return (
              <div key={product._id} className="customer-product-card">
                {/* IMAGE */}
                <div className="product-image customer-product-image">
                  <button
                    type="button"
                    className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
                    onClick={() => handleWishlist(product)}
                    aria-label="Add to wishlist"
                  >
                    <FaHeart />
                  </button>

                  <img
                    src={
                      product.productImages?.length > 0
                        ? `http://localhost:5000/uploads/productImages/${product.productImages[0]}`
                        : "https://via.placeholder.com/300"
                    }
                    alt={product.productName}
                  />
                </div>

                {/* BODY */}
                <div className="product-body">
                  <div className="product-content">
                    <div className="product-salon-info">
                      <span className="shop-name">
                        {product.ownerId?.ownerShopName || "Elite Salon"}
                      </span>

                      <div className="salon-meta-details">
                        {product.ownerId?.ownerEmail && (
                          <span className="owner-email" title={product.ownerId.ownerEmail}>
                            <FaEnvelope /> {product.ownerId.ownerEmail}
                          </span>
                        )}

                        <span
                          className="service-address"
                          title={`${product.ownerId?.ownerShopCity || ""}, ${
                            product.ownerId?.ownerShopPincode || ""
                          }`}
                        >
                          <FaMapMarkerAlt /> {product.ownerId?.ownerShopCity || ""}
                          {product.ownerId?.ownerShopCity && product.ownerId?.ownerShopPincode
                            ? ", "
                            : ""}
                          {product.ownerId?.ownerShopPincode || "Location N/A"}
                        </span>
                      </div>
                    </div>

                    <h3>{product.productName}</h3>

                    <p className="desc">{product.productDescription}</p>
                  </div>

                  {/* PRICE + CART */}
                  <div className="product-footer">
                    <div className="product-meta">
                      <FaRupeeSign />
                      {product.productPrice}
                    </div>

                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  </div>

                  {/* BUY NOW */}
                  <button
                    type="button"
                    className="buy-now-btn"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SEE MORE */}
      {isPreview && (
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/products", {
                state: { customer },
              })
            }
          >
            View All Products
          </button>
        </div>
      )}

      {/* SLIDE-OUT CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
};

export default CustomerProducts;
