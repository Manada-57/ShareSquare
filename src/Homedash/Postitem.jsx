import React, { useState } from "react";
import axios from "axios";
import "./Postitem.css";

export default function PostItem() {
  const storedUser = sessionStorage.getItem("user");
  const userEmail = storedUser ? JSON.parse(storedUser).email : null;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    tags: [],
    location: "",
    contactPrefs: [],
    images: []
  });

  const availableTags = ["Exchangeable", "Borrow", "Sale"];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox" && name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: checked
          ? [...prev.tags, value]
          : prev.tags.filter((tag) => tag !== value)
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        contactPrefs: checked
          ? [...prev.contactPrefs, value]
          : prev.contactPrefs.filter((pref) => pref !== value)
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        images: [...files]
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formDataToSend = new FormData();

    // Append all text fields
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("condition", formData.condition);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("userEmail", userEmail);

    // Append tags as JSON string
    formDataToSend.append("tags", JSON.stringify(formData.tags));

    // Append contact preferences as JSON string
    formDataToSend.append("contactPrefs", JSON.stringify(formData.contactPrefs));

    // Append each image
    formData.images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    const res = await axios.post("http://localhost:5000/api/post", formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (res.data.success) {
      alert("Item posted successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        tags: [],
        location: "",
        contactPrefs: [],
        images: []
      });
    }
  } catch (err) {
    console.error("Error posting item:", err);
  }
};

  return (
    <div className="wrapper">
      <h1>Post an Item</h1>
      <form className="form" onSubmit={handleSubmit}>
        
        <label>Item Title *</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label>Description *</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>

        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="">Select category</option>
          <option>Furniture</option>
          <option>Electronics</option>
          <option>Books</option>
          <option>Clothing</option>
          <option>Other</option>
        </select>

        <label>Condition</label>
        <select name="condition" value={formData.condition} onChange={handleChange}>
          <option value="">Choose product type</option>
          <option>expensive</option>
          <option>normal</option>
          <option>small level</option>
        </select>

        <label>Tags</label>
        <div className="checks">
          {availableTags.map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                name="tags"
                value={tag}
                checked={formData.tags.includes(tag)}
                onChange={handleChange}
              />
              {tag}
            </label>
          ))}
        </div>

        <label>Upload Images</label>
        <input type="file" multiple accept="image/*" onChange={handleChange} />

        <label>Location</label>
        <input type="text" name="location" placeholder="City / Pincode" value={formData.location} onChange={handleChange} />

        <label>Contact Preferences</label>
        <div className="checks">
          {["Email", "Phone", "WhatsApp"].map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                value={option}
                checked={formData.contactPrefs.includes(option)}
                onChange={handleChange}
              />
              {option}
            </label>
          ))}
        </div>

        <button type="submit" className="submitBtn">Post Item</button>
      </form>
    </div>
  );
}
