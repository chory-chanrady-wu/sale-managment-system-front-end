import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductTypeForm({ editing, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    PRODUCTTYPE_NAME: "",
    REMARKS: "",
    MANUFACTURER: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const SERVER_URL = "http://localhost:4000/api/product-types";

  useEffect(() => {
    if (editing) {
      setFormData({
        PRODUCTTYPE_NAME: editing.PRODUCTTYPE_NAME || "",
        REMARKS: editing.REMARKS || "",
        MANUFACTURER: editing.MANUFACTURER || "",
      });
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.PRODUCTTYPE_NAME.trim()) errs.PRODUCTTYPE_NAME = "Type Name is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (editing && editing.PRODUCTTYPE_ID) {
        await axios.put(`${SERVER_URL}/${editing.PRODUCTTYPE_ID}`, formData);
        onSuccess && onSuccess("Product type updated successfully!");
      } else {
        await axios.post(SERVER_URL, formData);
        onSuccess && onSuccess("Product type added successfully!");
        setFormData({ PRODUCTTYPE_NAME: "", REMARKS: "", MANUFACTURER: "" });
      }
      setErrors({});
    } catch (err) {
      console.error(err);
      onSuccess && onSuccess(err.response?.data?.message || "Failed to save product type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">{editing ? "Edit Product Type" : "New Product Type"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="PRODUCTTYPE_NAME"
          placeholder="Type Name"
          value={formData.PRODUCTTYPE_NAME}
          onChange={handleChange}
          className={`w-full border p-2 rounded mb-2 ${errors.PRODUCTTYPE_NAME ? "border-red-500" : ""}`}
        />
        {errors.PRODUCTTYPE_NAME && <p className="text-red-500 text-sm">{errors.PRODUCTTYPE_NAME}</p>}

        <textarea
          name="REMARKS"
          placeholder="Description"
          value={formData.REMARKS}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-2"
        />

        <input
          type="text"
          name="MANUFACTURER"
          placeholder="Manufacturer"
          value={formData.MANUFACTURER}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-2"
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            {loading ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
