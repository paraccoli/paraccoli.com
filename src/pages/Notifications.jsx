import React, { useState, useEffect } from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ユーザー情報を最初に更新して認証状態を確認
        await refreshUser();
        
        // 並列でデータを取得
        const [feedbackResponse, notificationsResponse] = await Promise.all([
          fetch('https://example.com/api/feedback/my', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache'
            }
          }),
          fetch('https://example.com/api/notifications/my', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache'
            }
          })
        ]);

        // フィードバック処理
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          setFeedback(feedbackData);
        } else if (feedbackResponse.status === 401 || feedbackResponse.status === 403) {
          // 認証エラーの場合は再認証を試みる
          const refreshSuccessful = await refreshUser();
          if (!refreshSuccessful) {
            // 再認証に失敗した場合は処理を中断（AuthContextのlogout処理が呼ばれる）
            return;
          }
        }

        // 通知処理
        if (notificationsResponse.ok) {
          const notificationData = await notificationsResponse.json();
          setNotifications(notificationData);
        } else if (notificationsResponse.status === 401 || notificationsResponse.status === 403) {
          // 認証エラーの場合は再認証を試みる（上と同様）
          const refreshSuccessful = await refreshUser();
          if (!refreshSuccessful) return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('データの取得に失敗しました。ネットワーク接続を確認してください。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, refreshUser]);

  if (!isAuthenticated) {
    return null; // ナビゲーションが発生するので何も表示しない
  }

  if (loading) {
    return (
      <Section>
        <div className="max-w-4xl mx-auto flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-red-50 border-l-4 border-red-500">
            <h2 className="text-xl font-bold text-red-700 mb-2">エラーが発生しました</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再読み込み
            </button>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">通知</h2>
        <div className="space-y-4">
          {/* システム通知 */}
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(notification.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notification.content}</p>
                </div>
              </div>
            </Card>
          ))}

          {/* フィードバック通知 */}
          {feedback.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-full"> {/* 幅を100%に設定 */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-2 py-1 text-sm rounded-full 
                      bg-blue-100 text-blue-800 mr-2">
                      {item.type === 'improvement' ? '改善提案' :
                       item.type === 'question' ? '質問' :
                       item.type === 'bug' ? 'バグ報告' :
                       item.type === 'promotion' ? '宣伝報告' : 'その他'}
                    </span>
                    {/* 報酬表示を追加 */}
                    {item.reward > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        +{item.reward} PARC
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                  {item.response && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-500">
                      <p className="text-sm font-medium">管理者からの返信:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.response}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(item.responded_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {notifications.length === 0 && feedback.length === 0 && (
            <Card className="p-4 text-center text-gray-500">
              通知はありません
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Notifications;