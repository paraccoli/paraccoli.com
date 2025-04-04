import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

export const AuthContext = createContext(null);

// useAuthフックをエクスポートする
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 明示的に定義
  const [loading, setLoading] = useState(true);

  // ユーザー情報を更新する関数 (メモ化して安定させる)
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return null;

    try {
      // キャッシュを無効化した新しいリクエスト
      const response = await fetch('https://example.com/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const userData = await response.json();
        
        // ユーザーデータを更新
        setUser(userData);
        setIsAuthenticated(true);
        
        // localStorage も更新
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 他のコンポーネントに通知
        window.dispatchEvent(new CustomEvent('user-updated', {
          detail: { user: userData }
        }));
        
        return userData;
      } else {
        // 401や403エラーの場合はログアウト
        if (response.status === 401 || response.status === 403) {
          logout();
        }
        
        console.error('Error fetching user data:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }, []); // 依存配列から logout を削除して循環参照を防止

  // ログアウト関数
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ログイン関数
  const login = useCallback((userData) => {
    // ユーザー情報を設定
    const userWithBooleanAdmin = {
      ...userData,
      is_admin: Boolean(userData.is_admin)
    };
    
    setUser(userWithBooleanAdmin);
    setIsAuthenticated(true);
    
    // localStorage に保存
    localStorage.setItem('user', JSON.stringify(userWithBooleanAdmin));
  }, []);

  // アプリ起動時に認証状態を復元
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserStr = localStorage.getItem('user');

        if (!token || !storedUserStr) {
          setLoading(false);
          return;
        }

        try {
          const storedUser = JSON.parse(storedUserStr);
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // トークンの検証は非同期で行い、失敗したら後でログアウト
          fetch('https://example.com/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache'
            }
          }).then(response => {
            if (!response.ok) {
              console.log('Token verification failed, logging out');
              logout();
            }
          }).catch(() => {
            // エラーが発生してもクラッシュさせない
            console.error('Token verification failed with error');
          });
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
          logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};