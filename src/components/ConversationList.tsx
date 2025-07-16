import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MessageSquare, Image, Paperclip } from 'lucide-react';

interface Conversation {
  id: string;
  updated_at: string;
  last_message_at: string;
  participant: {
    id: string;
    name: string;
    email: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading
}: ConversationListProps) {
  const getMessagePreview = (message: Conversation['last_message']) => {
    if (!message) return 'No messages yet';
    
    switch (message.message_type) {
      case 'image':
        return '📷 Image';
      case 'file':
        return '📎 File';
      default:
        return message.content || 'Message';
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

  if (loading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 mb-2 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1">
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
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation with one of your contacts
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={cn(
            "w-full p-4 text-left hover:bg-muted/50 transition-colors",
            selectedConversationId === conversation.id && "bg-muted"
          )}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {conversation.participant.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-sm truncate">
                  {conversation.participant.name || conversation.participant.email}
                </h3>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                      addSuffix: true
                    })}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {conversation.last_message && getMessageIcon(conversation.last_message.message_type)}
                <p className="text-sm text-muted-foreground truncate">
                  {getMessagePreview(conversation.last_message)}
                </p>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}