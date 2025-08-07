import React from 'react';
import { QrCode, Share2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MyContactCardForm from '@/components/MyContactCardForm';

export const MyCard = () => { // Fixed showQRModal reference error
  return (
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
        <MyContactCardForm />
      </section>
    </div>
  );
};