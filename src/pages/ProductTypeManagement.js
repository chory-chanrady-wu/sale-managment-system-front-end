import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import ProductTypeForm from "../forms/ProductTypeForm";
import Toast from "../components/Toast";

export default function ProductTypeManagement() {
  const [productTypes, setProductTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deletingId, setDeletingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000";

  // Load product types
  const loadProductTypes = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/product-types`);
      setProductTypes(res.data);
    } catch (err) {
      console.error("Failed to load product types:", err);
      showToast("Failed to load product types", "error");
    }
  };

  useEffect(() => {
    loadProductTypes();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Add/Edit handlers
  const handleAdd = () => {
    setEditingType(null);
    setShowForm(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  // Delete product type
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product type?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${SERVER_URL}/api/product-types/${id}`);
      showToast("Product type deleted successfully");
      loadProductTypes();
    } catch (err) {
      console.error("Failed to delete product type:", err);
      showToast(err.response?.data?.error || "Failed to delete product type", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle success from form
  const handleFormSuccess = (msg) => {
    setShowForm(false);
    setEditingType(null);
    loadProductTypes();
    showToast(msg);
  };

  // Filter & sort
  const filteredTypes = useMemo(() => {
    return productTypes
      .filter((pt) => pt.TYPE_NAME?.toLowerCase().includes(debouncedSearch.toLowerCase()))
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
  }, [productTypes, debouncedSearch, sortField, sortOrder]);

  return (
    <FormContainer title="Product Types Management">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Type Name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="ID">ID</option>
          <option value="TYPE_NAME">Type Name</option>
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
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Product Type
        </button>
      </div>

      {/* Product Types Table */}
      <table className="table-auto border border-black w-full min-w-max">
        <thead className="bg-green-500 top-0 z-10">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Type Name</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTypes.length > 0 ? (
            filteredTypes.map((pt) => (
              <tr key={pt.PRODUCTTYPE_ID} className="hover:bg-gray-100">
                <td className="p-2 border text-center">{pt.PRODUCTTYPE_ID}</td>
                <td className="p-2 border">{pt.PRODUCTTYPE_NAME}</td>
                <td className="p-2 border">{pt.REMARKS}</td>
                <td className="p-2 border">{pt.MANUFACTURER}</td>
                <td className="p-2 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(pt)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pt.ID)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={deletingId === pt.ID}
                  >
                    {deletingId === pt.ID ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No product types found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
            </button>
            <ProductTypeForm
              editing={editingType}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

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
