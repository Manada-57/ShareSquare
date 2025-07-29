import React from 'react';
import styles from './FeatureSection.module.css'; // make sure this CSS file exists

export default function feature() {
  return (
    <div className={styles.feature-section}>
      {/* Left side image */}
      <div className={styles.feature-image}>
        <img
          src="./src/assets/exchange.png" // replace with correct image path
          alt="App Preview"
        />
      </div>

      {/* Right side content */}
      <div className={styles.feature-text}>
        <h2>
          Making<br />
          innovations<br />
          <span className={styles.highlight}>for you</span>
        </h2>

        <div className={styles.feature-box}>
          <h3>For Borrowers</h3>
          <p>
            Borrow items easily from nearby users with our real-time location and instant request system.
          </p>
        </div>

        <div className={styles.feature-box}>
          <h3>For Exchangers</h3>
          <p>
            Seamlessly list and swap goods with others, while tracking status, pickup locations, and more.
          </p>
        </div>
      </div>
    </div>
  );
};


