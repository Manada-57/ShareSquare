import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PremiumSubscription.module.css"; // reuse your CSS
import Header from "./Header.jsx";
export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const product =  decodeURIComponent(searchParams.get("product")) || "Subscription";
  return (
    <div className="post-container">
      <Header />
    <div className={styles.container}>
      <h1>Payment Successful ✅</h1>
      <p>Thank you for subscribing to: <strong>{product}</strong></p>
      <p>Your subscription is now active!</p>

      <button
        className={styles.subscribeButton}
        onClick={() => navigate("/home")} // redirect to homepage or dashboard
      >
        Go to Dashboard
      </button>
    </div>
    </div>
  );
}