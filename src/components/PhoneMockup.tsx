import React from 'react';
import { Card } from '@/components/ui/card';

interface PhoneMockupProps {
  className?: string;
}

const PhoneMockup = ({ className = '' }: PhoneMockupProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative w-80 h-[640px] mx-auto">
        {/* Phone Body */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] shadow-2xl border border-zinc-700">
          {/* Screen */}
          <div className="absolute top-6 left-6 right-6 bottom-6 bg-black rounded-[2.5rem] overflow-hidden">
            {/* Status Bar */}
            <div className="h-8 bg-black flex items-center justify-between px-6 text-sm text-white">
              <span>9:41</span>
              <div className="flex space-x-1">
                <div className="w-4 h-3 bg-white rounded-sm"></div>
                <div className="w-4 h-3 bg-white rounded-sm opacity-60"></div>
                <div className="w-4 h-3 bg-white rounded-sm opacity-30"></div>
              </div>
            </div>
            
            {/* App Header */}
            <div className="h-16 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Networq</span>
            </div>
            
            {/* App Content */}
            <div className="p-6 space-y-4 bg-zinc-900 flex-1">
              {/* Contact Cards */}
              <Card className="p-4 bg-zinc-800 border-zinc-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/80 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-white/40 rounded w-32"></div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-zinc-800 border-zinc-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/80 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-white/40 rounded w-36"></div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-zinc-800 border-zinc-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/80 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-white/40 rounded w-28"></div>
                  </div>
                </div>
              </Card>
              
              {/* QR Code Section */}
              <div className="mt-8 text-center">
                <div className="w-24 h-24 bg-white mx-auto rounded-xl mb-4 flex items-center justify-center">
                  <div className="w-20 h-20 bg-black rounded-lg grid grid-cols-8 gap-px p-2">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'} rounded-[1px]`}></div>
                    ))}
                  </div>
                </div>
                <div className="h-3 bg-white/60 rounded w-20 mx-auto"></div>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-36 h-1.5 bg-zinc-600 rounded-full"></div>
        </div>
        
        {/* Phone Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-[3rem] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default PhoneMockup;