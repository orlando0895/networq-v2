import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  User, 
  Search, 
  BellOff, 
  Bell,
  Shield, 
  Flag, 
  Users, 
  UserPlus, 
  LogOut,
  Settings
} from 'lucide-react';
import { ContactInfoDialog } from './ContactInfoDialog';
import { MessageSearchDialog } from './MessageSearchDialog';
import { GroupInfoDialog } from './GroupInfoDialog';
import { BlockReportDialog } from './BlockReportDialog';
import { MuteNotificationsDialog } from './MuteNotificationsDialog';

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface ChatMenuDropdownProps {
  conversationId: string;
  currentUserId: string;
  isGroupChat: boolean;
  participants: Participant[];
  isMuted: boolean;
  onLeaveGroup?: () => void;
  onAddParticipants?: () => void;
}

export function ChatMenuDropdown({
  conversationId,
  currentUserId,
  isGroupChat,
  participants,
  isMuted,
  onLeaveGroup,
  onAddParticipants
}: ChatMenuDropdownProps) {
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showBlockReport, setShowBlockReport] = useState(false);
  const [showMuteDialog, setShowMuteDialog] = useState(false);

  // For individual chats, get the other participant
  const otherParticipant = !isGroupChat ? participants[0] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 touch-target">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
          {/* Individual Chat Options */}
          {!isGroupChat && otherParticipant && (
            <>
              <DropdownMenuItem onClick={() => setShowContactInfo(true)}>
                <User className="mr-2 h-4 w-4" />
                Contact Info
              </DropdownMenuItem>
            </>
          )}

          {/* Group Chat Options */}
          {isGroupChat && (
            <>
              <DropdownMenuItem onClick={() => setShowGroupInfo(true)}>
                <Users className="mr-2 h-4 w-4" />
                Group Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddParticipants}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Participants
              </DropdownMenuItem>
            </>
          )}

          {/* Common Options */}
          <DropdownMenuItem onClick={() => setShowMessageSearch(true)}>
            <Search className="mr-2 h-4 w-4" />
            Search Messages
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowMuteDialog(true)}>
            {isMuted ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Unmute {isGroupChat ? 'Group' : 'Notifications'}
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Mute {isGroupChat ? 'Group' : 'Notifications'}
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Safety Options */}
          {!isGroupChat && otherParticipant && (
            <DropdownMenuItem onClick={() => setShowBlockReport(true)} className="text-destructive focus:text-destructive">
              <Flag className="mr-2 h-4 w-4" />
              Block/Report User
            </DropdownMenuItem>
          )}

          {/* Group-specific options */}
          {isGroupChat && (
            <DropdownMenuItem onClick={onLeaveGroup} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Group
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Components */}
      {otherParticipant && (
        <ContactInfoDialog
          open={showContactInfo}
          onOpenChange={setShowContactInfo}
          participant={otherParticipant}
        />
      )}

      <MessageSearchDialog
        open={showMessageSearch}
        onOpenChange={setShowMessageSearch}
        conversationId={conversationId}
      />

      {isGroupChat && (
        <GroupInfoDialog
          open={showGroupInfo}
          onOpenChange={setShowGroupInfo}
          conversationId={conversationId}
          participants={participants}
          currentUserId={currentUserId}
        />
      )}

      {otherParticipant && (
        <BlockReportDialog
          open={showBlockReport}
          onOpenChange={setShowBlockReport}
          targetUser={otherParticipant}
          conversationId={conversationId}
        />
      )}

      <MuteNotificationsDialog
        open={showMuteDialog}
        onOpenChange={setShowMuteDialog}
        conversationId={conversationId}
        isGroupChat={isGroupChat}
        isMuted={isMuted}
      />
    </>
  );
}