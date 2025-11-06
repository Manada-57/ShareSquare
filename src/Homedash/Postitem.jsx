import React, { useState } from "react";
import axios from "axios";
import "./Postitem.css";
import Header from "./Header.jsx";

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
    latitude: "",
    longitude: "",
    contactPrefs: [],
    images: [],
  });

  const availableTags = ["Exchangeable", "Borrow", "Sale"];

  // 🧭 Fetch coordinates when user enters a location
  const fetchCoordinates = async () => {
    if (!formData.location) {
      alert("Please enter a location first!");
      return;
    }

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: formData.location,
            format: "json",
            limit: 1,
          },
        }
      );

      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        console.log("✅ Coordinates found:", lat, lon, display_name);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          location: display_name,
        }));
      } else {
        alert("❌ No results found for that place.");
      }
    } catch (err) {
      console.error("❌ Error fetching coordinates:", err);
      alert("Error fetching location data. Try again.");
    }
  };

  // 🧩 Input and form handling
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox" && name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: checked
          ? [...prev.tags, value]
          : prev.tags.filter((tag) => tag !== value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        contactPrefs: checked
          ? [...prev.contactPrefs, value]
          : prev.contactPrefs.filter((pref) => pref !== value),
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        images: [...files],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🚀 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("userEmail", userEmail);
      formDataToSend.append("tags", JSON.stringify(formData.tags));
      formDataToSend.append("contactPrefs", JSON.stringify(formData.contactPrefs));
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const res = await axios.post("https://sharesquare-y50q.onrender.com/api/post", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("✅ Item posted successfully!");
        setFormData({
          title: "",
          description: "",
          category: "",
          condition: "",
          tags: [],
          location: "",
          latitude: "",
          longitude: "",
          contactPrefs: [],
          images: [],
        });
      }
    } catch (err) {
      console.error("❌ Error posting item:", err);
    }
  };

  return (
    <div className="post-container">
      <Header />

      <div className="post-wrapper">
        <h1 className="form-title">📦 Post an Item</h1>

        <form className="post-form" onSubmit={handleSubmit}>
          {/* LEFT COLUMN */}
          <div className="form-left">
            <label>Item Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>

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
              <option>Expensive</option>
              <option>Normal</option>
              <option>Small level</option>
            </select>
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-right">
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

            <label>Enter Location</label>
            <div className="location-input">
              <input
                type="text"
                name="location"
                placeholder="e.g. Sivakasi, Tamil Nadu"
                value={formData.location}
                onChange={handleChange}
              />
              <button type="button" onClick={fetchCoordinates}>
                Get Coordinates
              </button>
            </div>

            <div className="coord-display">
              {formData.latitude && (
                <>
                  <p>📍 Latitude: {formData.latitude}</p>
                  <p>🌎 Longitude: {formData.longitude}</p>
                </>
              )}
            </div>

            <label>Upload Images</label>
            <input type="file" multiple accept="image/*" onChange={handleChange} />

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

            <button type="submit" className="submitBtn">
              Post Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}