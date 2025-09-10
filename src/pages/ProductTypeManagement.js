import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import ProductTypeForm from "../forms/ProductTypeForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function ProductTypeManagement() {
  const [productTypes, setProductTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteId, setDeleteId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterManufacturer, setFilterManufacturer] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000/api/product-types";

  // Load product types
  const loadProductTypes = async () => {
    try {
      const res = await axios.get(SERVER_URL);
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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleAdd = () => {
    setEditingType(null);
    setShowForm(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${SERVER_URL}/${deleteId}`);
      showToast("Product type deleted successfully", "success");
      setDeleteId(null);
      loadProductTypes();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to delete product type", "error");
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setShowForm(false);
    setEditingType(null);
    loadProductTypes();
    showToast(msg, "success");
  };

  // Unique manufacturers for filter
  const manufacturers = useMemo(() => {
    const set = new Set(productTypes.map(pt => pt.MANUFACTURER).filter(Boolean));
    return Array.from(set);
  }, [productTypes]);

  // Filter & sort
  const filteredTypes = useMemo(() => {
    return productTypes
      .filter(pt => pt.PRODUCTTYPE_NAME?.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .filter(pt => filterManufacturer ? pt.MANUFACTURER === filterManufacturer : true)
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
  }, [productTypes, debouncedSearch, filterManufacturer, sortField, sortOrder]);

  return (
    <FormContainer title="Product Types Management">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Type Name..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />
        <select
          value={filterManufacturer}
          onChange={e => setFilterManufacturer(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Manufacturers</option>
          {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="PRODUCTTYPE_ID">ID</option>
          <option value="PRODUCTTYPE_NAME">Type Name</option>
          <option value="MANUFACTURER">Manufacturer</option>
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
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

      {/* Table */}
      <table className="table-auto border w-full min-w-max">
        <thead className="bg-green-500">
          <tr>
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Type Name</th>
            <th className="px-2 py-1 border">Description</th>
            <th className="px-2 py-1 border">Manufacturer</th>
            <th className="px-2 py-1 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTypes.length > 0 ? filteredTypes.map(pt => (
            <tr key={pt.PRODUCTTYPE_ID} className="border-b hover:bg-gray-100">
              <td className="px-2 py-1 border text-center">{pt.PRODUCTTYPE_ID}</td>
              <td className="px-2 py-1 border">{pt.PRODUCTTYPE_NAME}</td>
              <td className="px-2 py-1 border">{pt.REMARKS}</td>
              <td className="px-2 py-1 border">{pt.MANUFACTURER}</td>
              <td className="px-2 py-1 border text-center space-x-2">
                <button
                  onClick={() => handleEdit(pt)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(pt.PRODUCTTYPE_ID)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="10" className="px-2 py-1 border text-center">
                  No products type found.
                </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full max-w-md relative">
            <ProductTypeForm
              editing={editingType}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={Boolean(deleteId)}
        message="Are you sure you want to delete this product type?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
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
