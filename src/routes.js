// routes.js
import Dashboard from "./pages/Dashboard";
import JobsManagement from "./pages/Jobs";
import EmployeesManagement from "./pages/EmployeesManagement";
import ClientTypes from "./pages/ClientType";
import ClientManagement from "./pages/ClientManagement";
import ProductTypeManagement from "./pages/ProductTypeManagement";
import ProductForm from "./forms/ProductForm";
import InvoiceForm from "./forms/InvoiceForm";

const routes = [
  { path: "/dashboard", element: Dashboard, title: "Dashboard" },
  { path: "/jobs", element: JobsManagement, title: "Jobs Management" },
  { path: "/employees", element: EmployeesManagement, title: "Employees Management" },
  { path: "/client-types", element: ClientTypes, title: "Client Types" },
  { path: "/clients", element: ClientManagement, title: "Clients Management" },
  { path: "/product-types", element: ProductTypeManagement, title: "Product Types" },
  { path: "/products", element: ProductForm, title: "Products" },
  { path: "/invoices", element: InvoiceForm, title: "Invoices" },
];

export default routes;
