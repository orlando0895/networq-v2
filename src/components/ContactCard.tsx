
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Users, Mail, Phone, UserPlus, Edit, Plus, ChevronDown } from "lucide-react";
import EditContactForm from "./EditContactForm";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
}

const ContactCard = ({ contact, onUpdateContact }: ContactCardProps) => {
  const [isEditingContact, setIsEditingContact] = useState(false);

  return (
    <>
      <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
        <Accordion type="single" collapsible>
          <AccordionItem value={contact.id} className="border-none">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">{contact.name}</CardTitle>
                    <Badge 
                      className={`${
                        contact.tier === "A-player" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      } flex items-center gap-1 text-xs`}
                    >
                      {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                      <span className="hidden sm:inline">{contact.tier}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1 truncate">{contact.company}</p>
                  <p className="text-sm text-slate-500 truncate">{contact.industry}</p>
                </div>
                <AccordionTrigger className="hover:no-underline p-2 ml-2">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </AccordionTrigger>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {contact.services?.slice(0, 2).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                    {service}
                  </Badge>
                ))}
                {contact.services && contact.services.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-600">
                    +{contact.services.length - 2}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-0 px-4 sm:px-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 break-all">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{contact.phone}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Notes</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{contact.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button size="sm" className="justify-center h-10">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Refer
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10"
                      onClick={() => setIsEditingContact(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="justify-center h-10">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <EditContactForm
        contact={contact}
        isOpen={isEditingContact}
        onOpenChange={setIsEditingContact}
        onUpdateContact={onUpdateContact}
      />
    </>
  );
};

export default ContactCard;
