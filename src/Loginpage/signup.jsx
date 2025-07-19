import React, { useState } from 'react';
import './Signup.css';
import signupImage from '../assets/signup_left_half.png'; // use a relevant image

const Signup = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Signup submitted (email verification would be sent)");
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={signupImage} alt="Signup" className="login-img" />
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSignup}>
          <h2>Create Account</h2>
          <p>Sign up to get started with ShareSquare</p>

          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            required 
          />
          
          <button type="submit" className="login-btn">Sign Up</button>

          <div className="social-login">
            <p>Or sign up with</p>
            <div className="social-buttons">
              <button type="button" className="google">Google</button>
              <button type="button" className="github">GitHub</button>
              <button type="button" className="linkedin">LinkedIn</button>
            </div>
          </div>

          <div className="switch-link">
            Already have an account? <a href="/login">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
