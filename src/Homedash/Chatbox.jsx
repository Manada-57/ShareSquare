import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Chatbox.css";
import Header from "./Header.jsx";

export default function ChatPage() {
  const { email: receiverEmailParam } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const [receiverName, setReceiverName] = useState("");
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]); // sidebar list
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const newSocket = io("https://sharesquare-y50q.onrender.com");
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

    // Try to find from sidebar chats first
    const found = chats.find((c) => c.email === receiverEmailParam);
    if (found?.name) {
      setReceiverName(found.name);
    } else {
      // Fallback: fetch from backend
      const fetchUser = async () => {
        try {
          const res = await axios.get(
            `https://sharesquare-y50q.onrender.com/api/user?email=${receiverEmailParam}`
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
          `https://sharesquare-y50q.onrender.com/api/chats/${currentUser}`
        );
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChats();
  }, [currentUser]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!socket || !currentUser || !receiverEmail) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://sharesquare-y50q.onrender.com/api/messages?user1=${currentUser}&user2=${receiverEmail}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();

    // Join socket room
    socket.emit("joinRoom", { user1: currentUser, user2: receiverEmail });

    // Listen for new messages
    socket.on("chatMessage", (msg) => {
      if (
        (msg.sender === currentUser && msg.receiver === receiverEmail) ||
        (msg.sender === receiverEmail && msg.receiver === currentUser)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
            // --- Update sidebar chats (last message + last time) ---
      setChats((prevChats) => {
        const otherUser =
          msg.sender === currentUser ? msg.receiver : msg.sender;

        const existing = prevChats.find((c) => c.email === otherUser);

        let updatedChats;
        if (existing) {
          // Update existing chat
          updatedChats = prevChats.map((c) =>
            c.email === otherUser
              ? { ...c, lastMessage: msg.text, lastTime: msg.timestamp }
              : c
          );
        } else {
          // Add new chat
          updatedChats = [
            ...prevChats,
            {
              email: otherUser,
              name: msg.sender === currentUser ? receiverName : msg.sender, // fallback
              lastMessage: msg.text,
              lastTime: msg.timestamp,
            },
          ];
        }
        // Sort chats by latest message time
        return updatedChats.sort(
          (a, b) => new Date(b.lastTime) - new Date(a.lastTime)
        );
      });
    });
    return () => socket.off("chatMessage");
  }, [socket, currentUser, receiverEmail, receiverName]);

  // Auto scroll to bottom
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
      {/* HEADER */}
      <Header />

      <div className="chat-container">
        {/* LEFT SIDEBAR */}
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
                <div className="chat-avatar">
                  {chat.name?.[0] || chat.email[0]}
                </div>
                <div className="chat-info">
                  <p className="chat-name">{chat.name}</p>
                  <p className="chat-last">
                    {chat.lastMessage || "No messages yet"}
                  </p>
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

        {/* RIGHT CHAT WINDOW */}
        <div className="chat-window">
          {receiverEmail ? (
            <>
              <div className="chat-header">
                <h3>{receiverName}</h3>
              </div>
              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${
                      msg.sender === currentUser ? "sent" : "received"
                    }`}
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