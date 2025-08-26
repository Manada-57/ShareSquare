import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Homepage.css";
import {
  FaSearch,
  FaBell,
  FaTh,
  FaRegCommentAlt,
  FaUserCircle,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [posts, setPosts] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) navigate("/signup", { replace: true });

    // Fetch posts for homepage
    axios
      .get("http://localhost:5000/api/explore")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setShowMenu(false);
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

  const categories = [
    "Trending",
    "Funny",
    "Aww",
    "Anime",
    "Art",
    "Handmade",
    "Wallpapers",
    "Tech",
  ];

  return (
    <div className="home-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-name">ShareSquare</h1>
          <nav>
            <ul>
              <li onClick={() => navigate("/post")}>Post</li>
              <li onClick={() => navigate("/explore")}>Explore</li>
              <li onClick={() => navigate("/premium")}>Premium</li>
              <li onClick={() => navigate("/chatbox")}>Chat</li>
            </ul>
          </nav>
        </div>

        <div className="header-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search" />
        </div>

        <div className="header-right">
          <FaRegCommentAlt className="icon" title="Messages" />
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

      {/* CATEGORY BAR */}
      <div className="category-bar">
        {categories.map((cat, index) => (
          <button key={index} className="category-btn">
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS FEED */}
      <main className="posts-feed">
        {posts.length > 0 ? (
          posts.map((post, index) =>
            post.images?.map((img, i) => (
              <div key={`${index}-${i}`} className="post-card">
                <img
                  src={img}
                  alt={post.title || "Post image"}
                  className="post-img"
                />
                <div className="post-details">
                  <h3>{post.title || "Untitled"}</h3>
                  <p
                    className="post-user clickable"
                    onClick={() => navigate(`/profile/${post.email}`)}
                    title={post.email} // optional tooltip showing email
                  >
                    👤 {post.username || post.email?.split("@")[0] || "Unknown"}
                  </p>
                  <div className="post-stats">
                    <span>👍 {post.likes || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>👁 {post.views || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <p className="no-posts">No posts available</p>
        )}
      </main>
    </div>
  );
};

export default Home;
