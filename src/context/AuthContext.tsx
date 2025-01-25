import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('auth/login', { username, password });
      console.log(response)
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // navigate("/login")
    delete axios.defaults.headers.common['Authorization'];
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const res = await axios.post('auth/signup', { username, email, password });
      console.log(email)
      console.log(res)
    //   await login(username, password);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};