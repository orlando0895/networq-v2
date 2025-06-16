
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StickyNote } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface AddNoteFormProps {
  contact: Contact;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
}

const AddNoteForm = ({ contact, isOpen, onOpenChange, onUpdateContact }: AddNoteFormProps) => {
  const [note, setNote] = useState("");

  const handleAddNote = async () => {
    if (!note.trim()) return;

    const existingNotes = contact.notes || "";
    const newNote = existingNotes 
      ? `${existingNotes}\n\n${new Date().toLocaleDateString()}: ${note.trim()}`
      : `${new Date().toLocaleDateString()}: ${note.trim()}`;

    const result = await onUpdateContact(contact.id, {
      notes: newNote
    });

    if (result?.success) {
      setNote("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Add Note for {contact.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick note about this contact..."
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="flex-1" disabled={!note.trim()}>
              Add Note
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteForm;
