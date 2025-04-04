// src/pages/AdminHome.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import NotificationBadge from '../components/shared/NotificationBadge';
import { useAdminNotification } from '../contexts/AdminNotificationContext';
import NotFound from '../pages/NotFound';
import { useAuth } from '../contexts/AuthContext';

export default function AdminHome() {
  const { user } = useAuth();
  const { notifications } = useAdminNotification();
  
  const adminModules = [
    {
      title: '通報管理',
      description: 'ユーザーからの通報を確認・対応します',
      path: '/admin/reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      notificationCount: notifications.reports
    },
    {
      title: 'フィードバック管理',
      description: 'ユーザーからのフィードバックを確認・返信します',
      path: '/admin/feedback',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      notificationCount: notifications.feedback
    },
    {
      title: 'クエスト管理',
      description: 'クエストの生成と管理を行います',
      path: '/admin/quests',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      notificationCount: notifications.quests
    },
    {
      title: 'PARC交換管理',
      description: 'PARC交換リクエストの承認と管理を行います',
      path: '/admin/exchange',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      notificationCount: notifications.exchange
    },
    {
      title: 'セキュリティログ',
      description: 'セキュリティイベントのログを確認できます',
      path: '/admin/security-logs', // 統一: ハイフン付きを使用
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      notificationCount: notifications.security || 0
    },
    {
      title: 'ユーザー管理',
      description: 'ユーザー情報の確認、PARC残高管理、アカウント制限',
      path: '/admin/users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">管理者パネル</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminModules.map((feature) => (
              <Link key={feature.path} to={feature.path}>
                <Card className="h-full p-6 flex flex-col transition-all duration-300 hover:shadow-lg relative">
                  {/* 通知バッジを追加 */}
                  <NotificationBadge count={feature.notificationCount} />
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};