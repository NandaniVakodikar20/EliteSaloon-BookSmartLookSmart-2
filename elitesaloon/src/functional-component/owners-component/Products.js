import React from "react";
import Swal from "sweetalert2";
import { FiShoppingBag, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

const Products = ({
  filteredProducts,
  setShowProductModal,
  showProductModal,
  productForm,
  setProductForm,
  handleProductSubmit,
  editingProduct,
  closeProductModal,
  openEditProduct,
  deleteProduct,
  getCategoryLabel,
}) => {
  // PRODUCT VALIDATION
  const validateProductForm = () => {
    if (!productForm.productName || productForm.productName.trim().length < 3) {
      Swal.fire(
        "Validation Error",
        "Product name must be at least 3 characters",
        "error",
      );
      return false;
    }

    if (
      !productForm.productDescription ||
      productForm.productDescription.trim().length < 10
    ) {
      Swal.fire(
        "Validation Error",
        "Description must be at least 10 characters",
        "error",
      );
      return false;
    }

    if (!productForm.productPrice || productForm.productPrice <= 0) {
      Swal.fire("Validation Error", "Price must be greater than 0", "error");
      return false;
    }

    if (
      !editingProduct &&
      (!productForm.productImages || productForm.productImages.length === 0)
    ) {
      Swal.fire(
        "Validation Error",
        "Please upload at least one product image",
        "error",
      );
      return false;
    }

    return true;
  };

  // IMAGE VALIDATION
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        Swal.fire(
          "Invalid Image",
          "Only JPG, PNG, WEBP images allowed",
          "error",
        );
        return;
      }

      if (file.size > maxSize) {
        Swal.fire(
          "File Too Large",
          "Image size must be less than 2MB",
          "error",
        );
        return;
      }
    }

    setProductForm({
      ...productForm,
      productImages: files,
    });
  };

  return (
    <div className="od-section">
      <div className="od-section-header">
        <h2 className="od-section-title">Product Management</h2>

        <button
          className="od-btn-add"
          onClick={() => setShowProductModal(true)}
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="od-card-grid">
        {filteredProducts.map((product) => (
     <div key={product._id} className="od-item-card od-product-card">
            <div className="od-item-image">
              {product.productImages && product.productImages.length > 0 ? (
               <img
  src={`http://localhost:5000/uploads/productImages/${product.productImages[0]}`}
  alt={product.productName}
  className="od-product-img" 
/>
              ) : (
                <FiShoppingBag />
              )}
            </div>

            <div className="od-item-content">
              <span
                className={`od-item-category ${product.productPreferredGender.toLowerCase()}`}
              >
                {getCategoryLabel(product.productPreferredGender)}
              </span>

              <h3 className="od-item-name">{product.productName}</h3>

              <p className="od-item-description">
                {product.productDescription}
              </p>

              <div className="od-item-meta">
                <div className="od-item-price">₹{product.productPrice}</div>
              </div>

              <div className="od-item-actions">
                <button
                  className="od-btn od-btn-edit"
                  onClick={() => openEditProduct(product)}
                >
                  <FiEdit2 /> Edit
                </button>

                <button
                  className="od-btn od-btn-delete"
                  onClick={() => deleteProduct(product._id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="od-modal-overlay active" onClick={closeProductModal}>
          <div className="od-modal" onClick={(e) => e.stopPropagation()}>
            <div className="od-modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>

              <button className="od-modal-close" onClick={closeProductModal}>
                <FiX />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!validateProductForm()) return;

                handleProductSubmit(e);
              }}
            >
              <div className="od-modal-body">
                {/* NAME */}
                <div className="od-form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={productForm.productName}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* TYPE */}
                <div className="od-form-group">
                  <label>Product Type</label>
                  <select
                    value={productForm.productType}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productType: e.target.value,
                      })
                    }
                  >
                    <option value="SHAMPOO">Shampoo</option>
                    <option value="HAIRGEL">Hair Gel</option>
                    <option value="FACEWASH">Face Wash</option>
                    <option value="SUNSCREAM">Sunscreen</option>
                    <option value="CONDITIONER">Conditioner</option>
                     <option value="HAIR_SERUM">Hair Serum</option>
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="od-form-group">
                  <label>Description</label>
                  <textarea
                    value={productForm.productDescription}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productDescription: e.target.value,
                      })
                    }
                  />
                </div>

                {/* PRICE */}
                <div className="od-form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={productForm.productPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productPrice: e.target.value,
                      })
                    }
                  />
                </div>

                {/* GENDER */}
                <div className="od-form-group">
                  <label>Preferred Gender</label>
                  <select
                    value={productForm.productPreferredGender}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productPreferredGender: e.target.value,
                      })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* IMAGE */}
                <div className="od-form-group">
                  <label>Product Image</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingProduct}
                  />
                </div>
              </div>

              <div className="od-modal-footer">
                <button
                  type="button"
                  className="od-btn-cancel"
                  onClick={closeProductModal}
                >
                  Cancel
                </button>

                <button type="submit" className="od-btn-save">
                  {editingProduct ? "Update" : "Add"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
