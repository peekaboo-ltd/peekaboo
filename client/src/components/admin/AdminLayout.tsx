import React from 'react';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AdminSidebar: React.FC = () => {
  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Riders', path: '/admin/riders' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Peekaboo</h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="block px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const AdminNavbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
