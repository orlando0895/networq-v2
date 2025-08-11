import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, Heart, X } from 'lucide-react';
import { useEventRSVP, RSVPStatus } from '@/hooks/useEventRSVP';
import { cn } from '@/lib/utils';

interface EventRSVPButtonProps {
  eventId: string;
  initialAttendees?: number;
  variant?: 'default' | 'compact';
  className?: string;
}

const statusConfig = {
  going: {
    label: 'Going',
    icon: Check,
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 text-white'
  },
  interested: {
    label: 'Interested', 
    icon: Heart,
    variant: 'outline' as const,
    className: 'border-orange-500 text-orange-500 hover:bg-orange-50'
  },
  not_going: {
    label: 'Can\'t Go',
    icon: X,
    variant: 'outline' as const,
    className: 'border-red-500 text-red-500 hover:bg-red-50'
  }
};

export const EventRSVPButton = ({ 
  eventId, 
  initialAttendees = 0, 
  variant = 'default',
  className 
}: EventRSVPButtonProps) => {
  const { status, isLoading, handleRSVP } = useEventRSVP(eventId, initialAttendees);

  if (variant === 'compact' && status) {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Button
        size="sm"
        variant={config.variant}
        className={cn(config.className, className)}
        disabled={isLoading}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Button>
    );
  }

  const currentConfig = status ? statusConfig[status] : null;
  const CurrentIcon = currentConfig?.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentConfig?.variant || 'default'}
          className={cn(
            currentConfig?.className,
            'min-w-[120px] justify-between',
            className
          )}
          disabled={isLoading}
        >
          <div className="flex items-center">
            {CurrentIcon && <CurrentIcon className="h-4 w-4 mr-2" />}
            {currentConfig?.label || 'Join Event'}
          </div>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        {Object.entries(statusConfig).map(([statusKey, config]) => {
          const Icon = config.icon;
          const statusValue = statusKey as RSVPStatus;
          
          return (
            <DropdownMenuItem
              key={statusKey}
              onClick={() => handleRSVP(statusValue)}
              className="flex items-center"
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
              {status === statusValue && (
                <Check className="h-3 w-3 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        {status && (
          <>
            <div className="border-t my-1" />
            <DropdownMenuItem
              onClick={() => handleRSVP(null)}
              className="flex items-center text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Remove RSVP
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};