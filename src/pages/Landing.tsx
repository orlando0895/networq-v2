import React, { useState, useEffect } from "react";
import { ArrowRight, Download, Shield, Zap, Users, Smartphone, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for password recovery redirect from email
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      navigate('/auth');
      return;
    }

    document.documentElement.classList.add('dark');
    
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [navigate]);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
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
        if (error.code === '23505') {
          throw new Error('Email already registered for waitlist');
        }
        throw new Error(error.message || 'Something went wrong');
      }

      toast({
        title: "Welcome to Networq! 🎉",
        description: "You've successfully joined our waitlist. We'll notify you when early access is available!",
      });
      
      setEmail("");
    } catch (error: any) {
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Networq" 
              className="h-8 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/auth" className="text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              Never lose a
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-normal">
                connection
              </span>
              <br />
              again.
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              The professional networking app that keeps you organized, connected, and productive.
            </p>
            
            {/* App preview */}
            <div className="relative mx-auto w-80 h-96 mb-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl" />
              <div className="relative bg-black/90 backdrop-blur-xl rounded-[3rem] p-2 border border-white/20">
                <img 
                  src="/lovable-uploads/c018c308-324b-4fc0-9dff-95bcced380de.png" 
                  alt="Networq mobile app interface"
                  className="w-full h-full object-cover rounded-[2.5rem]"
                />
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
              <Link 
                to="/auth"
                className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-all flex items-center gap-2 shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                Download on App Store
              </button>
            </div>

            {/* Download note */}
            <p className="text-sm text-white/50">
              Available for iOS and Android. No subscription required.
            </p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative bg-gray-900/50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Why choose Networq?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Simple, powerful features designed for modern professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Instant Contact Exchange</h3>
              <p className="text-white/70 leading-relaxed">
                Share your contact information with a QR code. No app required for recipients.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Smart Organization</h3>
              <p className="text-white/70 leading-relaxed">
                Keep your contacts organized with tags, notes, and filters. Never forget where you met someone.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4">Privacy First</h3>
              <p className="text-white/70 leading-relaxed">
                Your data stays yours. No selling, no tracking, no ads. Just a clean, professional experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-light mb-2">10K+</div>
              <div className="text-white/70">Professionals</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">50K+</div>
              <div className="text-white/70">Connections Made</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">4.9★</div>
              <div className="text-white/70">App Store Rating</div>
            </div>
          </div>
          
          <blockquote className="text-xl text-white/90 italic mb-4">
            "Networq has completely transformed how I manage my professional relationships. It's simple, elegant, and just works."
          </blockquote>
          <cite className="text-white/70">— Sarah Chen, Business Development Manager</cite>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of professionals who never lose a connection.
          </p>
          
          {/* Email signup */}
          <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Join Waitlist"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/logo.png" 
                alt="Networq" 
                className="h-6 w-auto mr-3"
              />
              <span className="text-white/70 text-sm">
                © 2024 Networq. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/support" className="text-white/70 hover:text-white text-sm transition-colors">
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