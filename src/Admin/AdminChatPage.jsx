import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../Homedash/Chatbox.css";
import AdminHeader from "./AdminHeader.jsx";
export default function AdminChatPage() {
  const { email: selectedUserEmail } = useParams(); // user selected by admin
  const [selectedUserName, setSelectedUserName] = useState(""); // display name
  const [chats, setChats] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch selected user's info to get their name
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user?email=${selectedUserEmail}`);
        setSelectedUserName(res.data.name || selectedUserEmail);
      } catch (err) {
        console.error(err);
        setSelectedUserName(selectedUserEmail);
      }
    };
    fetchUserName();
  }, [selectedUserEmail]);

  // Fetch all messages of the selected user
  useEffect(() => {
    if (!selectedUserEmail) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/user-messages/${selectedUserEmail}`
        );
        const msgs = res.data;

        // Group messages by the other participant
        const grouped = {};
        for (let msg of msgs) {
          const otherEmail = msg.sender === selectedUserEmail ? msg.receiver : msg.sender;
          const otherName = msg.sender === selectedUserEmail ? msg.receiverName : msg.senderName;

          if (!grouped[otherEmail]) grouped[otherEmail] = { messages: [], name: otherName };
          grouped[otherEmail].messages.push(msg);
        }

        const chatArray = Object.keys(grouped).map(email => {
          const msgs = grouped[email].messages;
          return {
            email,
            name: grouped[email].name,
            messages: msgs,
            lastMessage: msgs[msgs.length - 1].text,
            lastTime: msgs[msgs.length - 1].timestamp,
          };
        });

        setChats(chatArray);

        // Open first chat by default
        if (chatArray.length > 0) {
          setReceiverEmail(chatArray[0].email);
          setReceiverName(chatArray[0].name);
          setMessages(chatArray[0].messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedUserEmail]);

  // When sidebar chat is clicked
  const openChat = (userEmail, chatMessages, name) => {
    setReceiverEmail(userEmail);
    setReceiverName(name);
    setMessages(chatMessages);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
            <div className="home-container">
              <AdminHeader />
    <div className="home-container">
      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <h2>Chats of {selectedUserName}</h2> {/* Display name */}
          <div className="chat-list">
            {chats.map((chat, idx) => (
              <div
                key={idx}
                className={`chat-list-item ${receiverEmail === chat.email ? "active" : ""}`}
                onClick={() => openChat(chat.email, chat.messages, chat.name)}
              >
                <div className="chat-avatar">{chat.name?.[0] || chat.email[0]}</div>
                <div className="chat-info">
                  <p className="chat-name">{chat.name}</p>
                  <p className="chat-last">{chat.lastMessage || "No messages yet"}</p>
                </div>
                <span className="chat-time">
                  {chat.lastTime
                    ? new Date(chat.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
              </div>

              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${msg.sender === selectedUserEmail ? "sent" : "received"}`}
                  >
                    <p>{msg.text}</p>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Disabled input */}
              <form className="chat-input-form">
                <input type="text" placeholder="Admin cannot send messages" disabled />
                <button type="submit" disabled>Send</button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">Select a chat to view messages</div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
