import React from 'react';
import { Calendar, Plus, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';

const Events = () => {
  return (
    <MobileLayout
      header={
        <PageHeader
          title="Events"
          subtitle="Discover networking opportunities"
          action={
            <Button size="sm" className="touch-target">
              <Plus className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Create</span>
            </Button>
          }
        />
      }
    >
      <div className="space-y-6">
        {/* Upcoming Events */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {/* Sample Event Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Tech Networking Meetup
                </CardTitle>
                <CardDescription>Connect with fellow tech professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Tomorrow, 6:00 PM - 9:00 PM
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Downtown Conference Center
                  </div>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="touch-target">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Business Breakfast Club
                </CardTitle>
                <CardDescription>Weekly networking over coffee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Friday, 8:00 AM - 10:00 AM
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Central Coffee House
                  </div>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="touch-target">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Discover More */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Discover More</h2>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Find Events Near You</h3>
            <p className="text-muted-foreground mb-4">Discover networking events in your area</p>
            <Button className="touch-target">Browse Events</Button>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Events;