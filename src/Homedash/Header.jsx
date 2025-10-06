import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaTh, FaRegCommentAlt, FaUserCircle } from "react-icons/fa";
import io from "socket.io-client";
import "./Header.css";

const SOCKET_URL = "https://sharesquare-y50q.onrender.com"; // Backend Socket.IO URL

const Header = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const menuRef = useRef(null);

  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;

  // ---------------- SOCKET.IO ----------------
  useEffect(() => {
    if (!currentUser) return;

    const socket = io(SOCKET_URL);

    // Join user's personal room for notifications
    socket.emit("joinUserRoom", { email: currentUser });

    // Listen for incoming messages
    socket.on("chatMessage", (msg) => {
      if (msg.receiver === currentUser) {
        setHasNewMessage(true); // show red dot
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // ---------------- Profile dropdown ----------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------- Handlers ----------------
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  const handleMessagesClick = () => {
    setHasNewMessage(false); // reset red dot
    navigate("/chatbox");
  };

  // ---------------- JSX ----------------
  return (
    <header className="app-header">
      {/* Left side */}
      <div className="header-left">
        <h1 className="app-name" onClick={() => navigate("/home")}>ShareSquare</h1>
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
        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%" }}>
          <input
            type="text"
            placeholder="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Right side icons */}
      <div className="header-right">
        {/* Messages */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={handleMessagesClick}>
          <FaRegCommentAlt className="icon" title="Messages" />
          {hasNewMessage && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "red",
              }}
            />
          )}
        </div>

        {/* Other icons */}
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/requestreceived")}>
        <FaBell className="icon" title="Requests" />
        </div>
        <FaTh className="icon" title="Apps" />

        {/* Profile dropdown */}
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