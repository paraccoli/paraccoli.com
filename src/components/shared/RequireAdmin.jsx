import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RequireAdmin = ({ children }) => {
  const { user, loading, refreshUser } = useAuth();
  
  // コンポーネントがマウントされたときにユーザー情報を更新
  useEffect(() => {
    if (!loading && user && !user.is_admin) {
      refreshUser();
    }
  }, []);

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

  // 明示的にis_adminのチェックを行う
  const isAdmin = user && user.is_admin === true;
  
  if (!isAdmin) {
    console.log('Not admin, redirecting...');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;