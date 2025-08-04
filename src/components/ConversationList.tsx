import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MessageSquare, Image, Paperclip, Trash2, UserMinus, Users, Archive } from 'lucide-react';
import { SwipeableItem } from '@/components/SwipeableItem';
import { PullToRefresh } from '@/components/PullToRefresh';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface Conversation {
  id: string;
  updated_at: string;
  last_message_at: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  participant_count: number;
  is_group_chat: boolean;
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
    sender_name?: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (conversationId: string, deleteType: 'hide' | 'delete') => void;
  onRefresh?: () => Promise<void> | void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  onRefresh,
  loading
}: ConversationListProps) {
  const [swipedConversation, setSwipedConversation] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { impact } = useHapticFeedback();
  
  const handleDeleteClick = (conversationId: string) => {
    impact('medium');
    setConversationToDelete(conversationId);
    setShowDeleteDialog(true);
    setSwipedConversation(null);
  };

  const handleHideClick = (conversationId: string) => {
    impact('light');
    if (onDeleteConversation) {
      onDeleteConversation(conversationId, 'hide');
    }
  };

  const handleConversationClick = (conversationId: string) => {
    impact('light');
    onSelectConversation(conversationId);
  };

  const handleDeleteConfirm = (deleteType: 'hide' | 'delete') => {
    if (conversationToDelete && onDeleteConversation) {
      onDeleteConversation(conversationToDelete, deleteType);
    }
    setShowDeleteDialog(false);
    setConversationToDelete(null);
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.is_group_chat) {
      if (conversation.participants.length === 0) return 'Group Chat';
      if (conversation.participants.length === 1) return conversation.participants[0].name || conversation.participants[0].email;
      if (conversation.participants.length === 2) {
        return conversation.participants.map(p => (p.name || p.email).split(' ')[0]).join(', ');
      }
      return `${(conversation.participants[0].name || conversation.participants[0].email).split(' ')[0]} and ${conversation.participants.length - 1} others`;
    }
    
    const participant = conversation.participants[0];
    return participant?.name || participant?.email || 'Unknown User';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.is_group_chat) {
      return `${conversation.participant_count} participants`;
    }
    return conversation.participants[0]?.email || '';
  };

  const getMessagePreview = (message: Conversation['last_message'], isGroupChat: boolean) => {
    if (!message) return 'No messages yet';
    
    let preview = '';
    
    // Add sender name for group chats
    if (isGroupChat && message.sender_name) {
      preview = `${message.sender_name.split(' ')[0]}: `;
    }
    
    switch (message.message_type) {
      case 'image':
        return preview + '📷 Image';
      case 'file':
        return preview + '📎 File';
      default:
        return preview + (message.content || 'Message');
    }
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'file':
        return <Paperclip className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const renderConversationAvatar = (conversation: Conversation) => {
    if (conversation.is_group_chat) {
      return (
        <div className="relative">
          <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-primary/20">
            <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Users className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 text-xs font-semibold bg-accent text-accent-foreground border-2 border-background">
            {conversation.participant_count}
          </Badge>
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
        </div>
      );
    }

    const participant = conversation.participants[0];
    return (
      <div className="relative">
        <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-primary/20">
          <AvatarFallback className="text-sm font-semibold">
            {participant?.name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2 md:p-3 mb-2 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-6">
        <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
        <h3 className="font-medium mb-2 text-sm md:text-base">No conversations yet</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Start a conversation with one of your contacts
        </p>
      </div>
    );
  }

  const conversationContent = (
    <>
      <div className="divide-y divide-border">
        {conversations.map((conversation) => {
          const swipeActions = onDeleteConversation ? [
            {
              id: 'hide',
              label: 'Hide',
              icon: <Archive className="h-4 w-4" />,
              color: 'warning' as const,
              onAction: () => handleHideClick(conversation.id)
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: <Trash2 className="h-4 w-4" />,
              color: 'destructive' as const,
              onAction: () => handleDeleteClick(conversation.id)
            }
          ] : [];

          return (
            <SwipeableItem
              key={conversation.id}
              rightActions={swipeActions}
              className="bg-background"
              hapticFeedback={true}
            >
              <button
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-all active:bg-muted/70 touch-target-large haptic-enabled group relative",
                  selectedConversationId === conversation.id && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <div className="flex items-center space-x-4">
                  {renderConversationAvatar(conversation)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <h3 className="font-semibold text-base truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        {conversation.is_group_chat && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 touch-no-select">
                            <Users className="h-3 w-3 mr-1" />
                            Group
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.last_message && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                              addSuffix: true
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 min-w-0 flex-1">
                        {conversation.last_message && getMessageIcon(conversation.last_message.message_type)}
                        <p className="text-sm text-muted-foreground truncate">
                          {getMessagePreview(conversation.last_message, conversation.is_group_chat)}
                        </p>
                      </div>
                      {!conversation.is_group_chat && (
                        <p className="text-xs text-muted-foreground truncate ml-2 flex-shrink-0 max-w-24">
                          {getConversationSubtitle(conversation)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </SwipeableItem>
          );
        })}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              How would you like to delete this conversation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel className="touch-target">Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleDeleteConfirm('hide')}
              className="w-full sm:w-auto touch-target"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Hide from my side
            </Button>
            <AlertDialogAction
              onClick={() => handleDeleteConfirm('delete')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto touch-target"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete completely
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return onRefresh ? (
    <PullToRefresh onRefresh={onRefresh} disabled={loading}>
      {conversationContent}
    </PullToRefresh>
  ) : conversationContent;
}