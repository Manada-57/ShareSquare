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
import Home from "./Homedash/Home.jsx";
import Header from "./Homedash/Header.jsx";
import PostItem from "./Homedash/Postitem.jsx";
import Profile from "./Homedash/Profile.jsx";
import ChatBox from "./Homedash/Chatbox.jsx";
import Explore from "./explore/Explore.jsx";
import UserProfile from "./Homedash/UserProfile.jsx";
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
          <Vision />
          <Anime /> 
          <ServiceQuote />
          <EndPage />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/post" element={<PostItem />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chatbox/:email" element={<ChatBox />} />
      <Route path="/chatbox" element={<ChatBox />} /> 
      <Route path="/explore" element={<Explore />} />
      <Route path="/user/:email" element={<UserProfile />} />
    </Routes>
  );
}

export default App;