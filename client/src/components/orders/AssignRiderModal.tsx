import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import assignmentService from '../../services/assignment.service';
import type { User } from '../../types/user.type';
import { Phone, User as UserIcon } from 'lucide-react';

interface AssignRiderModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onAssigned: () => void;
}

export const AssignRiderModal: React.FC<AssignRiderModalProps> = ({
  open,
  onClose,
  orderId,
  onAssigned,
}) => {
  const [riders, setRiders] = useState<User[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableRiders();
    }
  }, [open]);

  const fetchAvailableRiders = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentService.getAvailableRiders();
      setRiders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch available riders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRiderId) {
      toast.error('Please select a rider');
      return;
    }

    setIsSubmitting(true);
    try {
      await assignmentService.createAssignment({
        orderId,
        riderId: selectedRiderId,
        notes,
      });
      toast.success('Rider assigned successfully');
      onAssigned();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRiderId('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Rider</DialogTitle>
          <DialogDescription>
            Select an available rider to assign to this order
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="rider">Select Rider</Label>
                <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                  <SelectTrigger id="rider">
                    <SelectValue placeholder="Choose a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {riders.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No available riders found
                      </div>
                    ) : (
                      riders.map((rider) => (
                        <SelectItem key={rider.id} value={rider.id}>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{rider.name || 'Unnamed Rider'}</span>
                            {rider.phoneNumber && (
                              <span className="text-xs text-muted-foreground">
                                ({rider.phoneNumber})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or notes for the rider..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {selectedRiderId && (
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm font-medium">Selected Rider Details</p>
                  {(() => {
                    const rider = riders.find(r => r.id === selectedRiderId);
                    return rider ? (
                      <div className="text-sm text-muted-foreground">
                        <p>{rider.name || 'Unnamed Rider'}</p>
                        {rider.phoneNumber && (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {rider.phoneNumber}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting || !selectedRiderId}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Rider'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};