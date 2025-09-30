import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Chatbox.css";
import Header from "./Header.jsx";
import { FaEllipsisV } from "react-icons/fa"; // three-dot icon

export default function ChatPage() {
  const { email: receiverEmailParam } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const [receiverName, setReceiverName] = useState("");
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Init socket
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (receiverEmailParam) {
      setReceiverEmail(receiverEmailParam);
    } else {
      setReceiverEmail(null);
    }
  }, [receiverEmailParam]);

  useEffect(() => {
    if (receiverEmailParam) {
      setReceiverEmail(receiverEmailParam);

      const found = chats.find((c) => c.email === receiverEmailParam);
      if (found?.name) {
        setReceiverName(found.name);
      } else {
        const fetchUser = async () => {
          try {
            const res = await axios.get(
              `http://localhost:5000/api/user?email=${receiverEmailParam}`
            );
            setReceiverName(res.data.name || receiverEmailParam);
          } catch (err) {
            console.error(err);
            setReceiverName(receiverEmailParam);
          }
        };
        fetchUser();
      }
    } else {
      setReceiverEmail(null);
      setReceiverName("");
    }
  }, [receiverEmailParam, chats]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchChats = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chats/${currentUser}`
        );
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChats();
  }, [currentUser]);

  // Fetch messages & socket listeners
  useEffect(() => {
    if (!socket || !currentUser || !receiverEmail) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages?user1=${currentUser}&user2=${receiverEmail}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();

    socket.emit("joinRoom", { user1: currentUser, user2: receiverEmail });

    socket.on("chatMessage", (msg) => {
      if (
        (msg.sender === currentUser && msg.receiver === receiverEmail) ||
        (msg.sender === receiverEmail && msg.receiver === currentUser)
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      setChats((prevChats) => {
        const otherUser =
          msg.sender === currentUser ? msg.receiver : msg.sender;
        const existing = prevChats.find((c) => c.email === otherUser);

        let updatedChats;
        if (existing) {
          updatedChats = prevChats.map((c) =>
            c.email === otherUser
              ? { ...c, lastMessage: msg.text, lastTime: msg.timestamp }
              : c
          );
        } else {
          updatedChats = [
            ...prevChats,
            {
              email: otherUser,
              name: msg.sender === currentUser ? receiverName : msg.sender,
              lastMessage: msg.text,
              lastTime: msg.timestamp,
            },
          ];
        }
        return updatedChats.sort(
          (a, b) => new Date(b.lastTime) - new Date(a.lastTime)
        );
      });
    });

    return () => socket.off("chatMessage");
  }, [socket, currentUser, receiverEmail, receiverName]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const msgObj = {
      sender: currentUser,
      receiver: receiverEmail,
      text: message,
      timestamp: new Date(),
    };

    socket.emit("chatMessage", msgObj);
    setMessage("");
  };

  return (
    <div className="home-container">
      <Header />

      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <h2>Chats</h2>
          <div className="chat-list">
            {chats.map((chat, idx) => (
              <div
                key={idx}
                className={`chat-list-item ${
                  receiverEmail === chat.email ? "active" : ""
                }`}
                onClick={() => {
                  setReceiverEmail(chat.email);
                  navigate(`/chatbox/${chat.email}`);
                }}
              >
                <div className="chat-avatar">{chat.name?.[0] || chat.email[0]}</div>
                <div className="chat-info">
                  <p className="chat-name">{chat.name}</p>
                  <p className="chat-last">{chat.lastMessage || "No messages yet"}</p>
                </div>
                <span className="chat-time">
                  {chat.lastTime
                    ? new Date(chat.lastTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="chat-window">
          {receiverEmail ? (
            <>
              <div className="chat-header">
                <h3>{receiverName}</h3>
                <div className="chat-header-menu">
                  <FaEllipsisV
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowReportModal(!showReportModal)}
                  />
                </div>
              </div>

              {/* Report Modal */}
              {showReportModal && (
                <div className="report-modal">
                  <h4>Report {receiverName}</h4>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="">Select Reason</option>
                    <option value="Spam">Spam</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Fake Post">Fake Post</option>
                    <option value="Others">Others</option>
                  </select>

                  {reportReason === "Others" && (
                    <textarea
                      placeholder="Type reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}

                  <button
                    onClick={async () => {
                      if (!reportReason) return alert("Select a reason");
                      try {
                        await axios.post("http://localhost:5000/api/report", {
                          reporterEmail: currentUser,
                          reportedEmail: receiverEmail,
                          reason: reportReason,
                          otherReason: reportReason === "Others" ? customReason : "",
                        });
                        alert("Report submitted successfully!");
                        setShowReportModal(false);
                        setReportReason("");
                        setCustomReason("");
                      } catch (err) {
                        console.error(err);
                        alert("Failed to submit report.");
                      }
                    }}
                  >
                    Submit
                  </button>
                  <button onClick={() => setShowReportModal(false)}>Cancel</button>
                </div>
              )}

              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${msg.sender === currentUser ? "sent" : "received"}`}
                  >
                    <p>{msg.text}</p>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" disabled={!message.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
