import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';

const AdminSettingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage application settings and preferences.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-gray-700">No settings available yet.</p>
          <p className="text-gray-500 text-sm mt-2">This page is ready for future configuration options.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
