import React from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-blue-100 ${isActive ? "bg-blue-500 text-white" : "text-gray-700"}`;

  return (
    <header className="bg-green-500 shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Sale Management System</h1>
      <nav className="font-black flex space-x-2">
        <NavLink to="/dashboard" className={linkClasses}>Dashboard</NavLink>
        <NavLink to="/jobs" className={linkClasses}>Jobs</NavLink>
        <NavLink to="/employees" className={linkClasses}>Employees</NavLink>
        <NavLink to="/client-types" className={linkClasses}>Client Types</NavLink>
        <NavLink to="/clients" className={linkClasses}>Clients</NavLink>
        <NavLink to="/product-types" className={linkClasses}>Product Types</NavLink>
        <NavLink to="/products" className={linkClasses}>Products</NavLink>
        <NavLink to="/invoices" className={linkClasses}>Invoices</NavLink>
        <NavLink to="/reports" className={linkClasses}>ReportManagement</NavLink>
      </nav>
    </header>
  );
}
