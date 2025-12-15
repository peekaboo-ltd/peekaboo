import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; role?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getUserRole: () => string | undefined;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Manager
class AuthManager {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include HTTP-only cookies with every request
      ...options,
    };
    return fetch(url, config);
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Extract role from userRoles array (first role) or direct role field
        let userRole = user.role;
        if (!userRole && user.userRoles && Array.isArray(user.userRoles) && user.userRoles.length > 0) {
          userRole = user.userRoles[0]?.role?.name || 'customer';
        }
        
        // Normalize role to lowercase for consistency
        userRole = (userRole || 'customer').toLowerCase();
        
        // Map server response fields to User interface
        const mappedUser: User = {
          id: user.id,
          email: user.username || user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: userRole,
        };
        return { success: true, user: mappedUser };
      } else {
        return { success: false, error: 'No user data received from server' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async register(userData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Transform frontend payload to match backend expectations
      const backendPayload = {
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        phoneNumber: userData.phone, // Map 'phone' to 'phoneNumber'
        password: userData.password,
        roles: userData.role ? [userData.role.toUpperCase()] : ['CUSTOMER'], // Transform to uppercase array
      };
      
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(backendPayload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        return { success: false, error: errorData.message || 'Registration failed' };
      }
      const data = await response.json();
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Extract role from userRoles array (first role) or direct role field
        let userRole = user.role;
        if (!userRole && user.userRoles && Array.isArray(user.userRoles) && user.userRoles.length > 0) {
          userRole = user.userRoles[0]?.role?.name || 'customer';
        }
        
        // Normalize role to lowercase for consistency
        userRole = (userRole || 'customer').toLowerCase();
        
        // Map server response fields to User interface
        const mappedUser: User = {
          id: user.id,
          email: user.email || user.username,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: userRole,
        };
        return { success: true, user: mappedUser };
      } else {
        return { success: false, error: 'No user data received from server' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async checkAuth(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest('/auth/me', {
        method: 'GET',
      });

      if (!response.ok) {
        return { success: false, error: 'Not authenticated' };
      }

      const data = await response.json();
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Extract role from userRoles array (first role) or direct role field
        let userRole = user.role;
        if (!userRole && user.userRoles && Array.isArray(user.userRoles) && user.userRoles.length > 0) {
          userRole = user.userRoles[0]?.role?.name || 'customer';
        }
        
        // Normalize role to lowercase for consistency
        userRole = (userRole || 'customer').toLowerCase();
        
        const mappedUser: User = {
          id: user.id,
          email: user.email || user.username,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: userRole,
        };
        return { success: true, user: mappedUser };
      } else {
        return { success: false, error: 'No user data in response' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }
 
}

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authManager = new AuthManager();

  // Initialize auth state on mount - check if user is already authenticated
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const result = await authManager.checkAuth();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; role?: string }> => {
    setLoading(true);
    
    const result = await authManager.login(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      // Return user data for redirection logic
      setLoading(false);
      return { 
        success: true, 
        user: result.user, 
        role: result.user.role 
      };
    }
    
    setLoading(false);
    return { success: result.success, error: result.error };
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    const result = await authManager.register(userData);
    
    if (result.success && result.user) {
      setUser(result.user);
    }
    
    setLoading(false);
    return { success: result.success, error: result.error };
  };

  const logout = async (): Promise<void> => {
    setUser(null);
  };



  const getUserRole = (): string | undefined => {
    return user?.role;
  };


  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;