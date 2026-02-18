import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setImportBatchModal } from '@/states/slices/batch.slice';
import { useCallback } from 'react';

const ImportBatch = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { importBatchModal } = useAppSelector((state) => state.batch);

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setImportBatchModal(false));
  }, [dispatch]);

  return (
    <Modal
      isOpen={importBatchModal}
      onClose={closeModal}
      heading={`Import Batch Orders`}
      className="!max-w-[90vw] !w-[70vw]"
    >
      ImportBatch
    </Modal>
  );
};

export default ImportBatch;
