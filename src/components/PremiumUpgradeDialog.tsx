import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PremiumUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const PremiumUpgradeDialog: React.FC<PremiumUpgradeDialogProps> = ({
  open,
  onOpenChange,
  feature = "this feature"
}) => {
  const premiumFeatures = [
    "Create unlimited events",
    "Advanced discovery features",
    "Priority event visibility",
    "Enhanced networking tools",
    "Premium support",
    "Analytics and insights"
  ];

  const freeFeatures = [
    "View all public events",
    "Join events created by others",
    "Basic contact management",
    "Limited messaging"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-base">
            Unlock {feature} and all premium networking features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-3 flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                Premium Features
              </h3>
              <ul className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Free Features</h3>
              <ul className="space-y-2">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => onOpenChange(false)}
            >
              Continue with Free
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeDialog;