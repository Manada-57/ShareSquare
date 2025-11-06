import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewPosts.css";
import Header from "./Header.jsx";
export default function ViewPosts() {
  const { email } = useParams();
  const [posts, setPosts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const currentUserEmail = JSON.parse(sessionStorage.getItem("user"))?.email;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts?email=${email}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load posts:", err);
      }
    };
    fetchPosts();
  }, [email]);

  // ✅ Check active subscription
  const checkSubscription = async () => {
    try {
      console.log("Checking subscription for:", currentUserEmail);

      const res = await axios.get(
        `http://localhost:5000/api/subscription/${currentUserEmail}`
      );

      console.log("Full response:", res.data);
      const sub = res.data.subscription;

      if (!sub) {
        console.log("❌ No subscription found");
        return false;
      }

      if (!sub.expiryDate) {
        console.log("❌ No expiry date in subscription");
        return false;
      }

      const now = new Date();
      const expiry = new Date(sub.expiryDate);

      if (isNaN(expiry.getTime())) {
        console.log("❌ Invalid expiry date");
        return false;
      }

      const isValid = expiry.getTime() > now.getTime();
      console.log(isValid ? "✅ Subscription ACTIVE" : "❌ Subscription EXPIRED");

      return isValid;
    } catch (err) {
      console.error("❌ Error checking subscription:", err);
      return false;
    }
  };

  // ✅ Redirect to Stripe Checkout (if needed)
  

  // ✅ When user chooses to request a post
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowDialog(true);
  };

  // ✅ Handle Borrow / Exchange action
  const handleRequestType = async (requestType) => {

    setShowDialog(false);
    
    if (requestType === "Borrow") {
      console.log("🔍 Borrow request initiated, checking subscription...");
      const hasActiveSub = await checkSubscription();

      if (!hasActiveSub) {
        const confirm = window.confirm(
          "⚠️ You need an active subscription to borrow items.\n\nWould you like to subscribe now?"
        );
        if (confirm) {
           navigate("/premium");
        }
        return;
      }
       if (!startDate || !endDate) {
      alert("⚠️ Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      alert("⚠️ End date must be after start date!");
      return;
    }

      console.log("✅ Subscription verified, proceeding with borrow request");
    }

    try {
      await axios.post("http://localhost:5000/api/request/send", {
        postId: selectedPost._id,
        postTitle: selectedPost.title,
        requestType: requestType,
        requesterEmail: currentUserEmail,
        ownerEmail: selectedPost.userEmail,
        startDate: startDate,
        endDate: requestType === "Borrow" ? endDate : null,

      });

      alert(`✅ Request for ${selectedPost.title} (${requestType}) sent successfully!`);
      navigate("/chatbox");
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("❌ Failed to send request. Please try again.");
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedPost(null);
  };

  return (
    <div className="post-container">
      <Header />
    <div className="posts-page">
      <h2>{email}'s Posts</h2>
      <div className="post-list">
        {posts.length === 0 ? (
          <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            No posts available
          </p>
        ) : (
          posts.map((p) => (
            <div
              key={p._id}
              className="post-card1"
              onClick={() => handlePostClick(p)}
            >
              <img src={p.images[0]} alt={p.title} />
              <h4>{p.title}</h4>
            </div>
          ))
        )}
      </div>

      {/* Dialog Box */}
      {showDialog && (
        <>
          <div className="dialog-overlay" onClick={closeDialog}></div>
          <div className="dialog-box">
            {!selectedPost?.requestStep ? (
              <>
                <h3>Choose Request Type</h3>
                <p>
                  What would you like to do with <strong>{selectedPost?.title}</strong>?
                </p>
                <div className="dialog-buttons">
                  <button
                    className="dialog-btn borrow-btn"
                    onClick={() =>
                      setSelectedPost({ ...selectedPost, requestStep: "Borrow" })
                    }
                  >
                    🤝 Borrow
                  </button>
                  <button
                    className="dialog-btn exchange-btn"
                    onClick={() =>
                      setSelectedPost({ ...selectedPost, requestStep: "Exchange" })
                    }
                  >
                    🔄 Exchange
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  {selectedPost.requestStep === "Borrow"
                    ? "Borrow Request Details"
                    : "Exchange Request Details"}
                </h3>

                <div style={{ textAlign: "center" }}>
                  <label>
                    📅 Start Date:{" "}
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      style={{ margin: "8px" }}
                    />
                  </label>

                  {selectedPost.requestStep === "Borrow" && (
                    <label>
                      🔁 End Date:{" "}
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        style={{ margin: "8px" }}
                      />
                    </label>
                  )}
                </div>

                <div className="dialog-buttons">
                  <button
                    className="dialog-btn borrow-btn"
                    onClick={() => handleRequestType(selectedPost.requestStep)}
                  >
                    ✅ Confirm
                  </button>
                  <button
                    className="dialog-btn exchange-btn"
                    onClick={() =>
                      setSelectedPost({ ...selectedPost, requestStep: null })
                    }
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}

            <button className="dialog-close" onClick={closeDialog}>
              ✕
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}
