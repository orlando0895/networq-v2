
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
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
    <div className="mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 sm:pl-12 py-3 sm:py-4 text-sm sm:text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors h-12 sm:h-14"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          variant={filterTier === "all" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("all")}
          className="flex-1 sm:flex-none transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base"
        >
          All ({contacts.length})
        </Button>
        <Button
          variant={filterTier === "A-player" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("A-player")}
          className="flex-1 sm:flex-none transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base"
        >
          <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 fill-current" />
          <span className="hidden sm:inline">A-Players</span>
          <span className="sm:hidden">A-Play</span>
          <span className="ml-1">({contacts.filter(c => c.tier === "A-player").length})</span>
        </Button>
        <Button
          variant={filterTier === "Acquaintance" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("Acquaintance")}
          className="flex-1 sm:flex-none transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Acquaintances</span>
          <span className="sm:hidden">Acq</span>
          <span className="ml-1">({contacts.filter(c => c.tier === "Acquaintance").length})</span>
        </Button>
      </div>
    </div>
  );
};

export default ContactFilters;
