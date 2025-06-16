
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactStatsProps {
  contacts: Contact[];
}

const ContactStats = ({ contacts }: ContactStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">{contacts.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">A-Players</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">{contacts.filter(c => c.tier === "A-player").length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Industries</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">{new Set(contacts.map(c => c.industry).filter(Boolean)).size}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactStats;
