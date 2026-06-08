import React, { useState, useEffect } from "react";
import axios from "axios";

const GuestProducts = ({ handleProtectedNavigation }) => {
  const [dbProducts, setDbProducts] = useState([]);
  const [productFilter, setProductFilter] = useState("all");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuestProducts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "http://localhost:5000/guest/allproducts",
        );

        if (response.data && response.data.success) {
          setDbProducts(response.data.data);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error retrieving dynamic guest products:", err);
        setError("Failed to load products from database.");
        setLoading(false);
      }
    };

    fetchGuestProducts();
  }, []);

  // FILTER LOGIC
  const filteredProducts = dbProducts.filter((product) => {
    const gender = product.productPreferredGender?.trim().toUpperCase();

    if (productFilter === "male") {
      return gender === "MALE";
    }

    if (productFilter === "female") {
      return gender === "FEMALE";
    }

    return true;
  });

  // ONLY 6 PRODUCTS INITIALLY
  const displayedProducts = showAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, 6);

  if (loading) {
    return (
      <div className="services-loading-state">
        <p>Loading product collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-error-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="guest-services-page">
      {/* HEADER */}
      <div className="guest-services-header">
        <h2 className="guest-services-title">Salon Products</h2>

        <p className="guest-services-subtitle">
          Explore our beauty & grooming collection
        </p>
      </div>

      {/* FILTERS */}
      <div className="filters-container">
        <div className="filter-bar">
          <button
            className={productFilter === "all" ? "active" : ""}
            onClick={() => {
              setProductFilter("all");
              setShowAllProducts(false);
            }}
          >
            All
          </button>
          <button
            className={productFilter === "male" ? "active" : ""}
            onClick={() => {
              setProductFilter("male");
              setShowAllProducts(false);
            }}
          >
            Male
          </button>
          <button
            className={productFilter === "female" ? "active" : ""}
            onClick={() => {
              setProductFilter("female");
              setShowAllProducts(false);
            }}
          >
            Female
          </button>
        </div>
      </div>

      {/* PRODUCT CARDS */}
      <div className="cards">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <div key={product._id} className="card">
              {/* IMAGE */}
              <div className="image-wrapper">
                <img
                  src={
                    product.productImages && product.productImages.length > 0
                      ? `http://localhost:5000/uploads/productImages/${product.productImages[0]}`
                      : "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={product.productName}
                />

                <span className="badge">{product.productPreferredGender}</span>
              </div>

              {/* CONTENT */}
              <div className="card-body">
                <span className="badge-category">
                  {product.productType || "Cosmetics"}
                </span>

                <h3>{product.productName}</h3>

                <p className="service-description">
                  {product.productDescription}
                </p>

                {product.ownerId && (
                  <p className="service-shop-location">
                    🏢 {product.ownerId.ownerShopName} (
                    {product.ownerId.ownerShopCity})
                  </p>
                )}

                <div className="bottom">
                  <span className="price">₹{product.productPrice}</span>

                  <button
                    className="add"
                    onClick={() =>
                      handleProtectedNavigation("/customerdashboard", {
                        activeSection: "products",
                      })
                    }
                  >
                    View Product
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="services-error-state">No products available</div>
        )}
      </div>

      {/* VIEW MORE */}
      {filteredProducts.length > 6 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          <button
            className="add"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? "Show Less" : "View More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestProducts;
