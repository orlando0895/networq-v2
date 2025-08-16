import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/hooks/useContacts";
import { exportContactsToCSV, exportContactsToVCF } from "@/lib/contacts-export";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExportDataDialog = ({ open, onOpenChange }: ExportDataDialogProps) => {
  const { contacts } = useContacts();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [exporting, setExporting] = useState<'csv' | 'vcf' | null>(null);

  const handleExportCSV = async () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts to export",
        description: "Add some contacts first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setExporting('csv');
      exportContactsToCSV(contacts);
      toast({
        title: "Contacts exported successfully",
        description: `Exported ${contacts.length} contacts as CSV.`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportVCF = async () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts to export",
        description: "Add some contacts first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setExporting('vcf');
      exportContactsToVCF(contacts);
      toast({
        title: "Contacts exported successfully",
        description: `Exported ${contacts.length} contacts as vCard file.`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('VCF export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(null);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        Export your {contacts.length} contacts in your preferred format
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-between h-12"
          onClick={handleExportCSV}
          disabled={exporting === 'csv'}
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Export as CSV</div>
              <div className="text-xs text-muted-foreground">Spreadsheet format</div>
            </div>
          </div>
          {exporting === 'csv' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-between h-12"
          onClick={handleExportVCF}
          disabled={exporting === 'vcf'}
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Export as vCard</div>
              <div className="text-xs text-muted-foreground">Import to phone contacts</div>
            </div>
          </div>
          {exporting === 'vcf' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        vCard files can be imported to most phones by opening the file and tapping "Add All Contacts"
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Export Data</DrawerTitle>
            <DrawerDescription>
              Choose how you'd like to export your contacts
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose how you'd like to export your contacts
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};