import styles from "./Vision.module.css";
import { FaGlobe, FaHandshake, FaTruck, FaChartLine } from "react-icons/fa";

const visionData = [
  {
    icon: <FaGlobe />,
    title: "Our Goal",
    subtitle: "Build a community-first exchange system",
    description: "We aim to connect people nearby who can lend, borrow, or swap items — no middlemen."
  },
  {
    icon: <FaHandshake />,
    title: "Core Focus",
    subtitle: "Verified users, safe exchanges",
    description: "Each member brings value — through reputation, reviews, and responsible sharing."
  },
  {
    icon: <FaTruck />,
    title: "How It Works",
    subtitle: "Request, match, deliver or meet",
    description: "Post items. Request them. Meet or get doorstep delivery via a premium system."
  },

];

export default function Vision() {
  return (
    <div className={styles.container}>
      <h1>Our Mission in Numbers</h1>
      <p className={styles.subtitle}>
        ShareSquare is built to empower local communities through smart sharing and responsible borrowing.
      </p>
      <div className={styles.visionSection}>
        {visionData.map((item, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.icon}>{item.icon}</div>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.subtitleCard}>{item.subtitle}</div>
            <div className={styles.description}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
