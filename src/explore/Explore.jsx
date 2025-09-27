import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Explore.css";
import Header from "../Homedash/Header.jsx";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState(""); // 🆕 store city name

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const geoRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            const foundCity =
              geoRes.data.address.city ||
              geoRes.data.address.town ||
              geoRes.data.address.village ||
              geoRes.data.address.state ||
              "";

            setCity(foundCity);

            if (foundCity) {
              // 🗺️ Step 2: Fetch posts using city name
              const postsRes = await axios.get(
                `http://localhost:5000/api/explore?city=${encodeURIComponent(
                  foundCity
                )}`
              );
              setPosts(postsRes.data);
            } else {
              setError("Could not detect your city.");
            }

            setLoading(false);
          } catch (err) {
            console.error("Failed to fetch posts", err);
            setError("Failed to fetch posts for your location.");
            setLoading(false);
          }
        },
        (err) => {
          console.error("Location error:", err);
          setError("⚠ You must allow location access to use Explore.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported in this browser.");
      setLoading(false);
    }
  }, []);

  return (
    <div className="home-container">
      <Header />
      <div className="explore-page">
        <div className="explore-header">
          <h2>📍 Explore Near You</h2>
          {city && <p>Showing posts from <b>{city}</b></p>}
          <p>Posts are filtered based on your current city</p>
        </div>
        <div className="explore-divider"></div>

        {/* Loading / Error */}
        {loading && <p className="loading">Fetching your nearby posts...</p>}
        {error && <p className="error">{error}</p>}

        {/* Posts */}
        <div className="post-grid">
          {!loading && posts.length > 0 ? (
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
                    <img src={imageUrl} alt={post.title || "Post image"} />
                    <p className="author">👤 {post.username || post.email}</p>
                  </div>
                ))
              ) : (
                <div key={index} className="post-item no-image">
                  <p>No images for this post</p>
                </div>
              )
            )
          ) : (
            !loading &&
            !error && (
              <div className="no-posts">
                <h3>No nearby posts found</h3>
                <p>Be the first one to post in your area!</p>
              </div>
            )
          )}
        </div>

        {/* Modal */}
        {selectedPost && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="close-btn"
                onClick={() => setSelectedPost(null)}
              >
                ✖
              </span>
              <img
                src={selectedPost.image}
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
    </div>
  );
}
