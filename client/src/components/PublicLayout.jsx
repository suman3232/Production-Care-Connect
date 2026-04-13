import React from "react";
import { Link } from "react-router-dom";
import "../styles/LayoutStyles.css";

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-brand">
          <span className="brand-icon">🏥</span>
          <span>CARE CONNECT</span>
        </div>
        <nav className="public-nav desktop-only">
          <Link to="/login">Login</Link>
          <Link to="/register" className="public-cta">
            Get Started
          </Link>
        </nav>
      </header>
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">🏥</span>
            <span>CARE CONNECT</span>
            <p>Your trusted healthcare companion</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Platform</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <a href="#booking">Smart Booking</a>
              <a href="#tracking">Health Tracking</a>
              <a href="#analytics">Analytics</a>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 CARE CONNECT. All rights reserved.</p>
          <div className="social-links">
            <a href="#facebook">📘</a>
            <a href="#twitter">🐦</a>
            <a href="#linkedin">💼</a>
          </div>
        </div>
      </footer>
      
      {/* Mobile Action Buttons */}
      <div className="mobile-actions">
        <Link to="/login" className="btn btn-secondary">
          Login
        </Link>
        <Link to="/register" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default PublicLayout;
