import styles from "./Hero.module.css";
import Navbar from "../mainproject/navbar.jsx";
import heroImg from "../assets/Adobe Express - file.png";
export default function hero(){
    return (
       <div className={styles.hero}>
        
            <img src={heroImg} alt="two people"></img>
            <Navbar />
            <div className={styles.herocontent}>
                <h1>Exchange, Borrow, and Share Locally</h1>
                <p>Easily connect with people nearby to exchange and borrow items.</p>
            </div>
        </div>
    ); 
}
