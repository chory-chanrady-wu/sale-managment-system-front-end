import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmployeeForm({ employee, jobs = [], onClose, onSaved }) {
  const [formData, setFormData] = useState({
    EmployeeName: "",
    Gender: "",
    BirthDate: "",
    Job_ID: "",
    Address: "",
    Phone: "",
    Salary: "",
    Remarks: "",
    Working_Site: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(""); // preview from existing photo or uploaded file
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  //const date = new Date(employee.BIRTHDATE);
  // Pre-fill form if editing
  useEffect(() => {
    if (employee) {
    const birthDateStr = employee.BIRTHDATE
      ? (() => {
          const d = new Date(employee.BIRTHDATE);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`; // Correct for <input type="date" />
        })()
      : "";
      //const date = new Date(birthDateStr);
      // Convert Oracle DATE to YYYY-MM-DD string safely
      //const formattedDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
      setFormData({
        EmployeeName: employee.EMPLOYEENAME || "",
        Gender: employee.GENDER || "",
        BirthDate: birthDateStr || "",
        Job_ID: employee.JOB_ID || "",
        Address: employee.ADDRESS || "",
        Phone: employee.PHONE || "",
        Salary: employee.SALARY || "",
        Remarks: employee.REMARKS || "",
        Working_Site: employee.WORKING_SITE || "",
      });

      // If backend returns base64 Photo
      setPhotoPreview(employee.Photo || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value);
    });

    if (photoFile) data.append("Photo", photoFile);

    try {
      if (employee) {
        // Update existing employee
        await axios.put(
          `http://localhost:4000/api/employees/${employee.EMPLOYEEID}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // Create new employee
        await axios.post(
          "http://localhost:4000/api/employees",
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      onSaved(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error("Save employee error:", err.response?.data || err);
      alert(err.response?.data?.error || "Failed to save employee");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-full">
      <h2 className="text-xl font-bold mb-4 text-center">
        {employee ? "Edit Employee" : "New Employee"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="EmployeeName"
          placeholder="Employee Name"
          value={formData.EmployeeName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="Gender"
          value={formData.Gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="date"
          name="BirthDate"
          placeholder="Birth Date"
          value={formData.BirthDate || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />  
        <select
          name="Job_ID"
          value={formData.Job_ID}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Job</option>
          {jobs.map((job) => (
            <option key={job.JOB_ID} value={job.JOB_ID}>
              {job.JOB_TITLE}
            </option>
          ))}
        </select>

        <input
          name="Address"
          placeholder="Address"
          value={formData.Address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="Phone"
          placeholder="Phone"
          value={formData.Phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="Salary"
          placeholder="Salary"
          value={formData.Salary}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="Remarks"
          placeholder="Remarks"
          value={formData.Remarks}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Photo upload */}
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
              className="w-full h-48 object-cover rounded"
            />
          )}
        </div>

        <input
          name="Working_Site"
          placeholder="Working Site"
          value={formData.Working_Site}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

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
            {employee ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
