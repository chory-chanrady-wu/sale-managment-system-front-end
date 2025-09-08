import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductTypeForm({ editing, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    PRODUCTTYPE_NAME: "",
    REMARKS: "",
    MANUFACTURER: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const SERVER_URL = "http://localhost:4000";

  // Populate form if editing
  useEffect(() => {
    if (editing) {
      setFormData({
        PRODUCTTYPE_NAME: editing.PRODUCTTYPE_NAME || "",
        REMARKS: editing.REMARKS || "",
        MANUFACTURER: editing.MANUFACTURER || "",
      });
    }
  }, [editing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate inputs
  const validate = () => {
    const errs = {};
    if (!formData.PRODUCTTYPE_NAME.trim())
      errs.PRODUCTTYPE_NAME = "Type Name is required";
    return errs;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (editing && editing.ProductType_ID) {
        // Update existing
        await axios.put(`${SERVER_URL}/api/product-types/${editing.ProductType_ID}`, formData);
        toast.success("Product type updated successfully!");
      } else {
        // Add new
        await axios.post(`${SERVER_URL}/api/product-types`, formData);
        toast.success("Product type added successfully!");
        setFormData({ PRODUCTTYPE_NAME: "", REMARKS: "", MANUFACTURER: "" });
      }
      setErrors({});
      onSuccess && onSuccess();
    } catch (err) {
      console.error("Error saving product type:", err);
      toast.error(
        err.response?.data?.error || "Failed to save product type"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {editing ? "Edit Product Type" : "Add Product Type"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* PRODUCTTYPE_NAME */}
        <div className="mb-3">
          <input
            type="text"
            name="PRODUCTTYPE_NAME"
            value={formData.PRODUCTTYPE_NAME}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${
              errors.PRODUCTTYPE_NAME ? "border-red-500" : ""
            }`}
            placeholder="Enter product type name"
          />
          {errors.PRODUCTTYPE_NAME && (
            <p className="text-red-500 text-sm">{errors.PRODUCTTYPE_NAME}</p>
          )}
        </div>

        {/* REMARKS */}
        <div className="mb-3">
          <textarea
            name="REMARKS"
            value={formData.REMARKS}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter description"
          />
        </div>

        {/* MANUFACTURER */}
        <div className="mb-3">
          <input
            type="text"
            name="MANUFACTURER"
            value={formData.MANUFACTURER}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${
              errors.MANUFACTURER ? "border-red-500" : ""
            }`}
            placeholder="Enter manufacturer"
          />
          {errors.MANUFACTURER && (
            <p className="text-red-500 text-sm">{errors.MANUFACTURER}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Saving..." : editing ? "Update" : "Add"}
          </button>
        </div>
    </form>
  </div>
  );
}
