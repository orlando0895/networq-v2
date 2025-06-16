
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
    <div className="mb-6 sm:mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by name, service, or industry..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 py-3 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors h-12"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterTier === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
          className="transition-all duration-200 h-10"
        >
          All ({contacts.length})
        </Button>
        <Button
          variant={filterTier === "A-player" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("A-player")}
          className="transition-all duration-200 h-10"
        >
          <Star className="w-3 h-3 mr-1 fill-current" />
          A-Players ({contacts.filter(c => c.tier === "A-player").length})
        </Button>
        <Button
          variant={filterTier === "Acquaintance" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("Acquaintance")}
          className="transition-all duration-200 h-10"
        >
          Acquaintances ({contacts.filter(c => c.tier === "Acquaintance").length})
        </Button>
      </div>
    </div>
  );
};

export default ContactFilters;
