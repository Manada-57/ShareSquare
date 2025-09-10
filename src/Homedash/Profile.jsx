import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import Header from "./Header.jsx";
export default function Profile() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const email = user?.email;

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!email) return;
    axios
      .get(`http://localhost:5000/api/user?email=${email}`)
      .then((res) => {
        setUserData(res.data);
        setFormData({
          name: res.data.name || "",
          bio: res.data.bio || "",
        });
      })
      .catch((err) => console.error(err));
    axios
      .get(`http://localhost:5000/api/posts?email=${email}`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err));
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/users/editprofile/${userData?.email}`,
        formData
      );
      setUserData({ ...userData, ...formData });
      setEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
        <div className="home-container">
      {/* HEADER */}
      <Header />
    <div className="profile-container">
      <div className="sidebar">
        <div className="profile-card">
          <img
            src={userData?.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="avatar"
          />
          {editing ? (
            <form onSubmit={handleSave} className="edit-form">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="input-field"
              />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Bio"
                className="textarea-field"
              />
              <div className="form-buttons">
                <button type="submit" className="save-btn">Save</button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2>{userData?.name || email.split("@")[0]}</h2>
              <p className="username">{userData?.username }</p>
              <p className="email">{userData?.email}</p>
              <p className="bio">{userData?.bio}</p>
              <button onClick={() => setEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            </>
          )}
          <div className="followers-info">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{userData?.followers || 0}</strong> followers</span>
            <span><strong>{userData?.following || 0}</strong> following</span>
          </div>
        </div>
      </div>

      <div className="main-section">
        <h3>Your Posts</h3>
        {posts.length > 0 ? (
          <div className="post-grid">
            {posts.map((post) =>
              post.images.map((img, idx) => (
                <div key={idx} className="post-item">
                  <img src={img} alt={post.title} />
                </div>
              ))
            )}
          </div>
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
    </div>
  );
}
