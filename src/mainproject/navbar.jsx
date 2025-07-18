import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.whole}>
      <div className={styles.sub}>
        <div className={styles.leftLinks}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>Home</a>
          <a href="#" className={styles.navItem}>Explore</a>
          <a href="#" className={styles.navItem}>Post</a>
        </div>

        <div className={styles.logo}>
          <div className={styles.jcCircle}><h2>SQ</h2></div>
          <h2 className={styles.jcreaText}>SHARESQUARE</h2>
        </div>

        <div className={styles.rightLinks}>
          <a href="#" className={styles.navItem}>Premium hub</a>
          <a href="#" className={styles.navItem}>Sign up</a>
          <a href="#" className={styles.navItem}>login</a>
        </div>
      </div>
    </div>
  );
}
