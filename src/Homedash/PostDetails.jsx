import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header.jsx";
import "./PostDetails.css";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const currentUserEmail = JSON.parse(sessionStorage.getItem("user"))?.email;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://sharesquare-y50q.onrender.com/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id]);

  const checkSubscription = async () => {
    try {
      const res = await axios.get(
        `https://sharesquare-y50q.onrender.com/api/subscription/${currentUserEmail}`
      );
      const sub = res.data.subscription;
      if (!sub || !sub.expiryDate) return false;
      return new Date(sub.expiryDate) > new Date();
    } catch (err) {
      console.error("Error checking subscription:", err);
      return false;
    }
  };

  const handleRequestType = async (requestType) => {
    setShowDialog(false);

    if (requestType === "Borrow") {
      const hasActiveSub = await checkSubscription();
      if (!hasActiveSub) {
        if (window.confirm("⚠️ You need an active subscription to borrow items.\nSubscribe now?"))
          navigate("/premium");
        return;
      }

      if (!startDate || !endDate) {
        alert("⚠️ Please select both start and end dates.");
        return;
      }
      if (new Date(endDate) <= new Date(startDate)) {
        alert("⚠️ End date must be after start date!");
        return;
      }
    }

    try {
      await axios.post("https://sharesquare-y50q.onrender.com/api/request/send", {
        postId: post._id,
        postTitle: post.title,
        requestType,
        requesterEmail: currentUserEmail,
        ownerEmail: post.userEmail,
        startDate: requestType === "Borrow" ? startDate : new Date(),
        endDate: requestType === "Borrow" ? endDate : null,
      });

      alert(`✅ Request for ${post.title} (${requestType}) sent successfully!`);
      navigate("/chatbox");
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("❌ Failed to send request. Please try again.");
    }
  };

  if (!post) {
    return (
          <div className="post-container">
      <Header />
      <div className="post-details-wrapper">
        <div className="loading-text">Loading post details...</div>
      </div>
      </div>
    );
  }

  return (
        <div className="post-container">
      <Header />
    <div className="post-details-wrapper">
      <div className="post-details-container">
        <div className="post-left">
          <img src={post.images[0]} alt={post.title} className="post-image" />
        </div>
        <div className="post-right">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className="post-description">{post.description}</p>
          <div className="post-info">
            <p><strong>Category:</strong> {post.category}</p>
            <p><strong>Condition:</strong> {post.condition}</p>
            <p><strong>Location:</strong> {post.location}</p>
          </div>
          <div className="post-actions">
            {post.tags.includes("Borrow") && (
              <button className="btn-primary" onClick={() => setShowDialog(true)}>🤝 Borrow</button>
            )}
            {post.tags.includes("Exchangeable") && (
              <button className="btn-secondary" onClick={() => handleRequestType("Exchange")}>🔄 Exchange</button>
            )}
          </div>
        </div>
      </div>

      {showDialog && (
        <>
          <div className="dialog-overlay" onClick={() => setShowDialog(false)}></div>
          <div className="dialog-box">
            <h3>Select Borrow Period</h3>
            <div className="date-picker">
              <label>
                📅 Start Date:
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                🔁 End Date:
                <input
                  type="date"
                  value={endDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <div className="dialog-buttons">
              <button className="btn-primary" onClick={() => handleRequestType("Borrow")}>✅ Confirm Borrow</button>
              <button className="btn-secondary" onClick={() => setShowDialog(false)}>✕ Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
    </div>
  );
}