import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { RidersTable } from '../../components/admin/RidersTable';
import { EditRiderModal } from '../../components/admin/EditRiderModal';
import { Rider } from '../../types/user.type';

export const AdminRidersPage: React.FC = () => {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditRider = (rider: Rider) => {
    setSelectedRider(rider);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRider(null);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Riders Management</h1>
          <p className="text-gray-600 mt-1">Manage all riders in the system</p>
        </div>

        <RidersTable onEdit={handleEditRider} />

        {isEditModalOpen && selectedRider && (
          <EditRiderModal rider={selectedRider} onClose={handleModalClose} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRidersPage;
