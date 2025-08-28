import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/lib/supabase-subscriptions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useEventComments = (eventId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    if (!eventId) return;
    
    try {
      const { data: commentData, error } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for comments
      const commentsWithProfiles = await Promise.all(
        (commentData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile,
          };
        })
      );

      setComments(commentsWithProfiles);

    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content,
          parent_comment_id: parentCommentId,
        });

      if (error) throw error;

      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('event_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Comment updated",
        description: "Your comment has been updated",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription
    const channelName = `event-comments-${eventId}`;
    const channel = subscriptionManager.getOrCreateChannel(channelName, () =>
      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_comments',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            fetchComments();
          }
        )
        .subscribe()
    );

    return () => {
      // Don't remove the channel here - let the manager handle it
    };
  }, [eventId]);

  return {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
  };
};