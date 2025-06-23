
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactStatsProps {
  contacts: Contact[];
}

const ContactStats = ({ contacts }: ContactStatsProps) => {
  const industriesCount = new Set(contacts.map(c => c.industry).filter(Boolean)).size;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-600 mb-2">Industries</p>
        <p className="text-3xl font-bold text-slate-900">{industriesCount}</p>
      </div>
    </div>
  );
};

export default ContactStats;
