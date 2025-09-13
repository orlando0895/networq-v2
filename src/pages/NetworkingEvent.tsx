import React from 'react';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Target, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NetworkingEvent = () => {
  const navigate = useNavigate();

  const features = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Build a comprehensive digital business card in minutes"
    },
    {
      step: "02", 
      title: "Share with One Tap",
      description: "Generate and share your unique QR code instantly"
    },
    {
      step: "03",
      title: "Scan & Connect", 
      description: "Capture contact information and add industry tags automatically"
    },
    {
      step: "04",
      title: "Message & Follow-Up",
      description: "Stay connected with integrated messaging right inside the app"
    }
  ];

  const problems = [
    {
      title: "Paper Cards Get Lost",
      stat: "67% of business cards are thrown away within a week"
    },
    {
      title: "No Follow-Up System", 
      stat: "Most connections fade without structured relationship management"
    },
    {
      title: "Manual Data Entry",
      stat: "Time-consuming transcription creates barriers to connection"
    }
  ];

  const membershipBenefits = [
    {
      title: "Web Development Suite",
      description: "Free website audit, discounted creation, plus access to Website Builder Pro, Funnel Builder Pro, and App Builder Pro tools"
    },
    {
      title: "Business Builder Kit",
      description: "Complete online resource library to launch or scale your business with proven frameworks and templates"
    },
    {
      title: "Elite Community Access", 
      description: "Accountability app, curated quality connections, exclusive member trainings, and monthly networking outings"
    }
  ];

  const sponsorshipTiers = [
    {
      title: "Title Sponsor",
      description: "Your logo on all event materials, speaking slot, VIP tickets, and lifetime membership for key staff"
    },
    {
      title: "Supporting Sponsors",
      description: "Prominent logo placement, event shout-outs, email and social media promotion, plus VIP tickets"
    },
    {
      title: "Community Partners",
      description: "Contribute in-kind (beverages, raffle prizes) and receive table space plus recognition at the event"
    }
  ];

  return (
    <MobileLayout
      header={
        <PageHeader 
          title="Networq Event"
          subtitle="Transforming Networking in Scottsdale"
        />
      }
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold text-foreground">
            Networq – Transforming Networking in Scottsdale
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Networking isn't about exchanging business cards; it's about building relationships. 
            Networq bridges the gap between in-person introductions and long-term connections. 
            Join us to experience the future of networking in America's most dynamic entrepreneurial hub.
          </p>
        </section>

        {/* The Problem Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            The Problem: Missed Connections & Lost Opportunities
          </h2>
          <p className="text-muted-foreground">
            We've all been there—shuffling paper cards, forgetting names, losing numbers in jacket pockets. 
            Traditional networking leaves too much to chance and lacks meaningful follow-up systems.
          </p>
          <p className="text-muted-foreground">
            Entrepreneurs and professionals need a better way to connect and stay connected in today's fast-paced business environment.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            {problems.map((problem, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{problem.stat}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Solution Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Our Solution: The Networq App
          </h2>
          <p className="text-muted-foreground">
            Networq replaces paper business cards with a dynamic, digital card that automatically updates 
            and integrates with an intuitive CRM system.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-10 h-10 rounded-full flex items-center justify-center">
                      {feature.step}
                    </Badge>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground italic">
            Networq simplifies networking so you never lose a lead or miss an opportunity to grow your business.
          </p>
        </section>

        {/* Event Overview Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Event Overview: Networq Networking Event
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold">September 23, 2025</p>
                <p className="text-sm text-muted-foreground">Just 10 days away—mark your calendars!</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <MapPin className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold">Scottsdale, AZ</p>
                <p className="text-sm text-muted-foreground">Premium venue details provided to sponsors</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Target className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold">100+ attendees and 20 new members</p>
                <p className="text-sm text-muted-foreground">Quality connections over quantity</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Star className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold">Live demos, curated sessions, workshops</p>
                <p className="text-sm text-muted-foreground">Plus exclusive membership opportunities</p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-muted-foreground">
            Join entrepreneurs, founders, and professionals as we celebrate the launch of Networq in our hometown.
          </p>
        </section>

        {/* Membership Benefits Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Membership Benefits
          </h2>
          <p className="text-muted-foreground">
            Our paid membership transforms Networq into a comprehensive business-building ecosystem designed for serious entrepreneurs.
          </p>
          
          <div className="space-y-4">
            {membershipBenefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Exclusive Feature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access to our virtual boardroom where members present ideas and receive feedback from a panel of experienced mentors, 
                plus AI-powered lead generation tools.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Sponsorship Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Sponsorship Opportunities
          </h2>
          <p className="text-muted-foreground">
            We're offering three carefully designed sponsorship tiers to maximize your investment and brand exposure:
          </p>
          
          <div className="space-y-4">
            {sponsorshipTiers.map((tier, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{tier.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-muted-foreground">
            Our attendees are decision-makers and innovators actively seeking new solutions. 
            Sponsoring Networq positions your brand in front of an engaged community ready to invest in growth.
          </p>
        </section>

        {/* Why Sponsor Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Why Sponsor Networq?
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Premium Exposure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reach 100+ entrepreneurs in-person, plus thousands online through our comprehensive marketing efforts
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Target className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Brand Alignment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showcase your support for local business innovation and cutting-edge technology adoption
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <ArrowRight className="w-8 h-8 mx-auto text-primary" />
                <CardTitle className="text-lg">Long-term Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join Networq's ecosystem with opportunities for future collaborations, app integrations, and co-branding
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-muted/50 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <blockquote className="text-lg italic text-muted-foreground">
                "We're not just hosting an event; we're building a movement. Partner with us at the ground level 
                and grow alongside Scottsdale's next generation of business leaders."
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Ready to Partner?
          </h2>
          <p className="text-muted-foreground">
            Sponsorship packages are limited and filling quickly. Don't miss your opportunity to be part of Scottsdale's networking revolution.
          </p>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <p className="font-bold text-destructive mb-4">Time-Sensitive:</p>
              <p className="text-muted-foreground">
                Contact us today to secure your sponsorship tier and help shape the future of networking in Scottsdale's thriving business community.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            We look forward to collaborating with you and building something extraordinary together!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/support')}>
              Contact Us
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Back to App
            </Button>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default NetworkingEvent;