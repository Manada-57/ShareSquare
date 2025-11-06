import React from "react";
import { useNavigate } from "react-router-dom";
import "../Homedash/Header.css";

const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="app-header admin-header">
      <div className="header-left">
        <h1
          className="app-name"
          onClick={() => navigate("/admin-dashboard")}
          style={{ cursor: "pointer" }}
        >
          ShareSquare Admin
        </h1>
      </div>
    </header>
  );
};

export default AdminHeader;