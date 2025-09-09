import React, { useState, useEffect } from "react";
import axios from "axios";
import ClientForm from "../forms/ClientForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import FormContainer from "../components/FormContainer";

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [cityFilter, setCityFilter] = useState("");

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/clients`);
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Add/Edit/Delete handlers
  const handleAdd = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (clientNo) => {
    setDeletingId(clientNo);
    try {
      await axios.delete(`${SERVER_URL}/api/clients/${clientNo}`);
      showToast("Client deleted successfully!", "success");
      loadClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      showToast(err.response?.data?.error || "Failed to delete client", "error");
    } finally {
      setConfirmDeleteId(null);
      setDeletingId(null);
    }
  };

  const handleFormSuccess = (message) => {
    setShowForm(false);
    loadClients();
    showToast(message || "Operation successful!");
  };

  const filteredClients = clients
    .filter((c) => c.CLIENTNAME?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter((c) => (cityFilter ? c.CITY === cityFilter : true))
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

  const cities = Array.from(new Set(clients.map((c) => c.CITY).filter(Boolean)));

  return (
    <FormContainer title="Client Management">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded flex-1"
          />

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border p-2 rounded"
          >
          <option value="">All City</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Sort By</option>
            <option value="CLIENTNAME">Name</option>
            <option value="CITY">City</option>
            <option value="CLIENT_TYPE">Client Type</option>
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
              onClick={handleAdd}
              className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            New Client
          </button>
        </div>
          {/* Form Modal */}
          {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
            <ClientForm
              editing={editingClient}
              onSuccess={(msg) => handleFormSuccess(msg)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      
        <table className="table-auto border border-black w-full min-w-max">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="border px-2 py-1">Client No</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Gender</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">City</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Client Type</th>
              <th className="border px-2 py-1">Discount Rate</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.CLIENT_NO} className="border-b hover:bg-gray-100">
                <td className="text-center border px-2 py-1">{client.CLIENT_NO}</td>
                <td className="border px-2 py-1">{client.CLIENTNAME}</td>
                <td className="text-center border px-2 py-1">{client.GENDER}</td>
                <td className="border px-2 py-1">{client.EMAIL}</td>
                <td className="border px-2 py-1">{client.PHONE}</td>
                <td className="border px-2 py-1">{client.CITY}</td>
                <td className="border px-2 py-1">{client.ADDRESS}</td>
                <td className="text-center border px-2 py-1">{client.CLIENT_TYPE}</td>
                <td className="text-center border px-2 py-1">{client.DISCOUNT}%</td>
                <td className="text-center border px-2 py-1 space-x-1">
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(client.CLIENT_NO)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={deletingId === client.CLIENT_NO}
                  >
                    {deletingId === client.CLIENT_NO ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this client?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </FormContainer>
  );
}
