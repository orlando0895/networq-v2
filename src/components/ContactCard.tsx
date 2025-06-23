
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Users, Mail, Phone, UserPlus, Edit, Plus, ChevronDown, Trash2, MoreVertical } from "lucide-react";
import EditContactForm from "./EditContactForm";
import AddNoteForm from "./AddNoteForm";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

const ContactCard = ({ contact, onUpdateContact, onDeleteContact }: ContactCardProps) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleDelete = async () => {
    await onDeleteContact(contact.id);
  };

  return (
    <>
      <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
        <Accordion type="single" collapsible>
          <AccordionItem value={contact.id} className="border-none">
            <CardHeader className="pb-2 px-4 sm:px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight">{contact.name}</CardTitle>
                    <Badge 
                      className={`${
                        contact.tier === "A-player" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      } flex items-center gap-1 text-xs self-start`}
                    >
                      {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                      <span>{contact.tier}</span>
                    </Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-base font-medium text-slate-700">{contact.company}</p>
                    <p className="text-sm text-slate-500">{contact.industry}</p>
                  </div>
                  
                  {/* Contact info - show on mobile */}
                  <div className="block sm:hidden space-y-2 mb-3">
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
                  </div>
                </div>

                {/* Mobile actions menu */}
                <div className="flex items-center gap-2 sm:hidden">
                  <Button size="sm" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Refer
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border">
                      <DropdownMenuItem onClick={() => setIsEditingContact(true)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAddingNote(true)} className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:text-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Contact
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {contact.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop accordion trigger */}
                <AccordionTrigger className="hover:no-underline p-2 ml-2 hidden sm:flex">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </AccordionTrigger>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {contact.services?.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                    {service}
                  </Badge>
                ))}
                {contact.services && contact.services.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-600">
                    +{contact.services.length - 3}
                  </Badge>
                )}
              </div>

              {/* Mobile "View Details" button */}
              <div className="block sm:hidden mt-3">
                <AccordionTrigger className="hover:no-underline p-0 w-full">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    View Details
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </AccordionTrigger>
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4">
                <div className="space-y-4">
                  {/* Desktop contact info */}
                  <div className="hidden sm:block space-y-3">
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
                  </div>

                  {contact.notes && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                  
                  {/* Desktop action buttons */}
                  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-2">
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10"
                      onClick={() => setIsAddingNote(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="justify-center h-10 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {contact.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

      <AddNoteForm
        contact={contact}
        isOpen={isAddingNote}
        onOpenChange={setIsAddingNote}
        onUpdateContact={onUpdateContact}
      />
    </>
  );
};

export default ContactCard;
