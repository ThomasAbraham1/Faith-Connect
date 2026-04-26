import React, { useState } from 'react';
import { Modal } from '@/components/dynamic/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface SendWhatsAppProps {
  trigger: React.ReactNode;
  phoneNumbers: string[];
  names?: string[];
  onSuccess?: () => void;
}

export const SendWhatsApp: React.FC<SendWhatsAppProps> = ({ 
  trigger, 
  phoneNumbers, 
  names = [],
  onSuccess 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Default values from user snippet
  const [contentSid, setContentSid] = useState('HXb5b62575e6e4ff6129ad7c8efe1f983e');
  const [var1, setVar1] = useState('12/1');
  const [var2, setVar2] = useState('3pm');

  const handleSend = async () => {
    if (phoneNumbers.length === 0) {
      toast.error('No recipients selected');
      return;
    }

    setIsSending(true);
    try {
      const contentVariables = JSON.stringify({ "1": var1, "2": var2 });
      
      const response = await axios.post('/api/whatsapp/send', {
        phones: phoneNumbers,
        contentSid,
        contentVariables
      });

      if (response.data.success || Array.isArray(response.data)) {
        setIsSuccess(true);
        toast.success(`Message sent to ${phoneNumbers.length} recipient(s)`);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        toast.error('Failed to send message: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('WhatsApp Error:', error);
      toast.error(error.response?.data?.message || 'Error connecting to server');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerButtonContent={trigger}
      triggerButtonVariant="ghost"
      modelTitle="Send WhatsApp Message"
      modelDescription="Send a templated WhatsApp message via Twilio."
    >
      <div className="space-y-6 py-4">
        {/* Recipients */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Recipients ({phoneNumbers.length})
          </Label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 border rounded-lg bg-muted/20">
            {phoneNumbers.length > 0 ? (
              phoneNumbers.map((phone, i) => (
                <Badge key={i} variant="secondary" className="font-medium text-[10px] py-0 px-2 h-5">
                  {names[i] ? `${names[i]} (${phone})` : phone}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">No recipients selected</span>
            )}
          </div>
        </div>

        {/* Template Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentSid">Template SID</Label>
            <Input 
              id="contentSid" 
              value={contentSid} 
              onChange={(e) => setContentSid(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="var1" className="text-muted-foreground">Variable {"{1}"} (Date)</Label>
              <Input 
                id="var1" 
                value={var1} 
                onChange={(e) => setVar1(e.target.value)}
                placeholder="e.g. 12/1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="var2" className="text-muted-foreground">Variable {"{2}"} (Time)</Label>
              <Input 
                id="var2" 
                value={var2} 
                onChange={(e) => setVar2(e.target.value)}
                placeholder="e.g. 3pm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || phoneNumbers.length === 0}
            className="min-w-[120px]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Sent!
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
