import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import JobsManagement from "./pages/Jobs";
import EmployeesManagement from "./pages/EmployeesManagement";
import ClientTypes from "./pages/ClientType";
import ClientManagement from "./pages/ClientManagement";
import ProductTypeManagement from "./pages/ProductTypeManagement";
import ProductForm from "./forms/ProductForm";
import InvoiceForm from "./forms/InvoiceForm";

function RouteWithTitle({ element: Element, title }) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Element />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="p-6">
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Pages with titles */}
            <Route path="/dashboard" element={<RouteWithTitle element={Dashboard} title="Dashboard" />} />
            <Route path="/jobs" element={<RouteWithTitle element={JobsManagement} title="Jobs Management" />} />
            <Route path="/employees" element={<RouteWithTitle element={EmployeesManagement} title="Employees Management" />} />
            <Route path="/client-types" element={<RouteWithTitle element={ClientTypes} title="Client Types" />} />
            <Route path="/clients" element={<RouteWithTitle element={ClientManagement} title="Clients Management" />} />
            <Route path="/product-types" element={<RouteWithTitle element={ProductTypeManagement} title="Product Types" />} />
            <Route path="/products" element={<RouteWithTitle element={ProductForm} title="Products" />} />
            <Route path="/invoices" element={<RouteWithTitle element={InvoiceForm} title="Invoices" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
