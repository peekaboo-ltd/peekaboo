import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { UserPlus, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import assignmentService from '../../services/assignment.service';
import type { OrderAssignment } from '../../types/orderAssignment.type';
import { AssignRiderModal } from './AssignRiderModal';

interface AssignmentSectionProps {
  orderId: string;
  onUpdate?: () => void;
}

const assignmentStatusConfig = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
};

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  orderId,
  onUpdate,
}) => {
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [orderId]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await assignmentService.getAssignmentsByOrder(orderId);
      setAssignments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignmentCreated = () => {
    fetchAssignments();
    onUpdate?.();
  };

  const currentAssignment = assignments.find(
    (a) => a.status === 'PENDING' || a.status === 'ACCEPTED'
  );

  const historicalAssignments = assignments.filter(
    (a) => a.status === 'REJECTED' || a.status === 'COMPLETED'
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assignment */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Current Assignment</CardTitle>
              <CardDescription>
                Active rider assignment for this order
              </CardDescription>
            </div>
            {!currentAssignment && (
              <Button onClick={() => setShowAssignModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Rider
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentAssignment ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rider</p>
                    <p className="font-medium">
                      {currentAssignment.rider?.name || 'Unknown Rider'}
                    </p>
                  </div>
                  {currentAssignment.rider?.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {currentAssignment.rider.phoneNumber}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge
                      className={assignmentStatusConfig[currentAssignment.status as keyof typeof assignmentStatusConfig]?.className}
                    >
                      {assignmentStatusConfig[currentAssignment.status as keyof typeof assignmentStatusConfig]?.label || currentAssignment.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                    <p className="text-sm">
                      {format(new Date(currentAssignment.createdAt), 'PPp')}
                    </p>
                  </div>
                  {currentAssignment.acceptedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                      <p className="text-sm">
                        {format(new Date(currentAssignment.acceptedAt), 'PPp')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignModal(true)}
                >
                  Reassign Rider
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No rider assigned to this order yet
              </p>
              <Button onClick={() => setShowAssignModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Rider
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment History */}
      {historicalAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment History</CardTitle>
            <CardDescription>
              Previous assignments for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Completed/Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {assignment.rider?.name || 'Unknown Rider'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={assignmentStatusConfig[assignment.status as keyof typeof assignmentStatusConfig]?.className}
                        variant="secondary"
                      >
                        {assignmentStatusConfig[assignment.status as keyof typeof assignmentStatusConfig]?.label || assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(assignment.createdAt), 'PP')}
                    </TableCell>
                    <TableCell>
                      {assignment.completedAt && 
                        format(new Date(assignment.completedAt), 'PP')}
                      {assignment.rejectedAt && 
                        format(new Date(assignment.rejectedAt), 'PP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assign Rider Modal */}
      <AssignRiderModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        orderId={orderId}
        onAssigned={handleAssignmentCreated}
      />
    </div>
  );
};