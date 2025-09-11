import React, { useState, useEffect, useRef } from "react";
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
  const [products, setProducts] = useState([]);

  const SERVER_URL = "http://localhost:4000";
  const printRef = useRef();

  const showToast = (message, type = "success") => setToast({ show: true, message, type });
  // Add this inside InvoiceManagement, near handlePrint
  const handlePrintInvoice = (invoice) => {
    // set the invoice to editingInvoice so printRef can access it
    setEditingInvoice(invoice);

    // small timeout to ensure React updates the state before printing
    setTimeout(() => {
      if (printRef.current) {
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // reload to restore React
      }
    }, 100);
  };
  const loadInvoices = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/invoices`);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load invoices", "error");
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    }
  };

  const loadClients = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/clients`);
      setClients(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load clients", "error");
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load employees", "error");
    }
  };

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

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleView = (invoice) => {
    setViewInvoice(invoice);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  useEffect(() => {
    loadInvoices();
    loadClients();
    loadEmployees();
    loadProducts();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((i) =>
      i.INVOICENO?.toString().includes(debouncedSearch) ||
      clients.find(c => c.CLIENT_NO === i.CLIENT_NO)?.CLIENTNAME.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .filter((i) => (employeeFilter ? i.EMPLOYEEID === Number(employeeFilter) : true))
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
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search Invoice No or Client..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0 flex-1"
        />

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

      <div className="overflow-x-auto">
        <table className="table-auto border border-black w-full min-w-max">
          <thead className="bg-green-500 top-0 z-10">
            <tr>
              <th className="px-2 py-1 border text-center">Invoice No</th>
              <th className="px-2 py-1 border text-center">Date</th>
              <th className="px-2 py-1 border">Client</th>
              <th className="px-2 py-1 border">Employee</th>
              <th className="px-2 py-1 border text-center">Status</th>
              <th className="px-2 py-1 border text-center">Items</th>
              <th className="px-2 py-1 border text-center">Amount</th>
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
                const clientName = clients.find(c => c.CLIENT_NO === i.CLIENT_NO)?.CLIENTNAME || "";
                const employeeName = employees.find(e => e.EMPLOYEEID === i.EMPLOYEEID)?.EMPLOYEENAME || "";

                      // Calculate total amount
                const totalAmount = i.details?.reduce((sum, d) => sum + d.QTY * d.PRICE, 0) || 0;
                return (
                  <tr key={i.INVOICENO} className="border-b hover:bg-gray-100">
                    <td className="px-2 py-1 border text-center">{i.INVOICENO}</td>
                    <td className="px-2 py-1 border text-center">{i.INVOICE_DATE?.split("T")[0]}</td>
                    <td className="px-2 py-1 border">{clientName}</td>
                    <td className="px-2 py-1 border">{employeeName}</td>
                    <td className="px-2 py-1 border text-center">{i.INVOICE_STATUS}</td>
                    <td className="px-2 py-1 border text-center">{i.details?.length || 0}</td>
                    <td className="px-2 py-1 border text-center">${totalAmount.toFixed(2)}</td>
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
                      <button
                        onClick={() => handlePrintInvoice(i)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Print
                      </button> 
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / New Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <InvoiceForm
            invoice={editingInvoice}
            clients={clients}
            employees={employees}
            products={products}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              loadInvoices();
              showToast(editingInvoice ? "Invoice updated!" : "Invoice created!");
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* View / Print Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2 z-20">
          <InvoiceForm
            invoice={viewInvoice}
            clients={clients}
            employees={employees}
            products={products}
            onClose={() => setViewInvoice(null)}
            readOnly={true}
            printRef={printRef}
            onPrint={handlePrint}
          />
        </div>
      )}
      {/*print*/}
      <div className="hidden" ref={printRef}>
        {editingInvoice && (
          <>
            <h2>Invoice</h2>
            <div>Date: {editingInvoice.INVOICE_DATE?.split("T")[0]}</div>
            <div>Client: {clients.find(c => c.CLIENT_NO === editingInvoice.CLIENT_NO)?.CLIENTNAME}</div>
            <div>Employee: {employees.find(e => e.EMPLOYEEID === editingInvoice.EMPLOYEEID)?.EMPLOYEENAME}</div>
            <div>Status: {editingInvoice.INVOICE_STATUS}</div>
            <div>Memo: {editingInvoice.INVOICEMEMO}</div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000" }}>Product</th>
                  <th style={{ border: "1px solid #000" }}>Qty</th>
                  <th style={{ border: "1px solid #000" }}>Price</th>
                  <th style={{ border: "1px solid #000" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {editingInvoice.details?.map((d, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000" }}>
                      {products.find(p => p.PRODUCT_NO === d.PRODUCT_NO)?.PRODUCTNAME}
                    </td>
                    <td style={{ border: "1px solid #000", textAlign: "center" }}>{d.QTY}</td>
                    <td style={{ border: "1px solid #000", textAlign: "right" }}>${d.PRICE}</td>
                    <td style={{ border: "1px solid #000", textAlign: "right" }}>${d.QTY * d.PRICE}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: "right", fontWeight: "bold" }}>Grand Total:</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    ${editingInvoice.details?.reduce((sum, d) => sum + d.QTY * d.PRICE, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

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
