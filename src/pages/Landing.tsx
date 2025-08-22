import React, { useState, useEffect } from "react";
import { ArrowRight, QrCode, Users, MessageCircle, Camera, Filter, Star, Share2, Scan, Tag, Shield, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "./landing.css";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [professionIndex, setProfessionIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const professions = [
    "financial advisors",
    "real estate agents", 
    "entrepreneurs",
    "consultants",
    "recruiters",
    "account executives"
  ];

  useEffect(() => {
    // Check for password recovery redirect from email
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      navigate('/auth');
      return;
    }

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

    // Set up rotating professions
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let intervalId;
    
    if (!reduceMotion) {
      intervalId = setInterval(() => {
        setProfessionIndex((prev) => (prev + 1) % professions.length);
      }, 2500);
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('landing-page');
      document.documentElement.classList.remove('dark');
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [professions.length, navigate]);

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

      {/* Skip to content link */}
      <a 
        href="#main" 
        className="skip-link"
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="header sticky-header">
        <div className="container">
          <div className="nav">
            <div className="logo-container animate-slide-in">
                <img 
                  src="/logo.png" 
                  alt="Networq" 
                  className="brand-logo"
                />
            </div>
            <nav aria-label="Primary navigation" className="main-nav">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it works</a>
              <a href="#security" className="nav-link">Security</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <Link to="/support" className="nav-link">Support</Link>
              <Link to="/auth" className="nav-link">Sign in</Link>
              <a href="#waitlist" className="btn-primary nav-cta">Get Started</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="main">
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
                  <a 
                    href="#waitlist"
                    className="btn-primary hero-btn btn-3d" 
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="btn-icon" />
                  </a>
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

      {/* We've All Been There */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-white mb-16 animate-on-scroll">
            We've All Been There...
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Business Cards Get Lost */}
            <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 text-center animate-on-scroll">
              <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Business Cards Get Lost</h3>
              <p className="text-gray-400 leading-relaxed">
                Those stacks of cards? They vanish into wallet black holes, never to be seen again.
              </p>
            </div>

            {/* Connections Fizzle Out */}
            <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 text-center animate-on-scroll">
              <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connections Fizzle Out</h3>
              <p className="text-gray-400 leading-relaxed">
                Great conversations at events turn into "I should reach out" thoughts that never happen.
              </p>
            </div>

            {/* Contact Info Gets Outdated */}
            <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 text-center animate-on-scroll">
              <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Contact Info Gets Outdated</h3>
              <p className="text-gray-400 leading-relaxed">
                Phone numbers change, emails update, but your saved contacts stay frozen in time.
              </p>
            </div>
          </div>

          {/* Founder Quote */}
          <div className="max-w-4xl mx-auto animate-on-scroll">
            <div className="flex items-start gap-6">
              <div className="w-1 h-24 bg-blue-500 rounded-full flex-shrink-0"></div>
              <div>
                <blockquote className="text-xl text-gray-300 italic leading-relaxed mb-4">
                  "After years of attending networking events where valuable connections slipped away, I knew professionals needed a better solution. Networq solves the contact exchange problem once and for all."
                </blockquote>
                <cite className="text-gray-400 font-medium">— Orlando Taylor, Founder</cite>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features">
        {/* Feature 1: Messaging */}
        <section className="feature-section feature-reverse messaging-feature">
          <div className="container">
            <div className="feature-layout">
              <div className="feature-image messaging-showcase">
                <div className="phone-3d-container">
                  <div className="phone-mockup-3d">
                    <div className="phone-screen-glow"></div>
                    <img 
                      src="/lovable-uploads/004eee51-2dc9-4417-9e84-11b72c4dc89c.png" 
                      alt="Messages interface showing conversations and connections"
                      className="phone-screen-content animate-on-scroll"
                    />
                  </div>
                  <div className="floating-ui-elements">
                    <div className="message-bubble bubble-1">
                      <MessageCircle className="bubble-icon" />
                    </div>
                    <div className="message-bubble bubble-2">
                      <Users className="bubble-icon" />
                    </div>
                    <div className="message-bubble bubble-3">
                      <Star className="bubble-icon" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-content messaging-content">
                <div className="feature-badge animate-on-scroll">
                  <Sparkles className="badge-icon" />
                  <span>Premium Messaging</span>
                </div>
                <h2 className="feature-title animate-on-scroll">
                  Keep the conversation
                  <span className="title-highlight"> alive.</span>
                </h2>
                <p className="feature-subtitle animate-on-scroll">
                  In-app messaging to follow up after events
                </p>
                <div className="feature-benefits animate-on-scroll">
                  <div className="benefit-item interactive-benefit" data-benefit="context">
                    <div className="benefit-icon-wrapper">
                      <MessageCircle className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Keep context by event</span>
                      <span className="benefit-description">Never lose track of where you met</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="reminders">
                    <div className="benefit-icon-wrapper">
                      <Star className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Reminders to follow up</span>
                      <span className="benefit-description">Smart notifications at the right time</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="teams">
                    <div className="benefit-icon-wrapper">
                      <Users className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Group threads for teams</span>
                      <span className="benefit-description">Collaborate with your entire team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-background-elements">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
          </div>
        </section>

        {/* Feature 2: QR Sharing */}
        <section className="feature-section qr-feature">
          <div className="container">
            <div className="feature-layout">
              <div className="feature-content qr-content">
                <div className="feature-badge animate-on-scroll">
                  <QrCode className="badge-icon" />
                  <span>Instant Sharing</span>
                </div>
                <h2 className="feature-title animate-on-scroll">
                  Share your info in
                  <span className="title-highlight"> seconds.</span>
                </h2>
                <p className="feature-subtitle animate-on-scroll">
                  No app required for the recipient
                </p>
                <div className="feature-benefits animate-on-scroll">
                  <div className="benefit-item interactive-benefit" data-benefit="camera">
                    <div className="benefit-icon-wrapper">
                      <Camera className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Works with any camera</span>
                      <span className="benefit-description">Universal compatibility across all devices</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="share">
                    <div className="benefit-icon-wrapper">
                      <Share2 className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Share link fallback</span>
                      <span className="benefit-description">Multiple ways to connect seamlessly</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="sync">
                    <div className="benefit-icon-wrapper">
                      <ArrowRight className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Updates sync to shared card</span>
                      <span className="benefit-description">Real-time updates to all shared contacts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-image qr-showcase">
                <div className="phone-3d-container">
                  <div className="phone-mockup-3d">
                    <div className="phone-screen-glow"></div>
                    <img 
                      src="/lovable-uploads/a5cfad31-2d0f-4d68-81dc-74aca65731d2.png" 
                      alt="Share via QR; recipient doesn't need the app"
                      className="phone-screen-content animate-on-scroll"
                    />
                    <img 
                      src="/lovable-uploads/6025a1e3-8f42-4a9c-b78b-79ee6d98e146.png" 
                      alt="Profile interface with QR code sharing"
                      className="phone-screen-content"
                    />
                  </div>
                  <div className="floating-ui-elements">
                    <div className="qr-bubble bubble-1">
                      <QrCode className="bubble-icon" />
                    </div>
                    <div className="qr-bubble bubble-2">
                      <Share2 className="bubble-icon" />
                    </div>
                    <div className="qr-bubble bubble-3">
                      <Camera className="bubble-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-background-elements">
            <div className="gradient-orb orb-1 qr-orb"></div>
            <div className="gradient-orb orb-2 qr-orb"></div>
          </div>
        </section>

        {/* Feature 3: Business Card Scanning */}
        <section className="feature-section feature-reverse scanning-feature">
          <div className="container">
            <div className="feature-layout">
              <div className="feature-image scanning-showcase">
                <div className="phone-3d-container">
                  <div className="phone-mockup-3d">
                    <div className="phone-screen-glow"></div>
                    <img 
                      src="/lovable-uploads/121d40c6-6d40-4982-9947-9923d2be3e3a.png" 
                      alt="Business card scan with auto field extraction"
                      className="phone-screen-content animate-on-scroll"
                    />
                    <img 
                      src="/lovable-uploads/34dfd5ce-7686-4630-a59c-a4be95cc8519.png" 
                      alt="Business card scanning interface with camera options"
                      className="phone-screen-content"
                    />
                  </div>
                  <div className="floating-ui-elements">
                    <div className="scan-bubble bubble-1">
                      <Camera className="bubble-icon" />
                    </div>
                    <div className="scan-bubble bubble-2">
                      <Scan className="bubble-icon" />
                    </div>
                    <div className="scan-bubble bubble-3">
                      <Users className="bubble-icon" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-content scanning-content">
                <div className="feature-badge animate-on-scroll">
                  <Camera className="badge-icon" />
                  <span>Smart Scanning</span>
                </div>
                <h2 className="feature-title animate-on-scroll">
                  No more lost
                  <span className="title-highlight"> business cards.</span>
                </h2>
                <p className="feature-subtitle animate-on-scroll">
                  Automatically extracts name, email, company, title
                </p>
                <div className="feature-benefits animate-on-scroll">
                  <div className="benefit-item interactive-benefit" data-benefit="upload">
                    <div className="benefit-icon-wrapper">
                      <Camera className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Upload or snap</span>
                      <span className="benefit-description">Flexible capture from gallery or camera</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="edit">
                    <div className="benefit-icon-wrapper">
                      <Scan className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Fix fields before saving</span>
                      <span className="benefit-description">Review and perfect extracted information</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="link">
                    <div className="benefit-icon-wrapper">
                      <Users className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Links to the event</span>
                      <span className="benefit-description">Contextual connection to where you met</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-background-elements">
            <div className="gradient-orb orb-1 scan-orb"></div>
            <div className="gradient-orb orb-2 scan-orb"></div>
          </div>
        </section>

        {/* Feature 4: Organization */}
        <section className="feature-section organization-feature">
          <div className="container">
            <div className="feature-layout">
              <div className="feature-content organization-content">
                <div className="feature-badge animate-on-scroll">
                  <Filter className="badge-icon" />
                  <span>Smart Organization</span>
                </div>
                <h2 className="feature-title animate-on-scroll">
                  Stay organized without
                  <span className="title-highlight"> the effort.</span>
                </h2>
                <p className="feature-subtitle animate-on-scroll">
                  Segment by client type and priority for quick outreach
                </p>
                <div className="feature-benefits animate-on-scroll">
                  <div className="benefit-item interactive-benefit" data-benefit="tags">
                    <div className="benefit-icon-wrapper">
                      <Tag className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Tag by industry</span>
                      <span className="benefit-description">Categorize contacts for targeted outreach</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="views">
                    <div className="benefit-icon-wrapper">
                      <Filter className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Saved views</span>
                      <span className="benefit-description">Custom filters for instant access</span>
                    </div>
                  </div>
                  <div className="benefit-item interactive-benefit" data-benefit="followup">
                    <div className="benefit-icon-wrapper">
                      <Star className="benefit-icon" />
                      <div className="icon-glow"></div>
                    </div>
                    <div className="benefit-content">
                      <span className="benefit-title">Follow-up filters</span>
                      <span className="benefit-description">Never miss important connections</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="feature-image organization-showcase">
                <div className="phone-3d-container">
                  <div className="phone-mockup-3d">
                    <div className="phone-screen-glow"></div>
                    <img 
                      src="/lovable-uploads/95e43555-d5b4-4913-8c10-d39846440ae4.png" 
                      alt="Contact organization by tags and saved views"
                      className="phone-screen-content animate-on-scroll"
                    />
                    <img 
                      src="/lovable-uploads/b650bbbc-251f-4899-9875-2ebbd14e3fc3.png" 
                      alt="Contacts organization interface with filters and industry tags"
                      className="phone-screen-content"
                    />
                  </div>
                  <div className="floating-ui-elements">
                    <div className="org-bubble bubble-1">
                      <Tag className="bubble-icon" />
                    </div>
                    <div className="org-bubble bubble-2">
                      <Filter className="bubble-icon" />
                    </div>
                    <div className="org-bubble bubble-3">
                      <Star className="bubble-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-background-elements">
            <div className="gradient-orb orb-1 org-orb"></div>
            <div className="gradient-orb orb-2 org-orb"></div>
          </div>
        </section>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title animate-on-scroll">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card animate-on-scroll" aria-describedby="step-1-desc">
              <div className="step-header">
                <div className="step-number">1</div>
                <Share2 className="step-icon" />
                <h3>Share your card with a QR</h3>
              </div>
              <p id="step-1-desc">Generate and display your QR code for instant contact sharing</p>
            </div>
            
            <div className="step-card animate-on-scroll" aria-describedby="step-2-desc">
              <div className="step-header">
                <div className="step-number">2</div>
                <Scan className="step-icon" />
                <h3>Scan business cards or save contacts from QR</h3>
              </div>
              <p id="step-2-desc">Capture contact information effortlessly through scanning or QR codes</p>
            </div>
            
            <div className="step-card animate-on-scroll" aria-describedby="step-3-desc">
              <div className="step-header">
                <div className="step-number">3</div>
                <Tag className="step-icon" />
                <h3>Add tags/notes and schedule follow-up</h3>
              </div>
              <p id="step-3-desc">Organize contacts with tags and set reminders for future outreach</p>
            </div>
            
            <div className="step-card animate-on-scroll" aria-describedby="step-4-desc">
              <div className="step-header">
                <div className="step-number">4</div>
                <MessageCircle className="step-icon" />
                <h3>Message and track conversations</h3>
              </div>
              <p id="step-4-desc">Keep all communication in one place with context and history</p>
              <div className="step-image">
                <img 
                  src="/lovable-uploads/40188bd7-a231-4c99-9d9c-65fbb1597950.png" 
                  alt="Messaging and tracking step"
                  className="step-thumbnail"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="perfect-for-section">
        <div className="container">
          <p className="perfect-for-text" aria-live="polite">
            Perfect for{" "}
            <span className="rotating-profession">
              {professions[professionIndex]}
            </span>{" "}
            looking to make the most out of their contacts list
          </p>
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

      {/* Security & Privacy */}
      <section className="security-section trust-section" id="security">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Security & Privacy</h2>
          <div className="security-content">
            <div className="security-grid">
              <div className="security-feature animate-on-scroll">
                <Shield className="security-icon" />
                <h3>Encryption in transit (TLS)</h3>
                <p>All data transfers are secured with industry-standard encryption</p>
              </div>
              <div className="security-feature animate-on-scroll">
                <Check className="security-icon" />
                <h3>Secure managed Postgres</h3>
                <p>Your data is stored securely with Supabase's enterprise-grade infrastructure</p>
              </div>
              <div className="security-feature animate-on-scroll">
                <ArrowRight className="security-icon" />
                <h3>Export your data anytime</h3>
                <p>Full data portability - download all your contacts and conversations</p>
              </div>
              <div className="security-feature animate-on-scroll">
                <Users className="security-icon" />
                <h3>Delete your account anytime</h3>
                <p>Complete control over your data with instant account deletion</p>
              </div>
              <div className="security-feature animate-on-scroll">
                <Shield className="security-icon" />
                <h3>Minimal permissions</h3>
                <p>We only request access to what's necessary for core functionality</p>
              </div>
              <div className="security-feature animate-on-scroll">
                <Check className="security-icon" />
                <h3>Private by default</h3>
                <p>Your contacts and conversations are never shared without permission</p>
              </div>
            </div>
            <div className="security-cta animate-on-scroll">
              <Link to="/privacy" className="btn-secondary">
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Simple Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card animate-on-scroll">
              <div className="pricing-header">
                <h3>Free</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Core capture</span>
                </div>
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Basic organization</span>
                </div>
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>QR share</span>
                </div>
              </div>
              <a href="#waitlist" className="btn-secondary pricing-cta">
                Get Started Free
              </a>
            </div>
            
            <div className="pricing-card featured animate-on-scroll">
              <div className="pricing-badge">Coming Soon</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">9</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Everything in Free</span>
                </div>
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Advanced filters</span>
                </div>
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Reminders</span>
                </div>
                <div className="feature-item">
                  <Check className="feature-check" />
                  <span>Team features</span>
                </div>
              </div>
              <a href="#waitlist" className="btn-primary pricing-cta">
                Join waitlist for early Pro access
              </a>
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