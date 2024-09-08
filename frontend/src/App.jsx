import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Attendee from "./pages/Attendee";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";
import MyAppointment from "./pages/MyAppointment";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <div className="mx-4 sm:mx-[10%]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Attendee />} />
          <Route path="/doctors/:speciality" element={<Attendee />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/myappointments" element={<MyAppointment />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
        </Routes>
        <Footer/>
      </div>
    </>
  );
};

export default App;
