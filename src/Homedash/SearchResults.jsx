import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchResults.css";
import Header from "./Header";
const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");

  useEffect(() => {
    if (!searchQuery) return;

    const fetchResults = async () => {
      try {
        const res = await axios.get(
          `https://sharesquare-y50q.onrender.com/api/posts/search?query=${encodeURIComponent(searchQuery)}&sort=${sortBy}`
        );
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, sortBy]);

  if (!searchQuery) return <p className="no-query">No search query provided.</p>;

  return (
        <div className="post-container">
          <Header />
    
    <div className="search-page-container">
      {/* Sidebar Filters */}
      <aside className="search-sidebar">
        <h3>Filters</h3>
        <div className="filter-section">
          <h4>Categories</h4>
          <ul>
            <li>Mobiles & Accessories</li>
            <li>Electronics</li>
            <li>Home & Furniture</li>
            <li>Fashion</li>
          </ul>
        </div>
        <div className="filter-section">
          <h4>Price</h4>
          <input type="range" min="0" max="50000" step="1000" />
        </div>
      </aside>

      {/* Main Results */}
      <main className="search-results">
        <div className="results-header">
          <p>
            Showing 1 – {results.length} of {results.length} results for "{searchQuery}"
          </p>
          <div className="sort-options">
            <label>Sort By: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="popularity">Popularity</option>
              <option value="priceLow">Price -- Low to High</option>
              <option value="priceHigh">Price -- High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="results-list">
            {results.map((post) => (
              <div
                key={post._id}
                className="result-card"
                onClick={() => navigate(`/product/${post._id}`)}
              >
                <div className="card-image">
                  <img
  src={post.images?.[0] || "/default-product.png"}
  alt={post.title}
  onError={(e) => (e.target.src = "/default-product.png")}
/>

                </div>
                <div className="card-details">
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <p className="price">₹{post.price || "N/A"}</p>
                  {post.offer && <p className="offer">{post.offer}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
    </div>
  );
};

export default SearchResults;