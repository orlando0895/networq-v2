import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Network, 
  TrendingUp, 
  Award, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  Building,
  Eye,
  MessageSquare,
  Share2,
  BarChart3,
  Crown,
  Sparkles,
  Trophy,
  Gift,
  Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import networqLogo from '@/assets/networq-logo.png';
import appConnections from '@/assets/app-connections.png';
import appFilters from '@/assets/app-filters.png';
import appScanner from '@/assets/app-scanner.png';

const SponsorshipOpportunities = () => {
  const navigate = useNavigate();

  const sponsorshipTiers = [
    {
      tier: "Presenting Sponsor",
      price: "$25,000",
      color: "from-yellow-400 to-orange-500",
      icon: <Crown className="w-8 h-8" />,
      benefits: [
        "Logo prominently featured on all event materials",
        "Speaking opportunity during opening ceremony",
        "Premium booth location with custom setup",
        "Full-page ad in event program",
        "50 complimentary attendee tickets",
        "Access to VIP networking reception",
        "Post-event attendee contact list",
        "Year-round digital marketing partnership"
      ],
      highlight: true
    },
    {
      tier: "Premier Partner",
      price: "$15,000",
      color: "from-blue-500 to-purple-600",
      icon: <Trophy className="w-8 h-8" />,
      benefits: [
        "Logo on event signage and digital materials",
        "Exhibition booth in prime location",
        "Half-page ad in event program",
        "25 complimentary attendee tickets",
        "VIP networking reception access",
        "Social media promotion",
        "Email marketing inclusion",
        "On-stage recognition"
      ]
    },
    {
      tier: "Innovation Sponsor",
      price: "$10,000",
      color: "from-green-500 to-teal-500",
      icon: <Sparkles className="w-8 h-8" />,
      benefits: [
        "Logo on select event materials",
        "Standard exhibition booth",
        "Quarter-page ad in event program",
        "15 complimentary attendee tickets",
        "Networking reception invitation",
        "Digital marketing mentions",
        "Product demo opportunity"
      ]
    },
    {
      tier: "Supporting Partner",
      price: "$5,000",
      color: "from-gray-600 to-gray-700",
      icon: <Gift className="w-8 h-8" />,
      benefits: [
        "Logo in event program",
        "Promotional table space",
        "10 complimentary attendee tickets",
        "Social media mention",
        "Networking reception access",
        "Event photography rights"
      ]
    }
  ];

  const eventMetrics = [
    {
      icon: <Users className="w-10 h-10" />,
      value: "500+",
      label: "Expected Attendees",
      description: "C-level executives, entrepreneurs, and innovators"
    },
    {
      icon: <Building className="w-10 h-10" />,
      value: "150+",
      label: "Companies",
      description: "Representing diverse industries and sectors"
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      value: "$50M+",
      label: "Total Revenue",
      description: "Combined annual revenue of attending companies"
    },
    {
      icon: <Network className="w-10 h-10" />,
      value: "10,000+",
      label: "Connections Made",
      description: "Expected networking connections facilitated"
    }
  ];

  const sponsorBenefits = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Brand Visibility",
      description: "Maximize exposure to Scottsdale's most influential business leaders and decision-makers"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Lead Generation",
      description: "Connect directly with qualified prospects in a premium networking environment"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Thought Leadership",
      description: "Position your brand as an industry innovator through speaking and demonstration opportunities"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Market Intelligence",
      description: "Gain insights into market trends and customer needs through direct interaction"
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
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Megaphone className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium text-sm">Exclusive Sponsorship Opportunities</span>
                <Megaphone className="w-4 h-4 text-primary" />
              </div>
              
              <h1 className="text-6xl md:text-7xl font-light tracking-tight text-white leading-[0.9]">
                Partner with the
                <br />
                <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  future of networking
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
                Join Networq's exclusive launch event and connect your brand with Scottsdale's most innovative professionals and industry leaders.
              </p>
            </div>
            
            {/* App preview with animation */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <img 
                  src={appConnections} 
                  alt="Networq App - Innovation in Action" 
                  className="relative w-64 h-auto object-contain hover:scale-105 transition-transform duration-500 animate-fade-in"
                />
              </div>
            </div>
          </section>

          {/* Event Metrics Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Event impact
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Connect with Scottsdale's most influential business ecosystem at our exclusive launch event.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {eventMetrics.map((metric, index) => (
                <div key={index} className="text-center space-y-6 group hover:scale-105 transition-transform duration-300 p-8 hover:bg-white/5 rounded-3xl">
                  <div className="w-16 h-16 mx-auto text-primary group-hover:scale-110 transition-transform duration-300">
                    {metric.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-light text-white group-hover:text-primary transition-colors">{metric.value}</h3>
                    <p className="text-lg font-medium text-primary">{metric.label}</p>
                    <p className="text-sm text-gray-300 font-light">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why Sponsor Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Why sponsor Networq?
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Position your brand at the forefront of networking innovation and connect with tomorrow's business leaders.
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-16 md:grid-cols-2 max-w-6xl mx-auto items-center">
              <div className="space-y-8">
                {sponsorBenefits.map((benefit, index) => (
                  <div key={index} className="group p-8 hover:bg-white/5 transition-all duration-300 rounded-3xl">
                    <div className="space-y-6">
                      <div className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300">
                        {benefit.icon}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-medium text-white group-hover:text-primary transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-lg text-gray-300 font-light leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* App screenshots showcase */}
              <div className="flex flex-col gap-8">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <img 
                    src={appFilters} 
                    alt="Networq App - Advanced Networking Features" 
                    className="relative w-56 h-auto object-contain hover:scale-105 transition-transform duration-500 mx-auto"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <img 
                    src={appScanner} 
                    alt="Networq App - QR Code Technology" 
                    className="relative w-56 h-auto object-contain hover:scale-105 transition-transform duration-500 mx-auto"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sponsorship Tiers Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Sponsorship packages
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Choose the partnership level that best aligns with your business objectives and marketing goals.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
              {sponsorshipTiers.map((tier, index) => (
                <Card key={index} className={`border-0 ${tier.highlight ? 'bg-gradient-to-br from-white/15 to-white/10 ring-2 ring-primary/30' : 'bg-gradient-to-br from-white/10 to-white/5'} backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl ${tier.highlight ? 'shadow-primary/20' : 'shadow-black/20'} hover:scale-[1.02] transition-transform duration-300`}>
                  <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tier.color} p-3 text-white`}>
                        {tier.icon}
                      </div>
                      {tier.highlight && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-medium text-white">{tier.tier}</CardTitle>
                    <div className="text-4xl font-light text-white mb-2">{tier.price}</div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <div className="space-y-4">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 font-light">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <Button className={`w-full mt-8 h-12 rounded-xl text-lg font-medium ${tier.highlight ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'} transition-all duration-300 hover:scale-[1.02]`}>
                      Select Package
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Partnership Inquiry Section */}
          <section className="space-y-20 animate-fade-in">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium text-sm">Custom Packages Available</span>
                <Star className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white">
                Ready to partner?
              </h2>
              <p className="text-xl text-gray-300 font-light leading-relaxed">
                Let's discuss how your brand can be part of Networq's launch and the future of professional networking.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                <CardContent className="p-8 md:p-12 space-y-8">
                  <div className="text-center space-y-4 mb-8">
                    <h3 className="text-2xl font-medium text-white">Partnership Inquiry</h3>
                    <p className="text-gray-300 font-light">Tell us about your sponsorship goals and we'll create a custom package</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Contact Name *</label>
                      <Input 
                        placeholder="John Doe" 
                        className="border border-white/20 bg-white/10 rounded-xl h-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Job Title *</label>
                      <Input 
                        placeholder="Marketing Director" 
                        className="border border-white/20 bg-white/10 rounded-xl h-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Company *</label>
                      <Input 
                        placeholder="Your Company" 
                        className="border border-white/20 bg-white/10 rounded-xl h-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">Email *</label>
                      <Input 
                        type="email" 
                        placeholder="john@company.com" 
                        className="border border-white/20 bg-white/10 rounded-xl h-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                    <Input 
                      type="tel"
                      placeholder="(555) 123-4567" 
                      className="border border-white/20 bg-white/10 rounded-xl h-12 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Sponsorship Interest</label>
                    <Textarea 
                      placeholder="Tell us about your sponsorship goals, preferred package tier, and any specific requirements..."
                      className="border border-white/20 bg-white/10 rounded-xl min-h-[120px] text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all hover:bg-white/15 resize-none"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full h-14 rounded-xl text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary/25">
                      <Mail className="w-5 h-5 mr-2" />
                      Submit Partnership Inquiry
                    </Button>
                  </div>
                  
                  <div className="text-center pt-4 space-y-2">
                    <p className="text-sm text-gray-400 font-light">
                      We'll respond to partnership inquiries within 24 hours
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Custom Packages
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Premium Partnership
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipOpportunities;