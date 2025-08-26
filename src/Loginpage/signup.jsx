import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import signupImage from '../assets/signup_left_half.png';
import google from '../assets/download.jpeg';
import linked from '../assets/linked.png';
import github from '../assets/git.png';
import { useNavigate } from 'react-router-dom';
const Signup = () => {
  const [name, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password === confirm && confirm !== '';

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isMinLength || !hasUppercase || !hasSpecialChar) {
      setMessage('❌ Password does not meet requirements.');
      return;
    }

    if (!isMatch) {
      setMessage('❌ Passwords do not match!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/signup', {
        name,
        email,
        password,
        confirmpassword: confirm
      });

      setMessage(`✅ ${res.data.message}`);
      setFullname('');
      setEmail('');
      setPassword('');
      setConfirm('');
      if (res.status == 200 && res.data.message == 'User registered successfully!') {
       navigate('/login');
    }
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(`❌ ${err.response.data.message}`);
      } else {
        setMessage('❌ Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="visme_d"  data-title="Webinar Regitration form"
    data-url="g7ddqxx0-untitled-project?"
    fullPage="true"
    data-domain="forms"
    data-full-page="true"
    data-min-height="100vh"
    data-form-id="133190"> 
    <div className="login-wrapper">
      <div className="login-left">
        <img src={signupImage} alt="Signup" className="login-img" />
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSignup}>
          <h2>Create Account</h2>
          <p>Sign up to get started with ShareSquare</p>

          <input type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {password && (
            <div className="password-criteria">
              <p className={isMinLength ? "valid" : "invalid"}>
                {isMinLength ? "✅" : "❌"} At least 8 characters
              </p>
              <p className={hasUppercase ? "valid" : "invalid"}>
                {hasUppercase ? "✅" : "❌"} At least one uppercase letter
              </p>
              <p className={hasSpecialChar ? "valid" : "invalid"}>
                {hasSpecialChar ? "✅" : "❌"} At least one special character
              </p>
            </div>
          )}

          <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          {confirm && (
            <p className={isMatch ? "valid" : "invalid"}>
              {isMatch ? "✅" : "❌"} Passwords match
            </p>
          )}

          {message && <p className="server-message">{message}</p>}

          <button type="submit" className="login-btn">Sign Up</button>
          <div className="social-login">
          <p>Or sign up with</p>
          <div className="social-buttons">
             <a className="google" href="http://localhost:5000/auth/google"><img src={google} alt="Google" /> Google</a>
             <a className="github" href="http://localhost:5000/auth/github"><img src={github} alt="GitHub" /> GitHub</a>
             <a className="linkedin" href="http://localhost:5000/auth/linkedin"><img src={linked} alt="LinkedIn" /> LinkedIn</a>
          </div>
          </div>
          <div className="switch-link">
            Already have an account? <a href="/login">Login</a>
          </div>
        </form>
      </div>
    </div> 
    </div>   
  );
};

export default Signup;
