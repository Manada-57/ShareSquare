//ViewPosts.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewPosts.css";

export default function ViewPosts() {
  const { email } = useParams(); // owner’s email
  const [posts, setPosts] = useState([]);
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await axios.get(`https://sharesquare-y50q.onrender.com/api/posts?email=${email}`);
      setPosts(res.data);
    };
    fetchPosts();
  }, [email]);

  const handleClick = async (postId, postTitle, ownerEmail) => {
  const requestType = window.prompt("Type 'Borrow' or 'Exchange'");
  if (!["Borrow", "Exchange"].includes(requestType)) return;

  try {
    await axios.post("https://sharesquare-y50q.onrender.com/api/request/send", {
      postId,
      postTitle,
      requestType,
      requesterEmail: currentUser, // sender
      ownerEmail,                  // owner of the post
    });

    alert(`Request for ${postTitle} (${requestType}) sent successfully.`);
    navigate("/chatbox"); // go back to chat
  } catch (err) {
    console.error(err);
    alert("Failed to send request.");
  }
};

  return (
    <div className="posts-page">
      <h2>{email}'s Posts</h2>
      <div className="post-list">
        {posts.map((p) => (
          <div key={p._id} className="post-card" onClick={() => handleClick(p._id, p.title,p.userEmail)}>
            <img src={p.images[0]} alt={p.title} />
            <h4>{p.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}