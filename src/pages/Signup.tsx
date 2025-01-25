import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await signup(username, email, password);
        navigate('/dashboard');
      } catch (err) {
        setError('Signup failed');
      }
    };
  
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign Up for ApplyMate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500">{error}</p>}
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Sign Up</Button>
              <p className="text-center">
                Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };