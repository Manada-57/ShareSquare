import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const email = user?.email;

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:5000/api/posts?email=${email}`)
        .then((res) => setPosts(res.data))
        .catch((err) => console.error(err));
    }
  }, [email]);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-pic">
          <img src="https://via.placeholder.com/150" alt="Profile" />
        </div>
        <div className="profile-details">
          <div className="profile-top">
            <h2>{user?.username || email?.split("@")[0]}</h2>
            <button className="edit-btn">Edit Profile</button>
          </div>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>70</strong> followers</span>
            <span><strong>63</strong> following</span>
          </div>
          <div className="profile-bio">
            <p><strong>{user?.name || "Your Name"}</strong></p>
            <p>white marker on a whiteboard is always invisible 🤝<br />THUNDER BREATHING ⚡</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="profile-divider"></div>

      {/* Posts grid */}
      <div className="post-grid">
        {posts.length > 0 ? (
          posts.map((post, index) =>
            post.images?.map((filename, i) => (
              <div key={`${index}-${i}`} className="post-item">
                <img
                  src={`http://localhost:5000/api/image/${filename}`} // GridFS route
                  alt={post.title}
                />
              </div>
            ))
          )
        ) : (
          <div className="no-posts">
            <h3>Share Photos</h3>
            <p>When you share photos, they will appear on your profile.</p>
            <button>Share your first photo</button>
          </div>
        )}
      </div>
    </div>
  );
}
