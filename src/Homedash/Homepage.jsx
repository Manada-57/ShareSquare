import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/logout');
      navigate('/signup');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to ShareSquare!</h1>
        <p>Your trusted place to share and discover useful items.</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <section className="home-body">
        <h2>What's Next?</h2>
        <ul>
          <li>Browse shared items in your community</li>
          <li>List your unused products</li>
          <li>Connect with others and build trust</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
