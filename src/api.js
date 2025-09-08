import axios from "axios";

// Base URL of your backend API
const API_BASE_URL = "http://localhost:4000/api";

// -------------------- Jobs --------------------
export const fetchJobs = () => axios.get(`${API_BASE_URL}/jobs`);
export const saveJob = (job) => axios.post(`${API_BASE_URL}/jobs`, job);
export const updateJob = (id, job) => axios.put(`${API_BASE_URL}/jobs/${id}`, job);
export const deleteJob = (id) => axios.delete(`${API_BASE_URL}/jobs/${id}`);

// -------------------- Employees --------------------
export const fetchEmployees = () => axios.get(`${API_BASE_URL}/employees`);
export const saveEmployee = (emp) => axios.post(`${API_BASE_URL}/employees`, emp);
export const updateEmployee = (id, emp) => axios.put(`${API_BASE_URL}/employees/${id}`, emp);
export const deleteEmployee = (id) => axios.delete(`${API_BASE_URL}/employees/${id}`);

// -------------------- Client Types --------------------
export const fetchClientTypes = () => axios.get(`${API_BASE_URL}/client-types`);
export const saveClientType = (ct) => axios.post(`${API_BASE_URL}/client-types`, ct);
export const updateClientType = (id, ct) => axios.put(`${API_BASE_URL}/client-types/${id}`, ct);
export const deleteClientType = (id) => axios.delete(`${API_BASE_URL}/client-types/${id}`);

// -------------------- Clients --------------------
export const fetchClients = () => axios.get(`${API_BASE_URL}/clients`);
export const saveClient = (client) => axios.post(`${API_BASE_URL}/clients`, client);
export const updateClient = (id, client) => axios.put(`${API_BASE_URL}/clients/${id}`, client);
export const deleteClient = (id) => axios.delete(`${API_BASE_URL}/clients/${id}`);

// -------------------- Product Types --------------------
export const fetchProductTypes = () => axios.get(`${API_BASE_URL}/product-types`);
export const saveProductType = (pt) => axios.post(`${API_BASE_URL}/product-types`, pt);
export const updateProductType = (id, pt) => axios.put(`${API_BASE_URL}/product-types/${id}`, pt);
export const deleteProductType = (id) => axios.delete(`${API_BASE_URL}/product-types/${id}`);

// -------------------- Products --------------------
export const fetchProducts = () => axios.get(`${API_BASE_URL}/products`);
export const saveProduct = (p) => axios.post(`${API_BASE_URL}/products`, p);
export const updateProduct = (id, p) => axios.put(`${API_BASE_URL}/products/${id}`, p);
export const deleteProduct = (id) => axios.delete(`${API_BASE_URL}/products/${id}`);

// -------------------- Invoices --------------------
export const fetchInvoices = () => axios.get(`${API_BASE_URL}/invoices`);
export const saveInvoice = (inv) => axios.post(`${API_BASE_URL}/invoices`, inv);
export const updateInvoice = (id, inv) => axios.put(`${API_BASE_URL}/invoices/${id}`, inv);
export const deleteInvoice = (id) => axios.delete(`${API_BASE_URL}/invoices/${id}`);

// -------------------- Invoice Details --------------------
export const fetchInvoiceDetails = () => axios.get(`${API_BASE_URL}/invoice-details`);
export const saveInvoiceDetail = (detail) => axios.post(`${API_BASE_URL}/invoice-details`, detail);
export const updateInvoiceDetail = (invoiceNo, productNo, detail) =>
  axios.put(`${API_BASE_URL}/invoice-details/${invoiceNo}/${productNo}`, detail);
export const deleteInvoiceDetail = (invoiceNo, productNo) =>
  axios.delete(`${API_BASE_URL}/invoice-details/${invoiceNo}/${productNo}`);
// Note: Adjust the endpoints and parameters as per your backend API design.