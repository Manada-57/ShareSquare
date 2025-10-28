import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import Header from './Header';

const ProfilePage = () => {
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const email = storedUser?.email;
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [posts, setPosts] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [focusedPost, setFocusedPost] = useState(null); // For modal view

  // Fetch user and posts
  const fetchUserAndPosts = async () => {
    if (!email) return;
    try {
      const userRes = await axios.get(`http://localhost:5000/api/user?email=${email}`);
      setUser(userRes.data);
      if (editing) {
        setFormData({
          name: userRes.data.name || '',
          mobileNumber: userRes.data.mobileNumber || '',
          gender: userRes.data.gender || '',
          country: userRes.data.country || '',
          state: userRes.data.state || '',
          city: userRes.data.city || ''
        });
      }
      const postsRes = await axios.get(`http://localhost:5000/api/posts?email=${email}`);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/editprofile/${email}`, formData);
      await fetchUserAndPosts();
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handleEditClick = async () => {
    const userRes = await axios.get(`http://localhost:5000/api/user?email=${email}`);
    setFormData({
      name: userRes.data.name || '',
      mobileNumber: userRes.data.mobileNumber || '',
      gender: userRes.data.gender || '',
      country: userRes.data.country || '',
      state: userRes.data.state || '',
      city: userRes.data.city || ''
    });
    setEditing(true);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedPosts([]);
  };

  const handleCheckboxChange = (postId) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedPosts.length === 0) {
      alert("Please select posts to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected posts?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/delete-multiple`, {
        data: { ids: selectedPosts },
      });
      setPosts((prev) => prev.filter((p) => !selectedPosts.includes(p._id)));
      setDeleteMode(false);
      setSelectedPosts([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete posts");
    }
  };

  const handlePostClick = (post) => {
    if (deleteMode) return; // disable focus click in delete mode
    setFocusedPost(post);
  };

  const closeModal = () => setFocusedPost(null);

  if (!user) return <p>Loading...</p>;

  // Compute average rating
  const avgRating =
    user.ratingsReceived && user.ratingsReceived.length > 0
      ? (
          user.ratingsReceived.reduce((sum, r) => sum + (r.score || 0), 0) /
          user.ratingsReceived.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="post-container">
      <Header />

      <div className="github-style-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <img src={user?.profilePic || '/default-avatar.png'} alt="Avatar" className="avatar" />
          <h2>{user?.name}</h2>
          <p>@{user?.username}</p>
          <p>{user?.email}</p>
          <p>{user?.bio}</p>
          <p><strong>Trust Score:</strong> {user.trustScore}</p>
          <p><strong>Rating:</strong> ⭐ {avgRating}</p>
          <button onClick={handleEditClick}>Edit Profile</button>

          {editing && (
            <form onSubmit={handleSubmit} className="edit-form">
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" />
              <input type="text" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} placeholder="Mobile Number" />
              <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="text" name="country" value={formData.country || ''} onChange={handleChange} placeholder="Country" />
              <input type="text"name="state" value={formData.state || ''} onChange={handleChange} placeholder="State" />
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" />
              <button type="submit">Save</button>
            </form>
          )}
        </div>

        {/* MAIN SECTION */}
        <div className="main-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Your Posts</h3>
            <button onClick={toggleDeleteMode}>
              {deleteMode ? "Cancel" : "🗑️ Delete"}
            </button>
          </div>

          {deleteMode && (
            <button onClick={handleDeleteSelected} style={{ background: "red", color: "white", marginBottom: "10px" }}>
              Confirm Delete ({selectedPosts.length})
            </button>
          )}

          <div className="post-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="post-card"
                  onClick={() => handlePostClick(post)}
                  style={{ position: "relative" }}
                >
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post._id)}
                      onChange={() => handleCheckboxChange(post._id)}
                      style={{ position: "absolute", top: "10px", right: "10px" }}
                    />
                  )}
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  <p><strong>Category:</strong> {post.category}</p>
                  {post.images?.length > 0 && (
                    <img src={post.images[0]} alt="Post" className="post-image" />
                  )}
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL (Focused Post) */}
      {focusedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{focusedPost.title}</h2>
            <p>{focusedPost.description}</p>
            <p><strong>Category:</strong> {focusedPost.category}</p>
            <p><strong>Condition:</strong> {focusedPost.condition}</p>
            <p><strong>Location:</strong> {focusedPost.location}</p>
            {focusedPost.images?.length > 0 && (
              <img
                src={focusedPost.images[0]}
                alt="Full view"
                style={{ width: "50%" ,height:"50%", borderRadius: "8px", marginTop: "10px" }}
              />
            )}
            <button onClick={closeModal} style={{ marginTop: "10px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;