import React, { useState, useEffect } from "react";

export default function InvoiceForm({ invoice, clients, employees, onClose, onSaved }) {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = today.getFullYear();

  const localToday = `${year}-${month}-${day}`; // YYYY-MM-DD for <input type="date">

  const [formData, setFormData] = useState({
    Invoice_date: localToday,
    Client_no: "",
    EmployeeID: "",
    Invoice_status: "",
    InvoiceMemo: "",
  });

  useEffect(() => {
    if (invoice) setFormData(invoice);
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = invoice
        ? `http://localhost:4000/api/invoices/${invoice.InvoiceNo}`
        : "http://localhost:4000/api/invoices";
      const method = invoice ? "put" : "post";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save invoice");
      onSaved();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">{invoice ? "Edit Invoice" : "New Invoice"}</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="date"
          name="Invoice_date"
          value={formData.Invoice_date || localToday}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="Client_no"
          value={formData.Client_no || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Client</option>
          {clients.map(c => (
            <option key={c.CLIENT_NO} value={c.CLIENT_NO}>{c.CLIENTNAME}</option>
          ))}
        </select>
        <select
          name="EmployeeID"
          value={formData.EmployeeID || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Employee</option>
          {employees.map(e => (
            <option key={e.EMPLOYEEID} value={e.EMPLOYEEID}>{e.EMPLOYEENAME}</option>
          ))}
        </select>
        <select
          name="Invoice_status"
          value={formData.Invoice_status || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <textarea
          name="InvoiceMemo"
          value={formData.InvoiceMemo || ""}
          onChange={handleChange}
          placeholder="Invoice Memo"
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {invoice ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
