// src/App.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminNotificationProvider } from './contexts/AdminNotificationContext';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AdminNotificationProvider>
        <AppRoutes />
      </AdminNotificationProvider>
    </AuthProvider>
  );
}

export default App;