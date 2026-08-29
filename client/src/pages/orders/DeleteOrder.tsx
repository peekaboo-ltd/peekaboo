import Button from '@/components/inputs/Button';
import Modal from '@/components/Modal';
import { useDeleteOrder } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setDeleteOrderModal,
  setSelectedOrder,
} from '@/states/slices/order.slice';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/i18n';

const DeleteOrder = () => {
  const { t } = useI18n();
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { deleteOrderModal, selectedOrder } = useAppSelector(
    (state) => state.order,
  );

  // DELETE ORDER
  const {
    deleteOrder,
    reset: deleteOrderReset,
    isLoading,
    isSuccess,
  } = useDeleteOrder();

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setDeleteOrderModal(false));
    dispatch(setSelectedOrder(undefined));
    deleteOrderReset();
  }, [deleteOrderReset, dispatch]);

  useEffect(() => {
    if (isSuccess) {
      if (selectedOrder?.id && selectedOrder?.referenceId) {
        toast.success(t('orders.deleted', { reference: selectedOrder.referenceId }));
      }
      closeModal();
    }
  }, [isSuccess, closeModal, selectedOrder?.id, selectedOrder?.referenceId, t]);

  return (
    <Modal
      isOpen={deleteOrderModal}
      onClose={closeModal}
      heading={t('orders.deleteTitle', {
        reference: selectedOrder?.referenceId || t('orders.orderFallback'),
      })}
      headingClassName="text-(--destructive)"
    >
      <article className="w-full flex flex-col gap-4">
        <Button
          danger
          onClick={(e) => {
            e.preventDefault();
            if (selectedOrder?.id) {
              deleteOrder(selectedOrder.id);
            }
          }}
          isLoading={isLoading}
          className="self-end"
        >
          {t('orders.delete')}
        </Button>
      </article>
    </Modal>
  );
};

export default DeleteOrder;
