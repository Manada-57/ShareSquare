import React from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from '../assets/login.jpg';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await axios.post('http://localhost:5000/api/login',
        { email, password });
      if (res.status === 200) {
        navigate('/home'); // Redirect on successful login
      }
    } catch (err) {
      alert(err);
      console.error(err);
    }
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
              <a href="http://localhost:5000/auth/google">
                <button type="button" className="google">Google</button>
              </a>
              <a href="http://localhost:5000/auth/github">
                <button type="button" className="github">GitHub</button>
              </a>
              <a href="http://localhost:5000/auth/linkedin">
                <button type="button" className="linkedin">LinkedIn</button>
              </a>
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
