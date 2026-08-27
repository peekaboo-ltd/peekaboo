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

const DeleteOrder = () => {
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
        toast.success(
          `Order ${selectedOrder?.referenceId} deleted successfully`,
        );
      }
      closeModal();
    }
  }, [isSuccess, closeModal, selectedOrder?.id, selectedOrder?.referenceId]);

  return (
    <Modal
      isOpen={deleteOrderModal}
      onClose={closeModal}
      heading={`Delete ${selectedOrder?.referenceId || 'order'}?`}
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
          Delete order
        </Button>
      </article>
    </Modal>
  );
};

export default DeleteOrder;
