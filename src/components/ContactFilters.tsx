
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 py-4 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors h-14 text-lg"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={filterTier === "all" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("all")}
          className="flex-1 sm:flex-none transition-all duration-200 h-12 text-base"
        >
          All ({contacts.length})
        </Button>
        <Button
          variant={filterTier === "Acquaintance" ? "default" : "outline"}
          size="lg"
          onClick={() => onFilterChange("Acquaintance")}
          className="flex-1 sm:flex-none transition-all duration-200 h-12 text-base"
        >
          Acquaintances ({contacts.filter(c => c.tier === "Acquaintance").length})
        </Button>
      </div>
    </div>
  );
};

export default ContactFilters;
