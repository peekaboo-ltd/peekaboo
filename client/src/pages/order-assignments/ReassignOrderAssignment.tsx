import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setReassignOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback } from 'react'

const ReassignOrderAssignment = () => {

    // STATE VARIABLES
    const dispatch = useAppDispatch();
    const { reassignOrderAssignmentModal, selectedOrderAssignment } = useAppSelector((state) => state.orderAssignment);

    // CLOSE MODAL
    const closeModal = useCallback(() => {
        dispatch(setReassignOrderAssignmentModal(false));
        dispatch(setSelectedOrderAssignment(undefined));
    }, [dispatch]);

    return (
        <Modal isOpen={reassignOrderAssignmentModal} onClose={closeModal}>{JSON.stringify(selectedOrderAssignment, null, 2)}</Modal>
    )
}

export default ReassignOrderAssignment;
