import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "../pages/Home";
import Services from "../pages/Services";
import About from "../pages/About";
import Contact from "../pages/Contact";
import FeatureDetail from "../pages/FeatureDetail";
import Monetization from "../pages/Monetization";

import "./App.css";
import Trade from "../pages/Trade";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className={`app-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <h2 className="logo">🚀 Brand</h2>
          <nav>
            <NavLink to="/" end className="nav-link">Home</NavLink>
            <NavLink to="/trade" end className="nav-link">Trade</NavLink>
            <NavLink to="/services" className="nav-link">Services</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <header className="header">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <span className="header-title">Welcome to My App</span>
          </header>

          <section className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feature/:slug" element={<FeatureDetail />} />
              <Route path="/feature/monetization" element={<Monetization />} />

            </Routes>
          </section>

          <footer className="footer">© 2025 My App. All rights reserved.</footer>
        </main>
      </div>
    </Router>
  );
};

export default App;
