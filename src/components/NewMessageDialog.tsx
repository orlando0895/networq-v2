import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MessageSquare, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
  added_via?: string;
  created_at?: string;
  added_date?: string;
}

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onCreateGroupChat: (contactIds: string[]) => void;
}

export function NewMessageDialog({
  open,
  onOpenChange,
  contacts,
  onSelectContact,
  onCreateGroupChat
}: NewMessageDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isGroupMode, setIsGroupMode] = useState(true);

  // Get unique industries from contacts
  const industries = useMemo(() => {
    const allowedContacts = contacts.filter(contact => 
      contact.added_via && ['share_code', 'qr_code', 'mutual_contact'].includes(contact.added_via)
    );
    const uniqueIndustries = [...new Set(allowedContacts
      .map(contact => contact.industry)
      .filter(Boolean)
    )].sort();
    return uniqueIndustries;
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    // First filter by allowed contact types (messageable contacts)
    const allowedContacts = contacts.filter(contact => 
      contact.added_via && ['share_code', 'qr_code', 'mutual_contact'].includes(contact.added_via)
    );

    const availableContacts = allowedContacts;

    // If there's a search term, search through ALL available messageable contacts
    if (searchTerm.trim()) {
      return availableContacts.filter(contact => {
        // Apply industry filter
        if (selectedIndustry !== 'all' && contact.industry !== selectedIndustry) {
          return false;
        }
        
        // Apply search filter
        return contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contact.industry?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // If no search term, show only the 9 most recent contacts
    const recentContacts = availableContacts
      .sort((a, b) => {
        // Sort by created_at or added_date (most recent first)
        const dateA = new Date(a.created_at || a.added_date || 0).getTime();
        const dateB = new Date(b.created_at || b.added_date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 9); // Take only the 9 most recent

    // Apply industry filter to recent contacts
    return recentContacts.filter(contact => {
      if (selectedIndustry !== 'all' && contact.industry !== selectedIndustry) {
        return false;
      }
      return true;
    });
  }, [contacts, selectedIndustry, searchTerm]);

  const handleToggleContact = (contact: Contact) => {
    setSelectedContacts(prev => {
      const exists = prev.some(c => c.id === contact.id);
      return exists ? prev.filter(c => c.id !== contact.id) : [...prev, contact];
    });
  };


  const handleDone = () => {
    if (selectedContacts.length === 1) {
      onSelectContact(selectedContacts[0].id);
    } else if (selectedContacts.length > 1) {
      onCreateGroupChat(selectedContacts.map(c => c.id));
    }
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm('');
    setSelectedIndustry('all');
    setSelectedContacts([]);
    setIsGroupMode(true);
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">New Message</DialogTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleDone}
              disabled={selectedContacts.length === 0}
              className="h-9 px-3 text-sm"
            >
              Done
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 min-h-0 flex-1">
          
          <div className="flex flex-col space-y-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search names, notes, and info"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
              <div className="pt-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Participants ({selectedContacts.length}/100)
                </span>
              </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No contacts found' : 'No contacts available'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full w-full">
                <div className="space-y-2 pr-2">
                  {filteredContacts.map((contact) => (
                    <Button
                      key={contact.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 bg-background hover:bg-accent hover:text-accent-foreground border border-border/50 rounded-lg touch-target transition-all"
                      onClick={() => handleToggleContact(contact)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm font-medium">
                              {contact.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm truncate">{contact.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                            <span className="truncate max-w-32">{contact.email}</span>
                            {contact.company && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate max-w-24 hidden sm:inline">{contact.company}</span>
                              </>
                            )}
                            {contact.industry && (
                              <>
                                <span className="hidden md:inline">•</span>
                                <span className="truncate max-w-20 hidden md:inline">{contact.industry}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <Checkbox
                            checked={selectedContacts.some(sc => sc.id === contact.id)}
                            onCheckedChange={() => handleToggleContact(contact)}
                            className="h-5 w-5 rounded-full pointer-events-none"
                          />
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}