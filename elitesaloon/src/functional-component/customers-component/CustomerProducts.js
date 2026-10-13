
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaRupeeSign,
  FaHeart,
  FaShoppingCart,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import "./CustomerDashboard.css";

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

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("productWishlist")) || [];
    } catch {
      return [];
    }
  });

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

          if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
          ) {
            console.error("Invalid customer coordinates.");
            return;
          }

          console.log("CUSTOMER LOCATION in Products");
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

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
            throw new Error(
              `Server error: ${response.status}`
            );
          }

          const data = await response.json();

          console.log("Nearby Salon Product:", data);

          setProducts(data.products || []);
        } else {
          console.log(
            "No location found. Searching by pincode:",
            pincode
          );

          const response = await axios.get(
            `http://localhost:5000/customer/get-product-customer/${pincode}`
          );

          console.log(
            "Products by pincode:",
            response.data
          );

          setProducts(response.data.products || []);
        }
      } catch (err) {
        console.log(err);
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
  const displayProducts = isPreview
    ? products.slice(0, 4)
    : products;

  // =========================
  // ADD TO WISHLIST
  // =========================
  const handleWishlist = (product) => {
    let updatedWishlist;

    const alreadyExists = wishlist.some(
      (item) => item._id === product._id
    );

    if (alreadyExists) {
      updatedWishlist = wishlist.filter(
        (item) => item._id !== product._id
      );
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "productWishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (product) => {
    try {
      const existingCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const existingProductIndex = existingCart.findIndex(
        (item) => item._id === product._id
      );

      let updatedCart;

      if (existingProductIndex !== -1) {
        updatedCart = [...existingCart];

        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity:
            (updatedCart[existingProductIndex].quantity || 1) + 1,
        };
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
      );

      alert("Product added to cart!");
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
        product: product,
        quantity: 1,
        customer: customer || customerData,
        buyNow: true,
      },
    });
  };

  if (loading) {
    return (
      <p className="no-data">
        Loading products...
      </p>
    );
  }

  return (
    <div className="dashboard-content">

      {!isPreview && (
        <div className="content-header">
          <h2>Our Products</h2>
        </div>
      )}

      {/* NO DATA */}
      {displayProducts.length === 0 ? (
        <p className="no-data">
          No products available in your area
        </p>
      ) : (
        <div className="customer-product-grid">

          {displayProducts.map((product) => {

            const isWishlisted = wishlist.some(
              (item) => item._id === product._id
            );

            return (
              <div
                key={product._id}
                className="customer-product-card"
              >

                {/* =========================
                    IMAGE
                ========================== */}
                <div className="product-image customer-product-image">

                  {/* HEART */}
                  <button
                    type="button"
                    className={`product-wishlist-btn ${
                      isWishlisted ? "active" : ""
                    }`}
                    onClick={() =>
                      handleWishlist(product)
                    }
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

                {/* =========================
                    BODY
                ========================== */}
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
                          title={`${product.ownerId?.ownerShopCity || ""}, ${product.ownerId?.ownerShopPincode || ""}`}
                        >
                          <FaMapMarkerAlt /> {product.ownerId?.ownerShopCity || ""}{product.ownerId?.ownerShopCity && product.ownerId?.ownerShopPincode ? ", " : ""}{product.ownerId?.ownerShopPincode || "Location N/A"}
                        </span>
                      </div>
                    </div>

                    <h3>
                      {product.productName}
                    </h3>

                    <p className="desc">
                      {product.productDescription}
                    </p>

                  </div>

                  {/* =========================
                      PRICE + CART
                  ========================== */}
                  <div className="product-footer">

                    <div className="product-meta">
                      <FaRupeeSign />
                      {product.productPrice}
                    </div>

                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() =>
                        handleAddToCart(product)
                      }
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>

                  </div>

                  {/* =========================
                      BUY NOW
                  ========================== */}
                  <button
                    type="button"
                    className="buy-now-btn"
                    onClick={() =>
                      handleBuyNow(product)
                    }
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
        <div
          style={{
            textAlign: "right",
            marginTop: "10px",
          }}
        >
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

    </div>
  );
};

export default CustomerProducts;
