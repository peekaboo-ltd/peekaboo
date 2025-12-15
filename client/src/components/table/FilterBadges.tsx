import React from 'react';

interface FilterBadgesProps {
  filters: Record<string, string>;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({ filters }) => {
  const activeFilters = Object.entries(filters).filter(
    ([_, value]) => value && value.trim() !== ''
  );

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
      {activeFilters.length > 0 ? (
        activeFilters.map(([key, value]) => (
          <span key={key} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
          </span>
        ))
      ) : (
        <span className="text-gray-500">No filters applied</span>
      )}
    </div>
  );
};
