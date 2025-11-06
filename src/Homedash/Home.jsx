import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import Header from "./Header.jsx";

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch posts and check user session
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) navigate("/signup", { replace: true });

    axios
      .get("http://localhost:5000/api/explore")
      .then((res) => {
        setPosts(res.data);
        setFilteredPosts(res.data);
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  // Categories for filtering
  const categories = ["All", "Furniture", "Electronics", "Books", "Clothing", "Other"];

  // Filter posts based on category
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) => post.category === category);
      setFilteredPosts(filtered);
    }
  };

  return (
    <div className="home-container">
      {/* HEADER */}
      <Header />

      {/* CATEGORY BAR */}
      <div className="category-bar">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`category-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* POSTS FEED */}
      <main className="posts-feed">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) =>
            post.images?.map((img, i) => (
              <div
                key={`${index}-${i}`}
                className="post-card0 clickable"
                onClick={() => navigate(`/post/${post._id}`)} // Navigate to PostDetails
              >
                <img
                  src={img || "/placeholder.png"}
                  alt={post.title || "Post image"}
                  className="post-img"
                />
                <div className="post-details">
                  <h3>{post.title || "Untitled"}</h3>
                  <p
                    className="post-user clickable"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to post when clicking username
                      navigate(`/user/${post.email}`);
                    }}
                    title={post.email}
                  >
                    👤 {post.username || post.email?.split("@")[0] || "Unknown"}
                  </p>
                  <p className="post-category">📂 {post.category || "Other"}</p>
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