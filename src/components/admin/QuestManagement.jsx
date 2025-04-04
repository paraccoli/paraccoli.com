import React, { useState, useEffect } from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';

const QuestManagement = () => {
  const [loading, setLoading] = useState({
    daily: false,
    weekly: false
  });
  const [message, setMessage] = useState(null);
  const { markAsRead } = useAdminNotification();
  
  useEffect(() => {
    // 既読処理
    markAsRead('quests');
  }, []);

  const handleGenerateQuests = async (type) => {
    if (!confirm(`新しい${type === 'daily' ? 'デイリー' : 'ウィークリー'}クエストを生成しますか？`)) return;

    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`https://example.com/api/admin/quests/generate/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `${type === 'daily' ? 'デイリー' : 'ウィークリー'}クエストが生成されました` });
      } else {
        setMessage({ type: 'error', text: `${type === 'daily' ? 'デイリー' : 'ウィークリー'}クエストの生成に失敗しました` });
      }
    } catch (error) {
      console.error('Failed to generate quests:', error);
      setMessage({ type: 'error', text: 'クエストの生成中にエラーが発生しました' });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">クエスト管理</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* デイリークエスト生成 */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">デイリークエスト生成</h3>
              <p className="text-gray-600 mb-4">
                デイリークエストを生成します。
                既存のデイリークエストは上書きされます。
              </p>
              <Button
                variant="primary"
                onClick={() => handleGenerateQuests('daily')}
                disabled={loading.daily}
              >
                {loading.daily ? '生成中...' : 'デイリークエストを生成'}
              </Button>
            </div>
          </Card>

          {/* ウィークリークエスト生成 */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">ウィークリークエスト生成</h3>
              <p className="text-gray-600 mb-4">
                ウィークリークエストを生成します。
                既存のウィークリークエストは上書きされます。
              </p>
              <Button
                variant="primary"
                onClick={() => handleGenerateQuests('weekly')}
                disabled={loading.weekly}
              >
                {loading.weekly ? '生成中...' : 'ウィークリークエストを生成'}
              </Button>
            </div>
          </Card>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </Section>
  );
};

export default QuestManagement;