import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Zap, Wifi, Star } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa';
import { cn } from '@/lib/utils';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export function PWAInstallBanner({ onDismiss, className }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      onDismiss?.();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={cn(
      "mx-4 mb-4 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 shadow-lg",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Install Networq App</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Get the full app experience with offline access and native features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <Zap className="h-5 w-5 mx-auto text-primary" />
            <p className="text-xs font-medium">Faster</p>
          </div>
          <div className="space-y-1">
            <Wifi className="h-5 w-5 mx-auto text-primary" />
            <p className="text-xs font-medium">Offline</p>
          </div>
          <div className="space-y-1">
            <Star className="h-5 w-5 mx-auto text-primary" />
            <p className="text-xs font-medium">Native</p>
          </div>
        </div>
        <Button onClick={handleInstall} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
}

// Floating install button for persistent install prompt
export function PWAInstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(true);

  if (!isInstallable || isInstalled || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={handleInstall}
        size="lg"
        className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground px-6"
      >
        <Download className="h-5 w-5 mr-2" />
        Install
      </Button>
    </div>
  );
}