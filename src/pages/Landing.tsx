import React, { useEffect } from "react";
import { ArrowRight, Download, Shield, Users, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for password recovery redirect from email
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Networq" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold tracking-tight">Networq</span>
          </div>
          <Link 
            to="/auth" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-6 py-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                ✨ Professional networking reimagined
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8 leading-[0.9] text-foreground">
              Never lose a
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent font-medium">
                connection
              </span>
              <br />
              again.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              The most elegant way to share your contact information and grow your professional network. Built for modern professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20">
              <Link 
                to="/auth"
                className="group bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold hover:shadow-elegant transition-all flex items-center gap-2 text-lg shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-lg px-6 py-4 rounded-2xl hover:bg-muted/50">
                <Download className="w-5 h-5" />
                Download App
              </button>
            </div>

            {/* App Preview */}
            <div className="relative max-w-sm mx-auto mb-20">
              <div className="absolute inset-0 bg-gradient-primary rounded-[3rem] blur-3xl opacity-20" />
              <div className="relative bg-card backdrop-blur-xl rounded-[3rem] p-4 border border-border shadow-2xl">
                <img 
                  src="/lovable-uploads/c018c308-324b-4fc0-9dff-95bcced380de.png" 
                  alt="Networq mobile app interface showcasing professional digital business cards"
                  className="w-full h-auto object-cover rounded-[2.5rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="how-it-works" className="py-32 bg-gradient-accent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                How it works
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light mb-6 tracking-tight text-foreground">
              Simple. Powerful. Professional.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Three simple steps to transform your networking experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-elegant transition-all duration-300 transform group-hover:-translate-y-1">
                  <Smartphone className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Create your card</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Design a beautiful digital business card with all your professional information in minutes.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-elegant transition-all duration-300 transform group-hover:-translate-y-1">
                  <Users className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Share instantly</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Share your contact information with a simple QR code or link. No app required for recipients.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-elegant transition-all duration-300 transform group-hover:-translate-y-1">
                  <Shield className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Stay organized</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Keep track of your connections with smart organization tools and never lose touch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-foreground">
              Trusted by professionals worldwide
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands who have transformed their networking
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="text-5xl font-light text-foreground mb-2">10K+</div>
              <div className="text-muted-foreground font-medium">Active Professionals</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="text-5xl font-light text-foreground mb-2">50K+</div>
              <div className="text-muted-foreground font-medium">Connections Made</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="text-5xl font-light text-foreground mb-2">4.9★</div>
              <div className="text-muted-foreground font-medium">App Store Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-tight text-foreground">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who never lose a connection. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link 
              to="/auth"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-semibold hover:shadow-elegant transition-all text-lg shadow-lg hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img 
                src="/logo.png" 
                alt="Networq" 
                className="h-6 w-auto mr-3"
              />
              <span className="text-muted-foreground text-sm">
                © 2024 Networq. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-8">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors font-medium">
                Privacy Policy
              </Link>
              <Link to="/support" className="text-muted-foreground hover:text-foreground text-sm transition-colors font-medium">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;