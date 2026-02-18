import { Batch } from '@/types/batch.type';
import { createSlice } from '@reduxjs/toolkit';

export interface BatchState {
  importBatchModal: boolean;
  deleteBatchModal: boolean;
  batch?: Batch;
  selectedBatch?: Batch;
}

const initialState: BatchState = {
  importBatchModal: false,
  deleteBatchModal: false,
  batch: undefined,
  selectedBatch: undefined,
};

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    setImportBatchModal: (state, action) => {
      state.importBatchModal = action.payload;
    },
    setSelectedBatch: (state, action) => {
      state.selectedBatch = action.payload;
    },
    setDeleteBatchModal: (state, action) => {
      state.deleteBatchModal = action.payload;
    },
    setBatch: (state, action) => {
      state.batch = action.payload;
    },
  },
});

export const {
  setImportBatchModal,
  setSelectedBatch,
  setDeleteBatchModal,
  setBatch,
} = batchSlice.actions;

export default batchSlice.reducer;
