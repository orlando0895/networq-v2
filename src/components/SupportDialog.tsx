import { Mail, MessageCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    question: "How do I add contacts to my network?",
    answer: "You can add contacts by scanning their QR code, entering their share code, or manually creating a contact. Go to the Connections tab and tap the '+' button to get started."
  },
  {
    question: "How do I share my contact information?",
    answer: "Go to your Profile tab and tap 'Share My Card' to generate a QR code or get your unique share code. Others can scan the QR code or enter your share code to add you to their network."
  },
  {
    question: "Can I export my contacts?",
    answer: "Yes! Go to Profile > Account Actions > Export Data to download your contacts as CSV or vCard (.vcf) files that can be imported to your phone's contacts app."
  },
  {
    question: "How do I organize my contacts?",
    answer: "You can categorize contacts as 'A-player' or 'Acquaintance', add notes, and filter by company, industry, or connection method to stay organized."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all your data is encrypted and stored securely. You can delete your account and all associated data at any time from Profile > Account Actions > Danger Zone."
  }
];

export const SupportDialog = ({ open, onOpenChange }: SupportDialogProps) => {
  const isMobile = useIsMobile();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleContactSupport = () => {
    window.open('mailto:support@networq.app?subject=Networq Support Request&body=Hi, I need help with:', '_blank');
  };

  const handleFeatureRequest = () => {
    window.open('mailto:support@networq.app?subject=Networq Feature Request&body=Hi, I have a feature request:', '_blank');
  };

  const content = (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-12"
          onClick={handleContactSupport}
        >
          <Mail className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Contact Support</div>
            <div className="text-xs text-muted-foreground">Get help with any issues</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start h-12"
          onClick={handleFeatureRequest}
        >
          <Lightbulb className="h-5 w-5 mr-3" />
          <div className="text-left">
            <div className="font-medium">Feature Request</div>
            <div className="text-xs text-muted-foreground">Suggest new features or improvements</div>
          </div>
        </Button>
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-medium">Frequently Asked Questions</h3>
        </div>
        
        {faqs.map((faq, index) => (
          <Card key={index}>
            <Collapsible 
              open={expandedFaq === index} 
              onOpenChange={(open) => setExpandedFaq(open ? index : null)}
            >
              <CollapsibleTrigger asChild>
                <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Can't find what you're looking for? Contact support and we'll help you out!
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Support & Help</DrawerTitle>
            <DrawerDescription>
              Get help and find answers to common questions
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Support & Help</DialogTitle>
          <DialogDescription>
            Get help and find answers to common questions
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};