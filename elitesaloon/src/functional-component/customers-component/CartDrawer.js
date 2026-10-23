import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaTrashAlt, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../css/CustomerCheckout.css";

const CartDrawer = ({ isOpen, onClose, cart, setCart }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpdateQuantity = (productId, delta) => {
    const updated = cart.map((item) => {
      const id = item.productId || item._id;
      if (id === productId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleRemoveItem = (productId, productName) => {
    Swal.fire({
      title: "Remove Item?",
      text: `Remove "${productName}" from your cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#800020",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Remove",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cart.filter((item) => {
          const id = item.productId || item._id;
          return id !== productId;
        });
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
      }
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: "Clear Shopping Cart?",
      text: "All items will be removed from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#800020",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Clear All",
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([]);
        localStorage.removeItem("cart");
      }
    });
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.productPrice) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const shipping = subtotal >= 500 || cart.length === 0 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const grandTotal = Math.round(subtotal + shipping + tax);

  const handleProceedToCheckout = () => {
    onClose();
    navigate("/checkout", {
      state: {
        fromCart: true,
        items: cart,
      },
    });
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="cart-drawer-header">
          <h3>
            <FaShoppingBag /> Shopping Cart ({cart.length})
          </h3>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close Cart">
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <FaShoppingBag />
              </div>
              <h4>Your Cart is Empty</h4>
              <p>Explore our premium salon products and add them to your cart.</p>
              <button
                className="btn-continue-shopping"
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b76e79",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>

              {cart.map((item) => {
                const id = item.productId || item._id;
                const unitPrice = Number(item.productPrice) || 0;
                const qty = Number(item.quantity) || 1;
                const lineTotal = unitPrice * qty;
                const imgUrl =
                  item.productImages && item.productImages.length > 0
                    ? `http://localhost:5000/uploads/productImages/${item.productImages[0]}`
                    : item.productImage
                    ? `http://localhost:5000/uploads/productImages/${item.productImage}`
                    : "https://via.placeholder.com/150";

                return (
                  <div key={id} className="cart-item-card">
                    <img src={imgUrl} alt={item.productName} className="cart-item-img" />

                    <div className="cart-item-details">
                      <div>
                        <h4 className="cart-item-title">{item.productName}</h4>
                        <div className="cart-item-shop">
                          {item.ownerId?.ownerShopName || "Elite Salon"}
                        </div>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-item-price">
                          ₹{lineTotal.toFixed(2)}
                          {qty > 1 && (
                            <small
                              style={{
                                display: "block",
                                fontSize: "0.75rem",
                                color: "#888",
                                fontWeight: "normal",
                              }}
                            >
                              ₹{unitPrice} each
                            </small>
                          )}
                        </div>

                        <div className="quantity-controller">
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(id, -1)}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-val">{qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleUpdateQuantity(id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        className="cart-remove-item"
                        onClick={() => handleRemoveItem(id, item.productName)}
                      >
                        <FaTrashAlt /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-bill-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-bill-row">
              <span>Delivery Charges:</span>
              <span>{shipping > 0 ? `₹${shipping.toFixed(2)}` : "FREE (Above ₹500)"}</span>
            </div>
            <div className="cart-bill-row">
              <span>GST Tax (18% included):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="cart-bill-row total-row">
              <span>Estimated Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button className="checkout-action-btn" onClick={handleProceedToCheckout}>
              Proceed to Checkout <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
