import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import signupImage from '../assets/signup_left_half.png';
import google from '../assets/download.jpeg';
import linked from '../assets/linked.png';
import github from '../assets/git.png';
import { Link,useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password === confirm && confirm !== '';
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setMessage('❌ Please enter a valid email.');
      return;
    }

    if (!isMinLength || !hasUppercase || !hasSpecialChar) {
      setMessage('❌ Password does not meet requirements.');
      return;
    }

    if (!isMatch) {
      setMessage('❌ Passwords do not match!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/verify/sendc', { email });
      setMessage('✅ Verification code sent to your email.');
      setVerificationStep(true);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to send verification code.');
    }
  };
  const handleVerifyCode = async () => {
    if (!code) {
      setMessage('❌ Please enter the verification code.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/verify/check', { email, code });
      const res = await axios.post('http://localhost:5000/api/signup', {
        name,
        email,
        password,
        confirmpassword: confirm
      });

      setMessage(`✅ ${res.data.message}`);
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Verification failed.');
    }
  };
  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={signupImage} alt="Signup" className="login-img" />
      </div>
      <div className="login-right">
        {!verificationStep ? (
          <form className="login-form" onSubmit={handleSignupSubmit}>
            <h2>Create Account</h2>
            <p>Sign up to get started with ShareSquare</p>
            <input
              type="text"
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
            <input type="password" placeholder="Confirm Password" value={confirm}onChange={(e) => setConfirm(e.target.value)} required/>
            {confirm && (
              <p className={isMatch ? "valid" : "invalid"}>{isMatch ? "✅" : "❌"} Passwords match</p>
            )}
            {message && <p className="server-message">{message}</p>}
            <button type="submit" className="login-btn">Send Verification Code</button>
            <div className="social-login">
              <p>Or sign up with</p>
              <div className="social-buttons">
                <a className="google" href="http://localhost:5000/auth/google"><img src={google} alt="Google" /> Google</a>
                <a className="github" href="http://localhost:5000/auth/github"><img src={github} alt="GitHub" /> GitHub</a>
                <a className="linkedin" href="http://localhost:5000/auth/linkedin"><img src={linked} alt="LinkedIn" /> LinkedIn</a></div>
            </div>
            <p className="switch-link">Already have an account? <Link to="/login">Login</Link></p>
          </form>
        ) : (
          <div className="login-form">
            <h2>Verify Your Email</h2>
            <p>Enter the verification code sent to your email</p>
            <input type="text"placeholder="6-digit code"value={code}onChange={(e) => setCode(e.target.value)}required/>
            {message && <p className="server-message">{message}</p>}
            <button type="button" className="login-btn" onClick={handleVerifyCode}>Verify & Complete Signup</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Signup;
