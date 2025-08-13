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
import { Search, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface AddParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  existingParticipants: Participant[];
  onParticipantsAdded: () => void;
}

export function AddParticipantsDialog({
  open,
  onOpenChange,
  conversationId,
  existingParticipants,
  onParticipantsAdded
}: AddParticipantsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { toast } = useToast();

  // Filter contacts that can be added (not already in conversation, not blocked)
  const availableContacts = useMemo(() => {
    const existingIds = new Set(existingParticipants.map(p => p.id));
    
    return contacts.filter(contact => {
      // Must be a messageable contact
      if (!contact.added_via || !['share_code', 'qr_code', 'mutual_contact'].includes(contact.added_via)) {
        return false;
      }
      
      // Not already in the conversation
      if (existingIds.has(contact.id)) {
        return false;
      }
      
      return true;
    });
  }, [contacts, existingParticipants]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableContacts;
    }

    return availableContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableContacts, searchTerm]);

  const handleToggleContact = (contact: any) => {
    setSelectedContacts(prev => {
      const exists = prev.some(c => c.id === contact.id);
      return exists ? prev.filter(c => c.id !== contact.id) : [...prev, contact];
    });
  };

  const handleAddParticipants = async () => {
    if (selectedContacts.length === 0 || !user) return;

    setIsLoading(true);
    
    try {
      // Add participants to the conversation
      const participantInserts = selectedContacts.map(contact => ({
        conversation_id: conversationId,
        user_id: contact.id
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      if (participantError) {
        throw participantError;
      }

      // Create system message about the addition
      const participantNames = selectedContacts.map(c => c.name).join(', ');
      const systemMessage = `Added ${participantNames} to the group`;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: systemMessage,
          message_type: 'system'
        });

      if (messageError) {
        throw messageError;
      }

      toast({
        title: "Participants added",
        description: `Successfully added ${selectedContacts.length} participant(s)`,
      });

      onParticipantsAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding participants:', error);
      toast({
        title: "Error adding participants",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchTerm('');
    setSelectedContacts([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md h-[88vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Add Participants</DialogTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddParticipants}
              disabled={selectedContacts.length === 0 || isLoading}
              className="h-9 px-3 text-sm mr-12"
            >
              {isLoading ? "Adding..." : `Add (${selectedContacts.length})`}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 min-h-0 flex-1">
          <div className="flex flex-col space-y-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts to add"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="pt-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Selected ({selectedContacts.length})
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No contacts found' : 'No contacts available to add'}
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
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="text-sm font-medium">
                              {contact.name
                                .split(' ')
                                .map((n: string) => n[0])
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