import React, { useState, useEffect } from "react";
import { ArrowRight, QrCode, Users, MessageCircle, Calendar, Star, Zap, MapPin, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "./landing.css";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoaded(true);
    // Add landing page class to body for dark theme
    document.body.classList.add('landing-page');
    document.documentElement.classList.add('dark');
    
    // Set up intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, observerOptions);

    // Observe all animate-on-scroll elements
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('dark');
      observer.disconnect();
    };
  }, []);

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
      // Try backend URL if it exists, otherwise use Supabase
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      if (backendUrl) {
        const response = await fetch(`${backendUrl}/api/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.detail || 'Something went wrong');
        }

        toast({
          title: "Welcome to Networq! 🎉",
          description: result.message,
        });
      } else {
        // Fallback to Supabase
        const { error } = await supabase
          .from('waitlist_signups')
          .insert([
            {
              email: email.toLowerCase(),
              source: 'landing_page',
              user_agent: navigator.userAgent
            }
          ]);

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('Email already registered for waitlist');
          }
          throw new Error(error.message || 'Something went wrong');
        }

        toast({
          title: "Welcome to Networq! 🎉",
          description: "You've successfully joined our waitlist. We'll notify you when early access is available!",
        });
      }
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Animated Background Elements */}
      <div className="bg-animations">
        <div className="floating-particles"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo-container animate-slide-in">
                <img 
                  src="/logo.png" 
                  alt="Networq" 
                  className="brand-logo"
                />
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="btn-ghost animate-fade-in">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className={`hero-title ${isLoaded ? 'animate-title' : ''}`}>
                Never Lose Another{" "}
                <span className="text-accent animate-glow">Connection</span>{" "}
                Again
              </h1>
              <p className="hero-subtitle animate-fade-up">
                Stop losing valuable contacts at networking events. Networq is the digital business 
                card with built-in CRM that makes contact exchange instant and follow-up effortless.
              </p>
              <div className="hero-cta animate-fade-up-delay">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/auth"
                    className="btn-primary hero-btn btn-3d" 
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="btn-icon" />
                  </Link>
                </div>
                <p className="hero-note">Join 1,000+ professionals already using Networq</p>
              </div>
            </div>
            <div className="hero-visual">
              <div className="phone-3d animate-float">
                <div className="phone-screen">
                  <div className="qr-demo animate-pulse-soft">
                    <QrCode size={120} className="qr-icon animate-rotate-slow" />
                    <p className="qr-text">Instant Contact Sharing</p>
                  </div>
                  <div className="screen-glow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem & Origin Story */}
      <section className="problem-section">
        <div className="container">
          <div className="problem-content">
            <h2 className="section-title animate-on-scroll">We've All Been There...</h2>
            <div className="problem-grid">
              <div className="problem-card animate-card-1">
                <div className="problem-icon-3d">
                  <div className="icon-inner">📇</div>
                </div>
                <h3>Business Cards Get Lost</h3>
                <p>Those stacks of cards? They vanish into wallet black holes, never to be seen again.</p>
                <div className="card-glow"></div>
              </div>
              <div className="problem-card animate-card-2">
                <div className="problem-icon-3d">
                  <div className="icon-inner">🔗</div>
                </div>
                <h3>Connections Fizzle Out</h3>
                <p>Great conversations at events turn into "I should reach out" thoughts that never happen.</p>
                <div className="card-glow"></div>
              </div>
              <div className="problem-card animate-card-3">
                <div className="problem-icon-3d">
                  <div className="icon-inner">📱</div>
                </div>
                <h3>Contact Info Gets Outdated</h3>
                <p>Phone numbers change, emails update, but your saved contacts stay frozen in time.</p>
                <div className="card-glow"></div>
              </div>
            </div>
            <div className="origin-story animate-on-scroll">
              <blockquote className="animate-quote">
                "After years of attending networking events where valuable connections slipped away, 
                I knew professionals needed a better solution. Networq solves the contact exchange problem once and for all."
              </blockquote>
              <cite>— Orlando Taylor, Founder</cite>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Networq Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title animate-on-scroll">How Networq Works</h2>
          <p className="section-subtitle">Three simple steps to better networking</p>
          <div className="steps-container">
            <div className="steps-grid">
              <div className="step-card animate-step-1">
                <div className="step-number-3d">
                  <span>1</span>
                  <div className="number-glow"></div>
                </div>
                <div className="step-content">
                  <QrCode className="step-icon animate-rotate-hover" />
                  <h3>Share Contacts Instantly</h3>
                  <p>Generate your QR code or scan theirs. Contact details transfer in seconds, even without internet.</p>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-card animate-step-2">
                <div className="step-number-3d">
                  <span>2</span>
                  <div className="number-glow"></div>
                </div>
                <div className="step-content">
                  <Users className="step-icon animate-scale-hover" />
                  <h3>Stay Organized Automatically</h3>
                  <p>Contacts are sorted by events, industry, and tags. No more scattered business cards.</p>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-card animate-step-3">
                <div className="step-number-3d">
                  <span>3</span>
                  <div className="number-glow"></div>
                </div>
                <div className="step-content">
                  <MessageCircle className="step-icon animate-pulse-hover" />
                  <h3>Follow Up Effortlessly</h3>
                  <p>Send messages, schedule meetings, and nurture relationships—all in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Why Networq Works Better</h2>
          <div className="features-grid">
            <div className="feature-card-3d animate-feature-1">
              <div className="feature-icon-wrapper">
                <QrCode className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>QR Code Contact Sharing</h3>
              <p>Skip the business card shuffle. Share your complete contact info instantly, online or offline.</p>
              <div className="feature-shimmer"></div>
            </div>
            <div className="feature-card-3d animate-feature-2">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>Built-in CRM</h3>
              <p>Every contact becomes a managed relationship. Track conversations, set follow-up reminders, and close more deals.</p>
              <div className="feature-shimmer"></div>
            </div>
            <div className="feature-card-3d animate-feature-3">
              <div className="feature-icon-wrapper">
                <Zap className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>Always Up-to-Date</h3>
              <p>When someone updates their info, your contacts update automatically. No more outdated phone numbers.</p>
              <div className="feature-shimmer"></div>
            </div>
            <div className="feature-card-3d animate-feature-4">
              <div className="feature-icon-wrapper">
                <MessageCircle className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>In-App Messaging</h3>
              <p>Connect directly with your contacts. Start conversations, share documents, and coordinate meetings.</p>
              <div className="feature-shimmer"></div>
            </div>
            <div className="feature-card-3d animate-feature-5">
              <div className="feature-icon-wrapper">
                <Calendar className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>Event Discovery</h3>
              <p>Find relevant networking events in your area. See who's attending before you decide to go.</p>
              <div className="feature-shimmer"></div>
            </div>
            <div className="feature-card-3d animate-feature-6">
              <div className="feature-icon-wrapper">
                <MapPin className="feature-icon" />
                <div className="icon-glow"></div>
              </div>
              <h3>Discover Local Professionals</h3>
              <p>Browse professionals in your industry and location. Connect with the right people strategically.</p>
              <div className="feature-shimmer"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Social Proof & Vision */}
      <section className="social-proof">
        <div className="container">
          <div className="vision-content">
            <h2 className="section-title animate-on-scroll">The Future of Professional Networking</h2>
            <p className="vision-text animate-on-scroll">
              We're building the networking standard that professionals worldwide will rely on. 
              Networq will be the natural way people connect at business events, conferences, and meetings.
            </p>
            <div className="stats-3d-grid">
              <div className="stat-card-3d animate-stat-1">
                <div className="stat-number">1K+</div>
                <div className="stat-label">Active Users</div>
                <div className="stat-glow"></div>
              </div>
              <div className="stat-card-3d animate-stat-2">
                <div className="stat-number">95%</div>
                <div className="stat-label">Follow-up Rate</div>
                <div className="stat-glow"></div>
              </div>
              <div className="stat-card-3d animate-stat-3">
                <div className="stat-number">3 Sec</div>
                <div className="stat-label">Contact Exchange</div>
                <div className="stat-glow"></div>
              </div>
            </div>
            <div className="testimonials">
              <div className="testimonial-3d animate-on-scroll">
                <Star className="testimonial-icon animate-star" />
                <p>"Finally, a networking solution that actually works. I never lose contacts anymore!"</p>
                <cite>— Sarah M., Sales Director</cite>
                <div className="testimonial-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Join the Revolution (Waitlist) */}
      <section className="waitlist-section" id="waitlist">
        <div className="container">
          <div className="waitlist-content">
            <h2 className="section-title animate-on-scroll">
              Get <span className="text-accent">Early Access</span>
            </h2>
            <p className="section-subtitle animate-on-scroll">
              Be among the first professionals to experience effortless networking. 
              Skip the business card hassle and never lose a valuable connection again.
            </p>
            <form className="waitlist-form-3d" onSubmit={handleWaitlistSignup}>
              <div className="form-group-3d">
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="input-field-3d"
                    placeholder="Enter your email for early access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="input-glow"></div>
                </div>
                <button type="submit" className="btn-primary btn-revolution" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Joining..." : "Get Early Access"}</span>
                  <ArrowRight className="btn-icon" />
                  <div className="btn-particles"></div>
                </button>
              </div>
            </form>
            <p className="waitlist-note animate-on-scroll">
              Join 1,000+ professionals who are ready to improve their networking. 
              Early access includes premium features free for 3 months.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="footer-3d">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-container">
                <img 
                  src="/logo.png" 
                  alt="Networq" 
                  className="footer-logo"
                />
              </div>
              <p className="footer-description">
                The digital business card with built-in CRM that makes 
                professional networking effortless and effective.
              </p>
            </div>
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
          <div className="footer-bottom">
            <p>&copy; 2024 Networq LLC. Making networking work better for everyone.</p>
            <p>Founded by Orlando Taylor</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;