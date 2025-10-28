import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchResults = () => {
  const [sortedPosts, setSortedPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // ✅ Convert km → 1–10 distance score (1 = close, 10 = far)
  const distanceToScore = (km) => {
    if (km <= 1) return 1;
    if (km <= 3) return 2;
    if (km <= 5) return 4;
    if (km <= 8) return 6;
    if (km <= 10) return 8;
    return 10;
  };

  // ✅ Tag → numeric value
  const valueToScore = (tag) => {
    switch (tag?.toLowerCase()) {
      case "cheap":
        return 2;
      case "medium":
        return 3;
      case "expensive":
        return 5;
      default:
        return 3;
    }
  };

  // ✅ Haversine distance in km
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

  // ✅ Get user current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  // ✅ Fetch posts + trust + ML recommendations
  useEffect(() => {
    if (!userLocation) return;

    const fetchAndRecommend = async () => {
      try {
        const res = await axios.get("https://sharesquare-y50q.onrender.com/api/posts");
        const allPosts = res.data;
        const borrowerEmail = user?.email;

        // Get borrower trust
        const borrowerTrustRes = await axios.get(
          `https://sharesquare-y50q.onrender.com/api/user/trust/${borrowerEmail}`
        );
        const borrowerTrust = borrowerTrustRes.data.trustScore || 50;

        // Cache for lender trust scores
        const trustCache = {};

        // Enrich each post
        const enriched = await Promise.all(
          allPosts.map(async (post) => {
            // 🔹 Get lender trust (with cache)
            if (!trustCache[post.userEmail]) {
              const lenderTrustRes = await axios.get(
                `https://sharesquare-y50q.onrender.com/api/user/trust/${post.userEmail}`
              );
              trustCache[post.userEmail] = lenderTrustRes.data.trustScore || 50;
            }
            const lenderTrust = trustCache[post.userEmail];

            // 🔹 Calculate distance in km
            const km = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              post.location.lat,
              post.location.lon
            );

            // 🔹 Prepare feature inputs
            const distanceScore = distanceToScore(km);
            const valueScore = valueToScore(post.tags);
            const itemAvailable = 1;

            const features = [
              borrowerTrust,
              lenderTrust,
              itemAvailable,
              valueScore,
              distanceScore,
            ];

            // 🔹 Get ML prediction
            const mlRes = await axios.post("https://sharesquare-y50q.onrender.com/predict", {
              features,
            });

            const matchScore = mlRes.data.probability;
            return { ...post, matchScore, km };
          })
        );

        // ✅ Sort by ML match score (high → low)
        const sorted = enriched.sort((a, b) => b.matchScore - a.matchScore);
        setSortedPosts(sorted);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchAndRecommend();
  }, [userLocation]);

  return (
    <div className="search-results">
      <h2>🔍 Recommended Products</h2>

      {sortedPosts.length === 0 ? (
        <p>Loading recommendations...</p>
      ) : (
        <div className="posts-grid">
          {sortedPosts.map((post) => (
            <div key={post._id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <p><strong>Tag:</strong> {post.tags}</p>
              <p><strong>Distance:</strong> {post.km.toFixed(2)} km</p>
              <p><strong>Distance Score:</strong> {distanceToScore(post.km)}</p>
              <p><strong>Predicted Match:</strong> {(post.matchScore * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;