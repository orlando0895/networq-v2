import React from 'react';
import { Card } from '@/components/ui/card';

interface PhoneMockupProps {
  className?: string;
}

const PhoneMockup = ({ className = '' }: PhoneMockupProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative w-64 h-[520px] mx-auto">
        {/* Phone Body */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[2.5rem] shadow-2xl">
          {/* Screen */}
          <div className="absolute top-4 left-4 right-4 bottom-4 bg-background rounded-[2rem] overflow-hidden">
            {/* Status Bar */}
            <div className="h-6 bg-background flex items-center justify-between px-4 text-xs text-foreground">
              <span>9:41</span>
              <div className="flex space-x-1">
                <div className="w-4 h-2 bg-foreground rounded-sm"></div>
                <div className="w-4 h-2 bg-foreground rounded-sm"></div>
                <div className="w-4 h-2 bg-foreground rounded-sm"></div>
              </div>
            </div>
            
            {/* App Header */}
            <div className="h-14 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">Networq</span>
            </div>
            
            {/* App Content */}
            <div className="p-4 space-y-4">
              {/* Contact Cards */}
              <Card className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-foreground/20 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-foreground/10 rounded w-24"></div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-foreground/20 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-foreground/10 rounded w-24"></div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-foreground/20 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-foreground/10 rounded w-24"></div>
                  </div>
                </div>
              </Card>
              
              {/* QR Code Section */}
              <div className="mt-6 text-center">
                <div className="w-20 h-20 bg-foreground mx-auto rounded-lg mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-background rounded grid grid-cols-4 gap-px p-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`bg-foreground ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                    ))}
                  </div>
                </div>
                <div className="h-2 bg-foreground/20 rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-zinc-600 rounded-full"></div>
        </div>
        
        {/* Phone Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-[2.5rem] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default PhoneMockup;