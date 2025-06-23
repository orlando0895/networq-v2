
import { Button } from "@/components/ui/button";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactStatsProps {
  contacts: Contact[];
}

const ContactStats = ({ contacts }: ContactStatsProps) => {
  const industriesCount = new Set(contacts.map(c => c.industry).filter(Boolean)).size;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          size="lg"
          disabled
          className="flex-1 sm:flex-none transition-all duration-200 h-12 text-base cursor-default bg-slate-900 text-white hover:bg-slate-900"
        >
          Industries ({industriesCount})
        </Button>
      </div>
    </div>
  );
};

export default ContactStats;
