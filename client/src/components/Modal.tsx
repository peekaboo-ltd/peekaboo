import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] h-[90vh]',
};

const Modal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], className)}
        aria-describedby={description ? undefined : 'modal-content'}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle asChild>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <section id="modal-content" className="mt-4">
          {children}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;