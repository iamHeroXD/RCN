import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { authService } from './services/storage';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout}><Home user={user} /></Layout> : <Navigate to="/login" />} />
        
        <Route path="/shop" element={user ? <Layout user={user} onLogout={handleLogout}><Shop user={user} onUpdateUser={handleUpdateUser} /></Layout> : <Navigate to="/login" />} />
        
        <Route path="/profile" element={user ? <Layout user={user} onLogout={handleLogout}><Profile user={user} onUpdateUser={handleUpdateUser} /></Layout> : <Navigate to="/login" />} />

        <Route path="/admin" element={user ? <Layout user={user} onLogout={handleLogout}><Admin user={user} /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;