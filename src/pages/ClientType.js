/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import ClientTypeForm from "../forms/ClientTypeForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function ClientTypes() {
  const [clientTypes, setClientTypes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track currently deleting
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [discountFilter, setDiscountFilter] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  const loadClientTypes = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/client-types`);
      setClientTypes(res.data);
    } catch (err) {
      console.error("Error loading client types:", err);
      showToast("Failed to load client types", "error");
    }
  };

  useEffect(() => {
    loadClientTypes();
  }, []);

  const handleEdit = (ct) => {
    setEditing(ct);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id); // disable button
    try {
      showToast("Client Type deleted successfully", "success");
      loadClientTypes();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        "Failed to delete client type. It may be used in other records.";
      showToast(msg, "error");
    } finally {
      setConfirmDeleteId(null);
      setDeletingId(null);
    }
  };

  const filteredClientTypes = useMemo(() => {
    return clientTypes
      .filter(
        (ct) =>
          ct.CLIENT_TYPE?.toLowerCase().includes(searchText.toLowerCase()) ||
          ct.TYPE_NAME?.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((ct) =>
        discountFilter ? ct.DISCOUNT_RATE === Number(discountFilter) : true
      )
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
  }, [clientTypes, searchText, sortField, sortOrder, discountFilter]);

  return (
    <FormContainer title="Client Types Management">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Client Type or Type Name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={discountFilter}
          onChange={(e) => setDiscountFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
        <option value="">All Discount Rate</option>
          {Array.from(new Set(clientTypes.map((ct) => ct.DISCOUNT_RATE)))
            .sort((a, b) => a - b)
            .map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="CLIENT_TYPE_ID">ID</option>
          <option value="CLIENT_TYPE">Client Type</option>
          <option value="TYPE_NAME">Type Name</option>
          <option value="DISCOUNT_RATE">Discount Rate</option>
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
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Client Type
        </button>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
              onClick={() => setShowModal(false)}
            >
            </button>
              <ClientTypeForm
                editing={editing}
                onSuccess={() => {
                  setShowModal(false);
                  setEditing(null);
                  loadClientTypes();
                  showToast(editing ? "Client Type updated successfully" : "Client Type added successfully", "success");
                }}
                onCancel={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
              />
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse">
        <thead className="bg-green-500 top-0 z-10">
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Client Type</th>
            <th className="px-2 py-1 border">Type Name</th>
            <th className="px-2 py-1 border">Discount Rate</th>
            <th className="px-2 py-1 border">Remarks</th>
            <th className="px-2 py-1 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientTypes.length > 0 ? (
            filteredClientTypes.map((ct) => (
              <tr key={ct.CLIENT_TYPE_ID} className="border-b hover:bg-gray-100">
                <td className="px-2 py-1 border text-center">{ct.CLIENT_TYPE_ID}</td>
                <td className="px-2 py-1 border">{ct.CLIENT_TYPE}</td>
                <td className="px-2 py-1 border text-center">{ct.TYPE_NAME}</td>
                <td className="px-2 py-1 border text-center">{ct.DISCOUNT_RATE}%</td>
                <td className="px-2 py-1 border">{ct.REMARKS}</td>
                <td className="px-2 py-1 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(ct)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(ct.CLIENT_TYPE_ID)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    disabled={deletingId === ct.CLIENT_TYPE_ID}
                  >
                    {deletingId === ct.CLIENT_TYPE_ID ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center">
                No client types found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this client type?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </FormContainer>
  );
}
