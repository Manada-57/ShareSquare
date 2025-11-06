import React, { useState, useEffect } from "react";
import styles from "./PremiumSubscription.module.css";
import { SiStripe } from "react-icons/si";
import Header from "./Header.jsx";
export default function PremiumSubscription() {
  const [planType, setPlanType] = useState("");
  const [days, setDays] = useState(1);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const pricing = {
    Expensive: 1000, 
    Medium: 500,
    Small: 200,
  };
  // Get user info from sessionStorage
  const currentUserEmail = JSON.parse(sessionStorage.getItem("user"))?.email;
  const currentUserName = JSON.parse(sessionStorage.getItem("user"))?.name;
  // Check if the user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUserEmail) return;
      try {
        const res = await fetch(`https://sharesquare-y50q.onrender.com/api/subscription/${currentUserEmail}`);
        const data = await res.json();
        if (data.subscription && new Date(data.subscription.expiryDate) > new Date()) {
          setIsSubscribed(true);
          setSubscriptionInfo(data.subscription);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };

    checkSubscription();
  }, [currentUserEmail]);

  const handleStripePayment = async () => {
    if (!planType) {
      alert("Please select a subscription plan");
      return;
    }
    
    if (!currentUserEmail ) {
      alert("User not logged in");
      return;
    }

    if (isSubscribed) {
      alert(`You already have an active subscription until ${new Date(subscriptionInfo.expiryDate).toLocaleDateString()}`);
      return;
    }

    const amount = pricing[planType] * days;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days); // calculate expiry date

    try {
      const res = await fetch("https://sharesquare-y50q.onrender.com/api/make-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          productName: `Subscription: ${planType}`,
          userEmail: currentUserEmail,
          name: currentUserName,
          planType,
          days,
          expiryDate,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert(data.error || "Failed to create payment session");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="post-container">
      <Header />
    <div className={styles.container}>
      <h1>Subscription Plans</h1>

      {isSubscribed && subscriptionInfo ? (
        <div className={styles.alreadySubscribed}>
          <p>You are already subscribed until <strong>{new Date(subscriptionInfo.expiryDate).toLocaleDateString()}</strong>.</p>
        </div>
      ) : (
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
      )}

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
    </div>
  );
}