import React from "react";
import Header from "../components/Header";
import CategoryMenu from "../components/CategoryMenu";
import TopAttendee from "../components/TopAttendee";
import Banner from "../components/banner";

const Home = () => {
  return (
    <div>
      <Header />
      <CategoryMenu />
      <TopAttendee />
      <Banner />
    </div>
  );
};

export default Home;
