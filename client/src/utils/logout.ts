 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContextSecure';

 const { logout } = useAuth();
  const navigate = useNavigate();
   export const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };