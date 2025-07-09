import React from "react";
import { useParams } from "react-router-dom";
import "../styles/FeatureDetail.css";

const featureContent = {
  "voucher-exchange": "Detailed information about voucher exchange.",
  "booking-movie": "Details about movie ticket booking.",
  "transportation-booking": "Book cabs, trains, or flights here.",
  "real-estate-booking": "Buy, sell or rent real estate properties.",
  "transaction-portal": "Secure transaction management system.",
  "affiliate-marketing": "Affiliate program and earning details.",
  "monetization": "Monetization strategies and ads setup.",
  "scraping": "Data scraping tools and API usage.",
};

const FeatureDetail = () => {
  const { slug } = useParams();
  const content = featureContent[slug] || "Feature not found.";

  return (
    <div className="feature-detail-container">
      <h2>{slug.replace(/-/g, " ").toUpperCase()}</h2>
      <p>{content}</p>
    </div>
  );
};

export default FeatureDetail;
