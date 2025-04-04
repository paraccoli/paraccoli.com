import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDiscordUser } from '../../services/discord';
import LoadingSpinner from '../shared/LoadingSpinner';

const LoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (isProcessing) return; // 既に処理中なら終了
      setIsProcessing(true);

      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('認証コードが見つかりません');
        }

        // 認証開始
        const data = await getDiscordUser(code);
        
        if (data?.user) {
          login(data.user);
          console.log('ログイン成功:', data.user.username);
          navigate('/', { replace: true });
        } else {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('認証エラー:', error);
        setError(error.message || '認証処理中にエラーが発生しました');
        // 5秒後にログインページへ戻る
        setTimeout(() => navigate('/login', { replace: true }), 5000);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        {error ? (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-bold mb-1">エラーが発生しました</p>
              <p>{error}</p>
            </div>
            <p className="text-gray-600 mt-4">
              5秒後にログインページに戻ります...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <LoadingSpinner variant="dots" size="xl" className="mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              認証処理中...
            </h2>
            <p className="text-gray-600">
              しばらくお待ちください。自動的にホーム画面に移動します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginCallback;