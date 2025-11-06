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
import UserProfile from "./Homedash/UserProfile.jsx";
import SearchResults from "./Homedash/SearchResults.jsx";
import ViewPosts from "./Homedash/ViewPosts.jsx";
import RequestReceived from "./Homedash/RequestReceived.jsx";
import PremiumSubscription from "./Homedash/PremiumSubscription.jsx";
import PaymentSuccess from "./Homedash/PaymentSuccess.jsx";
import PostDetails from "./Homedash/PostDetails.jsx";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminUserProfile from "./admin/AdminUserProfile.jsx";
import AdminChatPage from "./admin/AdminChatPage.jsx";
import AdminReports from "./admin/AdminReports.jsx";

function App() {
  return (
    <Routes>
      {/* Main website */}
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
      <Route path="/post" element={<PostItem />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chatbox/:email" element={<ChatBox />} />
      <Route path="/chatbox" element={<ChatBox />} />
      <Route path="/user/:email" element={<UserProfile />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/viewposts/:email" element={<ViewPosts />} />
      <Route path="/requestreceived" element={<RequestReceived />} />
      <Route path="/premium" element={<PremiumSubscription />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/post/:id" element={<PostDetails />} />

      {/* Admin routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/user/:email" element={<AdminUserProfile />} />
      <Route path="/admin/chatbox/:email" element={<AdminChatPage />} />
      <Route path="/admin/reports" element={<AdminReports />} />
    </Routes>
  );
}

export default App;