import React, { useState } from "react";
import { ArrowRight, QrCode, Users, MessageCircle, Calendar, Star, Zap, Network, MapPin } from "lucide-react";
import { mockWaitlistSignup } from "../utils/mock";
import { useToast } from "../hooks/use-toast";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleWaitlistSignup = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mockWaitlistSignup(email);
      toast({
        title: "Welcome to the Movement! 🚀",
        description: "You're now on the Networq waitlist. Get ready to revolutionize your networking!",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <Network className="logo-icon" />
              <span className="logo-text">Networq</span>
            </div>
            <button className="btn-ghost header-cta" onClick={() => document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })}>
              Join Waitlist
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Never Lose Another <span className="text-accent">Connection</span> Again
            </h1>
            <p className="hero-subtitle">
              The digital business card with built-in CRM that transforms how you network. 
              One tap, one scan, unlimited possibilities.
            </p>
            <div className="hero-cta">
              <button className="btn-primary hero-btn" onClick={() => document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })}>
                Get Early Access <ArrowRight className="btn-icon" />
              </button>
              <p className="hero-note">Join 1,000+ networking professionals</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="qr-demo">
                <QrCode size={120} className="qr-icon" />
                <p className="qr-text">Instant Contact Exchange</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem & Origin Story */}
      <section className="problem-section">
        <div className="container">
          <div className="problem-content">
            <h2 className="section-title">We've All Been There...</h2>
            <div className="problem-grid">
              <div className="problem-card">
                <div className="problem-icon">📇</div>
                <h3>Business Cards Get Lost</h3>
                <p>Those stacks of cards? They disappear into wallet black holes, never to be seen again.</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🔗</div>
                <h3>Connections Fizzle Out</h3>
                <p>Great conversations at events turn into "I should reach out" thoughts that never happen.</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">📱</div>
                <h3>Contact Info Gets Outdated</h3>
                <p>Phone numbers change, emails update, but your saved contacts stay frozen in time.</p>
              </div>
            </div>
            <div className="origin-story">
              <blockquote>
                "After years of attending networking events and watching valuable connections slip away, 
                I knew there had to be a better way. Networq was born from that frustration."
              </blockquote>
              <cite>— Orlando Taylor, Founder</cite>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Networq Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to networking success</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <QrCode className="step-icon" />
                <h3>Share Instantly</h3>
                <p>Generate your unique QR code or scan someone else's. Your contact info transfers in seconds.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <Users className="step-icon" />
                <h3>Organize Automatically</h3>
                <p>Contacts are sorted by tags, industry, and events. Your built-in CRM keeps everything organized.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <MessageCircle className="step-icon" />
                <h3>Follow Up Seamlessly</h3>
                <p>Send messages, schedule meetings, and nurture relationships—all within the app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Networq is Different</h2>
          <div className="features-grid">
            <div className="feature-card">
              <QrCode className="feature-icon" />
              <h3>QR Code Magic</h3>
              <p>Instant contact exchange that works offline and online. No more fumbling with business cards.</p>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>Built-in CRM</h3>
              <p>Every connection becomes a managed relationship. Tag, sort, and follow up like a pro.</p>
            </div>
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h3>Dynamic Updates</h3>
              <p>When contacts update their info, your saved details update automatically. No more outdated data.</p>
            </div>
            <div className="feature-card">
              <MessageCircle className="feature-icon" />
              <h3>In-App Messaging</h3>
              <p>Connect, chat, and build relationships without leaving the app. Group chats included.</p>
            </div>
            <div className="feature-card">
              <Calendar className="feature-icon" />
              <h3>Event Discovery</h3>
              <p>Find local networking events, create your own, and see who's attending before you go.</p>
            </div>
            <div className="feature-card">
              <MapPin className="feature-icon" />
              <h3>Discover Network</h3>
              <p>Browse other professionals in your area and industry. Expand your network strategically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Social Proof & Vision */}
      <section className="social-proof">
        <div className="container">
          <div className="vision-content">
            <h2 className="section-title">Our Vision</h2>
            <p className="vision-text">
              To become the biggest and only necessary app for professional networking. 
              Networq will be the standard way individuals share contact information at networking events worldwide.
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">1K+</div>
                <div className="stat-label">Early Adopters</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Contact Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">3 Sec</div>
                <div className="stat-label">Average Exchange Time</div>
              </div>
            </div>
            <div className="testimonials">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <Star className="testimonial-icon" />
                  <p>"Finally, a networking solution that actually works. No more lost business cards!"</p>
                  <cite>— Beta User</cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Join the Movement (Waitlist) */}
      <section className="waitlist-section" id="waitlist">
        <div className="container">
          <div className="waitlist-content">
            <h2 className="section-title">Join the Networking Revolution</h2>
            <p className="section-subtitle">
              Get early access to Networq and be among the first to experience the future of networking.
            </p>
            <form className="waitlist-form" onSubmit={handleWaitlistSignup}>
              <div className="form-group">
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Get Early Access"}
                  <ArrowRight className="btn-icon" />
                </button>
              </div>
            </form>
            <p className="waitlist-note">
              Join 1,000+ professionals waiting to revolutionize their networking. 
              Early access members get premium features free for 3 months.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <Network className="logo-icon" />
                <span className="logo-text">Networq</span>
              </div>
              <p className="footer-description">
                The digital business card with built-in CRM, revolutionizing professional networking.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#how-it-works">How it Works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About</a></li>
                  <li><a href="#privacy">Privacy</a></li>
                  <li><a href="#terms">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Networq LLC. All rights reserved.</p>
            <p>Founded by Orlando Taylor</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;