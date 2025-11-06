import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";

export default function UserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:5000/api/posts?email=${email}`)
        .then((res) => setPosts(res.data))
        .catch((err) => console.error(err));

      axios
        .get(`http://localhost:5000/api/user?email=${email}`)
        .then((res) => setUserData(res.data))
        .catch((err) => console.error(err));
    }
  }, [email]);

  const handleMessage = () => {
    navigate(`/chatbox/${email}`);
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-pic">
          <img
            src={userData?.profilePic || "https://via.placeholder.com/150"}
            alt="Profile"
          />
        </div>
        <div className="profile-details">
          <div className="profile-top">
            <h2>{userData?.username || email?.split("@")[0]}</h2>
            <div className="user-buttons">
              {currentUser !== email && (
                <button className="message-btn" onClick={handleMessage}>
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Removed followers, following and connect button */}

          <div className="profile-bio">
            <p><strong>{userData?.name || "User Name"}</strong></p>
            <p>{userData?.bio || "This user has no bio yet."}</p>
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
                <img src={filename} alt={post.title || "Post"} />
              </div>
            ))
          )
        ) : (
          <div className="no-posts">
            <h3>No Posts Yet</h3>
            <p>This user hasn’t shared any photos yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
