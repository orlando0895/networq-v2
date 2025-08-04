import React from 'react';
import { User, Edit, QrCode, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MyContactCardForm from '@/components/MyContactCardForm';

const ProfileManagement = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your digital business card</p>
            </div>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Card
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <QrCode className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">QR Code</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Share2 className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">Share</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Edit className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">Edit</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Profile Form */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Update your digital business card information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyContactCardForm />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ProfileManagement;