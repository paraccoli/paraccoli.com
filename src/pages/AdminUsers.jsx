import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import RequireAdmin from '../components/shared/RequireAdmin';
import Section from '../components/shared/Section';
import UserManagement from '../components/admin/UserManagement';

export default function AdminUsers() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // RequireAdmin コンポーネントを使用して、管理者のみがアクセスできるようにする
  return (
    <RequireAdmin>
      <Section className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
          <UserManagement />
        </div>
      </Section>
    </RequireAdmin>
  );
}