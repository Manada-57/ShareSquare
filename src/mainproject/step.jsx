import styles from './step.module.css';
import { Upload, Search, Handshake, Gem } from 'lucide-react';
export default function HowItWorks() {
  return (
    <div className={styles.container}>
      <h2>How It Works</h2>
       <div className={styles.underline}></div>
      <div className={styles.steps}>
        
        <div className={styles.step}>
          <div className={styles.underline2}></div>
          <h3>1. Post Your Item</h3>
          <p>Share the items you want to exchange.</p>
           <Upload size={40} color="#FF8000" />
        </div>
        <div className={styles.step}>
          <div className={styles.underline2}></div>
          <h3>2. Browse Items</h3>
          <p>Find items shared by others near you.</p>
           <Search size={40} color="#FF8000" />
        </div>
        <div className={styles.step}>
          <div className={styles.underline2}></div>
          <h3>3. Meet and Exchange</h3>
          <p>Connect and exchange safely with people nearby.</p>
           <Handshake size={40} color="#FF8000" />
        </div>
        <div className={styles.step}>
          <div className={styles.underline2}></div>
          <h3>4. Borrow via Premium</h3>
          <p>Get special access to borrow items through our Premium Hub.</p>
           <Gem size={40} color="#FF8000" />
        </div>
      </div>
    </div>
  );
}
