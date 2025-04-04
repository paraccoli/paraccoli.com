// src/contexts/AdminNotificationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AdminNotificationContext = createContext();

export const useAdminNotification = () => useContext(AdminNotificationContext);

export const AdminNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    reports: 0,
    feedback: 0,
    quests: 0,
    exchange: 0,
    security: 0  // セキュリティ通知カウントを追加
  });
  
  const [lastChecked, setLastChecked] = useState(() => {
    const saved = localStorage.getItem('admin_last_checked');
    return saved ? JSON.parse(saved) : {
      reports: new Date(0).toISOString(),
      feedback: new Date(0).toISOString(),
      quests: new Date(0).toISOString(),
      exchange: new Date(0).toISOString(),
      security: new Date(0).toISOString()  // セキュリティ用の最終確認時刻
    };
  });

  // 通知をフェッチする関数
  const fetchNotifications = async () => {
    if (!user?.is_admin) return;

    try {
      const response = await fetch('https://example.com/api/admin/notifications/count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    }
  };

  // 通知を既読とマークする
  const markAsRead = (type) => {
    setLastChecked(prev => {
      const updated = {
        ...prev,
        [type]: new Date().toISOString()
      };
      localStorage.setItem('admin_last_checked', JSON.stringify(updated));
      return updated;
    });
    
    // サーバー側に既読状態を送信
    fetch(`https://example.com/api/admin/notifications/read/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).catch(error => {
      console.error(`Failed to mark ${type} as read:`, error);
    });
    
    // ローカルの通知カウントをリセット
    setNotifications(prev => ({
      ...prev,
      [type]: 0
    }));
  };

  // 定期的に通知をチェック
  useEffect(() => {
    if (!user?.is_admin) return;
    
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    markAsRead,
    fetchNotifications
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};