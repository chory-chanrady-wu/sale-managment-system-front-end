// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import FormContainer from "../components/FormContainer";
import RecentActivityCard from "../components/RecentActivityCard";
import { useNavigate } from "react-router-dom";
import {
  fetchJobs,
  fetchEmployees,
  fetchClients,
  fetchProducts,
  fetchInvoices,
  fetchClientTypes,
  fetchProductTypes
} from "../api";

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#9933FF"];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [clientTypeData, setClientTypeData] = useState([]);
  const [productTypeData, setProductTypeData] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const jobs = (await fetchJobs()).data;
      const employees = (await fetchEmployees()).data;
      const clients = (await fetchClients()).data;
      const products = (await fetchProducts()).data;
      const invoices = (await fetchInvoices()).data;
      const clientTypes = (await fetchClientTypes()).data;
      const productTypes = (await fetchProductTypes()).data;

      // Counts for cards
      setCounts({
        jobs: jobs.length,
        employees: employees.length,
        clients: clients.length,
        products: products.length,
        invoices: invoices.length,
        productTypes: productTypes.length
      });

      // Clients by type
      setClientTypeData(clientTypes.map(type => ({
        name: type.TYPE_NAME,
        value: clients.filter(c => c.CLIENT_TYPE === type.CLIENT_TYPE).length
      })));

      // Products by type
      setProductTypeData(productTypes.map(type => ({
        name: type.ProductType_Name,
        value: products.filter(p => p.ProductType === type.ProductType_ID).length
      })));

      // Invoices by status
      const statusCounts = [...new Set(invoices.map(inv => inv.Invoice_status))].map(status => ({
        name: status,
        value: invoices.filter(inv => inv.Invoice_status === status).length
      }));
      setInvoiceStatusData(statusCounts);

      // Revenue & Profit per product
      setRevenueData(products.map(p => ({
        name: p.ProductName,
        revenue: (p.Sell_price || 0) * (p.QTY_ON_HAND || 0),
        profit: ((p.Sell_price || 0) - (p.Cost_Price || 0)) * (p.QTY_ON_HAND || 0)
      })));

      // Recent Activity (last 5 activities from invoices, products, employees)
      const activityList = [
        ...invoices.slice(-5).reverse().map(inv => ({
          user: `Client ${inv.Client_no}`,
          action: `Invoice #${inv.InvoiceNo} (${inv.Invoice_status})`,
          date: inv.Invoice_date
        })),
        ...products.slice(-5).reverse().map(p => ({
          user: "System",
          action: `Product added/updated: ${p.ProductName}`,
          date: new Date() // fallback date
        })),
        ...employees.slice(-5).reverse().map(e => ({
          user: e.EmployeeName,
          action: "Employee profile updated",
          date: new Date() // fallback date
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      setRecentActivity(activityList);

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  const cards = [
    { label: "Jobs", value: counts.jobs, color: "bg-blue-100", route: "/jobs" },
    { label: "Employees", value: counts.employees, color: "bg-green-100", route: "/employees" },
    { label: "Clients", value: counts.clients, color: "bg-yellow-100", route: "/clients" },
    { label: "Products", value: counts.products, color: "bg-purple-100", route: "/products" },
    { label: "Invoices", value: counts.invoices, color: "bg-red-100", route: "/invoices" },
    { label: "Product Types", value: counts.productTypes, color: "bg-pink-100", route: "/product-types" }
  ];

  return (
    <FormContainer title="Dashboard">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(card => (
          <div
            key={card.label}
            className={`${card.color} p-6 rounded shadow text-center cursor-pointer transform hover:scale-105 transition`}
            onClick={() => navigate(card.route)}
          >
            <h2 className="text-lg font-bold">{card.label}</h2>
            <p className="text-2xl mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clients by Type */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Clients by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={clientTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {clientTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Type */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Products by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productTypeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoices by Status */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Invoices by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue & Profit charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Revenue per Product</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-2">Profit per Product</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="profit" fill="#FF8042" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivityCard activities={recentActivity} />
    </FormContainer>
  );
}
