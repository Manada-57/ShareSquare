import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RequestReceived.css";

export default function ReceivedRequests() {
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return; // Only fetch if user is logged in

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/request/user/${currentUser}`);
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, [currentUser]);

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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // show readable date & time
  };

  // ✅ If no user is logged in, show message
  if (!currentUser) {
    return <p>Please log in to see your requests.</p>;
  }

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

            return (
              <div key={req._id} className="request-card">
                <h3>{req.postTitle}</h3>
                <p><strong>Type:</strong> {req.requestType}</p>
                <p><strong>Time:</strong> {formatDate(req.createdAt)}</p>

                {isIncoming && (
                  <p><strong>From:</strong> {req.requesterEmail}</p>
                )}
                {isOutgoing && (
                  <p><strong>To:</strong> {req.ownerEmail}</p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

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

                {isOutgoing && req.status !== "Pending" && (
                  <p className="ack-msg">
                    ✅ Your request for <strong>{req.postTitle}</strong> was{" "}
                    <strong>{req.status.toLowerCase()}</strong> by{" "}
                    <span>{req.ownerEmail}</span> on{" "}
                    <em>{formatDate(req.createdAt)}</em>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}