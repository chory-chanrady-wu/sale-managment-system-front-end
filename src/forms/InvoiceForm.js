//import React from "react";
import React, { useState, useEffect} from "react";
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
  const getTotal = () => {
    return invoiceDetails.reduce((sum, d) => sum + d.QTY * d.PRICE, 0);
  };

  const getDiscountedTotal = () => {
    const client = clients.find((c) => c.CLIENT_NO === formData.Client_no);
    const discount = client?.DISCOUNT || 0; // default 0 if no discount
    const subtotal = getTotal();
    return subtotal - (subtotal * discount) / 100;
  };

  const [invoiceDetails, setInvoiceDetails] = useState([]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <h3 className="font-bold text-xl mt-4 text-center">Invoice Details</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
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
        </div>

        <button
          type="button"
          onClick={() =>
            setInvoiceDetails([...invoiceDetails, { PRODUCT_NO: "", QTY: 1, PRICE: 0 }])
          }
          className="bg-green-500 text-white px-3 py-1 rounded mt-2"
        >
          + Add Product
        </button>

        <div className="mt-4 text-right space-y-1">
          <div>Subtotal: ${getTotal().toFixed(2)}</div>
          <div>
            Discount ({clients.find(c => c.CLIENT_NO === formData.Client_no)?.DISCOUNT || 0}%):
            -${(getTotal() - getDiscountedTotal()).toFixed(2)}
          </div>
          <div className="font-bold text-lg">
            Grand Total: ${getDiscountedTotal().toFixed(2)}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {invoice ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
