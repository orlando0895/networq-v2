import React from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Target, Star, CheckCircle, ArrowRight, Zap, Network, Smartphone, MessageSquare, QrCode, Scan, Sparkles, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import networqLogo from '@/assets/networq-logo.png';

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
      description: "Join us for an exclusive launch event in Scottsdale",
      accent: "from-blue-500 to-cyan-500"
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: "Scottsdale, AZ",
      subtitle: "Premium Venue",
      description: "Network with Arizona's top entrepreneurs and innovators",
      accent: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "100+ Attendees",
      subtitle: "Quality Connections",
      description: "Meet decision-makers and industry leaders",
      accent: "from-green-500 to-teal-500"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Live Demos",
      subtitle: "See Networq in Action",
      description: "Experience the future of networking firsthand",
      accent: "from-orange-500 to-red-500"
    }
  ];

  const premiumFeatures = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      category: "Business Growth Suite",
      features: [
        "Professional website builder with custom domains",
        "Sales funnel creation and optimization tools", 
        "Mobile app builder for your business",
        "Advanced analytics and lead tracking"
      ]
    },
    {
      icon: <Network className="w-8 h-8" />,
      category: "Elite Networking",
      features: [
        "Priority placement in discovery feeds",
        "Exclusive member-only events and meetups",
        "AI-powered connection recommendations",
        "Advanced contact management and CRM"
      ]
    },
    {
      icon: <Award className="w-8 h-8" />,
      category: "Expert Resources",
      features: [
        "Virtual boardroom for idea validation",
        "1-on-1 mentorship matching",
        "Business template library and frameworks",
        "Industry expert masterclasses"
      ]
    }
  ];

  const sponsorshipTiers = [
    {
      tier: "Premier Sponsor",
      price: "Contact for pricing",
      features: [
        "Logo on all event materials",
        "5-minute speaking opportunity",
        "VIP networking reception access",
        "Lifetime premium memberships for team",
        "Social media promotion campaign"
      ],
      gradient: "from-yellow-400 to-orange-500",
      popular: true
    },
    {
      tier: "Supporting Partner",
      price: "Contact for pricing",
      features: [
        "Brand recognition throughout event",
        "Social media promotion",
        "Networking session access",
        "Premium memberships for key staff",
        "Event marketing inclusion"
      ],
      gradient: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      tier: "Community Contributor",
      price: "In-kind contributions",
      features: [
        "In-kind contributions welcome",
        "Event day recognition",
        "Networking participation",
        "Community partner status",
        "Local business directory listing"
      ],
      gradient: "from-green-500 to-teal-500",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <MobileLayout className="relative z-10">
        <div className="space-y-20 py-8">
          {/* Hero Section */}
          <section className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <img 
                  src={networqLogo} 
                  alt="Networq Logo" 
                  className="relative w-40 h-40 object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-heading font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                The Future of Networking is Here
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                Join us for the exclusive launch of Networq in Scottsdale. Experience how digital networking 
                is transforming how professionals connect, follow up, and build lasting business relationships.
              </p>
              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-400/30 px-6 py-2 text-lg animate-pulse">
                  <Clock className="w-4 h-4 mr-2" />
                  Launching September 23, 2025
                </Badge>
              </div>
            </div>
          </section>

          {/* Problems Section */}
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                Why Traditional Networking 
                <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent"> Fails</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Every networking event ends the same way: a pile of business cards that get forgotten, 
                lost, or thrown away. It's time for a better solution.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {networkingProblems.map((item, index) => (
                <Card key={index} className="group relative bg-slate-800/50 border-slate-700/50 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover-scale">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-lg"></div>
                  <CardHeader className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">!</span>
                    </div>
                    <CardTitle className="text-xl text-red-400 group-hover:text-red-300 transition-colors">
                      {item.problem}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <p className="text-slate-300 font-medium">{item.impact}</p>
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
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
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                <span className="text-white">Networq App </span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Powerful tools designed to eliminate networking friction and build lasting business relationships.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              {appFeatures.map((feature, index) => (
                <Card key={index} className="group relative bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover-scale">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 group-hover:scale-110 transition-all duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl text-white group-hover:text-cyan-300 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-slate-300 text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Event Details */}
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                Launch Event 
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> Details</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Be among the first to experience Networq and connect with Scottsdale's most innovative professionals.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {eventHighlights.map((highlight, index) => (
                <Card key={index} className="group relative bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover-scale text-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${highlight.accent} opacity-5 group-hover:opacity-10 rounded-lg transition-opacity duration-500`}></div>
                  <CardHeader className="relative space-y-6 pb-2">
                    <div className="flex justify-center">
                      <div className={`p-6 rounded-2xl bg-gradient-to-br ${highlight.accent} opacity-20 group-hover:opacity-30 text-white group-hover:scale-110 transition-all duration-300`}>
                        {highlight.icon}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white mb-2">{highlight.title}</CardTitle>
                      <p className={`text-sm font-bold bg-gradient-to-r ${highlight.accent} bg-clip-text text-transparent`}>
                        {highlight.subtitle}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-slate-300 leading-relaxed">{highlight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Premium Membership */}
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Networq Premium </span>
                <span className="text-white">Membership</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Transform networking into business growth with our comprehensive suite of professional tools and exclusive access.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              {premiumFeatures.map((category, index) => (
                <Card key={index} className="group relative bg-slate-800/50 border-slate-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover-scale">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white group-hover:text-yellow-300 transition-colors">
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <ul className="space-y-4">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg"></div>
              <CardContent className="relative pt-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Exclusive Launch Benefit
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Event attendees get <span className="text-yellow-400 font-bold">50% off</span> their first year of Networq Premium, plus lifetime access to our virtual boardroom 
                  where you can pitch ideas to successful entrepreneurs and get real feedback.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Sponsorship */}
          <section className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                Partner with 
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent"> Networq</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Join us as a sponsor and connect your brand with Scottsdale's most ambitious professionals and entrepreneurs.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              {sponsorshipTiers.map((tier, index) => (
                <Card key={index} className={`group relative bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover-scale ${tier.popular ? 'ring-2 ring-yellow-500/50' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-5 group-hover:opacity-10 rounded-lg transition-opacity duration-500`}></div>
                  
                  <CardHeader className="relative text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {index + 1}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">{tier.tier}</CardTitle>
                    <p className={`text-lg font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                      {tier.price}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center space-y-12 py-16 animate-fade-in">
            <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg"></div>
              
              <CardContent className="relative pt-12 pb-12">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse">
                    <Network className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-white">Ready to Transform Your </span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Network?</span>
                </h2>
                
                <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Don't miss this opportunity to be part of Scottsdale's networking revolution. 
                  Connect with industry leaders, experience cutting-edge technology, and build relationships that matter.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold hover-scale shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                    onClick={() => navigate('/support')}
                  >
                    <Network className="w-6 h-6 mr-3" />
                    Register for Event
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 px-8 py-4 text-lg font-bold hover-scale transition-all duration-300"
                    onClick={() => navigate('/')}
                  >
                    <ArrowRight className="w-6 h-6 mr-3" />
                    Explore Networq App
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-slate-400">
              Questions about the event or sponsorship opportunities? <br />
              <Button 
                variant="link" 
                className="p-0 h-auto text-cyan-400 hover:text-cyan-300 underline text-lg transition-colors duration-300" 
                onClick={() => navigate('/support')}
              >
                Contact our team →
              </Button>
            </p>
          </section>
        </div>
      </MobileLayout>
    </div>
  );
};

export default NetworkingEvent;