import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log("2")
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/applications')}>Applications</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
    </div>
  );
};