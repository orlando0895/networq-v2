import { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useUserContactCard } from "@/hooks/useUserContactCard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContactCard from "@/components/ContactCard";
import ContactForm from "@/components/ContactForm";
import ContactStats from "@/components/ContactStats";
import ContactFilters from "@/components/ContactFilters";
import EmptyState from "@/components/EmptyState";
import { MobileLayout, PageHeader } from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";
import { generateVCF } from "@/lib/vcf";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const Index = () => {
  const {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: refetchContacts
  } = useContacts();
  const {
    fetchContactCardByShareCode
  } = useUserContactCard();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filterTier, setFilterTier] = useState<"all" | "A-player" | "Acquaintance">("all");
  const [filterIndustry, setFilterIndustry] = useState("all");

  // Check URL for share code on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('add');
    if (shareCode) {
      handleShareCodeFromUrl(shareCode);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const handleShareCodeFromUrl = async (shareCode: string) => {
    const result = await fetchContactCardByShareCode(shareCode);
    if (result.success && result.data) {
      const cardData = result.data;
      const addResult = await addContact({
        name: cardData.name,
        email: cardData.email,
        phone: cardData.phone || undefined,
        company: cardData.company || undefined,
        industry: cardData.industry || undefined,
        services: cardData.services || [],
        tier: 'Acquaintance',
        notes: cardData.notes || undefined,
        linkedin: cardData.linkedin || undefined,
        facebook: cardData.facebook || undefined,
        whatsapp: cardData.whatsapp || undefined,
        websites: cardData.websites || [],
        shareCode: shareCode // Pass the share code for mutual connection
      });
      if (addResult.success) {
        toast({
          title: "Contact Added! 🎉",
          description: `${cardData.name} has been added from the shared link.`
        });
      }
    } else {
      toast({
        title: "Invalid Link",
        description: "The shared contact link is invalid or expired.",
        variant: "destructive"
      });
    }
  };

  // Export contacts functionality
  const handleExportContacts = () => {
    if (filteredContacts.length === 0) {
      toast({
        title: "No contacts to export",
        description: "Add some contacts first or adjust your filters.",
        variant: "destructive"
      });
      return;
    }

    try {
      const vcfContent = filteredContacts
        .map(contact => generateVCF(contact))
        .join('\n\n');
      
      const blob = new Blob([vcfContent], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `networq-contacts-${new Date().toISOString().split('T')[0]}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Contacts exported successfully",
        description: `Exported ${filteredContacts.length} contacts to VCF file.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportFilteredAsCSV = () => {
    if (filteredContacts.length === 0) {
      toast({
        title: "No contacts to export",
        description: "Add some contacts first or adjust your filters.",
        variant: "destructive"
      });
      return;
    }

    try {
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Industry', 'Tier', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...filteredContacts.map(contact => [
          `"${contact.name || ''}"`,
          `"${contact.email || ''}"`,
          `"${contact.phone || ''}"`,
          `"${contact.company || ''}"`,
          `"${contact.industry || ''}"`,
          `"${contact.tier || ''}"`,
          `"${(contact.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `networq-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Contacts exported successfully",
        description: `Exported ${filteredContacts.length} contacts to CSV file.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.industry?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = filterTier === "all" || contact.tier === filterTier;
    const matchesIndustry = filterIndustry === "all" || contact.industry === filterIndustry;
    
    return matchesSearch && matchesTier && matchesIndustry;
  });

  const hasFilters = searchTerm !== "" || filterTier !== "all" || filterIndustry !== "all";

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }
  return (
    <MobileLayout
      header={
        <PageHeader
          title="Connections"
          subtitle={`${contacts.length} contacts in your network`}
          action={
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="touch-target">
                    <Download className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportContacts}>
                    Export as VCF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportFilteredAsCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="touch-target" onClick={() => setIsAddingContact(true)}>
                <Plus className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Add</span>
              </Button>
            </div>
          }
        />
      }
    >
      <div className="space-y-4">
        {/* Quick Stats */}
        {contacts.length > 0 && (
          <ContactStats 
            contacts={contacts} 
            filterIndustry={filterIndustry}
            onIndustryFilterChange={setFilterIndustry}
          />
        )}

        {/* Search and Filters */}
        <ContactFilters 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          filterTier={filterTier} 
          onFilterChange={setFilterTier} 
          contacts={contacts} 
        />

        {/* Contact Cards */}
        <div className="space-y-3">
          {filteredContacts.map(contact => (
            <ContactCard 
              key={contact.id} 
              contact={contact} 
              onUpdateContact={updateContact} 
              onDeleteContact={deleteContact}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredContacts.length === 0 && (
          <EmptyState 
            hasFilters={hasFilters} 
            onAddContact={() => setIsAddingContact(true)} 
          />
        )}

        {/* Results Summary */}
        {contacts.length > 0 && filteredContacts.length !== contacts.length && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredContacts.length} of {contacts.length} contacts
              {hasFilters && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ml-2 p-0 h-auto"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterTier('all');
                    setFilterIndustry('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </p>
          </div>
        )}
      </div>

      <ContactForm 
        isOpen={isAddingContact} 
        onOpenChange={setIsAddingContact} 
        onAddContact={addContact}
      />
    </MobileLayout>
  );
};

export default Index;
