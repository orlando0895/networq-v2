
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactStatsProps {
  contacts: Contact[];
}

const ContactStats = ({ contacts }: ContactStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
      <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-600 mb-2">Total Contacts</p>
        <p className="text-3xl font-bold text-slate-900">{contacts.length}</p>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-600 mb-2">A-Players</p>
        <p className="text-3xl font-bold text-amber-600">{contacts.filter(c => c.tier === "A-player").length}</p>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
        <p className="text-sm font-medium text-slate-600 mb-2">Industries</p>
        <p className="text-3xl font-bold text-indigo-600">{new Set(contacts.map(c => c.industry).filter(Boolean)).size}</p>
      </div>
    </div>
  );
};

export default ContactStats;
