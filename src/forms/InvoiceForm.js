import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

export default function InvoiceForm({
  invoice,
  clients = [],
  employees = [],
  products = [],
  onClose,
  onSaved,
}) {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    Invoice_date: localToday,
    Client_no: "",
    EmployeeID: "",
    Invoice_status: "",
    InvoiceMemo: "",
  });

  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const printRef = useRef(); // for print

  useEffect(() => {
    if (invoice) {
      setFormData({
        Invoice_date: invoice.INVOICE_DATE?.split("T")[0] || localToday,
        Client_no: invoice.CLIENT_NO || "",
        EmployeeID: invoice.EMPLOYEEID || "",
        Invoice_status: invoice.INVOICE_STATUS || "",
        InvoiceMemo: invoice.INVOICEMEMO || "",
      });
      setInvoiceDetails(invoice.details || []);
    }
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const clientsOptions = clients.map((c) => ({ value: c.CLIENT_NO, label: c.CLIENTNAME }));
  const employeesOptions = employees.map((e) => ({
    value: e.EMPLOYEEID,
    label: e.EMPLOYEENAME,
  }));
  const productsOptions = products.map((p) => ({
    value: p.PRODUCT_NO,
    label: `${p.PRODUCTNAME} ($${p.SELL_PRICE}) (In Stock:${p.QTY_ON_HAND})`,
    price: p.SELL_PRICE,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoicePayload = { ...formData };
      const invoiceUrl = invoice
        ? `http://localhost:4000/api/invoices/${invoice.INVOICENO}`
        : "http://localhost:4000/api/invoices";
      const invoiceMethod = invoice ? "put" : "post";

      const invoiceRes = await fetch(invoiceUrl, {
        method: invoiceMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload),
      });
      if (!invoiceRes.ok) throw new Error("Failed to save invoice");

      const savedInvoice = invoice ? invoice : await invoiceRes.json();
      const invoiceNo = savedInvoice.INVOICENO || savedInvoice.invoiceNo;

      if (invoiceDetails.length > 0) {
        const detailsPayload = invoiceDetails.map((d) => ({
          InvoiceNo: invoiceNo,
          Product_no: d.PRODUCT_NO,
          Qty: Number(d.QTY),
          Price: Number(d.PRICE),
        }));

        const detailsRes = await fetch("http://localhost:4000/api/invoice-details/bulk", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ details: detailsPayload }),
        });
        if (!detailsRes.ok) throw new Error("Failed to save invoice details");
      }

      onSaved();
    } catch (err) {
      alert(err.message);
    }
  };

  const getTotal = () => {
    return invoiceDetails.reduce((sum, d) => sum + d.QTY * d.PRICE, 0);
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-center">
        {invoice ? "Edit Invoice" : "New Invoice"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="date"
          name="Invoice_date"
          value={formData.Invoice_date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <Select
          options={clientsOptions}
          value={clientsOptions.find((opt) => opt.value === formData.Client_no) || null}
          onChange={(selected) =>
            setFormData({ ...formData, Client_no: selected?.value || "" })
          }
          placeholder="--ជ្រើសរើសអតិថិជន / Select Client--"
          isClearable
        />

        <Select
          options={employeesOptions}
          value={employeesOptions.find((opt) => opt.value === formData.EmployeeID) || null}
          onChange={(selected) =>
            setFormData({ ...formData, EmployeeID: selected?.value || "" })
          }
          placeholder="--ជ្រើសរើសបុគ្គលិក / Select Employee--"
          isClearable
        />

        <select
          name="Invoice_status"
          value={formData.Invoice_status}
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
          value={formData.InvoiceMemo}
          onChange={handleChange}
          placeholder="Invoice Memo"
          className="w-full border p-2 rounded"
        />

        <h3 className="font-bold mt-4">Invoice Details</h3>
        {invoiceDetails.map((d, index) => (
          <div key={index} className="flex space-x-2 items-center mb-2">
            <div className="flex-1">
              <Select
                options={productsOptions}
                value={productsOptions.find((opt) => opt.value === d.PRODUCT_NO) || null}
                onChange={(opt) => {
                  setInvoiceDetails((details) => {
                    const updated = [...details];
                    updated[index] = {
                      ...updated[index],
                      PRODUCT_NO: opt?.value || "",
                      PRICE: opt?.price || 0,
                    };
                    return updated;
                  });
                }}
                placeholder="Select Product"
                isClearable
              />
            </div>

            <input
              type="number"
              min="1"
              value={d.QTY || 1}
              onChange={(e) => {
                const qty = Number(e.target.value) || 1;
                setInvoiceDetails((details) => {
                  const updated = [...details];
                  updated[index] = { ...updated[index], QTY: qty };
                  return updated;
                });
              }}
              className="w-20 border p-1 rounded"
            />

            <input
              type="number"
              value={d.PRICE || 0}
              onChange={(e) => {
                const price = Number(e.target.value) || 0;
                setInvoiceDetails((details) => {
                  const updated = [...details];
                  updated[index] = { ...updated[index], PRICE: price };
                  return updated;
                });
              }}
              className="w-24 border p-1 rounded"
            />

            <button
              type="button"
              onClick={() =>
                setInvoiceDetails((details) => details.filter((_, i) => i !== index))
              }
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setInvoiceDetails([...invoiceDetails, { PRODUCT_NO: "", QTY: 1, PRICE: 0 }])
          }
          className="bg-green-500 text-white px-3 py-1 rounded mt-2"
        >
          + Add Product
        </button>

        <div className="mt-4 font-bold text-right">Total: ${getTotal()}</div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Print
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {invoice ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {/* Hidden div for printing */}
      <div className="hidden" ref={printRef}>
        <h2>Invoice</h2>
        <div>Date: {formData.Invoice_date}</div>
        <div>Client: {clients.find((c) => c.CLIENT_NO === formData.Client_no)?.CLIENTNAME}</div>
        <div>
          Employee: {employees.find((e) => e.EMPLOYEEID === formData.EmployeeID)?.EMPLOYEENAME}
        </div>
        <div>Status: {formData.Invoice_status}</div>
        <div>Memo: {formData.InvoiceMemo}</div>

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
            {invoiceDetails.map((d, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000" }}>
                  {products.find((p) => p.PRODUCT_NO === d.PRODUCT_NO)?.PRODUCTNAME}
                </td>
                <td style={{ border: "1px solid #000", textAlign: "center" }}>{d.QTY}</td>
                <td style={{ border: "1px solid #000", textAlign: "right" }}>${d.PRICE}</td>
                <td style={{ border: "1px solid #000", textAlign: "right" }}>${d.QTY * d.PRICE}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: "right", fontWeight: "bold" }}>
                Grand Total:
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>${getTotal()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
