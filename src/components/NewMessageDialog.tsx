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
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Filter, X, Users, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  const [isGroupMode, setIsGroupMode] = useState(false);

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
    // First filter by allowed contact types (messageable contacts)
    const allowedContacts = contacts.filter(contact => 
      contact.added_via && ['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via)
    );

    // Filter out already selected contacts in group mode
    const availableContacts = isGroupMode 
      ? allowedContacts.filter(contact => !selectedContacts.find(sc => sc.id === contact.id))
      : allowedContacts;

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
  }, [contacts, selectedIndustry, searchTerm, isGroupMode, selectedContacts]);

  const handleSelectContact = (contact: Contact) => {
    if (isGroupMode) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      onSelectContact(contact.id);
      handleClose();
    }
  };

  const handleRemoveFromSelection = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleCreateGroupChat = () => {
    if (selectedContacts.length >= 1) {
      onCreateGroupChat(selectedContacts.map(c => c.id));
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm('');
    setSelectedIndustry('all');
    setSelectedContacts([]);
    setIsGroupMode(false);
  };

  const toggleGroupMode = () => {
    setIsGroupMode(!isGroupMode);
    setSelectedContacts([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {isGroupMode ? 'Create Group Chat' : 'Start New Conversation'}
            </DialogTitle>
            <Button
              variant={isGroupMode ? "default" : "outline"}
              size="sm"
              onClick={toggleGroupMode}
              className="h-9 px-3 text-xs touch-target"
            >
              {isGroupMode ? <MessageSquare className="h-4 w-4 mr-1.5" /> : <Users className="h-4 w-4 mr-1.5" />}
              {isGroupMode ? 'Direct' : 'Group'}
            </Button>
          </div>
          {isGroupMode && (
            <p className="text-sm text-muted-foreground mt-1">
              Select multiple contacts to create a group chat
            </p>
          )}
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 min-h-0 flex-1">
          {/* Selected contacts in group mode with improved mobile UI */}
          {isGroupMode && selectedContacts.length > 0 && (
            <div className="flex-shrink-0 bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Selected ({selectedContacts.length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContacts([])}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedContacts.map((contact) => (
                  <Badge
                    key={contact.id}
                    variant="default"
                    className="flex items-center space-x-2 pr-1 py-1.5 touch-target"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-primary-foreground text-primary">
                        {contact.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs max-w-20 truncate font-medium">{contact.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromSelection(contact.id);
                      }}
                      className="h-5 w-5 p-0 hover:bg-primary-foreground/20 rounded-full touch-target"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
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

          <div className="flex-1 min-h-0 overflow-hidden">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No contacts found' : (isGroupMode && selectedContacts.length > 0 ? 'No more contacts available' : 'No contacts available')}
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
                      onClick={() => handleSelectContact(contact)}
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
                          {isGroupMode && (
                            <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <UserPlus className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                          )}
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
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Create group chat button with enhanced mobile styling */}
          {isGroupMode && selectedContacts.length > 0 && (
            <div className="flex-shrink-0 pt-4 border-t border-border">
              <Button
                onClick={handleCreateGroupChat}
                className="w-full h-12 text-base font-semibold touch-target"
                disabled={selectedContacts.length === 0}
                size="lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Create Group Chat ({selectedContacts.length})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}