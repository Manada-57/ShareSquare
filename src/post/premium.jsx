import React, { useState } from "react";
import styles from "./PremiumSubscription.module.css";

import { SiRazorpay, SiGooglepay, SiPaytm } from "react-icons/si";
import { MdPayment } from "react-icons/md";

const paymentOptions = [
  { id: "razorpay", label: "Razorpay", icon: <SiRazorpay size={24} /> },
  { id: "googlepay", label: "Google Pay", icon: <SiGooglepay size={24} /> },
  { id: "paytm", label: "Paytm", icon: <SiPaytm size={24} /> },
  { id: "upi", label: "UPI", icon: <MdPayment size={24} /> },
];

export default function PremiumSubscription() {
  const [materialType, setMaterialType] = useState("");
  const [days, setDays] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");

  const pricing = {
    Expensive: 100,
    Medium: 50,
    Small: 20,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!materialType || !paymentMethod) {
      alert("Please select material type and payment method");
      return;
    }
    alert(
      `Subscribed for ${materialType} material for ${days} day(s). Payment via ${paymentMethod}.`
    );
  };

  return (
    <div className={styles.container}>
      <h1>Premium Subscription</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.paymentOptions}>
          <p>Select Payment Method:</p>
          {paymentOptions.map(({ id, label, icon }) => (
            <label key={id} className={styles.paymentOption}>
              <input
                type="radio"
                name="payment"
                value={id}
                checked={paymentMethod === id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              />
              <span className={styles.icon}>{icon}</span>
              {label}
            </label>
          ))}
        </div>

        <button type="submit" className={styles.subscribeButton}>
          Subscribe Now
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