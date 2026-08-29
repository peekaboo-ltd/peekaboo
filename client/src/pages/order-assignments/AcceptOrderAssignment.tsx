import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { useAcceptOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setAcceptOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner';

const AcceptOrderAssignment = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();
    const { acceptOrderAssignmentModal, selectedOrderAssignment } = useAppSelector((state) => state.orderAssignment);

    // ACCEPT ORDER ASSIGNMENT
    const { acceptOrderAssignment, isLoading, isSuccess, reset } = useAcceptOrderAssignment();

    // CLOSE MODAL
    const closeModal = useCallback(() => {
        dispatch(setAcceptOrderAssignmentModal(false));
        dispatch(setSelectedOrderAssignment(undefined));
        reset();
    }, [dispatch, reset]);

    useEffect(() => {
        if (isSuccess) {
            if (selectedOrderAssignment?.id) {
                toast.success(`Assignment for ${selectedOrderAssignment?.order?.referenceId} accepted successfully`);
            }
            closeModal();
        }
    }, [isSuccess, closeModal, selectedOrderAssignment?.id, selectedOrderAssignment?.order?.referenceId]);

    return (
        <Modal heading={`Accept Assignment for ${selectedOrderAssignment?.order?.referenceId}`} headingClassName='text-green-700' isOpen={acceptOrderAssignmentModal} onClose={closeModal}>
            <article className='w-full flex flex-col gap-4'>
                <p className='text-sm'>
                    Are you sure you want to accept this assignment?
                </p>
                <Button className='self-end' approve onClick={(e) => {
                    e.preventDefault();
                    if (!selectedOrderAssignment?.id) return;
                    acceptOrderAssignment({ id: selectedOrderAssignment?.id });
                }} isLoading={isLoading}>
                    Accept
                </Button>
            </article>
        </Modal>
    )
}

export default AcceptOrderAssignment;
