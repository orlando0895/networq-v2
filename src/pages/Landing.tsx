import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Calendar, QrCode, Share2, MessageSquare, Shield, Smartphone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Networq</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Professional Networking Reimagined
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Build Your 
            <span className="text-primary"> Professional Network</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Enter your credentials to access your network. Organize contacts, attend events, and grow your professional connections with powerful tools designed for modern networking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Start Networking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Network Effectively</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to help you manage, grow, and leverage your professional network
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  Organize and categorize your professional contacts with detailed profiles, notes, and interaction history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <CardTitle>QR Code Sharing</CardTitle>
                <CardDescription>
                  Share your contact information instantly with QR codes. Perfect for events, meetings, and conferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Event Networking</CardTitle>
                <CardDescription>
                  Discover networking events, track RSVPs, and connect with other attendees to maximize your networking opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Direct Messaging</CardTitle>
                <CardDescription>
                  Stay connected with your network through built-in messaging and communication tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Share2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Discovery</CardTitle>
                <CardDescription>
                  Find and connect with professionals in your industry through intelligent discovery and recommendation features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>
                  Control your privacy settings and choose what information to share with different levels of your network.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Networq?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Smartphone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Mobile-First Design</h3>
                    <p className="text-muted-foreground">
                      Access your network anywhere with our responsive, mobile-optimized platform designed for professionals on the go.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Globe className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Professional Focus</h3>
                    <p className="text-muted-foreground">
                      Unlike social networks, Networq is built specifically for professional networking and business relationship management.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Privacy-First Approach</h3>
                    <p className="text-muted-foreground">
                      Your professional network is valuable. We prioritize privacy and give you complete control over your information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:pl-12">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-0 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Network?</h3>
                    <p className="text-muted-foreground mb-6">
                      Join thousands of professionals who are already building stronger networks with Networq.
                    </p>
                  </div>
                  <Link to="/auth">
                    <Button size="lg" className="w-full">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
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
                <span className="text-xl font-bold">Networq</span>
              </div>
              <p className="text-muted-foreground">
                Professional networking platform designed to help you build and maintain meaningful business relationships.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">Features</p>
                <p className="text-muted-foreground">Pricing</p>
                <p className="text-muted-foreground">Security</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground">About</p>
                <p className="text-muted-foreground">Blog</p>
                <p className="text-muted-foreground">Careers</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
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