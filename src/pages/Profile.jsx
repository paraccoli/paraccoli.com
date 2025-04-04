import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Section className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
              <p className="mt-2 text-gray-600">アカウント情報</p>
            </div>
            {/* 編集ボタンを削除 */}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* プロフィール画像とユーザー情報 */}
            <div className="text-center">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto"
              />
              <div className="mt-4">
                <p className="font-medium text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">Discord ID: {user?.discord_id}</p>
              </div>
            </div>

            {/* ユーザー情報表示 */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">ユーザー名</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">PARC残高</p>
                  <p className="font-medium">{user?.balance || 0} PARC</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">アカウント作成日</p>
                  <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">最終ログイン</p>
                  <p className="font-medium">{new Date(user?.last_login).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
};

export default Profile;