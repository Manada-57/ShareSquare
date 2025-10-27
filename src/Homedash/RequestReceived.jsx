import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RequestReceived.css";

export default function ReceivedRequests() {
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const [requests, setRequests] = useState([]);

  // Fetch requests
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

  // Auto-admin escalation every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.put(
          "http://localhost:5000/api/request/autoAdminEscalation"
        );
        if (res.data.updated > 0) {
          // Refresh requests to get updated adminuc statuses
          const refreshed = await axios.get(
            `http://localhost:5000/api/request/user/${currentUser}`
          );
          setRequests(refreshed.data);
        }
      } catch (err) {
        console.error("Error auto-escalating requests:", err);
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval); // cleanup on unmount
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

  const handleReturnRequest = async (reqId, side) => {
    try {
      await axios.put(`http://localhost:5000/api/request/return/${reqId}`, { side });

      setRequests((prev) =>
        prev.map((r) => {
          if (r._id === reqId && r.requestType === "Borrow") {
            switch (side) {
              case "ownerDirectYes":
                r.returnStatusByOwner = true;
                r.returnStatusBySender = true;
                r.returnedAt = new Date();
                r.declineCount = 0;
                r.adminuc = false;
                break;
              case "sender":
                r.returnStatusBySender = true;
                break;
              case "ownerConfirm":
                r.returnedAt = new Date();
                r.returnStatusByOwner = true;
                r.returnStatusBySender = true;
                r.declineCount = 0;
                r.adminuc = false;
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
    } catch (err) {
      console.error(err);
      alert("Failed to update return status");
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
            const borrowAccepted = req.requestType === "Borrow" && req.status === "Accepted";
            return (
              <div key={req._id} className="request-card">
                <h3>{req.postTitle}</h3>
                <p><strong>Type:</strong> {req.requestType}</p>
                <p><strong>Time:</strong> {formatDate(req.createdAt)}</p>
                {isIncoming && <p><strong>From:</strong> {req.requesterEmail}</p>}
                {isOutgoing && <p><strong>To:</strong> {req.ownerEmail}</p>}
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
                    {/* Owner sees "Item returned?" immediately */}
                    {isIncoming && !req.returnedAt && !req.returnStatusByOwner && !req.returnStatusBySender && (
                      <div className="action-buttons">
                        <p>
                          📌 Has the item <strong>{req.postTitle}</strong> been returned? Start Date: {formatDate(req.startDate)}
                        </p>
                        <button
                          className="accept-btn"
                          onClick={() => handleReturnRequest(req._id, "ownerDirectYes")}
                        >
                          Yes
                        </button>
                      </div>
                    )}

                    {/* Sender sees "Have you returned?" if owner didn't click direct Yes */}
                    {isOutgoing && !req.returnedAt && !req.returnStatusBySender && req.returnStatusByOwner !== "directYes" && (
                      <div className="action-buttons">
                        <p>
                          📌 Have you returned <strong>{req.postTitle}</strong> (Bought on: {formatDate(req.startDate)})?
                        </p>
                        <button
                          className="accept-btn"
                          onClick={() => handleReturnRequest(req._id, "sender")}
                        >
                          Yes
                        </button>
                      </div>
                    )}

                    {/* Owner confirms sender's return */}
                    {isIncoming && req.returnStatusBySender && !req.returnedAt && (
                      <div className="action-buttons">
                        <p>
                          📌 {req.requesterEmail} says the item is returned. Confirm?
                        </p>
                        <button
                          className="accept-btn"
                          onClick={() => handleReturnRequest(req._id, "ownerConfirm")}
                        >
                          Accept
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => handleReturnRequest(req._id, "ownerDecline")}
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* Display returned acknowledgement */}
                    {req.returnedAt && (
                      <p className="ack-msg">
                        ✅ Item <strong>{req.postTitle}</strong> returned on {formatDate(req.returnedAt)}
                      </p>
                    )}

                    {/* Admin undercover notice */}
                    {req.adminuc && (
                      <p className="ack-msg">
                        ⚠️ Return process for <strong>{req.postTitle}</strong> is now under admin supervision.
                      </p>
                    )}
                  </>
                )}

                {/* Outgoing completed requests (Exchange or Borrow non-return) */}
                {isOutgoing && req.status !== "Pending" && !borrowAccepted && (
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
