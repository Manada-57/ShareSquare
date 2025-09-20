import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";
export default function UserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentUser = JSON.parse(sessionStorage.getItem("user"))?.email;
  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:5000/api/posts?email=${email}`)
        .then((res) => setPosts(res.data))
        .catch((err) => console.error(err));
      axios
        .get(`http://localhost:5000/api/user?email=${email}`)
        .then((res) => {
          setUserData(res.data);
          setFollowers(res.data.followers || 0);
          setFollowing(res.data.following || 0);
          setIsConnected(res.data.followersList?.includes(currentUser));
        })
        .catch((err) => console.error(err));
    }
  }, [email, currentUser]);
  const handleConnect = () => {
    axios
      .post(`http://localhost:5000/api/connect`, {
        currentUser,
        targetUser: email,
      })
      .then((res) => {
        setIsConnected(res.data.connected);
        setFollowers(res.data.followersCount);
      })
      .catch((err) => console.error(err));
  };
  const handleMessage = () => {
    navigate(`/chatbox/${email}`);
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-pic">
          <img src={userData?.profilePic || "https://via.placeholder.com/150"} alt="Profile" />
        </div>
        <div className="profile-details">
          <div className="profile-top">
            <h2>{userData?.username || email?.split("@")[0]}</h2>
            <div className="user-buttons">
              {currentUser !== email && (
                <>
                  <button className="connect-btn" onClick={handleConnect}>
                    {isConnected ? "Connected" : "Connect"}
                  </button>
                  <button className="message-btn" onClick={handleMessage}>
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{followers}</strong> followers</span>
            <span><strong>{following}</strong> following</span>
          </div>
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
