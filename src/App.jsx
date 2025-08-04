import { Routes, Route } from "react-router-dom";
import Hero from "./mainproject/Hero.jsx";
import Step from "./mainproject/step.jsx";
import Login from "./Loginpage/Login.jsx";
import Signup from "./Loginpage/signup.jsx";
import Feature from "./mainproject/FeatureSection.jsx";
import Home from "./Homedash/Homepage.jsx";
function App() {
  return (
    
    <Routes>
      <Route path="/" element={
        <>
        <title>sharesquare</title>
            {/* Now only shown in home */}
          <Hero />
          <Step />
          <Feature />
       
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
