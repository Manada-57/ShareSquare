// QuoteCarousel.jsx
import React, { useEffect, useState } from "react";
import styles from "./Anime.module.css";

const quotes = [
  {
    name: "Mother Teresa",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/d/d6/Mother_Teresa_1.jpg",
    quote: "It's not how much we give but how much love we put into giving.",
    explanation:
      "True generosity lies not in quantity, but in the intention and love behind it."
  },
  {
    name: "Mahatma Gandhi",
    
      photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Portrait_Gandhi.jpg/440px-Portrait_Gandhi.jpg"
,
    quote:
      "The best way to find yourself is to lose yourself in the service of others.",
    explanation: "Selflessness in helping others leads to personal growth and purpose."
  },
{
  name: "Albert Einstein",
  photo: "./src/assets/albert.png",
  quote: "The purpose of human life is to serve, and to show compassion and the will to help others.",
  explanation: "Life gains meaning through service, kindness, and our willingness to uplift one another."
}

];

export default function QuoteCarousel() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.carousel}>
      {quotes.map((q, index) => {
        let position = styles.hidden;
        if (index === now) position = styles.active;
        else if (index === (now + 1) % quotes.length) position = styles.right;
        else if (index === (now -1 + quotes.length) % quotes.length) position = styles.left;

        return (
          <div className={`${styles.card} ${position}`} key={index}>
            <div className={styles.profile}>
              <img src={q.photo} alt={q.name} className={styles.photo} />
              <span className={styles.name}>{q.name}</span>
            </div>
            
            <div className={styles.new}>
            <h2 className={styles.quote}>
              "{q.quote}"
            </h2>
            <p className={styles.explanation}>{q.explanation}</p></div>
          </div>
        );
      })}
    </div>
  );
}
