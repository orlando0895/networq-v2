import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface ContactInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant;
}

export function ContactInfoDialog({ open, onOpenChange, participant }: ContactInfoDialogProps) {
  const { contacts } = useContacts();
  
  // Find the full contact info if this participant is in the user's contacts
  const contactInfo = contacts.find(contact => contact.email === participant.email);

  const initials = participant.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Info</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-xl font-semibold">{participant.full_name || 'Unknown User'}</h3>
              {contactInfo?.tier && (
                <Badge variant="secondary" className="mt-2">
                  {contactInfo.tier}
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-left justify-start"
                  onClick={() => window.open(`mailto:${participant.email}`, '_blank')}
                >
                  {participant.email}
                </Button>
              </div>
            </div>

            {contactInfo?.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-left justify-start"
                    onClick={() => window.open(`tel:${contactInfo.phone}`, '_blank')}
                  >
                    {contactInfo.phone}
                  </Button>
                </div>
              </div>
            )}

            {contactInfo?.company && (
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{contactInfo.company}</p>
                </div>
              </div>
            )}

            {contactInfo?.industry && (
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{contactInfo.industry}</p>
                </div>
              </div>
            )}

            {contactInfo?.linkedin && (
              <div className="flex items-center space-x-3">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-left justify-start"
                    onClick={() => window.open(contactInfo.linkedin, '_blank')}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            )}

            {contactInfo?.notes && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{contactInfo.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`mailto:${participant.email}`, '_blank')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            {contactInfo?.phone && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`tel:${contactInfo.phone}`, '_blank')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}