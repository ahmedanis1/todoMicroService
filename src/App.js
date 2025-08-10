import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { message } from 'antd';
import AppLayout from './components/Layout/AppLayout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/Home/HomePage';
import TodoDetailPage from './pages/TodoDetail/TodoDetailPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    message.success('Login successful!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    message.info('Logged out successfully');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <Routes>
        <Route
            path="/auth"
            element={
              isAuthenticated ?
                  <Navigate to="/home" replace /> :
                  <AuthPage onLogin={handleLogin} />
            }
        />

        <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AppLayout onLogout={handleLogout}>
                  <Navigate to="/home" replace />
                </AppLayout>
              </PrivateRoute>
            }
        />

        <Route
            path="/home"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AppLayout onLogout={handleLogout}>
                  <HomePage />
                </AppLayout>
              </PrivateRoute>
            }
        />

        <Route
            path="/todo/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AppLayout onLogout={handleLogout}>
                  <TodoDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
  );
}

export default App;