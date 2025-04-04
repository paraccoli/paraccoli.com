import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginPrompt from '../shared/LoginPrompt';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ログインページにリダイレクトする代わりに、ログインプロンプトを表示
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto">
          <LoginPrompt 
            title="ログインが必要です"
            message={`この${location.pathname.replace('/', '')}ページを利用するにはログインが必要です。`}
            theme="blue"
          />
        </div>
      </div>
    );
  }

  return children;
};

export default RequireAuth;