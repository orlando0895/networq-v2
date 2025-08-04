import React from 'react';
import { Radar, Users, Star, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Discovery = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Discovery</h1>
              <p className="text-muted-foreground">Find people in your area</p>
            </div>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Boost Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Discovery Stats */}
        <section className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">247</div>
              <div className="text-sm text-muted-foreground">People Nearby</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
            </CardContent>
          </Card>
        </section>

        {/* Discover People */}
        <section>
          <h2 className="text-lg font-semibold mb-4">People Near You</h2>
          <div className="space-y-4">
            {/* Sample Profile Cards */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Sarah Johnson</h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Boosted
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Marketing Director at TechCorp</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      0.5 miles away
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Michael Chen</h3>
                      <Badge variant="secondary">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Software Engineer at StartupXYZ</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      1.2 miles away
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Emily Rodriguez</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">UX Designer at DesignCo</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      2.1 miles away
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Discovery Settings */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5" />
                Discovery Settings
              </CardTitle>
              <CardDescription>Control how you appear to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visible in Discovery</span>
                <Button size="sm" variant="outline">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Discovery Radius</span>
                <Button size="sm" variant="outline">25 miles</Button>
              </div>
              <Button className="w-full">Update Settings</Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Discovery;