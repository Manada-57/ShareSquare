import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Explore.css";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); // For modal

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/explore")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Failed to fetch posts", err));
  }, []);

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <h2>🔍 Explore</h2>
        <p>Discover random posts from the community</p>
      </div>

      {/* Divider */}
      <div className="explore-divider"></div>

      {/* Posts grid */}
      <div className="post-grid">
        {posts.length > 0 ? (
          posts.map((post, index) =>
            post.images?.length > 0 ? (
              post.images.map((imageUrl, i) => (
                <div
                  key={`${index}-${i}`}
                  className="post-item"
                  onClick={() =>
                    setSelectedPost({ ...post, image: imageUrl })
                  }
                >
                  <img
                    src={imageUrl} // Use Cloudinary URL directly
                    alt={post.title || "Post image"}
                  />
                  <p className="author">👤 {post.email || "Unknown user"}</p>
                </div>
              ))
            ) : (
              <div key={index} className="post-item no-image">
                <p>No images for this post</p>
              </div>
            )
          )
        ) : (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Posts from the community will appear here.</p>
          </div>
        )}
      </div>

      {/* Modal for Post Details */}
      {selectedPost && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <span
              className="close-btn"
              onClick={() => setSelectedPost(null)}
            >
              ✖
            </span>
            <img
              src={selectedPost.image} // Use Cloudinary URL
              alt="Post"
              className="modal-image"
            />
            <div className="modal-details">
              <h3>{selectedPost.title || "Untitled Post"}</h3>
              <p>{selectedPost.description || "No description available."}</p>
              <p className="author">👤 {selectedPost.email || "Unknown user"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
