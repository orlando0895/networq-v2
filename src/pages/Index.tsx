
import { useState } from "react";
import { Network } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import ContactCard from "@/components/ContactCard";
import ContactForm from "@/components/ContactForm";
import ContactStats from "@/components/ContactStats";
import ContactFilters from "@/components/ContactFilters";
import EmptyState from "@/components/EmptyState";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const Index = () => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filterTier, setFilterTier] = useState<"all" | "A-player" | "Acquaintance">("all");

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = filterTier === "all" || contact.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const hasFilters = searchTerm !== "" || filterTier !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-2.5">
                <Network className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Your personal referral engine</p>
              </div>
            </div>
            <div className="flex items-center">
              <ContactForm 
                isOpen={isAddingContact}
                onOpenChange={setIsAddingContact}
                onAddContact={addContact}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <ContactFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterTier={filterTier}
          onFilterChange={setFilterTier}
          contacts={contacts}
        />

        <ContactStats contacts={contacts} />

        {/* Contacts List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredContacts.map((contact) => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              onUpdateContact={updateContact}
              onDeleteContact={deleteContact}
            />
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <EmptyState 
            hasFilters={hasFilters}
            onAddContact={() => setIsAddingContact(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              <span className="font-semibold">Networq</span> - Turn every introduction into a referral opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
