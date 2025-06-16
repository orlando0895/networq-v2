
import { useState } from "react";
import { Network } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import ContactCard from "@/components/ContactCard";
import ContactForm from "@/components/ContactForm";
import ContactStats from "@/components/ContactStats";
import ContactFilters from "@/components/ContactFilters";
import EmptyState from "@/components/EmptyState";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  services: string[];
  tier: "A-player" | "Acquaintance";
  notes: string;
  addedDate: string;
}

const Index = () => {
  const { contacts, loading, addContact } = useContacts();
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

  const hasFilters = searchTerm || filterTier !== "all";

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
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-2">
                <Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Your personal referral engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <ContactFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterTier={filterTier}
          onFilterChange={setFilterTier}
          contacts={contacts}
        />

        <ContactStats contacts={contacts} />

        {/* Contacts Grid */}
        <div className="space-y-3 sm:space-y-4">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
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
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
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
