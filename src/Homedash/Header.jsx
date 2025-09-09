// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaTh, FaRegCommentAlt, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Hide menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/logout");
      sessionStorage.removeItem("user");
      navigate("/signup", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="app-header">
      {/* Left side */}
      <div className="header-left">
        <h1 className="app-name">ShareSquare</h1>
        <nav>
          <ul>
            <li onClick={() => navigate("/home")}>Home</li>
            <li onClick={() => navigate("/post")}>Post</li>
            <li onClick={() => navigate("/explore")}>Explore</li>
            <li onClick={() => navigate("/premium")}>Premium</li>
          </ul>
        </nav>
      </div>

      {/* Search bar */}
      <div className="header-search">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search" />
      </div>

      {/* Right side icons */}
      <div className="header-right">
        <FaRegCommentAlt className="icon" title="Messages" onClick={()=>navigate("/chatbox")} />
        <FaBell className="icon" title="Notifications" />
        <FaTh className="icon" title="Apps" />

        <div className="profile-menu" ref={menuRef}>
          <FaUserCircle
            className="icon user-icon"
            title="Profile"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="dropdown-menu">
              <p onClick={() => navigate("/profile")}>Profile</p>
              <p onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
