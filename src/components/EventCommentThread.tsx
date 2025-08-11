import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, MoreVertical, Edit2, Trash2, Reply } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEventComments } from '@/hooks/useEventComments';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface EventCommentThreadProps {
  eventId: string;
}

export const EventCommentThread: React.FC<EventCommentThreadProps> = ({ eventId }) => {
  const { user } = useAuth();
  const { comments, isLoading, addComment, updateComment, deleteComment } = useEventComments(eventId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment: any) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Group comments by parent/child relationship
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
  const getReplies = (parentId: string) => 
    comments.filter(comment => comment.parent_comment_id === parentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Discussion</h3>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <Card className={isReply ? 'ml-8 border-l-2 border-primary/20' : ''}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-xs">
              {comment.profiles?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {comment.profiles?.full_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.created_at)}
                  {comment.updated_at !== comment.created_at && ' • edited'}
                </span>
              </div>
              
              {comment.user_id === user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => startEditing(comment)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {editingComment === comment.id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEditComment(comment.id)}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="mt-2 h-auto p-1 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Discussion</h3>
        <span className="text-sm text-muted-foreground">
          ({comments.length} comment{comments.length !== 1 ? 's' : ''})
        </span>
      </div>

      {/* New Comment Form */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm text-muted-foreground">
                  Replying to comment
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Join the discussion..."}
              className="min-h-[100px]"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Be respectful and constructive in your comments
              </span>
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {replyingTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem comment={comment} />
            {getReplies(comment.id).map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No comments yet</p>
          <p className="text-sm text-muted-foreground">Be the first to start the discussion!</p>
        </div>
      )}
    </div>
  );
};