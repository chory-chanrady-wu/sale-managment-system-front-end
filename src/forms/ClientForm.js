import React, { useState, useEffect } from "react";
import axios from "axios";
import CitySelect from "../components/CitySelect";
import Select from "react-select"

export default function ClientForm({ editing, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    CLIENTNAME: "",
    GENDER: "",
    EMAIL: "",
    PHONE: "",
    CITY: "",
    ADDRESS: "",
    CREATED_AT: "",
    CLIENT_TYPE_ID: "",
  });

  const [errors, setErrors] = useState({});
  const [clientTypes, setClientTypes] = useState([]);

  // Load client types for dropdown
  useEffect(() => {
    const loadClientTypes = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/client-types");
        setClientTypes(res.data);
      } catch (err) {
        console.error("Error loading client types:", err);
      }
    };
    loadClientTypes();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (editing) {
      setFormData({
        CLIENTNAME: editing.CLIENTNAME || "",
        GENDER: editing.GENDER || "",
        EMAIL: editing.EMAIL || "",
        PHONE: editing.PHONE || "",
        CITY: editing.CITY || "",
        ADDRESS: editing.ADDRESS || "",
        CREATED_AT: editing.CREATED_AT || "",
        CLIENT_TYPE_ID: editing.CLIENT_TYPE_ID || "",
      });
    } else {
      setFormData({
        CLIENTNAME: "",
        GENDER: "",
        EMAIL: "",
        PHONE: "",
        CITY: "",
        ADDRESS: "",
        CREATED_AT: new Date().toISOString().slice(0, 10),
        CLIENT_TYPE_ID: "",
      });
    }
    setErrors({});
  }, [editing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  {/* Clients Type Option*/}
  const clienttypeOptions = clientTypes.map(ct => ({
    value: ct.CLIENT_TYPE_ID,
    label: ct.CLIENT_TYPE
  }));

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.CLIENTNAME.trim()) newErrors.CLIENTNAME = "Client Name is required";
    if (!formData.CLIENT_TYPE_ID) newErrors.CLIENT_TYPE_ID = "Client Type is required";
      if (!formData.CITY) newErrors.CITY = "City is required";
    if (formData.EMAIL && !formData.EMAIL.includes("@")) newErrors.EMAIL = "Invalid email";
    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      let res;
      if (editing) {
        res = await axios.put(
          `http://localhost:4000/api/clients/${editing.CLIENT_NO}`,
          formData
        );
      } else {
        res = await axios.post(
          "http://localhost:4000/api/clients",
          formData
        );
      }

      if (res.status === 200) {
        // Send success message to parent
        if (typeof onSuccess === "function") {
          const message = editing
            ? "Client updated successfully!"
            : "Client created successfully!";
          onSuccess(message);
        }
      } else {
        if (typeof onSuccess === "function") {
          onSuccess("Failed to save client", "error");
        }
      }
    } catch (err) {
      console.error("Error saving client:", err.response?.data || err.message);
      if (typeof onSuccess === "function") {
        onSuccess(err.response?.data?.error || "Failed to save client", "error");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 border rounded shadow bg-white"
    >
      <h2 className="text-xl font-bold mb-4 text-center">
        {editing ? "Edit Client" : "New Client"}
      </h2>

      {/* Client Name */}
      <div className="mb-4">
        <input
          type="text"
          name="CLIENTNAME"
          value={formData.CLIENTNAME}
          onChange={handleChange}
          placeholder="Enter client name"
          className={`w-full p-2 border rounded ${errors.CLIENTNAME ? "border-red-500" : ""}`}
        />
        {errors.CLIENTNAME && <p className="text-red-500 text-sm mt-1">{errors.CLIENTNAME}</p>}
      </div>

      {/* Gender */}
      <div className="mb-4">
        <select
          name="GENDER"
          value={formData.GENDER}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Email */}
      <div className="mb-4">
        <input
          type="email"
          name="EMAIL"
          value={formData.EMAIL}
          onChange={handleChange}
          placeholder="Enter email"
          className={`w-full p-2 border rounded ${errors.EMAIL ? "border-red-500" : ""}`}
        />
        {errors.EMAIL && <p className="text-red-500 text-sm mt-1">{errors.EMAIL}</p>}
      </div>

      {/* Phone */}
      <div className="mb-4">
        <input
          type="text"
          name="PHONE"
          value={formData.PHONE}
          onChange={handleChange}
          placeholder="Enter phone number"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* City/Province */}
      <div className="mb-4">
        <CitySelect
          value={formData.CITY}
          onChange={(val) => setFormData({ ...formData, CITY: val })}
        />
        {errors.CITY && <p className="text-red-500 text-sm mt-1">{errors.CITY}</p>}
      </div>

      {/* Address */}
      <div className="mb-4">
        <textarea
          name="ADDRESS"
          value={formData.ADDRESS}
          onChange={handleChange}
          placeholder="Enter address"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Client Type */}
      <div className="mb-4">
        <Select
          options={clienttypeOptions}
          value={clienttypeOptions.find(option => option.value === formData.CLIENT_TYPE_ID) || null}
          onChange={(selected) =>
            setFormData({ ...formData, CLIENT_TYPE_ID: selected?.value || "" })
          }
          placeholder="--ជ្រើសរើសប្រភេទអតិថិជន / Select Client Type--"
          isClearable
          noOptionsMessage={() => "មិនមានក្នុងបញ្ជី / Not in list"}
        />
      </div>

      {/* Buttons */}
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
  );
}
