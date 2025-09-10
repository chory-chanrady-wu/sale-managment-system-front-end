import React, { useState, useEffect } from "react";
import axios from "axios";
import Toast from "../components/Toast";

export default function ProductForm({ product, productTypes = [], onClose, onSaved }) {
  const [formData, setFormData] = useState({
    PRODUCTNAME: "",
    PRODUCTTYPE: "",
    UNIT_MEASURE: "",
    REORDER_LEVEL: "",
    COST_PRICE: "",
    SELL_PRICE: "",
    QTY_ON_HAND: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => setToast({ show: true, message: msg, type });

  useEffect(() => {
    if (product) {
      setFormData({
        PRODUCTNAME: product.PRODUCTNAME || "",
        PRODUCTTYPE: product.PRODUCTTYPE || "",
        UNIT_MEASURE: product.UNIT_MEASURE || "",
        REORDER_LEVEL: product.REORDER_LEVEL || "",
        COST_PRICE: product.COST_PRICE || "",
        SELL_PRICE: product.SELL_PRICE || "",
        QTY_ON_HAND: product.QTY_ON_HAND || "",
      });
      setPhotoPreview(product.PHOTO || "");
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value);
    });
    if (photoFile) data.append("PHOTO", photoFile);

    try {
      if (product) {
        await axios.put(
          `http://localhost:4000/api/products/${product.PRODUCT_NO}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showToast("Product updated successfully");
      } else {
        await axios.post(
          "http://localhost:4000/api/products",
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        showToast("Product created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Save product error:", err.response?.data || err);
      showToast(err.response?.data?.error || "Failed to save product", "error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-full">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <h2 className="text-xl font-bold mb-4 text-center">
        {product ? "Edit Product" : "New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="PRODUCTNAME"
          placeholder="Product Name"
          value={formData.PRODUCTNAME}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="PRODUCTTYPE"
          value={formData.PRODUCTTYPE}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Product Type</option>
          {productTypes.map((pt) => (
            <option key={pt.PRODUCTTYPE_ID} value={pt.PRODUCTTYPE_ID}>
              {pt.PRODUCTTYPE_NAME}
            </option>
          ))}
        </select>

        <input
          name="UNIT_MEASURE"
          placeholder="Unit Measure"
          value={formData.UNIT_MEASURE}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="REORDER_LEVEL"
          placeholder="Reorder Level"
          value={formData.REORDER_LEVEL}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="COST_PRICE"
          placeholder="Cost Price"
          value={formData.COST_PRICE}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="SELL_PRICE"
          placeholder="Sell Price"
          value={formData.SELL_PRICE}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="QTY_ON_HAND"
          placeholder="Quantity On Hand"
          value={formData.QTY_ON_HAND}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded mb-2"
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-20 h-20 object-cover mx-auto rounded"
            />
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {product ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
