import React, { useState, useEffect } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import EmployeeForm from "../forms/EmployeeForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") => setToast({ show: true, message, type });

  // Load employees from backend
  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load employees", "error");
    }
  };

  // Load jobs for filter dropdown
  const loadJobs = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load jobs", "error");
    }
  };

  useEffect(() => {
    loadEmployees();
    loadJobs();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Handle view employee
  const handleView = async (employee) => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/employees/${employee.EMPLOYEEID}`);
      setViewEmployee(res.data);
    } catch (err) {
      console.error(err);
      showToast("Cannot load employee details", "error");
    }
  };

  // Handle delete employee
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/api/employees/${id}`);
      showToast("Employee deleted successfully!");
      loadEmployees();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete employee", "error");
    }
    setConfirmDeleteId(null);
  };

  // Handle edit employee
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // Filter and sort employees
  const filteredEmployees = employees
    .filter((e) => e.EMPLOYEENAME?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((e) => (jobFilter ? e.JOB_ID === Number(jobFilter) : true))
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <FormContainer title="Employees Management">
      {/* Toast */}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Employee Name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.JOB_ID} value={job.JOB_ID}>
              {job.JOB_TITLE}
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="EMPLOYEEID">ID</option>
          <option value="EMPLOYEENAME">Name</option>
          <option value="SALARY">Salary</option>
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
          onClick={() => { setEditingEmployee(null); setShowForm(true); }}
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border border-black w-full min-w-max">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="px-2 py-1 border text-center">ID</th>
              <th className="px-2 py-1 border">Name</th>
              <th className="px-2 py-1 border text-center">Gender</th>
              <th className="px-2 py-1 border text-center">Birth Date</th>
              <th className="px-2 py-1 border">Job</th>
              <th className="px-2 py-1 border">Phone</th>
              <th className="px-2 py-1 border">Address</th>
              <th className="px-2 py-1 border text-center">Salary</th>
              <th className="px-2 py-1 border text-center">Photo</th>
              <th className="px-2 py-1 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-2 py-1 border text-center">No employees found.</td>
              </tr>
            ) : (
              filteredEmployees.map((e) => {
                const jobTitle = jobs.find((j) => j.JOB_ID === e.JOB_ID)?.JOB_TITLE || "";
                return (
                  <tr key={e.EMPLOYEEID} className="border-b hover:bg-gray-100">
                    <td className="px-2 py-1 border text-center">{e.EMPLOYEEID}</td>
                    <td className="px-2 py-1 border break-words">{e.EMPLOYEENAME}</td>
                    <td className="px-2 py-1 border text-center">{e.GENDER}</td>
                    <td className="px-2 py-1 border text-center">
                      {e.BIRTHDATE ? new Date(e.BIRTHDATE).toLocaleDateString('en-GB') : ''}
                    </td>
                    <td className="px-2 py-1 border">{jobTitle}</td>
                    <td className="px-2 py-1 border">{e.PHONE}</td>
                    <td className="px-2 py-1 border">{e.ADDRESS}</td>
                    <td className="px-2 py-1 border text-center">{e.SALARY}$</td>
                    <td className="px-2 py-1 border text-center">
                      {e.PHOTO && (
                        <img
                          src={`data:image/jpeg;base64,${e.PHOTO}`}
                          alt={e.EMPLOYEENAME}
                          className="w-20 h-20 object-cover mx-auto rounded"
                        />
                      )}
                    </td>
                    <td className="px-2 py-1 border text-center space-x-1">
                      <button
                        onClick={() => handleEdit(e)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(e.EMPLOYEEID)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <EmployeeForm
            employee={editingEmployee}
            jobs={jobs}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              loadEmployees();
              showToast(editingEmployee ? "Employee updated!" : "Employee created!");
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* View Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-center truncate">{viewEmployee.EMPLOYEENAME}</h2>
            {viewEmployee.PHOTO && (
              <img
                src={`data:image/jpeg;base64,${viewEmployee.PHOTO}`}
                alt={viewEmployee.EMPLOYEENAME}
                className="w-full h-60 object-cover rounded mb-4"
              />
            )}
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {viewEmployee.EMPLOYEEID}</p>
              <p><strong>Gender:</strong> {viewEmployee.GENDER}</p>
              <p><strong>Birth Date:</strong> {viewEmployee.BIRTHDATE?.split("T")[0]}</p>
              <p><strong>Job:</strong> {jobs.find((j) => j.JOB_ID === viewEmployee.JOB_ID)?.JOB_TITLE || ""}</p>
              <p><strong>Phone:</strong> {viewEmployee.PHONE}</p>
              <p><strong>Address:</strong> {viewEmployee.ADDRESS}</p>
              <p><strong>Salary:</strong> {viewEmployee.SALARY}$</p>
              <p><strong>Remarks:</strong> {viewEmployee.REMARKS}</p>
              <p><strong>Working Site:</strong> {viewEmployee.WORKING_SITE}</p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setViewEmployee(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this employee?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </FormContainer>
  );
}
