import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminHeader from "./AdminHeader.jsx";
export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
        <div className="home-container">
          <AdminHeader />
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-actions">
        <button onClick={() => navigate("/admin/users")}>Manage Users</button>
        <button onClick={() => navigate("/admin/reports")}>Manage Reports</button>
      </div>
    </div>
    </div>
  );
}
