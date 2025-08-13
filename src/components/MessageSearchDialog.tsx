import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  created_at: string;
  sender_name: string;
  rank: number;
}

interface MessageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
}

export function MessageSearchDialog({ open, onOpenChange, conversationId }: MessageSearchDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase.rpc('search_messages_in_conversation', {
        conversation_id_param: conversationId,
        search_query: searchQuery.trim(),
        limit_param: 50
      });

      if (error) throw error;

      setSearchResults(data || []);
      setCurrentResultIndex(0);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Search Error",
        description: "Failed to search messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateResults = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    if (direction === 'up') {
      setCurrentResultIndex(prev => prev > 0 ? prev - 1 : searchResults.length - 1);
    } else {
      setCurrentResultIndex(prev => prev < searchResults.length - 1 ? prev + 1 : 0);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setCurrentResultIndex(0);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results Navigation */}
        {searchResults.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground border rounded-md p-2">
            <span>{currentResultIndex + 1} of {searchResults.length} results</span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateResults('up')}
                disabled={searchResults.length <= 1}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateResults('down')}
                disabled={searchResults.length <= 1}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Search Results */}
        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-3">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                Searching messages...
              </div>
            ) : hasSearched && searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found for "{searchQuery}"
              </div>
            ) : (
              searchResults.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    index === currentResultIndex 
                      ? 'bg-accent border-primary' 
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">
                      {result.sender_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {highlightSearchTerm(result.content, searchQuery)}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Instructions */}
        {!hasSearched && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Enter a search term to find messages in this conversation
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}