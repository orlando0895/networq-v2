import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Target, Star, CheckCircle, ArrowRight, Zap, Network, Smartphone, MessageSquare, QrCode, Scan, Sparkles, TrendingUp, Award, Clock, Mail, Phone, User, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import networqLogo from '@/assets/networq-logo.png';
import appConnections from '@/assets/app-connections.png';
import appFilters from '@/assets/app-filters.png';
import appScanner from '@/assets/app-scanner.png';
import appProfile from '@/assets/app-profile.png';
import appMessages from '@/assets/app-messages.png';

const NetworkingEvent = () => {
  const navigate = useNavigate();

  const appFeatures = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Digital Business Cards",
      description: "Create dynamic, always-updated digital cards that never get lost or forgotten"
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "One-Tap Sharing",
      description: "Share your contact info instantly with a QR code or personalized link"
    },
    {
      icon: <Scan className="w-8 h-8" />,
      title: "Smart Scanning",
      description: "Scan business cards and QR codes to capture contacts automatically"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Integrated Messaging",
      description: "Follow up and stay connected with built-in chat features"
    }
  ];

  const networkingProblems = [
    {
      problem: "Lost Paper Cards",
      impact: "67% of business cards end up in the trash within a week",
      solution: "Digital cards that update automatically"
    },
    {
      problem: "No Follow-Up System", 
      impact: "Most connections fade without proper relationship management",
      solution: "Built-in CRM and messaging tools"
    },
    {
      problem: "Manual Contact Entry",
      impact: "Time-consuming data entry creates barriers to connection",
      solution: "Automatic contact capture and organization"
    }
  ];

  const eventHighlights = [
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "September 23, 2025",
      subtitle: "Save the Date",
      description: "Join us for an exclusive launch event in Scottsdale"
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: "Scottsdale, AZ",
      subtitle: "Premium Venue",
      description: "Network with Arizona's top entrepreneurs and innovators"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "100+ Attendees",
      subtitle: "Quality Connections",
      description: "Meet decision-makers and industry leaders"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Live Demos",
      subtitle: "See Networq in Action",
      description: "Experience the future of networking firsthand"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="space-y-32 py-16 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center space-y-16 animate-fade-in">
            <div className="flex justify-center mb-8">
              <img 
                src={networqLogo} 
                alt="Networq" 
                className="w-24 h-24 object-contain"
              />
            </div>
            
            <div className="space-y-8 max-w-5xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-light tracking-tight text-white leading-[0.9]">
                The future of
                <br />
                <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  networking
                </span>
                <br />
                is here.
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
                Join the exclusive launch event in Scottsdale and experience how Networq is transforming professional connections.
              </p>
            </div>
            
            {/* App preview with animation */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img 
                  src={appConnections} 
                  alt="Networq App - Connections Screen" 
                  className="relative w-64 h-auto object-contain hover:scale-105 transition-transform duration-500 animate-fade-in"
                />
              </div>
            </div>
          </section>

          {/* Why Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Why traditional networking fails
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Every networking event ends the same way: a pile of business cards that get forgotten.
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-16 md:grid-cols-2 max-w-6xl mx-auto items-center">
              <div className="space-y-12">
                {networkingProblems.map((item, index) => (
                  <div key={index} className="group p-8 hover:bg-white/5 transition-all duration-300 rounded-3xl">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-medium text-white group-hover:text-primary transition-colors">
                        {item.problem}
                      </h3>
                      <p className="text-lg text-gray-300 font-light leading-relaxed">
                        {item.impact}
                      </p>
                      <div className="pt-4">
                        <p className="text-primary font-medium flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* App screenshot with scanning feature */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl animate-pulse"></div>
                  <img 
                    src={appFilters} 
                    alt="Networq App - Industry Filters" 
                    className="relative w-64 h-auto object-contain hover:scale-105 transition-transform duration-500 hover:rotate-2"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Designed for simplicity
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Powerful networking tools that feel effortless to use.
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-16 md:grid-cols-2 max-w-6xl mx-auto items-center">
              {/* App screenshots showcase */}
              <div className="flex flex-col gap-8 md:order-1">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <img 
                    src={appProfile} 
                    alt="Networq App - Profile Screen" 
                    className="relative w-56 h-auto object-contain hover:scale-105 transition-transform duration-500 mx-auto"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <img 
                    src={appMessages} 
                    alt="Networq App - Messages Screen" 
                    className="relative w-56 h-auto object-contain hover:scale-105 transition-transform duration-500 mx-auto"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
              
              <div className="space-y-8 md:order-2">
                {appFeatures.map((feature, index) => (
                  <div key={index} className="group p-8 hover:bg-white/5 transition-all duration-500 rounded-3xl">
                    <div className="space-y-6">
                      <div className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-medium text-white group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-lg text-gray-300 font-light leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Event Section */}
          <section className="space-y-20 animate-fade-in bg-white/5 rounded-[4rem] p-16 md:p-24">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Launch event
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Be among the first to experience Networq with Scottsdale's most innovative professionals.
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {eventHighlights.map((highlight, index) => (
                <div key={index} className="text-center space-y-6 group hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 mx-auto text-primary group-hover:scale-110 transition-transform duration-300">
                    {highlight.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-white group-hover:text-primary transition-colors">{highlight.title}</h3>
                    <p className="text-primary font-medium text-sm">{highlight.subtitle}</p>
                    <p className="text-gray-300 font-light">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </section>

          {/* Registration Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Join the launch
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Secure your spot at the exclusive Networq launch event in Scottsdale.
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-16 md:grid-cols-2 max-w-4xl mx-auto items-center">
              {/* App preview with floating effect */}
              <div className="flex justify-center md:order-2">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-2xl animate-pulse"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                    <img 
                      src={appConnections} 
                      alt="Networq App Preview" 
                      className="w-48 h-auto object-contain mx-auto hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              <Card className="border-0 bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden md:order-1">
                <CardContent className="p-12 space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">First Name</label>
                      <Input 
                        placeholder="John" 
                        className="border-0 bg-white/10 rounded-2xl h-14 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Last Name</label>
                      <Input 
                        placeholder="Doe" 
                        className="border-0 bg-white/10 rounded-2xl h-14 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="border-0 bg-white/10 rounded-2xl h-14 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Company</label>
                    <Input 
                      placeholder="Your Company" 
                      className="border-0 bg-white/10 rounded-2xl h-14 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Role</label>
                    <Input 
                      placeholder="Your Title" 
                      className="border-0 bg-white/10 rounded-2xl h-14 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <Button className="w-full h-14 rounded-2xl text-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]">
                    Secure Your Spot
                  </Button>
                  
                  <p className="text-center text-sm text-gray-400 font-light">
                    Limited seats available. Event details will be sent via email.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NetworkingEvent;