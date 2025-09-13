import React from 'react';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Target, Star, CheckCircle, ArrowRight, Zap, Network, Smartphone, MessageSquare, QrCode, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import networqLogo from '@/assets/networq-logo.png';

const NetworkingEvent = () => {
  const navigate = useNavigate();

  const appFeatures = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Digital Business Cards",
      description: "Create dynamic, always-updated digital cards that never get lost"
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "One-Tap Sharing",
      description: "Share your contact info instantly with a QR code or link"
    },
    {
      icon: <Scan className="w-6 h-6" />,
      title: "Smart Scanning",
      description: "Scan business cards and QR codes to capture contacts automatically"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
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
      icon: <Calendar className="w-8 h-8" />,
      title: "September 23, 2025",
      subtitle: "Save the Date",
      description: "Join us for an exclusive launch event in Scottsdale"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Scottsdale, AZ",
      subtitle: "Premium Venue",
      description: "Network with Arizona's top entrepreneurs and innovators"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "100+ Attendees",
      subtitle: "Quality Connections",
      description: "Meet decision-makers and industry leaders"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Live Demos",
      subtitle: "See Networq in Action",
      description: "Experience the future of networking firsthand"
    }
  ];

  const premiumFeatures = [
    {
      category: "Business Growth Suite",
      features: [
        "Professional website builder with custom domains",
        "Sales funnel creation and optimization tools", 
        "Mobile app builder for your business",
        "Advanced analytics and lead tracking"
      ]
    },
    {
      category: "Elite Networking",
      features: [
        "Priority placement in discovery feeds",
        "Exclusive member-only events and meetups",
        "AI-powered connection recommendations",
        "Advanced contact management and CRM"
      ]
    },
    {
      category: "Expert Resources",
      features: [
        "Virtual boardroom for idea validation",
        "1-on-1 mentorship matching",
        "Business template library and frameworks",
        "Industry expert masterclasses"
      ]
    }
  ];

  return (
    <MobileLayout className="bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-12">
        {/* Hero Section with Logo */}
        <section className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <img 
              src={networqLogo} 
              alt="Networq Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              The Future of Networking is Here
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Join us for the exclusive launch of Networq in Scottsdale. Experience how digital networking 
              is transforming how professionals connect, follow up, and build lasting business relationships.
            </p>
            <Badge variant="secondary" className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-600 border-cyan-200">
              Launching September 23, 2025
            </Badge>
          </div>
        </section>

        {/* Why Networq Matters */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">
              Why Traditional Networking Fails
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every networking event ends the same way: a pile of business cards that get forgotten, 
              lost, or thrown away. It's time for a better solution.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {networkingProblems.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">{item.problem}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">{item.impact}</p>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-primary font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {item.solution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* App Features */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Networq App Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to eliminate networking friction and build lasting business relationships.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-primary group-hover:from-cyan-500/20 group-hover:to-blue-600/20 transition-all">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Event Details */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">
              Launch Event Details
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be among the first to experience Networq and connect with Scottsdale's most innovative professionals.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {eventHighlights.map((highlight, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-primary group-hover:from-cyan-500/20 group-hover:to-blue-600/20 transition-all">
                      {highlight.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                    <p className="text-sm text-primary font-medium">{highlight.subtitle}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Premium Membership */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Networq Premium Membership
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform networking into business growth with our comprehensive suite of professional tools and exclusive access.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {premiumFeatures.map((category, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="bg-gradient-to-r from-cyan-500/10 via-primary/10 to-blue-600/10 border-primary/30">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Exclusive Launch Benefit</h3>
              <p className="text-muted-foreground">
                Event attendees get 50% off their first year of Networq Premium, plus lifetime access to our virtual boardroom 
                where you can pitch ideas to successful entrepreneurs and get real feedback.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Partnership & Sponsorship */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold text-foreground">
              Partner with Networq
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us as a sponsor and connect your brand with Scottsdale's most ambitious professionals and entrepreneurs.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                  1
                </div>
                <CardTitle>Premier Sponsor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Logo on all event materials</li>
                  <li>• 5-minute speaking opportunity</li>
                  <li>• VIP networking reception</li>
                  <li>• Lifetime premium memberships for team</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                  2
                </div>
                <CardTitle>Supporting Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Brand recognition throughout event</li>
                  <li>• Social media promotion</li>
                  <li>• Networking session access</li>
                  <li>• Premium memberships for key staff</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                  3
                </div>
                <CardTitle>Community Contributor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• In-kind contributions welcome</li>
                  <li>• Event day recognition</li>
                  <li>• Networking participation</li>
                  <li>• Community partner status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-8 py-8">
          <Card className="bg-gradient-to-r from-cyan-500/10 via-primary/10 to-blue-600/10 border-primary/30">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Ready to Transform Your Network?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Don't miss this opportunity to be part of Scottsdale's networking revolution. 
                Connect with industry leaders, experience cutting-edge technology, and build relationships that matter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  onClick={() => navigate('/support')}
                >
                  <Network className="w-5 h-5 mr-2" />
                  Register for Event
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate('/')}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Explore Networq App
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-sm text-muted-foreground">
            Questions about the event or sponsorship opportunities? <br />
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/support')}>
              Contact our team
            </Button>
          </p>
        </section>
      </div>
    </MobileLayout>
  );
};

export default NetworkingEvent;