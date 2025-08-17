
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Search, Filter } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterTier: "all" | "A-player" | "Acquaintance";
  onFilterChange: (tier: "all" | "A-player" | "Acquaintance") => void;
  contacts: Contact[];
  selectedMethods: string[];
  onMethodsChange: (methods: string[]) => void;
}

const ContactFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterTier, 
  onFilterChange, 
  contacts,
  selectedMethods,
  onMethodsChange
}: ContactFiltersProps) => {
  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 py-4 text-base border-border focus:border-primary focus:ring-primary transition-colors h-14 text-lg bg-gradient-accent/30 hover:bg-gradient-accent/50 focus:bg-background"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 flex-shrink-0 bg-gradient-accent/30 hover:bg-gradient-primary hover:text-primary-foreground transition-all duration-300"
              aria-label="Open filters"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 bg-popover border border-border shadow-md">
            <DropdownMenuItem onClick={() => onMethodsChange([])} inset>
              All connections
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('share_code')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'share_code'] 
                  : selectedMethods.filter(v => v !== 'share_code');
                onMethodsChange(next);
              }}
            >
              Share code
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('mutual_contact')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'mutual_contact'] 
                  : selectedMethods.filter(v => v !== 'mutual_contact');
                onMethodsChange(next);
              }}
            >
              Mutual add
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('qr')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'qr'] 
                  : selectedMethods.filter(v => v !== 'qr');
                onMethodsChange(next);
              }}
            >
              QR code scan
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('business_card')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'business_card'] 
                  : selectedMethods.filter(v => v !== 'business_card');
                onMethodsChange(next);
              }}
            >
              Business card scan
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('manual')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'manual'] 
                  : selectedMethods.filter(v => v !== 'manual');
                onMethodsChange(next);
              }}
            >
              Manual entry
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('vcf')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'vcf'] 
                  : selectedMethods.filter(v => v !== 'vcf');
                onMethodsChange(next);
              }}
            >
              Import vCard (VCF)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedMethods.includes('discovery')}
              onCheckedChange={(checked) => {
                const next = checked 
                  ? [...selectedMethods, 'discovery'] 
                  : selectedMethods.filter(v => v !== 'discovery');
                onMethodsChange(next);
              }}
              disabled
            >
              Discovery (Coming Soon)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={filterTier === "all" ? "default" : "secondary"}
          size="lg"
          onClick={() => onFilterChange("all")}
          className="flex-1 sm:flex-none transition-all duration-200 h-12 text-base font-semibold bg-[#0d172a] text-white hover:bg-[#0d172a]/90 hover:shadow-lg hover:-translate-y-0.5"
        >
          All ({contacts.length})
        </Button>
      </div>
    </div>
  );
};

export default ContactFilters;
