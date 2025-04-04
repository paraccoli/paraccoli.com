const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://example.com/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // ヘッダーの設定
  getHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // トークンでのログイン
  async loginWithToken(token) {
    const response = await fetch(`${this.baseUrl}/auth/login/token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }

  // プロフィールの更新
  async updateProfile(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ユーザー情報の取得
  async getCurrentUser() {
    try {
      // まずprofileエンドポイントを試す
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        return response.json();
      }

      // 失敗した場合はmeエンドポイントを試す（後方互換性のため）
      const fallbackResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getHeaders()
      });

      if (!fallbackResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      return fallbackResponse.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}

// src/services/api.js に追加
const getCsrfToken = () => {
  // APIからCSRFトークンを取得する関数
  return fetch(`${API_BASE_URL}/auth/csrf-token`, {
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => data.csrf_token);
};

// データ更新リクエストにCSRFトークンを追加する例
async function updateData(url, data) {
  const csrfToken = await getCsrfToken();
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
}

export const api = new ApiClient();