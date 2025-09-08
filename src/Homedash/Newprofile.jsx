import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Newprofile.css';

const ProfilePage = ({ email }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/user?email=${email}`).then((res) => {
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        mobileNumber: res.data.mobileNumber || '',
        gender: res.data.gender || '',
        country: res.data.country || '',
        state: res.data.state || '',
        city: res.data.city || ''
      });
    });

    axios.get(`http://localhost:5000/api/posts?email=${email}`).then((res) => {
      setPosts(res.data);
    });
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/api/users/editprofile/${user._id}`, formData);
    setUser({ ...user, ...formData });
    setEditing(false);
  };

  return (
    <div className="github-style-container">
      <div className="sidebar">
        <img src={user?.profilePic || '/default-avatar.png'} alt="Avatar" className="avatar" />
        <h2>{user?.name}</h2>
        <p>@{user?.username}</p>
        <p>{user?.email}</p>
        <p>{user?.bio}</p>
        <button onClick={() => setEditing(!editing)}>Edit Profile</button>

        {editing && (
          <form onSubmit={handleSubmit} className="edit-form">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile Number" />
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
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
  );
};

export default ProfilePage;
