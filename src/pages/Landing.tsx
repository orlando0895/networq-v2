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
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Networq</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Early Access</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground leading-tight">
                Never Lose Another{" "}
                <span className="text-primary">Connection</span> Again
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed">
                Stop losing valuable contacts in the chaos of business cards and scattered notes. Networq helps you build, organize, and nurture your professional network effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    Get Early Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-10 py-4 text-foreground border-border hover:bg-muted/20 font-semibold">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative lg:pl-12">
              <PhoneMockup className="animate-fade-in" />
            </div>
          </div>
        </div>
      </section>

      {/* We've All Been There Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-foreground">We've All Been There...</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                <X className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Lost Business Cards</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You meet someone amazing at a conference, exchange cards, then can't find it when you need it most.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                <X className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Forgotten Follow-ups</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You promise to follow up with a new contact but forget their context and what you discussed.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                <X className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Missed Opportunities</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your network could help, but you can't remember who does what or how to reach them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Networq Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">How Networq Works</h2>
            <p className="text-xl sm:text-2xl text-muted-foreground">
              Simple, powerful tools that transform how you network
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Instant Contact Exchange</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Share your contact info via QR code or link. No more business cards to lose or manually enter.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Smart Organization</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Add context, notes, and tags to every contact. Never forget where you met or what you discussed.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Stay Connected</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Set follow-up reminders, discover mutual connections, and nurture relationships that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Networq Works Better */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">Why Networq Works Better</h2>
            <p className="text-xl sm:text-2xl text-muted-foreground">
              Compare the old way vs. the Networq way
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-10 border-destructive/20 bg-destructive/5 rounded-2xl">
              <h3 className="text-2xl font-bold mb-8 text-foreground flex items-center">
                <X className="h-6 w-6 text-destructive mr-3" />
                The Old Way
              </h3>
              <div className="space-y-6">
                <div className="flex items-start text-lg text-muted-foreground">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Lost or damaged business cards
                </div>
                <div className="flex items-start text-lg text-muted-foreground">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Manual data entry and typos
                </div>
                <div className="flex items-start text-lg text-muted-foreground">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Scattered contacts across platforms
                </div>
                <div className="flex items-start text-lg text-muted-foreground">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Forgotten follow-ups and context
                </div>
              </div>
            </Card>
            
            <Card className="p-10 border-primary/20 bg-primary/5 rounded-2xl">
              <h3 className="text-2xl font-bold mb-8 text-foreground flex items-center">
                <Check className="h-6 w-6 text-primary mr-3" />
                The Networq Way
              </h3>
              <div className="space-y-6">
                <div className="flex items-start text-lg text-foreground">
                  <span className="w-3 h-3 bg-primary rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Instant digital contact exchange
                </div>
                <div className="flex items-start text-lg text-foreground">
                  <span className="w-3 h-3 bg-primary rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Automatic contact enrichment
                </div>
                <div className="flex items-start text-lg text-foreground">
                  <span className="w-3 h-3 bg-primary rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Centralized, organized network
                </div>
                <div className="flex items-start text-lg text-foreground">
                  <span className="w-3 h-3 bg-primary rounded-full mr-4 mt-2 flex-shrink-0"></span>
                  Smart reminders and context
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Future of Professional Networking Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">The Future of Professional Networking</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-16 leading-relaxed">
            Join thousands of professionals who are already building stronger networks with Networq
          </p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="text-6xl font-bold text-primary mb-2">11K+</div>
              <p className="text-xl font-semibold text-foreground">Active Users</p>
              <p className="text-muted-foreground">Professionals building stronger networks daily</p>
            </div>
            
            <div className="space-y-4">
              <div className="text-6xl font-bold text-primary mb-2">95%</div>
              <p className="text-xl font-semibold text-foreground">Success Rate</p>
              <p className="text-muted-foreground">Follow-up success with smart reminders</p>
            </div>
            
            <div className="space-y-4">
              <div className="text-6xl font-bold text-primary mb-2">3 Sec</div>
              <p className="text-xl font-semibold text-foreground">Average Connection</p>
              <p className="text-muted-foreground">Time to exchange contact information</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-foreground">Get Early Access</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Join the waitlist and be among the first to experience the future of professional networking.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-xl px-16 py-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl">
              Get Early Access
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
          <p className="text-lg text-muted-foreground mt-8">
            No credit card required • Early access benefits • Be part of the beta
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">Networq</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The future of professional networking. Build, organize, and nurture your network like never before.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-foreground">Product</h4>
              <div className="space-y-3">
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Features</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Pricing</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Security</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-foreground">Company</h4>
              <div className="space-y-3">
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">About</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Blog</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Careers</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-foreground">Support</h4>
              <div className="space-y-3">
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Help Center</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Contact</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Privacy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/20 mt-16 pt-8 text-center">
            <p className="text-lg text-muted-foreground">&copy; 2024 Networq. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;