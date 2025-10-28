import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RequestReceived.css";

export default function ReceivedRequests() {
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const [requests, setRequests] = useState([]);
  const [ratings, setRatings] = useState({}); // store emoji ratings (persisted)

// 🔹 Load saved ratings (per logged-in user)
useEffect(() => {
  if (!currentUser) return;
  const saved = JSON.parse(localStorage.getItem(`userRatings_${currentUser}`)) || {};
  setRatings(saved);
}, [currentUser]);


  // 🔹 Fetch requests
  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/request/user/${currentUser}`
        );
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, [currentUser]);

  // 🔹 Auto-admin escalation every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.put(
          "http://localhost:5000/api/request/autoAdminEscalation"
        );
        if (res.data.updated > 0) {
          const refreshed = await axios.get(
            `http://localhost:5000/api/request/user/${currentUser}`
          );
          setRequests(refreshed.data);
        }
      } catch (err) {
        console.error("Error auto-escalating requests:", err);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // 🔹 Accept / Reject
  const handleAction = async (id, action) => {
    try {
      await axios.put(`http://localhost:5000/api/request/action/${id}`, { action });
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? { ...req, status: action === "Accept" ? "Accepted" : "Rejected" }
            : req
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

// 🔹 Return process (updated)
const handleReturnRequest = async (reqId, side) => {
  try {
    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => {
        if (r._id === reqId && r.requestType === "Borrow") {
          switch (side) {
            case "ownerDirectYes":
            case "ownerConfirm":
              r.returnStatusByOwner = true;
              r.returnStatusBySender = true;
              r.returnedAt = new Date();
              r.declineCount = 0;
              r.adminuc = false;
              break;
            case "sender":
              r.returnStatusBySender = true;
              break;
            case "ownerDecline":
              r.returnStatusByOwner = false;
              r.returnStatusBySender = false;
              r.declineCount = (r.declineCount || 0) + 1;
              if (r.declineCount >= 3) r.adminuc = true;
              break;
            default:
              break;
          }
        }
        return r;
      })
    );

    // 🔹 API call to backend (triggers trust logic)
    const res = await axios.put(
      `http://localhost:5000/api/request/return/${reqId}`,
      { side }
    );

    // ✅ Replace updated request with backend's latest version
    setRequests((prev) =>
      prev.map((r) => (r._id === reqId ? res.data.request : r))
    );

    if (side === "ownerConfirm" || side === "ownerDirectYes") {
      alert("✅ Return confirmed and trust score updated successfully!");
    } else {
      alert("✅ Return action recorded!");
    }
  } catch (err) {
    console.error("Error during return:", err);
    alert("❌ Failed to update return status");
  }
};

const handleSatisfaction = async (req, value) => {
  const from = currentUser;
  const to = req.ownerEmail === currentUser ? req.requesterEmail : req.ownerEmail;
  const role = req.ownerEmail === currentUser ? "owner" : "borrower";
  const score = value; // 1 to 5

  try {
    await axios.post("http://localhost:5000/api/user/rate", {
      from,
      to,
      score,
      role,
    });

    // ✅ Save rating for this user only (avoid mixing with others)
    setRatings((prev) => {
      const updated = { ...prev, [req._id]: value };
      localStorage.setItem(`userRatings_${currentUser}`, JSON.stringify(updated)); // <-- user-specific key
      return updated;
    });

    alert("Feedback recorded successfully! 👍");
  } catch (err) {
    console.error("Error recording feedback:", err);
    alert("Failed to submit feedback");
  }
};
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (!currentUser) return <p>Please log in to see your requests.</p>;

  return (
    <div className="requests-page">
      <h2>📬 All Requests & Updates</h2>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="requests-list">
          {requests.map((req) => {
            const isIncoming = req.ownerEmail === currentUser;
            const isOutgoing = req.requesterEmail === currentUser;
            const borrowAccepted =
              req.requestType === "Borrow" && req.status === "Accepted";

            return (
              <div key={req._id} className="request-card">
                <h3>{req.postTitle}</h3>
                <p>
                  <strong>Type:</strong> {req.requestType}
                </p>
                <p>
                  <strong>Time:</strong> {formatDate(req.createdAt)}
                </p>
                {isIncoming && (
                  <p>
                    <strong>From:</strong> {req.requesterEmail}
                  </p>
                )}
                {isOutgoing && (
                  <p>
                    <strong>To:</strong> {req.ownerEmail}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

                {/* Incoming pending requests */}
                {isIncoming && req.status === "Pending" && (
                  <div className="action-buttons">
                    <button
                      className="accept-btn"
                      onClick={() => handleAction(req._id, "Accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => handleAction(req._id, "Reject")}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {/* Borrow return workflow */}
                {borrowAccepted && (
                  <>
                    {/* Owner sees "Item returned?" */}
                    {isIncoming &&
                      !req.returnedAt &&
                      !req.returnStatusByOwner &&
                      !req.returnStatusBySender &&
                      !req.adminuc && (
                        <div className="action-buttons">
                          <p>
                            📌 Has the item <strong>{req.postTitle}</strong> been
                            returned? Start Date: {formatDate(req.startDate)}
                          </p>
                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleReturnRequest(req._id, "ownerDirectYes")
                            }
                          >
                            Yes
                          </button>
                        </div>
                      )}

                    {/* Borrower sees "Have you returned?" */}
                    {isOutgoing &&
                      !req.returnedAt &&
                      !req.returnStatusBySender &&
                      !req.adminuc && (
                        <div className="action-buttons">
                          <p>
                            📦 Have you returned <strong>{req.postTitle}</strong>{" "}
                            to the owner?
                          </p>
                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleReturnRequest(req._id, "sender")
                            }
                          >
                            Yes, I returned it
                          </button>
                        </div>
                      )}

                    {/* Owner confirm sender’s return */}
                    {isIncoming &&
                      req.returnStatusBySender &&
                      !req.returnedAt &&
                      !req.adminuc && (
                        <div className="action-buttons">
                          <p>
                            📌 {req.requesterEmail} says the item is returned.
                            Confirm?
                          </p>
                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleReturnRequest(req._id, "ownerConfirm")
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="decline-btn"
                            onClick={() =>
                              handleReturnRequest(req._id, "ownerDecline")
                            }
                          >
                            Decline
                          </button>
                        </div>
                      )}

                    {/* Display returned acknowledgement */}
                    {req.returnedAt && (
                      <p className="ack-msg">
                        ✅ Item <strong>{req.postTitle}</strong> returned on{" "}
                        {formatDate(req.returnedAt)}
                      </p>
                    )}

                    {/* Admin supervision */}
                    {req.adminuc && (
                      <p className="ack-msg">
                        ⚠️ Return process for{" "}
                        <strong>{req.postTitle}</strong> is now under admin
                        supervision.
                      </p>
                    )}

                    {/* Satisfaction rating (only after return & not yet rated) */}
                    {req.returnedAt && !ratings[req._id] && (
                      <div className="rating-section">
                        <p>
                          {isIncoming
                            ? "How satisfied are you with the borrower?"
                            : "How satisfied are you with the lender?"}
                        </p>
                        <div className="emoji-row">
                          {["😡", "😕", "😐", "😊", "😍"].map((emoji, index) => (
                            <button
                              key={index}
                              className="emoji-btn"
                              onClick={() => handleSatisfaction(req, index + 1)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
