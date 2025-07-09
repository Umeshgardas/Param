import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const features = [
    { name: "Voucher Exchange", slug: "voucher-exchange" },
    { name: "Booking Movie", slug: "booking-movie" },
    { name: "Transportation Booking", slug: "transportation-booking" },
    { name: "Real Estate Booking", slug: "real-estate-booking" },
    { name: "Transaction Portal", slug: "transaction-portal" },
    { name: "Affiliate Marketing", slug: "affiliate-marketing" },
    { name: "Monetization", slug: "monetization" },
    { name: "Scraping", slug: "scraping" },
  ];

  return (
    <div className="grid-container">
      {features.map((item, index) => (
        <NavLink
          to={`/feature/${item.slug}`}
          key={index}
          className="grid-box"
        >
          <p>{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default Home;
