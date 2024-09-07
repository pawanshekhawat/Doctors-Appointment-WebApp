import React from "react";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopAttendee from "../components/TopAttendee";
import Banner from "../components/banner";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopAttendee />
      <Banner />
      <Footer/>
    </div>
  );
};

export default Home;
