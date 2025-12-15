import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContextSecure';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const { user, getUserRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

 

  const userRole = getUserRole();
  const displayName = user ? ((user as any).lastName ?? (user as any).email ?? 'Account') : null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200 transition-transform duration-300 ease-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
        
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Peekaboo</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <Link
                    to={(() => {
                      switch (userRole) {
                        case 'admin':
                          return '/admin';
                        case 'staff':
                          return '/staff/dashboard';
                        case 'rider':
                          return '/rider/dashboard';
                        case 'customer':
                        default:
                          return '/dashboard';
                      }
                    })()}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{displayName}</span>
                  </Link>
                  
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/', { replace: true });
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};