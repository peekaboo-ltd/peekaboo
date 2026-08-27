import { FC, MouseEvent, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: (e?: MouseEvent) => void;
  className?: string;
  mainClassName?: string;
  overlayClassName?: string;
  heading?: string | ReactNode;
  headingClassName?: string;
  description?: string;
  descriptionClassName?: string;
}

const JSX_MODAL: FC<ModalProps> = ({
  isOpen,
  children,
  onClose,
  heading = null,
  headingClassName = null,
  className = null,
  overlayClassName = null,
  description = null,
  descriptionClassName = null,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName={overlayClassName}
        className={`z-[9999] w-[92vw] max-w-[92vw] min-w-0 sm:w-auto sm:max-w-[80vw] sm:min-w-[420px] lg:max-w-[720px] lg:min-w-[520px] max-h-[85vh] sm:max-h-[80vh] ${className} flex flex-col overflow-hidden`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle
            className={`text-lg font-medium text-(--ink) mt-[-10px] ${
              headingClassName ?? ''
            }`}
          >
            {heading}
          </DialogTitle>
            <DialogDescription
              className={`text-sm text-(--muted) ${descriptionClassName ?? ''}`}
            >
              {description}
            </DialogDescription>
        </DialogHeader>
        <main className="flex-1 overflow-y-auto min-h-0">
          <section className="p-1">{children}</section>
        </main>
      </DialogContent>
    </Dialog>
  );
};

const Modal: FC<ModalProps> = (props) => {
  const modalContainer = document.querySelector('#modal');
  if (!modalContainer) {
    throw new Error('Modal container not found');
  }

  return ReactDOM.createPortal(<JSX_MODAL {...props} />, modalContainer);
};

export default Modal;
