import { Routes, Route } from "react-router-dom";
import Hero from "./mainproject/Hero.jsx";
import Step from "./mainproject/step.jsx";

import Login from "./Loginpage/Login.jsx";
import Signup from "./Loginpage/signup.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <>
            {/* Now only shown in home */}
          <Hero />
          <Step />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
