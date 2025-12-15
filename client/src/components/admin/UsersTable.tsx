import React, { useState } from 'react';
import { useFetchUsersQuery } from '../../api/queries/users.queries';
import { UserStatus } from '../../constants/user.constants';
import { RoleTypes } from '../../types/auth.type';
import { EditUserModal } from './EditUserModal';
import { TableSearchBar } from '../table/TableSearchBar';
import { FilterBadges } from '../table/FilterBadges';
import { StatusBadge } from '../table/StatusBadge';
import { FilterModal } from '../table/FilterModal';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  userRoles: Array<{ role: { name: string } }>;
}

export const UsersTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    createdFrom: '',
    createdTo: '',
    status: '',
    role: '',
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, error } = useFetchUsersQuery({
    page,
    limit: 10,
    search,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
    status: filters.status || undefined,
    roles: filters.role ? [filters.role as RoleTypes] : undefined,
  });

  // Handle the actual API response structure
  const users: User[] = data?.rows || data?.data || [];
  const totalPages = data?.totalPages || 0;

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const closeFilters = () => setIsFilterOpen(false);

  const applyFilters = () => {
    setFilters(draftFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    const cleared = { createdFrom: '', createdTo: '', status: '', role: '' };
    setFilters(cleared);
    setDraftFilters(cleared);
    setPage(1);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <TableSearchBar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onResetFilters={resetFilters}
            onOpenFilters={openFilters}
            placeholder="Search users (name, email, phone)..."
          />
          <FilterBadges filters={filters} />
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">Error loading users</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.phoneNumber}</td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge 
                          status={user.userRoles?.[0]?.role?.name || 'CUSTOMER'}
                          variant="info"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge 
                          status={user.status}
                          variant={user.status === 'ACTIVE' ? 'success' : 'danger'}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Page {page} of {totalPages || 1}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!data || page >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <EditUserModal user={selectedUser} onClose={handleModalClose} />
      )}

      <FilterModal
        isOpen={isFilterOpen}
        onClose={closeFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Created from</label>
              <input
                type="date"
                value={draftFilters.createdFrom}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, createdFrom: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Created to</label>
              <input
                type="date"
                value={draftFilters.createdTo}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, createdTo: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={draftFilters.status}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Any</option>
                {Object.values(UserStatus).map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={draftFilters.role}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Any</option>
                {Object.values(RoleTypes).map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FilterModal>
    </>
  );
};
