import React, { useState } from "react";
import styles from "./PremiumSubscription.module.css"; // keep original CSS
import { SiStripe } from "react-icons/si"; // Stripe icon

export default function PremiumSubscription() {
  const [planType, setPlanType] = useState("");
  const [days, setDays] = useState(1);

  const pricing = {
    Expensive: 1000, // in rupees
    Medium: 500,
    Small: 200,
  };

  const handleStripePayment = async () => {
    if (!planType) {
      alert("Please select a subscription plan");
      return;
    }

    const amount = pricing[planType] * days; // rupees, backend converts to paise

    try {
      const res = await fetch("http://localhost:5000/api/make-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, productName: `Subscription: ${planType}` }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect user to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Failed to create payment session");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Subscription Plans</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleStripePayment();
        }}
        className={styles.form}
      >
        <label>
          Subscription Plan:
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            required
          >
            <option value="">Select plan</option>
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
            Total Price: ₹{planType ? pricing[planType] * days : 0}
          </strong>
        </div>

        <button type="submit" className={styles.subscribeButton}>
          <SiStripe size={24} style={{ marginRight: "8px" }} />
          Pay with Stripe
        </button>
      </form>

      <div className={styles.infoBox}>
        <h3>Why choose a Subscription?</h3>
        <ul>
          <li>Access exclusive items with higher priority</li>
          <li>Extended usage days without extra charges</li>
          <li>Unlock special offers for subscribers</li>
          <li>24/7 customer support for subscribers</li>
        </ul>
      </div>
    </div>
  );
}
