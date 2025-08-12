import React from "react";
import styles from "./Servicequote.module.css";
import { FaQuoteLeft } from "react-icons/fa";

export default function ServiceQuote() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <FaQuoteLeft className={styles.quoteIcon} />
        <p className={styles.quote}>
    Have a great service experience — where borrowing is easy, sharing is valued,
        and helping others builds a stronger community.
        </p>
        <p className={styles.author}>– Sharesquare</p>
        <div className={styles.emoji}>🤝</div>
      </div>
    </div>
  );
}
