import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const LandingPage = () => {
  return (
    <PublicLayout>
      <section className="landing-hero">
        <div className="landing-copy">
          <h1>
            <span className="highlight">Healthcare</span> booking made
            <br />
            smart, fast, and personal.
          </h1>
          <p>
            Connect with verified doctors, manage appointments seamlessly, and
            track your health journey with AI-powered insights. Your wellness,
            simplified.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="btn btn-primary">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Patients</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Expert Doctors</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
        <div className="landing-visual">
          <div className="hero-dashboard">
            <div className="dashboard-header">
              <div className="user-avatar">👤</div>
              <span>Welcome back, Sarah!</span>
            </div>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <span className="card-icon">📅</span>
                <span className="card-title">Next Appointment</span>
                <span className="card-value">Dr. Johnson - Today 2:00 PM</span>
              </div>
              <div className="dashboard-card">
                <span className="card-icon">💧</span>
                <span className="card-title">Water Goal</span>
                <span className="card-value">6/8 glasses</span>
              </div>
              <div className="dashboard-card">
                <span className="card-icon">🏃‍♀️</span>
                <span className="card-title">Exercise</span>
                <span className="card-value">45/60 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-steps">
        <h2>How It Works</h2>
        <p className="section-subtitle">
          Get started in three simple steps
        </p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover & Book</h3>
            <p>
              Browse verified specialists, check real-time availability, and
              book appointments instantly with our smart scheduling system.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Consult & Plan</h3>
            <p>
              Meet your doctor virtually or in-person. Receive personalized
              health plans with daily targets for water, exercise, and sleep.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Track & Thrive</h3>
            <p>
              Log daily activities, monitor progress against doctor
              recommendations, and achieve your health goals with data-driven
              insights.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2>Why Choose CARE CONNECT?</h2>
        <p className="section-subtitle">
          Advanced features designed for modern healthcare
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Booking</h3>
            <p>
              Real-time slot availability and instant confirmation. No more
              waiting on hold.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Verified Doctors</h3>
            <p>
              Connect with licensed, experienced healthcare professionals
              across all specialties.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>
              AI-powered health insights and progress tracking to keep you
              motivated and on track.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>
              HIPAA-compliant platform ensuring your health data remains
              completely confidential.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile First</h3>
            <p>
              Seamless experience across all devices. Track health and book
              appointments on the go.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>
              Round-the-clock customer support and health guidance whenever you
              need it.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Health Journey?</h2>
          <p>
            Join thousands of patients who have improved their health with
            personalized care and smart tracking.
          </p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Today
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
