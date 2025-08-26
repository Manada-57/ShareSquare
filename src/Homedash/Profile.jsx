import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Profile.css";

export default function Profile() {
  // Helper to read email from sessionStorage safely
  const getStoredUserEmail = () => {
    try {
      const s = sessionStorage.getItem("user");
      if (!s) return null;
      const u = JSON.parse(s);
      return u?.email || null;
    } catch {
      return null;
    }
  };

  // Track the "current logged in email" separately so we can react to changes
  const [userEmail, setUserEmail] = useState(() => getStoredUserEmail());

  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    name: "",
    email: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    bio: "",
  });

  // Fetch profile & posts for the given email
  const fetchProfileAndPosts = useCallback(async (email) => {
    if (!email) return;

    try {
      const [profileRes, postsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/profile/${encodeURIComponent(email)}`),
        axios.get(`http://localhost:5000/api/posts?email=${encodeURIComponent(email)}`),
      ]);

      // Accept several possible server response shapes
      const serverProfile = profileRes?.data?.profile || profileRes?.data || null;
      if (serverProfile) {
        setProfile((prev) => ({ ...prev, ...serverProfile }));
      } else {
        // fallback to session user if server didn't return profile
        const raw = sessionStorage.getItem("user");
        if (raw) {
          try {
            const stored = JSON.parse(raw);
            setProfile((prev) => ({ ...prev, ...stored }));
          } catch {}
        }
      }

      setPosts(postsRes?.data || []);
    } catch (err) {
      console.error("Error fetching profile or posts:", err);
      // On error, fallback to session user if available
      const raw = sessionStorage.getItem("user");
      if (raw) {
        try {
          const stored = JSON.parse(raw);
          setProfile((prev) => ({ ...prev, ...stored }));
        } catch {}
      }
    }
  }, []);

  // Fetch when userEmail changes (mount + when user logs in/out)
  useEffect(() => {
    if (userEmail) fetchProfileAndPosts(userEmail);
  }, [userEmail, fetchProfileAndPosts]);

  // Listen for changes to sessionStorage from other tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        setUserEmail(getStoredUserEmail());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also re-check when tab becomes visible again (useful after login redirect)
  useEffect(() => {
    const onVis = () => {
      const email = getStoredUserEmail();
      if (email !== userEmail) setUserEmail(email);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setEditing(false);
    };
    if (editing) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save handler used as form onSubmit
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const email = getStoredUserEmail();
    if (!email) {
      alert("No logged-in user to save for.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/profile/${encodeURIComponent(email)}`,
        profile
      );

      // Prefer server-returned profile if available
      const saved = res?.data?.profile || res?.data || profile;

      // Merge server-saved profile into sessionStorage user object (so we don't drop server-managed fields)
      try {
        const raw = sessionStorage.getItem("user");
        const stored = raw ? JSON.parse(raw) : {};
        const merged = { ...(stored || {}), ...saved };
        sessionStorage.setItem("user", JSON.stringify(merged));
      } catch (err) {
        // if sessionStorage set fails, still update UI
        console.warn("Could not update sessionStorage:", err);
      }

      setProfile((prev) => ({ ...prev, ...saved }));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Error updating profile. Check console/network.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setEditing(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-pic">
          <img src="https://via.placeholder.com/150" alt="Profile" />
        </div>

        <div className="profile-details">
          <div className="profile-top">
            <h2>{profile.username}</h2>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>

          <p className="profile-bio">{profile.bio || "Add a bio..."}</p>

          <div className="profile-details-list">
            <div>
              <strong>Email:</strong>
              <span>{profile.email}</span>
            </div>
            <div>
              <strong>Gender:</strong>
              <span>{profile.gender || "-"}</span>
            </div>
            <div>
              <strong>Country:</strong>
              <span>{profile.country || "-"}</span>
            </div>
            <div>
              <strong>State:</strong>
              <span>{profile.state || "-"}</span>
            </div>
            <div>
              <strong>City:</strong>
              <span>{profile.city || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-divider"></div>

      <div className="post-grid">
        {posts.length > 0 ? (
          posts.map((post, index) =>
            post.images?.map((filename, i) => (
              <div key={`${index}-${i}`} className="post-item">
                <img
                  src={`http://localhost:5000/api/image/${filename}`}
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

      {/* Modal for Editing */}
      {editing && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditing(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h3>Edit Profile</h3>

            <form className="modal-content" onSubmit={handleSave}>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={profile.username || ""}
                  onChange={handleChange}
                />
              </label>

              <label>
                Bio:
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </label>

              <label>
                Gender:
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Country:
                <input
                  type="text"
                  name="country"
                  value={profile.country || ""}
                  onChange={handleChange}
                />
              </label>

              <label>
                State:
                <input
                  type="text"
                  name="state"
                  value={profile.state || ""}
                  onChange={handleChange}
                />
              </label>

              <label>
                City:
                <input
                  type="text"
                  name="city"
                  value={profile.city || ""}
                  onChange={handleChange}
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}