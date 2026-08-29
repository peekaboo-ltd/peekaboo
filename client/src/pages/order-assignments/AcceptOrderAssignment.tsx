import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { useAcceptOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setAcceptOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n';

const AcceptOrderAssignment = () => {
    const { t } = useI18n();

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
                toast.success(t('assignments.accepted', { reference: selectedOrderAssignment?.order?.referenceId || '—' }));
            }
            closeModal();
        }
    }, [isSuccess, closeModal, selectedOrderAssignment?.id, selectedOrderAssignment?.order?.referenceId, t]);

    return (
        <Modal heading={t('assignments.acceptTitle', { reference: selectedOrderAssignment?.order?.referenceId || '—' })} headingClassName='text-green-700' isOpen={acceptOrderAssignmentModal} onClose={closeModal}>
            <article className='w-full flex flex-col gap-4'>
                <p className='text-sm'>
                    {t('assignments.acceptConfirm')}
                </p>
                <Button className='self-end' approve onClick={(e) => {
                    e.preventDefault();
                    if (!selectedOrderAssignment?.id) return;
                    acceptOrderAssignment({ id: selectedOrderAssignment?.id });
                }} isLoading={isLoading}>
                    {t('assignments.accept')}
                </Button>
            </article>
        </Modal>
    )
}

export default AcceptOrderAssignment;
