import React from 'react';
import { User, Edit, QrCode, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';
import MyContactCardForm from '@/components/MyContactCardForm';

const ProfileManagement = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout
      header={
        <PageHeader
          title="My Profile"
          subtitle="Manage your digital business card"
          action={
            <Button size="sm" variant="outline" className="touch-target" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Back</span>
            </Button>
          }
        />
      }
    >
      <div className="space-y-6">
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
      </div>
    </MobileLayout>
  );
};

export default ProfileManagement;