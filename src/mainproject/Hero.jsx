import styles from "./Hero.module.css";
import Navbar from "./navbar.jsx"

export default function hero(){
    return (
    <div className={styles.hero}>
        <img src="./src/assets/two people.png" alt="two people"></img>
       <div className={styles.nav}><Navbar/></div>
        <div className={styles.herocontent}>
            <h1>Exchange, Borrow, and Share Locally</h1>
        <p>Easily connect with people nearby to exchange and borrow items.</p>
        </div>
        </div>
    ); 
}
