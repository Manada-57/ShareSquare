import { React, useEffect} from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from '../assets/login.jpg';
import google from '../assets/download.jpeg';
import linked from '../assets/linked.png';
import github from '../assets/git.png';
const Login = () => {
  const navigate = useNavigate();
    // ✅ Capture email from query params (social login redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (email) {
      // Save social login user in sessionStorage
      sessionStorage.setItem("user", JSON.stringify({ email }));

      // Redirect to home
      navigate('/home', { replace: true });
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await axios.post('http://localhost:5000/api/login',
        { email, password });
      if (res.status === 200) {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
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
                         <a className="google" href="http://localhost:5000/auth/google"><img src={google} alt="Google" /> Google</a>
                         <a className="github" href="http://localhost:5000/auth/github"><img src={github} alt="GitHub" /> GitHub</a>
                         <a className="linkedin" href="http://localhost:5000/auth/linkedin"><img src={linked} alt="LinkedIn" /> LinkedIn</a>
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
