
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
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

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className="flex-1 sm:flex-none transition-all duration-200 h-12 text-base bg-slate-900 text-white hover:bg-slate-800"
            >
              {filterIndustry === "all" ? `Industries (${industriesCount})` : filterIndustry}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white">
            <DropdownMenuItem onClick={() => onIndustryFilterChange("all")}>
              All Industries
            </DropdownMenuItem>
            {industries.length === 0 ? (
              <DropdownMenuItem disabled>
                No industries found
              </DropdownMenuItem>
            ) : (
              industries.map((industry) => (
                <DropdownMenuItem 
                  key={industry}
                  onClick={() => onIndustryFilterChange(industry)}
                >
                  {industry}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ContactStats;
