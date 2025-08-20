import React, { useState, useEffect } from "react";
import { ArrowRight, QrCode, Users, MessageCircle, Camera, Filter, Star } from "lucide-react";
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

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className={`hero-title ${isLoaded ? 'animate-title' : ''}`}>
                Never Lose a{" "}
                <span className="text-accent animate-glow">Connection</span>{" "}
                Again
              </h1>
              <p className="hero-subtitle animate-fade-up">
                The professional networking app that keeps you organized, connected, and productive.
                Instantly save, organize, and access every contact.
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
                <p className="hero-note">Join thousands of professionals using Networq</p>
              </div>
            </div>
            <div className="hero-visual">
              <img 
                src="/lovable-uploads/c018c308-324b-4fc0-9dff-95bcced380de.png" 
                alt="Never lose a connection again - Networq app interface"
                className="hero-image animate-float"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Feature 2: Messaging */}
      <section className="feature-section feature-reverse">
        <div className="container">
          <div className="feature-layout">
            <div className="feature-image">
              <img 
                src="/lovable-uploads/d5a7f574-934a-4e95-ba65-87a654b95eb4.png" 
                alt="Messaging interface"
                className="animate-on-scroll"
              />
            </div>
            <div className="feature-content">
              <h2 className="feature-title animate-on-scroll">
                Keep the conversation alive.
              </h2>
              <p className="feature-subtitle animate-on-scroll">
                Message contacts directly and follow up with ease.
              </p>
              <div className="feature-benefits animate-on-scroll">
                <div className="benefit-item">
                  <MessageCircle className="benefit-icon" />
                  <span>Direct messaging with contacts</span>
                </div>
                <div className="benefit-item">
                  <Users className="benefit-icon" />
                  <span>Group conversations</span>
                </div>
                <div className="benefit-item">
                  <Star className="benefit-icon" />
                  <span>Follow-up reminders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: QR Sharing */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-layout">
            <div className="feature-content">
              <h2 className="feature-title animate-on-scroll">
                Share your info in seconds.
              </h2>
              <p className="feature-subtitle animate-on-scroll">
                One QR scan is all it takes.
              </p>
              <div className="feature-benefits animate-on-scroll">
                <div className="benefit-item">
                  <QrCode className="benefit-icon" />
                  <span>Generate QR codes instantly</span>
                </div>
                <div className="benefit-item">
                  <ArrowRight className="benefit-icon" />
                  <span>Copy share links</span>
                </div>
                <div className="benefit-item">
                  <Users className="benefit-icon" />
                  <span>Update contact cards in real-time</span>
                </div>
              </div>
            </div>
            <div className="feature-image">
              <img 
                src="/lovable-uploads/de68fc87-4034-4e34-bcea-69a3002e5e32.png" 
                alt="QR code sharing interface"
                className="animate-on-scroll"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Business Card Scanning */}
      <section className="feature-section feature-reverse">
        <div className="container">
          <div className="feature-layout">
            <div className="feature-image">
              <img 
                src="/lovable-uploads/47c7e8a6-0830-4387-8730-a3fd480b93c1.png" 
                alt="Business card scanning interface"
                className="animate-on-scroll"
              />
            </div>
            <div className="feature-content">
              <h2 className="feature-title animate-on-scroll">
                No more lost business cards.
              </h2>
              <p className="feature-subtitle animate-on-scroll">
                Scan and save contact info instantly.
              </p>
              <div className="feature-benefits animate-on-scroll">
                <div className="benefit-item">
                  <Camera className="benefit-icon" />
                  <span>Take photos of business cards</span>
                </div>
                <div className="benefit-item">
                  <ArrowRight className="benefit-icon" />
                  <span>Upload existing images</span>
                </div>
                <div className="benefit-item">
                  <Users className="benefit-icon" />
                  <span>Auto-extract contact information</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Organization */}
      <section className="feature-section">
        <div className="container">
          <div className="feature-layout">
            <div className="feature-content">
              <h2 className="feature-title animate-on-scroll">
                Stay organized without the effort.
              </h2>
              <p className="feature-subtitle animate-on-scroll">
                Easily filter your contacts by industry or tags.
              </p>
              <div className="feature-benefits animate-on-scroll">
                <div className="benefit-item">
                  <Filter className="benefit-icon" />
                  <span>Filter by industry categories</span>
                </div>
                <div className="benefit-item">
                  <Users className="benefit-icon" />
                  <span>Smart contact grouping</span>
                </div>
                <div className="benefit-item">
                  <Star className="benefit-icon" />
                  <span>Custom tags and labels</span>
                </div>
              </div>
            </div>
            <div className="feature-image">
              <img 
                src="/lovable-uploads/c5027386-eb84-489b-a9cc-8bfd988f2a9f.png" 
                alt="Contact organization and filtering"
                className="animate-on-scroll"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="container">
          <div className="vision-content">
            <h2 className="section-title animate-on-scroll">Trusted by Professionals Worldwide</h2>
            <div className="stats-3d-grid">
              <div className="stat-card-3d animate-stat-1">
                <div className="stat-number">10K+</div>
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

      {/* Call to Action */}
      <section className="waitlist-section" id="waitlist">
        <div className="container">
          <div className="waitlist-content">
            <h2 className="section-title animate-on-scroll">
              Ready to Transform Your <span className="text-accent">Networking?</span>
            </h2>
            <p className="section-subtitle animate-on-scroll">
              Join thousands of professionals who never lose connections again.
              Start building better relationships today.
            </p>
            <form className="waitlist-form-3d" onSubmit={handleWaitlistSignup}>
              <div className="form-group-3d">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-3d"
                  required
                />
                <button type="submit" className="btn-primary btn-revolution hover-scale animate-fade-in transition-all duration-300 hover:animate-pulse" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Getting Started..." : "Get Started Free"}</span>
                  <ArrowRight className="btn-icon" />
                  <div className="btn-particles"></div>
                </button>
              </div>
            </form>
            <p className="waitlist-note animate-on-scroll">
              Free forever plan available. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img 
                src="/logo.png" 
                alt="Networq" 
                className="footer-logo"
              />
              <p className="footer-tagline">Never lose a connection again</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <ul>
                  <li><Link to="/auth">Features</Link></li>
                  <li><Link to="/auth">Pricing</Link></li>
                  <li><Link to="/auth">Download</Link></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><Link to="/support">About</Link></li>
                  <li><Link to="/support">Contact</Link></li>
                  <li><Link to="/privacy-policy">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Networq. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;