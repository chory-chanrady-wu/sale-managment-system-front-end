import React, { useState, useEffect } from "react";
import axios from "axios";
import FormContainer from "../components/FormContainer";
import InvoiceForm from "../forms/InvoiceForm";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const SERVER_URL = "http://localhost:4000";

  const showToast = (message, type = "success") => setToast({ show: true, message, type });

  // Load invoices
  const loadInvoices = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/invoices`);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load invoices", "error");
    }
  };

  // Load clients
  const loadClients = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/clients`);
      setClients(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load clients", "error");
    }
  };

  // Load employees
  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load employees", "error");
    }
  };

  useEffect(() => {
    loadInvoices();
    loadClients();
    loadEmployees();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Handle view invoice
  const handleView = async (invoice) => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/invoices/${invoice.INVOICENO}`);
      setViewInvoice(res.data);
    } catch (err) {
      console.error(err);
      showToast("Cannot load invoice details", "error");
    }
  };

  // Handle delete invoice
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/api/invoices/${id}`);
      showToast("Invoice deleted successfully!");
      loadInvoices();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete invoice", "error");
    }
    setConfirmDeleteId(null);
  };

  // Handle edit invoice
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((i) => 
        i.INVOICENO?.toString().includes(debouncedSearch) ||
        clients.find(c => c.Client_no === i.Client_no)?.ClientName.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .filter((i) => (employeeFilter ? i.EmployeeID === Number(employeeFilter) : true))
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
    <FormContainer title="Invoice Management">
      {/* Toast */}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
            type="text"
            placeholder="Search Invoice No or Client..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />

        {/* Employee Filter */}
        <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="border p-2 rounded mb-2 md:mb-0"
        >
            <option value="">All Employees</option>
            {employees.map((emp) => (
            <option key={emp.EMPLOYEEID} value={emp.EMPLOYEEID}>
                {emp.EMPLOYEENAME}
            </option>
            ))}
        </select>

        <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border p-2 rounded"
        >
            <option value="">Sort By</option>
            <option value="INVOICENO">Invoice No</option>
            <option value="INVOICE_DATE">Date</option>
            <option value="INVOICE_STATUS">Status</option>
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
            onClick={() => { setEditingInvoice(null); setShowForm(true); }}
            className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            New Invoice
        </button>
        </div>

      {/* Invoice Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border border-black w-full min-w-max">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="px-2 py-1 border text-center">Invoice No</th>
              <th className="px-2 py-1 border text-center">Date</th>
              <th className="px-2 py-1 border">Client</th>
              <th className="px-2 py-1 border">Employee</th>
              <th className="px-2 py-1 border text-center">Status</th>
              <th className="px-2 py-1 border">Memo</th>
              <th className="px-2 py-1 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-2 py-1 border text-center">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map((i) => {
                const clientName = clients.find(c => c.Client_no === i.Client_no)?.ClientName || "";
                const employeeName = employees.find(e => e.EmployeeID === i.EmployeeID)?.EmployeeName || "";
                return (
                  <tr key={i.INVOICENO} className="border-b hover:bg-gray-100">
                    <td className="px-2 py-1 border text-center">{i.INVOICENO}</td>
                    <td className="px-2 py-1 border text-center">{i.INVOICE_DATE?.split("T")[0]}</td>
                    <td className="px-2 py-1 border">{clientName}</td>
                    <td className="px-2 py-1 border">{employeeName}</td>
                    <td className="px-2 py-1 border text-center">{i.INVOICE_STATUS}</td>
                    <td className="px-2 py-1 border">{i.INVOICEMEMO}</td>
                    <td className="px-2 py-1 border text-center space-x-1">
                      <button
                        onClick={() => handleEdit(i)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(i.INVOICENO)}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <InvoiceForm
            invoice={editingInvoice}
            clients={clients}
            employees={employees}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              loadInvoices();
              showToast(editingInvoice ? "Invoice updated!" : "Invoice created!");
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={!!confirmDeleteId}
        message="Are you sure you want to delete this invoice?"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </FormContainer>
  );
}
