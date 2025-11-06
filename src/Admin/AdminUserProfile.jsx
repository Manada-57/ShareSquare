import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminUserProfile.css";
import AdminHeader from "./AdminHeader.jsx";
export default function AdminUserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);

  const fetchData = () => {
    axios.get(`http://localhost:5000/api/user?email=${email}`)
      .then(res => setUserData(res.data))
      .catch(err => console.error(err));
    axios.get(`http://localhost:5000/api/posts?email=${email}`)
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, [email]);

  const deletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    axios.delete(`http://localhost:5000/api/posts/${postId}`)
      .then(() => fetchData())
      .catch(err => console.error(err));
  };

  return (
            <div className="home-container">
              <AdminHeader />
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-pic">
          <img src={userData?.profilePic || "https://via.placeholder.com/150"} alt="Profile" />
        </div>
        <div className="profile-details">
          <h2>{userData?.username || email.split("@")[0]}</h2>
          <p><strong>{userData?.name}</strong></p>
          <p>{userData?.bio || "No bio"}</p>
          <button onClick={() => navigate(`/admin/chatbox/${email}`)}>View Messages</button>
        </div>
      </div>

      <div className="post-grid">
        {posts.length === 0 ? <p>No posts yet.</p> :
          posts.map(post => (
            <div key={post._id} className="post-item">
              <img src={post.images[0]} alt="Post" />
              <button className="delete-btn" onClick={() => deletePost(post._id)}>Delete Post</button>
            </div>
          ))
        }
      </div>
    </div>
    </div>
  );
}
