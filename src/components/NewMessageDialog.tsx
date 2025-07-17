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
import { Search, MessageSquare, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

export function NewMessageDialog({
  open,
  onOpenChange,
  contacts,
  onSelectContact
}: NewMessageDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Get unique industries from contacts
  const industries = useMemo(() => {
    const allowedContacts = contacts.filter(contact => 
      contact.added_via && ['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via)
    );
    const uniqueIndustries = [...new Set(allowedContacts
      .map(contact => contact.industry)
      .filter(Boolean)
    )].sort();
    return uniqueIndustries;
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    // First filter by allowed contact types and get the 10 most recent
    const allowedContacts = contacts
      .filter(contact => 
        contact.added_via && ['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via)
      )
      .sort((a, b) => {
        // Sort by created_at or added_date (most recent first)
        const dateA = new Date(a.created_at || a.added_date || 0).getTime();
        const dateB = new Date(b.created_at || b.added_date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 9); // Take only the 9 most recent

    // Then apply industry and search filters to these 10 contacts
    return allowedContacts.filter(contact => {
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
  }, [contacts, selectedIndustry, searchTerm]);

  const handleSelectContact = (contactId: string) => {
    onSelectContact(contactId);
    setSearchTerm('');
    setSelectedIndustry('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 min-h-0 flex-1">
          <div className="flex flex-col space-y-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {industries.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No contacts found' : 'No contacts available'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {filteredContacts.map((contact) => (
                    <Button
                      key={contact.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 bg-background hover:bg-accent hover:text-accent-foreground border-border"
                      onClick={() => handleSelectContact(contact.id)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {contact.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">{contact.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span className="truncate">{contact.email}</span>
                            {contact.company && (
                              <>
                                <span>•</span>
                                <span className="truncate">{contact.company}</span>
                              </>
                            )}
                            {contact.industry && (
                              <>
                                <span>•</span>
                                <span className="truncate">{contact.industry}</span>
                              </>
                            )}
                          </div>
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