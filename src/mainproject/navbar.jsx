import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.whole}>
      <div className={styles.sub}>
        <div className={styles.leftLinks}>
          <Link to="/" className={`${styles.navItem} ${styles.active}`}>Home</Link>
          <Link to="/explore" className={styles.navItem}>Explore</Link>
          <Link to="/post" className={styles.navItem}>Post</Link>
        </div>

        <div className={styles.logo}>
          <div className={styles.jcCircle}><h2>SQ</h2></div>
          <h2 className={styles.jcreaText}>SHARESQUARE</h2>
        </div>

        <div className={styles.rightLinks}>
          <Link to="/premium" className={styles.navItem}>Premium hub</Link>
          <Link to="/signup" className={styles.navItem}>Sign up</Link>
          <Link to="/login" className={styles.navItem}>Login</Link>
        </div>
      </div>
    </div>
  );
}
