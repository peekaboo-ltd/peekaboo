import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextSecure';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', path: '/staff/dashboard' },
  { label: 'Assignments', path: '/assignments' },
];

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <StaffSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <StaffNavbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  </div>
);

const StaffSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Peekaboo</h1>
        <p className="text-xs text-gray-500 mt-1">Staff Console</p>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const StaffNavbar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Operations</p>
          <h2 className="text-xl font-semibold text-gray-900">Staff Workspace</h2>
        </div>
        <button
          onClick={async () => {
            await logout();
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

export default StaffLayout;
