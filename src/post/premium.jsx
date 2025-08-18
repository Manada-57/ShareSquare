import React, { useState } from "react";
import styles from "./PremiumSubscription.module.css";
import { SiRazorpay } from "react-icons/si";

export default function PremiumSubscription() {
  const [materialType, setMaterialType] = useState("");
  const [days, setDays] = useState(1);

  const pricing = {
    Expensive: 100,
    Medium: 50,
    Small: 20,
  };

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!materialType) {
      alert("Please select a material type");
      return;
    }

    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const amount = pricing[materialType] * days * 100; // Razorpay takes amount in paise

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key
      amount: amount,
      currency: "INR",
      name: "ShareSquare Premium",
      description: `Subscription for ${materialType} material`,
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "Your User",
        email: "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className={styles.container}>
      <h1>Premium Subscription</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRazorpayPayment();
        }}
        className={styles.form}
      >
        <label>
          Material Type:
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            required
          >
            <option value="">Select type</option>
            <option value="Expensive">Expensive</option>
            <option value="Medium">Medium</option>
            <option value="Small">Small</option>
          </select>
        </label>

        <label>
          Number of Days:
          <input
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            required
          />
        </label>

        <div className={styles.price}>
          <strong>
            Total Price: ₹{materialType ? pricing[materialType] * days : 0}
          </strong>
        </div>

        <button type="submit" className={styles.subscribeButton}>
          <SiRazorpay size={24} style={{ marginRight: "8px" }} />
          Pay with Razorpay
        </button>
      </form>

      <div className={styles.infoBox}>
        <h3>Why go Premium?</h3>
        <ul>
          <li>Borrow rare items with higher priority</li>
          <li>Extended borrowing days without extra fee</li>
          <li>Access to exclusive exchange offers</li>
          <li>24/7 customer support</li>
        </ul>
      </div>
    </div>
  );
}
