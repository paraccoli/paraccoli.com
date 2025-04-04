import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../shared/LoadingSpinner';

const DiscordLogin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 認証済みの場合はホームにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Discordログイン処理
  const handleLogin = () => {
    try {
      setIsLoading(true);
      
      // ランダムなStateを生成
      const state = Math.random().toString(36).substring(2, 15) + Date.now();
      
      // Stateをローカルストレージに保存
      localStorage.setItem('discord_state', state);
      
      // Discordの認証URLを構築
      const DISCORD_CLIENT_ID = 'xxxxxxxxxxxx'; // DiscordのクライアントIDを指定
      // リダイレクトURIを指定（Discordのアプリ設定で登録したものと一致させる必要があります）
      const REDIRECT_URI = 'https://example.com/auth/callback';
      
      // Discordの認証ページにリダイレクト
      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email&state=${state}&prompt=consent`;
      
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('ログインエラー:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-blue-600 p-6">
          <div className="flex justify-center">
            <img 
              src="/logo.svg" 
              alt="PARC" 
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-center text-2xl font-bold text-white mt-4">
            PARC へログイン
          </h1>
        </div>
        
        {/* コンテンツ */}
        <div className="p-8">
          <p className="text-gray-600 mb-6 text-center">
            Discordアカウントでログインすると、仮想通貨取引シミュレーション、ギルド機能などを利用できます。
          </p>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-3 font-medium transition-all ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <LoadingSpinner variant="ping" className="text-white" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" />
                </svg>
                <span>Discordでログイン</span>
              </>
            )}
          </button>
          
          <div className="mt-6 text-center">
            <a 
              href={process.env.DISCORD_INVITE_URL || "#"}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline text-sm"
            >
              Discordサーバーに参加する
            </a>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              ログインすることで、
              <Link to="/terms" className="text-blue-600 hover:underline">利用規約</Link>
              と
              <Link to="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
              に同意したものとみなされます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordLogin;