import React, { useState, useEffect } from "react";
import axios from "axios";

export default function JobsForm({ job, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    Job_Title: "",
    Department: "",
    Min_Salary: "",
    Max_Salary: "",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (job) setFormData({
      Job_Title: job.JOB_TITLE || "",
      Department: job.DEPARTMENT || "",
      Min_Salary: job.MIN_SALARY || "",
      Max_Salary: job.MAX_SALARY || "",
    });
    else {
      setFormData({ Job_Title: "", Department: "", Min_Salary: "", Max_Salary: "" });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (job && job.JOB_ID) {
        // Update existing job
        await axios.put(`http://localhost:4000/api/jobs/${job.JOB_ID}`, formData);
      } else {
        // Create new job
        await axios.post("http://localhost:4000/api/jobs", formData);
      }
      onSaved(); // refresh table
      onClose(); // close modal
    } catch (err) {
      console.error("Failed to save job:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-w-full">
      <h2 className="text-xl font-bold mb-4 text-center">
        {job ? "Edit Job" : "New Job"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="Job_Title"
          placeholder="Job Title"
          value={formData.Job_Title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="Department"
          placeholder="Department"
          value={formData.Department}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          name="Min_Salary"
          placeholder="Min Salary"
          value={formData.Min_Salary}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="Max_Salary"
          placeholder="Max Salary"
          value={formData.Max_Salary}
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
            {job ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
