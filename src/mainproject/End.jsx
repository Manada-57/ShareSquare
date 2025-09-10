import styles from "./End.Module.css";
import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function EndPage() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.let}>
                <h2 className={styles.type}>Let's Connect There</h2>
                 <Link to="/signup" className={styles.circle}><h2>Join Us ➤</h2></Link>
                
            </div>

            <div className={styles.footerGrid}>
                <div className={styles.brandSection}>
                    <h3 className={styles.logo}>ShareSquare</h3>
                    <p className={styles.para}>
                        ShareSquare is a local exchange platform connecting people nearby to share and swap goods.
                        Empowering communities with fair exchange, transparent deals, and a better way to share things with trust.
                    </p>

                    <div className={styles.socials}>
                        <FaFacebookF size={20} />
                        <FaTwitter size={20} />
                        <FaInstagram size={20} />
                        <FaYoutube size={20} />
                        <FaWhatsapp size={20} />
                    </div>
                </div>

                <div className={styles.linkGroup}>
                    <h4>Navigation</h4>
                    <p>Home</p>
                    <p>Explore</p>
                    <p>Exchange</p>
                    <p>About</p>
                    <p>Contact</p>
                </div>

                <div className={styles.linkGroup}>
                    <h4>Contact</h4>
                    <p>+91 7010407151</p>
                    <p>sharesquare@gmail.com</p>
                </div>

                <div className={styles.subscribe}>
                    <h4>Get the latest updates</h4>
                    <div className={styles.inputGroup}>
                        <input type="email" placeholder="Email Address" />
                        <button>➤</button>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p>© 2025 ShareSquare Team. All Rights Reserved.</p>
                <p>User Terms & Conditions | Privacy Policy</p>
            </div>
        </div>
    );
}
