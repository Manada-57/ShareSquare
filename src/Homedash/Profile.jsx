import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import Header from './Header';

const ProfilePage = () => {
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const email = storedUser?.email; // extract email
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [posts, setPosts] = useState([]);

  // Function to fetch user and posts
  const fetchUserAndPosts = async () => {
    if (!email) return;
    try {
      const userRes = await axios.get(`https://sharesquare-y50q.onrender.com/api/user?email=${email}`);
      setUser(userRes.data);

      // Only update formData if editing, otherwise leave it empty
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

      const postsRes = await axios.get(`https://sharesquare-y50q.onrender.com/api/posts?email=${email}`);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch latest data on mount
  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      // Update profile using email
      await axios.put(`https://sharesquare-y50q.onrender.com/api/users/editprofile/${email}`, formData);

      // Fetch latest data to refresh sidebar and form
      await fetchUserAndPosts();
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  // Open edit form and load latest data
  const handleEditClick = async () => {
    if (!email) return;
    try {
      const userRes = await axios.get(`https://sharesquare-y50q.onrender.com/api/user?email=${email}`);
      setFormData({
        name: userRes.data.name || '',
        mobileNumber: userRes.data.mobilenumber || '',
        gender: userRes.data.gender || '',
        country: userRes.data.country || '',
        state: userRes.data.state || '',
        city: userRes.data.city || ''
      });
      setEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>; // loading fallback

  return (
    <div className="post-container">
      <Header />

      <div className="github-style-container">
        <div className="sidebar">
          <img src={user?.profilePic || '/default-avatar.png'} alt="Avatar" className="avatar" />
          <h2>{user?.name}</h2>
          <p>@{user?.username}</p>
          <p>{user?.email}</p>
          <p>{user?.bio}</p>
          <button onClick={handleEditClick}>Edit Profile</button>

          {editing && (
            <form onSubmit={handleSubmit} className="edit-form">
              <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" />
              <input name="mobileNumber" value={user.mobileNumber || ''} onChange={handleChange} placeholder="Mobile Number" />
              <select name="gender" value={user.gender || ''} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input name="country" value={user.country || ''} onChange={handleChange} placeholder="Country" />
              <input name="state" value={user.state || ''} onChange={handleChange} placeholder="State" />
              <input name="city" value={user.city || ''} onChange={handleChange} placeholder="City" />
              <button type="submit">Save</button>
            </form>
          )}
        </div>

        <div className="main-section">
          <h3>Your Posts</h3>
          <div className="post-grid">
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} className="post-card">
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
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
    </div>
  );
};

export default ProfilePage;