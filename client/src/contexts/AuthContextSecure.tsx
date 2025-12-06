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

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        console.error('❌ Login failed:', errorData);
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      console.log('📦 Server response:', data);
      
      // Extract user from nested response structure
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Map server response fields to User interface
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: user.role || (user.userRoles && user.userRoles[0]) || 'customer',
        };
        console.log('✅ User data extracted:', mappedUser);
        return { success: true, user: mappedUser };
      } else {
        console.log('⚠️ No user data in response');
        return { success: false, error: 'No user data received from server' };
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async register(userData: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        console.error('❌ Registration failed:', errorData);
        return { success: false, error: errorData.message || 'Registration failed' };
      }
      const data = await response.json();
      console.log('📦 Registration response:', data);
      
      // Extract user from nested response structure
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Map server response fields to User interface
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: user.role || (user.userRoles && user.userRoles[0]) || 'customer',
        };
        console.log('✅ User data extracted from registration:', mappedUser);
        return { success: true, user: mappedUser };
      } else {
        console.log('⚠️ No user data in registration response');
        return { success: false, error: 'No user data received from server' };
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async checkAuth(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔍 Checking auth with /auth/me...');
      const response = await this.makeRequest('/auth/me', {
        method: 'GET',
      });

      console.log('📡 /auth/me response status:', response.status);

      if (!response.ok) {
        console.log('⚠️ Not authenticated, status:', response.status);
        return { success: false, error: 'Not authenticated' };
      }

      const data = await response.json();
      console.log('📦 Check auth response:', data);
      
      // Extract user from nested response structure
      let user = data.data?.user || data.user || data.data || data;
      
      if (user && user.id) {
        // Map server response fields to User interface
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          role: user.role || (user.userRoles && user.userRoles[0]) || 'customer',
        };
        console.log('✅ User session restored:', mappedUser);
        return { success: true, user: mappedUser };
      } else {
        console.log('⚠️ No user data in /auth/me response');
        return { success: false, error: 'No user data in response' };
      }
    } catch (error) {
      console.error('💥 Check auth error:', error);
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
      try {
        const result = await authManager.checkAuth();
        if (result.success && result.user) {
          console.log('✅ User session restored on app load');
          setUser(result.user);
        } else {
          console.log('ℹ️ No active session, user needs to login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
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
      console.log('✅ Login successful, setting user:', result.user);
      setUser(result.user);
      // Return user data for redirection logic
      setLoading(false);
      return { 
        success: true, 
        user: result.user, 
        role: result.user.role 
      };
    }
    
    console.log('❌ Login failed:', result.error);
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