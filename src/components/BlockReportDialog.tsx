import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Shield, Flag, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  full_name: string;
  email: string;
}

interface BlockReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: Participant;
  conversationId: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted messages' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'fake_profile', label: 'Fake or impersonation account' },
  { value: 'threats', label: 'Threats or violence' },
  { value: 'other', label: 'Other' }
];

export function BlockReportDialog({ 
  open, 
  onOpenChange, 
  targetUser, 
  conversationId 
}: BlockReportDialogProps) {
  const { toast } = useToast();
  const [action, setAction] = useState<'block' | 'report' | 'both'>('block');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlockUser = async () => {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: (await supabase.auth.getUser()).data.user?.id,
          blocked_id: targetUser.id
        });

      if (error) throw error;

      toast({
        title: "User blocked",
        description: `${targetUser.full_name || targetUser.email} has been blocked.`
      });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleReportUser = async () => {
    if (!reportReason) {
      toast({
        title: "Missing information",
        description: "Please select a reason for reporting.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: (await supabase.auth.getUser()).data.user?.id,
          reported_id: targetUser.id,
          reason: reportReason,
          description: reportDescription.trim() || null,
          conversation_id: conversationId
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. We'll review this case."
      });
    } catch (error: any) {
      console.error('Error reporting user:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (action === 'block' || action === 'both') {
        await handleBlockUser();
      }
      
      if (action === 'report' || action === 'both') {
        await handleReportUser();
      }

      // Close dialog on success
      onOpenChange(false);
      
      // Reset form
      setAction('block');
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      // Error handling is done in individual functions
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form
      setAction('block');
      setReportReason('');
      setReportDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Block or Report User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Taking action against:</p>
            <p className="font-semibold">{targetUser.full_name || 'Unknown User'}</p>
            <p className="text-sm text-muted-foreground">{targetUser.email}</p>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What would you like to do?</Label>
            <RadioGroup value={action} onValueChange={(value: 'block' | 'report' | 'both') => setAction(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="block" />
                <Label htmlFor="block" className="flex items-center space-x-2 cursor-pointer">
                  <Shield className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Block this user</p>
                    <p className="text-xs text-muted-foreground">They won't be able to message you</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="report" id="report" />
                <Label htmlFor="report" className="flex items-center space-x-2 cursor-pointer">
                  <Flag className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Report this user</p>
                    <p className="text-xs text-muted-foreground">Report for review by our team</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center space-x-2 cursor-pointer">
                  <div className="flex space-x-1">
                    <Shield className="h-4 w-4" />
                    <Flag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Block and report</p>
                    <p className="text-xs text-muted-foreground">Block user and submit a report</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Report Details */}
          {(action === 'report' || action === 'both') && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Reason for reporting *</Label>
                  <RadioGroup value={reportReason} onValueChange={setReportReason}>
                    {REPORT_REASONS.map((reason) => (
                      <div key={reason.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={reason.value} id={reason.value} />
                        <Label htmlFor={reason.value} className="text-sm cursor-pointer">
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Additional details (optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide any additional context that might help us review this case..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This action cannot be easily undone. Make sure you want to proceed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}