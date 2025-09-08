import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ClientTypeForm({ editing, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    CLIENT_TYPE: "",
    TYPE_NAME: "",
    DISCOUNT_RATE: "",
    REMARKS: "",
  });

  useEffect(() => {
    if (editing) {
      setFormData({
        CLIENT_TYPE: editing.CLIENT_TYPE || "",
        TYPE_NAME: editing.TYPE_NAME || "",
        DISCOUNT_RATE: editing.DISCOUNT_RATE || "",
        REMARKS: editing.REMARKS || "",
      });
    } else {
      setFormData({
        CLIENT_TYPE: "",
        TYPE_NAME: "",
        DISCOUNT_RATE: "",
        REMARKS: "",
      });
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(
          `http://localhost:4000/api/client-types/${editing.CLIENT_TYPE_ID}`,
          formData
        );
      } else {
        await axios.post("http://localhost:4000/api/client-types", formData);
      }
      onSuccess(); // reload list or close modal
    } catch (err) {
      console.error("Error saving client type:", err);
      alert("Failed to save client type.");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {editing ? "Edit Client Type" : "New Client Type"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="mb-4">
          <input
            type="text"
            name="CLIENT_TYPE"
            value={formData.CLIENT_TYPE}
            onChange={handleChange}
            placeholder="Client Type"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="TYPE_NAME"
            value={formData.TYPE_NAME}
            onChange={handleChange}
            placeholder="Type Name"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="DISCOUNT_RATE"
            value={formData.DISCOUNT_RATE}
            onChange={handleChange}
            placeholder="Discount Rate"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <textarea
            name="REMARKS"
            value={formData.REMARKS}
            onChange={handleChange}
            placeholder="Remarks"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
