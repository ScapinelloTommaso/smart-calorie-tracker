import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, dailyCalorieGoal: number, dailyProteinGoal: number, dailyCarbsGoal: number, dailyFatsGoal: number) => Promise<void>;
  logout: () => void;
  updateUser: (newData: any) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Boot-fetch: pull fresh profile data from API
      api.get('/user/profile')
        .then(({ data }) => {
          const freshUser = { ...JSON.parse(savedUser), ...data };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired or invalid – force logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { Username: username, Password: password });
    const { token, userId, username: loggedUsername } = response.data;
    localStorage.setItem('token', token);
    const userData = { id: userId, username: loggedUsername };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Immediately fetch full profile after login
    try {
      const { data } = await api.get('/user/profile');
      const fullUser = { ...userData, ...data };
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
    } catch { /* silent */ }
  };

  const register = async (username: string, password: string, dailyCalorieGoal: number, dailyProteinGoal: number, dailyCarbsGoal: number, dailyFatsGoal: number) => {
    await api.post('/auth/register', { 
      Username: username, 
      Password: password, 
      DailyCalorieGoal: Number(dailyCalorieGoal), 
      DailyProteinGoal: Number(dailyProteinGoal),
      DailyCarbsGoal: Number(dailyCarbsGoal),
      DailyFatsGoal: Number(dailyFatsGoal)
    });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data: any) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
