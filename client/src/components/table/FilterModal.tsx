import React, { ReactNode } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-4">
          {children}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear all
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
