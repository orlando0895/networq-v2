import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Heart, X } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactQuickFiltersProps {
  contacts: Contact[];
  activeFilters: {
    tier: "all" | "A-player" | "Acquaintance";
    industry: string;
    search: string;
  };
  onFilterChange: (filters: Partial<ContactQuickFiltersProps['activeFilters']>) => void;
}

const ContactQuickFilters = ({ contacts, activeFilters, onFilterChange }: ContactQuickFiltersProps) => {
  const aPlayerCount = contacts.filter(c => c.tier === "A-player").length;
  const acquaintanceCount = contacts.filter(c => c.tier === "Acquaintance").length;
  const recentlyAddedCount = contacts.filter(c => {
    const addedDate = new Date(c.added_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return addedDate >= weekAgo;
  }).length;

  const hasActiveFilters = activeFilters.tier !== "all" || activeFilters.industry !== "all" || activeFilters.search !== "";

  const clearAllFilters = () => {
    onFilterChange({ tier: "all", industry: "all", search: "" });
  };

  return (
    <div className="space-y-4">
      {/* Quick filter buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilters.tier === "A-player" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ tier: activeFilters.tier === "A-player" ? "all" : "A-player" })}
          className="h-8 text-xs font-medium transition-all hover:scale-105"
        >
          <Star className="w-3 h-3 mr-1.5 fill-current" />
          A-Players ({aPlayerCount})
        </Button>
        
        <Button
          variant={activeFilters.tier === "Acquaintance" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ tier: activeFilters.tier === "Acquaintance" ? "all" : "Acquaintance" })}
          className="h-8 text-xs font-medium transition-all hover:scale-105"
        >
          <Heart className="w-3 h-3 mr-1.5" />
          Acquaintances ({acquaintanceCount})
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Filter for recently added contacts
            // This would need additional logic to filter by date
          }}
          className="h-8 text-xs font-medium transition-all hover:scale-105"
        >
          <Clock className="w-3 h-3 mr-1.5" />
          Recent ({recentlyAddedCount})
        </Button>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
          
          {activeFilters.tier !== "all" && (
            <Badge variant="secondary" className="h-6 text-xs font-medium">
              Tier: {activeFilters.tier}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange({ tier: "all" })}
              />
            </Badge>
          )}
          
          {activeFilters.industry !== "all" && (
            <Badge variant="secondary" className="h-6 text-xs font-medium">
              Industry: {activeFilters.industry}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange({ industry: "all" })}
              />
            </Badge>
          )}
          
          {activeFilters.search && (
            <Badge variant="secondary" className="h-6 text-xs font-medium">
              Search: "{activeFilters.search}"
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => onFilterChange({ search: "" })}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContactQuickFilters;