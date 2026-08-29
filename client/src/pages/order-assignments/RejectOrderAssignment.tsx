import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { useRejectOrderAssignment } from '@/hooks/orders/orderAssignments.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setRejectOrderAssignmentModal, setSelectedOrderAssignment } from '@/states/slices/orderAssignment.slice';
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n';

const RejectOrderAssignment = () => {
    const { t } = useI18n();

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
                toast.success(t('assignments.rejected', { reference: selectedOrderAssignment?.order?.referenceId || '—' }));
            }
            closeModal();
        }
    }, [isSuccess, closeModal, selectedOrderAssignment?.id, selectedOrderAssignment?.order?.referenceId, t]);

    return (
        <Modal heading={t('assignments.rejectTitle', { reference: selectedOrderAssignment?.order?.referenceId || '—' })} headingClassName='text-(--ink)' isOpen={rejectOrderAssignmentModal} onClose={closeModal}>
            <article className='w-full flex flex-col gap-4'>
                <p className='text-sm'>
                    {t('assignments.rejectConfirm')}
                </p>
                <Button danger primary className='self-end' onClick={(e) => {
                    e.preventDefault();
                    if (!selectedOrderAssignment?.id) return;
                    rejectOrderAssignment({ id: selectedOrderAssignment?.id });
                }} isLoading={isLoading}>
                    {t('assignments.reject')}
                </Button>
            </article>
        </Modal>
    )
}

export default RejectOrderAssignment;
