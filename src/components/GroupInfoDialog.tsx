import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Edit2, 
  Check, 
  X, 
  UserMinus,
  Crown,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface GroupInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  participants: Participant[];
  currentUserId: string;
}

export function GroupInfoDialog({ 
  open, 
  onOpenChange, 
  conversationId, 
  participants,
  currentUserId 
}: GroupInfoDialogProps) {
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(getGroupChatTitle());
  const [tempGroupName, setTempGroupName] = useState(groupName);

  function getGroupChatTitle() {
    if (participants.length === 0) return 'Group Chat';
    if (participants.length === 1) return participants[0].full_name || participants[0].email;
    if (participants.length === 2) return participants.map(p => (p.full_name || p.email).split(' ')[0]).join(', ');
    return `${(participants[0].full_name || participants[0].email).split(' ')[0]} and ${participants.length - 1} others`;
  }

  const handleSaveName = () => {
    // TODO: Implement group name update functionality
    setGroupName(tempGroupName);
    setIsEditingName(false);
    toast({
      title: "Group name updated",
      description: "The group name has been changed."
    });
  };

  const handleCancelEdit = () => {
    setTempGroupName(groupName);
    setIsEditingName(false);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      // TODO: Implement remove participant functionality
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the group."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove participant.",
        variant: "destructive"
      });
    }
  };

  const totalParticipants = participants.length + 1; // +1 for current user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Group Info</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Avatar & Name */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Users className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 w-full">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={tempGroupName}
                    onChange={(e) => setTempGroupName(e.target.value)}
                    className="text-center"
                    placeholder="Group name"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <h3 className="text-xl font-semibold">{groupName}</h3>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setIsEditingName(true)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {totalParticipants} participants
              </p>
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Participants</Label>
            <ScrollArea className="max-h-60">
              <div className="space-y-3">
                {/* Current User */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        You
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">You</p>
                      <p className="text-xs text-muted-foreground">Group admin</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>

                {/* Other Participants */}
                {participants.map((participant) => {
                  const initials = participant.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || '?';

                  return (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {participant.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.email}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button className="flex-1" variant="outline">
              Add Participants
            </Button>
            <Button className="flex-1" variant="outline">
              Group Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
