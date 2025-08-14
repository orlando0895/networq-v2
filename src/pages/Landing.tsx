import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Calendar, QrCode, Share2, MessageSquare, Shield, Smartphone, Globe, Check, X, Zap, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhoneMockup from '@/components/PhoneMockup';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Networq</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-foreground hover:text-accent-foreground">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Early Access</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-foreground">
                Never Lose Another 
                <span className="text-primary"> Connection</span> Again
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Stop losing valuable contacts in the chaos of business cards and scattered notes. Networq helps you build, organize, and nurture your professional network effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Get Early Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 text-foreground border-border hover:bg-accent">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="lg:pl-12">
              <PhoneMockup className="animate-fade-in" />
            </div>
          </div>
        </div>
      </section>

      {/* We've All Been There Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">We've All Been There...</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Lost Business Cards</h3>
              <p className="text-muted-foreground">
                You meet someone amazing at a conference, exchange cards, then can't find it when you need it most.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Forgotten Follow-ups</h3>
              <p className="text-muted-foreground">
                You promise to follow up with a new contact but forget their context and what you discussed.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Missed Opportunities</h3>
              <p className="text-muted-foreground">
                Your network could help, but you can't remember who does what or how to reach them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Networq Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">How Networq Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, powerful tools that transform how you network
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Instant Contact Exchange</h3>
              <p className="text-muted-foreground">
                Share your contact info via QR code or link. No more business cards to lose or manually enter.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Smart Organization</h3>
              <p className="text-muted-foreground">
                Add context, notes, and tags to every contact. Never forget where you met or what you discussed.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Stay Connected</h3>
              <p className="text-muted-foreground">
                Set follow-up reminders, discover mutual connections, and nurture relationships that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Networq Works Better */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Why Networq Works Better</h2>
            <p className="text-xl text-muted-foreground">
              Compare the old way vs. the Networq way
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-destructive/20 bg-destructive/5">
              <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                <X className="h-5 w-5 text-destructive mr-2" />
                The Old Way
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Lost or damaged business cards
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Manual data entry and typos
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Scattered contacts across platforms
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Forgotten follow-ups and context
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-primary/20 bg-primary/5">
              <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                The Networq Way
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Instant digital contact exchange
                </div>
                <div className="flex items-center text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Automatic contact enrichment
                </div>
                <div className="flex items-center text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Centralized, organized network
                </div>
                <div className="flex items-center text-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Smart reminders and context
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Join Thousands of Smart Networkers</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold text-foreground">10,000+</span>
              </div>
              <p className="text-lg text-muted-foreground">Active Professionals</p>
              <p className="text-sm text-muted-foreground">Building stronger networks daily</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold text-foreground">3x</span>
              </div>
              <p className="text-lg text-muted-foreground">Faster Connections</p>
              <p className="text-sm text-muted-foreground">Compared to traditional methods</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold text-foreground">95%</span>
              </div>
              <p className="text-lg text-muted-foreground">Follow-up Success</p>
              <p className="text-sm text-muted-foreground">With smart reminder system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Transform Your Networking?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the waitlist and be among the first to experience the future of professional networking.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 py-6">
              Get Early Access Now
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Early access benefits • Be part of the beta
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Networq</span>
              </div>
              <p className="text-muted-foreground">
                The future of professional networking. Build, organize, and nurture your network like never before.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">Features</p>
                <p className="text-muted-foreground">Pricing</p>
                <p className="text-muted-foreground">Security</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">About</p>
                <p className="text-muted-foreground">Blog</p>
                <p className="text-muted-foreground">Careers</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">Help Center</p>
                <p className="text-muted-foreground">Contact</p>
                <p className="text-muted-foreground">Privacy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Networq. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;