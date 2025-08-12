import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import axios from 'axios';
import { FaSearch, FaBell, FaTh, FaRegCommentAlt, FaUserCircle } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/logout');
      sessionStorage.removeItem('user');
      navigate('/signup', { replace: true });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="home-container">
      {/* HEADER */}
      <header className="app-header">
        {/* Left side */}
        <div className="header-left">
          <h1 className="app-name">ShareSquare</h1>
          <nav>
            <ul>
              <li onClick={() => navigate('/post')}>Post</li>
              <li onClick={() => navigate('/explore')}>Explore</li>
              <li onClick={() => navigate('/premium')}>Premium</li>
            </ul>
          </nav>
        </div>

        {/* Middle search */}
        <div className="header-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search" />
        </div>

        {/* Right side icons */}
        <div className="header-right">
          <FaRegCommentAlt className="icon" title="Messages" />
          <FaBell className="icon" title="Notifications" />
          <FaTh className="icon" title="Apps" />

          {/* Profile menu */}
          <div className="profile-menu" ref={menuRef}>
            <FaUserCircle
              className="icon user-icon"
              title="Profile"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="dropdown-menu">
                <p onClick={() => navigate('/profile')}>Profile</p>
                <p onClick={handleLogout}>Logout</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="home-body">
        <h2>Welcome to ShareSquare!</h2>
        <p>Your trusted place to share and discover useful items.</p>
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
