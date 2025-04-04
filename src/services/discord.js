// Discord APIとの連携に関するサービス
const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

// サーバーのAPIエンドポイント
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const loginWithDiscord = (state) => {
  // stateが引数で渡されていない場合は生成
  if (!state) {
    state = Math.random().toString(36).substring(7) + Date.now();
    localStorage.setItem('discord_state', state);
  }

  // Discordの認証URLを構築
  const DISCORD_CLIENT_ID = '1341667406166360115';
  const REDIRECT_URI = 'https://example.com/auth/callback';
  
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    state: state,
    prompt: 'consent'
  });

  // ログにリダイレクト先を表示
  console.log(`Redirecting to Discord OAuth: ${DISCORD_API_ENDPOINT}/oauth2/authorize?${params}`);
  
  // Discordの認証ページにリダイレクト
  window.location.href = `${DISCORD_API_ENDPOINT}/oauth2/authorize?${params}`;
};

export const getDiscordUser = async (code) => {
  try {
    console.log('認証リクエスト送信中...');
    console.log('API URL:', API_URL);
    
    const response = await fetch(`${API_URL}/auth/discord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: 'https://example.com/auth/callback'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord認証エラーレスポンス:', {
        status: response.status,
        body: errorText
      });
      throw new Error(errorText || '認証に失敗しました');
    }

    const data = await response.json();
    console.log('認証成功。ユーザー情報:', data.user ? {
      username: data.user.username,
      is_admin: data.user.is_admin
    } : 'ユーザー情報なし');
    
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  } catch (error) {
    console.error('認証エラー:', error);
    throw error;
  }
};