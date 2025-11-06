import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";
import AdminHeader from "./AdminHeader.jsx";
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    axios.delete(`http://localhost:5000/api/admin/users/${email}`)
      .then(() => fetchUsers())
      .catch(err => console.error(err));
  };

  return (
            <div className="home-container">
              <AdminHeader />
    <div className="admin-users">
      <h2>All Users</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.email}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>
                <button onClick={() => navigate(`/admin/user/${user.email}`)}>View Profile</button>
                <button onClick={() => deleteUser(user.email)}>Delete User</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}