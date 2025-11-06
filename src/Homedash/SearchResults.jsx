import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResults.css"; // ✅ Import CSS file
import Header from "./Header.jsx";
const SearchResults = () => {
  const [sortedPosts, setSortedPosts] = useState([]);
  const [placeInput, setPlaceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  const distanceToScore = (km) => {
    if (km <= 1) return 1;
    if (km <= 3) return 2;
    if (km <= 5) return 4;
    if (km <= 8) return 6;
    if (km <= 10) return 8;
    return 10;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getCoordinates = async (place) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          place
        )}&format=json&limit=1`,
        { headers: { "User-Agent": "ShareSquare/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (err) {
      console.error("❌ Error fetching coordinates:", err);
      return null;
    }
  };

  const fetchRecommendations = async (coords) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/posts/search", {
        params: { query: searchQuery },
      });
      const allPosts = res.data;
      if (!allPosts || allPosts.length === 0) {
        setSortedPosts([]);
        return;
      }

      const borrowerEmail = user?.email;
      const borrowerTrustRes = await axios.get(
        `http://localhost:5000/api/user/trust/${borrowerEmail}`
      );
      const borrowerTrust = borrowerTrustRes.data.trustScore || 50;

      const trustCache = {};

      let candidates = await Promise.all(
        allPosts.map(async (post) => {
          if (!post.latitude || !post.longitude) return null;
          if (!trustCache[post.userEmail]) {
            const lenderTrustRes = await axios.get(
              `http://localhost:5000/api/user/trust/${post.userEmail}`
            );
            trustCache[post.userEmail] = lenderTrustRes.data.trustScore || 50;
          }

          const km = calculateDistance(
            coords.lat,
            coords.lon,
            post.latitude,
            post.longitude
          );

          return {
            id: post._id,
            image: post.images && post.images.length > 0 ? post.images[0] : "/default.jpg",
            userEmail: post.userEmail,
            userName: post.userName || post.userEmail.split("@")[0],
            trust: trustCache[post.userEmail],
            distance: distanceToScore(km),
            km,
            title: post.title,
            description: post.description,
            tags: post.tags,
          };
        })
      );

      const validCandidates = candidates.filter(Boolean);
      if (validCandidates.length === 0) {
        setSortedPosts([]);
        return;
      }

      const mlRes = await axios.post("http://127.0.0.1:5000/search", {
        mode: "borrower",
        borrower: { trust: borrowerTrust },
        item: { available: 1, value: 3 },
        candidates: validCandidates.map((c) => ({
          id: c.id,
          trust: c.trust,
          distance: c.distance,
        })),
      });

      const ranked = mlRes.data;

      const rankedPosts = ranked.map((r) => {
        const post = validCandidates.find((p) => p.id === r.id);
        return {
          ...post,
          matchScore: r.match_prob,
        };
      });

      setSortedPosts(rankedPosts);
    } catch (err) {
      console.error("❌ Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!placeInput.trim()) return alert("Enter your location!");
    const coords = await getCoordinates(placeInput);
    if (!coords) return alert("Couldn't find that place.");
    fetchRecommendations(coords);
  };

  const handleUserClick = (email) => {
    navigate(`/user/${encodeURIComponent(email)}`);
  };

  const handlePostClick = (id) => {
    navigate(`/post/${id}`);
  };

  return (
    <div className="post-container">
      <Header />
    <div className="search-container">
      <div className="search-header">
        <h2>
          🔍 Search Results for <span>“{searchQuery}”</span>
        </h2>

        <div className="search-bar">
          <input
            type="text"
            value={placeInput}
            onChange={(e) => setPlaceInput(e.target.value)}
            placeholder="Enter your city or area (e.g., Sivakasi)"
          />
          <button onClick={handleSearch}>Find Nearby</button>
        </div>
      </div>

      {loading ? (
        <p className="loading">⏳ Loading recommendations...</p>
      ) : sortedPosts.length === 0 ? (
        <p className="no-results">Enter your location to view recommendations.</p>
      ) : (
        <div className="results-grid">
          {sortedPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="image-container" onClick={() => handlePostClick(post.id)}>
                <img src={post.image} alt={post.title} />
                <div className="match-badge">
                  {(post.matchScore * 100).toFixed(1)}% Match
                </div>
              </div>

              <div className="post-content">
                <h3 onClick={() => handlePostClick(post.id)}>{post.title}</h3>
                <p className="description">
                  {post.description.length > 90
                    ? post.description.slice(0, 90) + "..."
                    : post.description}
                </p>

                <div
                  className="user-info"
                  onClick={() => handleUserClick(post.userEmail)}
                >
                  <div className="avatar">
                    {post.userName.charAt(0).toUpperCase()}
                  </div>
                  <span>{post.userName}</span>
                </div>

                <div className="post-footer">
                  <span>📍 {post.km?.toFixed(1)} km away</span>
                  <span>⭐ Trust {post.trust}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default SearchResults;
