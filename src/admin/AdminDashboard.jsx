import React, { useState, useEffect } from "react";
import axios from "axios";
const API = "http://localhost:5000/api/admin";
export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  useEffect(() => {
    fetchUsers();
    fetchComplaints();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API}/complaints`);
      setComplaints(res.data);
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

  const updateComplaint = async (email, status) => {
    try {
      await axios.patch(`${API}/complaints/${email}`, { status });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <div>
        <button onClick={() => setTab("users")}>Manage Users</button>
        <button onClick={() => setTab("complaints")}>Manage Complaints</button>
      </div>

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

      {tab === "complaints" && (
        <div>
          <h2>Complaints</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>User Email</th><th>Complaint</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.userId?.email}</td>
                  <td>{c.text}</td>
                  <td>{c.status}</td>
                  <td>
                    <button onClick={() => updateComplaint(c.userId.email, "Verified")}>
                      Verify
                    </button>
                    <button onClick={() => updateComplaint(c.userId.email, "Pending")}>
                      Set Pending
                    </button>
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
