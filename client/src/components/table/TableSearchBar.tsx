import React from 'react';

interface TableSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onOpenFilters: () => void;
  placeholder?: string;
}

export const TableSearchBar: React.FC<TableSearchBarProps> = ({
  searchValue,
  onSearchChange,
  onResetFilters,
  onOpenFilters,
  placeholder = 'Search...',
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="px-3 py-2 text-sm border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onOpenFilters}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Filter
        </button>
      </div>
    </div>
  );
};
