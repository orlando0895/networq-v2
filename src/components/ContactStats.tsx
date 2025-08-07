
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactStatsProps {
  contacts: Contact[];
  filterIndustry: string;
  onIndustryFilterChange: (industry: string) => void;
}

const ContactStats = ({ contacts, filterIndustry, onIndustryFilterChange }: ContactStatsProps) => {
  const industries = Array.from(
    new Set(contacts.map(c => c.industry).filter(Boolean))
  ).sort();
  const industriesCount = industries.length;

  const aPlayerCount = contacts.filter(c => c.tier === "A-player").length;
  const acquaintanceCount = contacts.filter(c => c.tier === "Acquaintance").length;

  return (
    <div className="space-y-6">
      {/* Network Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{contacts.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Contacts</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-tier-a-player/10 to-tier-a-player/5 rounded-xl p-4 border border-tier-a-player/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-tier-a-player fill-current" />
              <div className="text-2xl font-bold text-tier-a-player">{aPlayerCount}</div>
            </div>
            <div className="text-sm text-muted-foreground">A-Players</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-tier-acquaintance/10 to-tier-acquaintance/5 rounded-xl p-4 border border-tier-acquaintance/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-tier-acquaintance">{acquaintanceCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Acquaintances</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-xl p-4 border border-info/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-info">{industriesCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Industries</div>
          </div>
        </div>
      </div>

      {/* Industry Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <span className="text-sm font-medium text-muted-foreground">Filter by industry:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:scale-105 bg-background/50 backdrop-blur-sm"
            >
              {filterIndustry === "all" ? `All Industries (${industriesCount})` : filterIndustry}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
            <DropdownMenuItem onClick={() => onIndustryFilterChange("all")}>
              <div className="flex items-center justify-between w-full">
                <span>All Industries</span>
                <Badge variant="secondary" className="text-xs">{industriesCount}</Badge>
              </div>
            </DropdownMenuItem>
            {industries.length === 0 ? (
              <DropdownMenuItem disabled>
                No industries found
              </DropdownMenuItem>
            ) : (
              industries.map((industry) => {
                const count = contacts.filter(c => c.industry === industry).length;
                return (
                  <DropdownMenuItem 
                    key={industry}
                    onClick={() => onIndustryFilterChange(industry)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{industry}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ContactStats;
