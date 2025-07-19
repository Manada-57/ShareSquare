import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import loginImage from '../assets/login.jpg'; // Replace with your image

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Login submitted (email verification would happen here)');
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={loginImage} alt="Login Illustration" className="login-img" />
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome Back 👋</h2>
          <p>Please sign in to continue</p>

          <input type="email" placeholder="📧 Email Address" required />
          <input type="password" placeholder="🔒 Password" required />

          <button type="submit" className="login-btn">Login</button>

          <div className="social-login">
            <p>Or login with:</p>
            <div className="social-buttons">
              <button className="google">Google</button>
              <button className="github">GitHub</button>
              <button className="linkedin">LinkedIn</button>
            </div>
          </div>

          <p className="switch-link">
            Don’t have an account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
