import React, { useState, useEffect } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import JobsForm from "../forms/JobsForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function JobsManagement() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${SERVER_URL}/api/jobs/${id}`);
      showToast("Job deleted successfully!");
      loadJobs();
    } catch (err) {
      console.error("Failed to delete job:", err);
      showToast(err.response?.data?.error || "Failed to delete job", "error");
    } finally {
      setConfirmDeleteId(null);
      setDeletingId(null);
    }
  };

  const handleFormSaved = (message) => {
    setShowForm(false);
    setEditingJob(null);
    loadJobs();
    showToast(message || "Job saved successfully!");
  };

  const filteredJobs = jobs
    .filter((j) =>
      (j.JOB_TITLE || j.JOB_ID || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    )
    .filter((j) =>
      departmentFilter
        ? (j.DEPARTMENT || "").toLowerCase() === departmentFilter.toLowerCase()
        : true
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const departments = [...new Set(jobs.map((j) => j.DEPARTMENT).filter(Boolean))];

  return (
    <FormContainer title="Jobs Management">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Job Title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="">All Departments</option>
          {departments.map((dep) => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="JOB_ID">Job ID</option>
          <option value="MIN_SALARY">Min Salary</option>
          <option value="MAX_SALARY">Max Salary</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setEditingJob(null);
            setShowForm(true);
          }}
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Job
        </button>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <table className="min-w-full border border-black">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="px-2 py-1 border">Job ID</th>
              <th className="px-2 py-1 border">Job Title</th>
              <th className="px-2 py-1 border">Department</th>
              <th className="px-2 py-1 border">Min Salary</th>
              <th className="px-2 py-1 border">Max Salary</th>
              <th className="px-2 py-1 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((j) => (
              <tr key={j.JOB_ID} className="border-b hover:bg-gray-100">
                <td className="px-2 py-1 text-center border">{j.JOB_ID}</td>
                <td className="px-2 py-1 border">{j.JOB_TITLE}</td>
                <td className="px-2 py-1 border">{j.DEPARTMENT}</td>
                <td className="px-2 py-1 text-center border">{j.MIN_SALARY}$</td>
                <td className="px-2 py-1 text-center border">{j.MAX_SALARY}$</td>
                <td className="px-2 py-1 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(j)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(j.JOB_ID)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={deletingId === j.JOB_ID}
                  >
                    {deletingId === j.JOB_ID ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Jobs Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <JobsForm
            job={editingJob}
            onClose={() => setShowForm(false)}
            onSaved={handleFormSaved} // <-- important
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this job?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </FormContainer>
  );
}
