import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Search, Filter } from 'lucide-react';

interface EmptyStateEnhancedProps {
  hasFilters: boolean;
  onAddContact: () => void;
}

export const EmptyStateEnhanced = ({ hasFilters, onAddContact }: EmptyStateEnhancedProps) => {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-primary/10 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-primary/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
          No matches found
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          We couldn't find any contacts matching your search criteria. Try adjusting your filters or search terms.
        </p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Clear filters - you might need to pass this as a prop
              window.location.reload();
            }}
          >
            Clear Filters
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-primary ripple-effect"
            onClick={onAddContact}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <Users className="w-16 h-16 text-primary/60" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-bounce delay-100">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <h2 className="text-2xl font-heading font-bold mb-3 text-foreground">
        Start building your network
      </h2>
      <p className="text-subtitle text-center max-w-md mb-8">
        Your professional network is empty. Add your first contact to get started and unlock the power of meaningful connections.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          size="lg" 
          className="bg-gradient-primary shadow-elegant hover:shadow-glow hover:-translate-y-1 ripple-effect"
          onClick={onAddContact}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Contact
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>

      {/* Feature hints */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Add Contacts</h4>
          <p className="text-xs text-muted-foreground">Manually or via QR codes</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-green-50 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Organize</h4>
          <p className="text-xs text-muted-foreground">Sort by tiers and industries</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-50 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Search className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Find</h4>
          <p className="text-xs text-muted-foreground">Powerful search and filters</p>
        </div>
      </div>
    </div>
  );
};