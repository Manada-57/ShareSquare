import { Routes, Route } from "react-router-dom";
import Hero from "./mainproject/Hero.jsx";
import Step from "./mainproject/step.jsx";
import Login from "./Loginpage/Login.jsx";
import Signup from "./Loginpage/signup.jsx";
import Feature from "./mainproject/Feature.jsx";
import Vision from "./mainproject/Vision.jsx";
import Anime from "./mainproject/Anime.jsx";
import ServiceQuote from "./mainproject/Servicequote.jsx";
import EndPage from "./mainproject/End.jsx";
function App() {
  return (
    
     { /* <Routes>
      <Route path="/" element={
        <>
        <title>sharesquare</title>
          
          <Hero />
          <Step />
          <Feature />
          <Vision />
          <Anime /> 
          <ServiceQuote />
          <EndPage />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
    </Routes> /*   }
  );
}

export default App;
