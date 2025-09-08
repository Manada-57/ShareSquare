import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Editprofile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const email = user?.email;

  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    profilePic: ""
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic") {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });
    data.append("email", email);

    try {
      await axios.put("http://localhost:5000/api/user/update", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="edit-profile-page">
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <h2>Update Your Profile</h2>

        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} />
        <input type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} />

        <select name="gender" onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="text" name="country" placeholder="Country" onChange={handleChange} />
        <input type="text" name="state" placeholder="State" onChange={handleChange} />
        <input type="text" name="city" placeholder="City" onChange={handleChange} />

        <label>Profile Picture</label>
        <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />

        <button type="submit" className="save-btn">Save Changes</button>
      </form>
    </div>
  );
}
