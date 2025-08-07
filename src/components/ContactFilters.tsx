
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, X } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterTier: "all" | "A-player" | "Acquaintance";
  onFilterChange: (tier: "all" | "A-player" | "Acquaintance") => void;
  contacts: Contact[];
}

const ContactFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterTier, 
  onFilterChange, 
  contacts 
}: ContactFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder="Search by name, company, or industry..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-4 text-base border focus:ring-2 focus:ring-primary/20 transition-all h-12 bg-background/50 backdrop-blur-sm"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Improved Filter Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={filterTier === "all" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("all")}
          className="h-16 flex-col gap-1 transition-all duration-200 hover:scale-105"
        >
          <span className="font-semibold text-lg">{contacts.length}</span>
          <span className="text-xs opacity-90">All Contacts</span>
        </Button>
        
        <Button
          variant={filterTier === "A-player" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("A-player")}
          className={`h-16 flex-col gap-1 transition-all duration-200 hover:scale-105 ${
            filterTier === "A-player" 
              ? "bg-tier-a-player text-white hover:bg-tier-a-player/90" 
              : "border-tier-a-player/30 hover:border-tier-a-player hover:bg-tier-a-player/5"
          }`}
        >
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-lg">{contacts.filter(c => c.tier === "A-player").length}</span>
          </div>
          <span className="text-xs opacity-90">A-Players</span>
        </Button>
        
        <Button
          variant={filterTier === "Acquaintance" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("Acquaintance")}
          className={`h-16 flex-col gap-1 transition-all duration-200 hover:scale-105 ${
            filterTier === "Acquaintance"
              ? "bg-tier-acquaintance text-white hover:bg-tier-acquaintance/90"
              : "border-tier-acquaintance/30 hover:border-tier-acquaintance hover:bg-tier-acquaintance/5"
          }`}
        >
          <span className="font-semibold text-lg">{contacts.filter(c => c.tier === "Acquaintance").length}</span>
          <span className="text-xs opacity-90">Acquaintances</span>
        </Button>
      </div>
    </div>
  );
};

export default ContactFilters;
