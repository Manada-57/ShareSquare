import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import Header from "./Header.jsx"; // import header
const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) navigate("/signup", { replace: true });

    axios
      .get("https://sharesquare-y50q.onrender.com/api/explore")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, [navigate]);

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
      <Header />

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
                    onClick={() => navigate(`/user/${post.email}`)}
                    title={post.email}
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
