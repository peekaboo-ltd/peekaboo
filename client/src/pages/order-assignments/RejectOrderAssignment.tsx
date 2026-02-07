import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { useRejectOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setRejectOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner';

const RejectOrderAssignment = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();
    const { rejectOrderAssignmentModal, selectedOrderAssignment } = useAppSelector((state) => state.orderAssignment);

    // REJECT ORDER ASSIGNMENT
    const { rejectOrderAssignment, isLoading, isSuccess, reset } = useRejectOrderAssignment();

    // CLOSE MODAL
    const closeModal = useCallback(() => {
        dispatch(setRejectOrderAssignmentModal(false));
        dispatch(setSelectedOrderAssignment(undefined));
        reset();
    }, [dispatch, reset]);

    useEffect(() => {
        if (isSuccess) {
            if (selectedOrderAssignment?.id) {
                toast.success(`Assignment for ${selectedOrderAssignment?.order?.referenceId} rejected successfully`);
            }
            closeModal();
        }
    }, [isSuccess, closeModal, selectedOrderAssignment?.id, selectedOrderAssignment?.order?.referenceId]);

    return (
        <Modal heading={`Reject Assignment for ${selectedOrderAssignment?.order?.referenceId}`} headingClassName='text-black' isOpen={rejectOrderAssignmentModal} onClose={closeModal}>
            <article className='w-full flex flex-col gap-4'>
                <p className='text-[14px]'>
                    Are you sure you want to reject this assignment?
                </p>
                <Button className='self-end' danger onClick={(e) => {
                    e.preventDefault();
                    if (!selectedOrderAssignment?.id) return;
                    rejectOrderAssignment({ id: selectedOrderAssignment?.id });
                }} isLoading={isLoading}>
                    Reject
                </Button>
            </article>
        </Modal>
    )
}

export default RejectOrderAssignment;
