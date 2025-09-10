import React, { useState, useEffect } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import ProductForm from "../forms/ProductForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") => setToast({ show: true, message, type });

  // Load products
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    }
  };

  // Load product types
  const loadProductTypes = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/product-types`);
      setProductTypes(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load product types", "error");
    }
  };

  useEffect(() => {
    loadProducts();
    loadProductTypes();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/api/products/${id}`);
      showToast("Product deleted successfully!");
      loadProducts();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete product", "error");
    }
    setConfirmDeleteId(null);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((p) =>
      p.PRODUCTNAME?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .filter((p) => (typeFilter ? p.PRODUCTTYPE === parseInt(typeFilter) : true))
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
    <FormContainer title="Products Management">
      {/* Toast */}
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
          placeholder="Search Product Name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="">All Types</option>
          {productTypes.map((pt) => (
            <option key={pt.PRODUCTTYPE_ID} value={pt.PRODUCTTYPE_ID}>
              {pt.PRODUCTTYPE_NAME}
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="PRODUCT_NO">Product ID</option>
          <option value="PRODUCT_NAME">Product Name</option>
          <option value="SELL_PRICE">Sell Price</option>
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
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New Product
        </button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border border-black w-full min-w-max">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="px-2 py-1 border text-center">Product ID</th>
              <th className="px-2 py-1 border">Product Name</th>
              <th className="px-2 py-1 border">Product Type</th>
              <th className="px-2 py-1 border">Reorder Level</th>
              <th className="px-2 py-1 border text-center">Cost</th>
              <th className="px-2 py-1 border text-center">Sell</th>
              <th className="px-2 py-1 border text-center">Profit %</th>
              <th className="px-2 py-1 border text-center">Qty</th>
              <th className="px-2 py-1 border text-center">Photo</th>
              <th className="px-2 py-1 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="10" className="px-2 py-1 border text-center">
                  No products found.
                </td>
              </tr>
            )}
            {filteredProducts.map((p) => (
              <tr key={p.PRODUCT_NO} className="border-b hover:bg-gray-100">
                <td className="px-2 py-1 border text-center">{p.PRODUCT_NO}</td>
                <td className="px-2 py-1 border">{p.PRODUCTNAME}</td>
                <td className="px-2 py-1 border">{p.PRODUCTTYPE}</td>
                <td className="px-2 py-1 border text-center">{p.REORDER_LEVEL}</td>
                <td className="px-2 py-1 border text-center">{p.COST_PRICE}</td>
                <td className="px-2 py-1 border text-center">{p.SELL_PRICE}</td>
                <td className="px-2 py-1 border text-center">{p.PROFIT_PERCENT}%</td>
                <td className="px-2 py-1 border text-center">{p.QTY_ON_HAND}</td>
                <td className="px-2 py-1 border text-center">
                  {p.PHOTO && (
                    <img
                      src={`data:image/jpeg;base64,${p.PHOTO}`}
                      alt={p.PRODUCTNAME}
                      className="w-20 h-20 object-cover mx-auto rounded"
                    />
                  )}
                </td>
                <td className="px-2 py-1 border text-center space-x-1">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.PRODUCT_NO)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <ProductForm
            product={editingProduct}
            productTypes={productTypes}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              loadProducts();
              showToast(editingProduct ? "Product updated!" : "Product created!", "success");
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this product?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </FormContainer>
  );
}
