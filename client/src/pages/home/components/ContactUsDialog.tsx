import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ContactUsForm from './ContactUsForm';

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactUsDialog = ({ open, onOpenChange }: ContactUsDialogProps) => {
  const [formKey, setFormKey] = useState(0);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTimeout(() => {
        setFormKey((current) => current + 1);
      }, 200);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <ContactUsForm
          key={formKey}
          onSuccessAction={() => handleClose(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContactUsDialog;
