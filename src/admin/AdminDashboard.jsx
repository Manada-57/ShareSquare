import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";
const API = "https://sharesquare-y50q.onrender.com/api/admin";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  // -------- USERS ----------
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await axios.delete(`${API}/users/${email}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // -------- REPORTS ----------
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/reports`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await axios.delete(`${API}/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  // -------- UI ----------
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setTab("users")}>Manage Users</button>
        <button onClick={() => setTab("reports")}>Manage Reports</button>
      </div>

      {/* USERS TAB */}
      {tab === "users" && (
        <div>
          <h2>Users</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button onClick={() => deleteUser(u.email)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === "reports" && (
        <div>
          <h2>Reports</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported</th>
                <th>Reason</th>
                <th>Other Reason</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.reporterEmail}</td>
                  <td>{r.reportedEmail}</td>
                  <td>{r.reason}</td>
                  <td>{r.reason === "Others" ? r.otherReason : "-"}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteReport(r._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}