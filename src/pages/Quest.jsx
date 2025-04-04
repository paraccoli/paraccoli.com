import React, { useState, useEffect } from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Quest = () => {
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ページロード時にクエスト情報を取得
    fetchQuests();

    // 定期的な更新（オプション）
    const interval = setInterval(fetchQuests, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, []);

  const fetchQuests = async () => {
    try {
      // デイリークエストを取得
      const dailyResponse = await fetch('https://example.com/api/quests/daily', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const daily = await dailyResponse.json();

      // ウィークリークエストを取得
      const weeklyResponse = await fetch('https://example.com/api/quests/weekly', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const weekly = await weeklyResponse.json();

      setDailyQuests(daily);
      setWeeklyQuests(weekly);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (questId) => {
    try {
      const response = await fetch(`https://example.com/api/quests/${questId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('クエスト報酬を受け取りました');
        // クエスト情報を更新
        await fetchQuests();
        // 残高更新イベントを発火
        window.dispatchEvent(new CustomEvent('balance-update'));
      } else {
        console.error('Failed to claim reward:', data);
        toast.error(data.detail || '報酬の受け取りに失敗しました');
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('報酬の受け取りに失敗しました');
    }
  };

  // QuestCardコンポーネントを改善
  const QuestCard = ({ quest }) => {
    const progress = Math.min((quest.progress / quest.required_count) * 100, 100);
    
    // デイリーログインクエスト用のログインボタン処理
    const handleLoginQuest = async () => {
      try {
        const response = await fetch('https://example.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          toast.success('デイリーログインを完了しました');
          await fetchQuests(); // クエスト情報を更新
        } else {
          const error = await response.json();
          toast.error(error.detail || 'デイリーログインに失敗しました');
        }
      } catch (error) {
        console.error('Failed to perform daily login:', error);
        toast.error('デイリーログインに失敗しました');
      }
    };
    
    return (
      <Card 
        className={`p-4 hover:shadow-lg transition-all duration-200 ${
          quest.completed ? 'bg-green-50' : ''
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* クエストタイプとタイトル */}
            <div className="flex items-center space-x-2">
              <span className={`text-2xl transition-transform duration-300 ${
                quest.completed ? 'transform rotate-12' : ''
              }`}>
                {quest.action_type === 'post' ? '📝' :
                 quest.action_type === 'comment' ? '💬' :
                 quest.action_type === 'login' ? '🔑' :
                 quest.action_type === 'react' ? '👍' : '🎯'}
              </span>
              <div>
                <h3 className="font-medium text-lg">{quest.title}</h3>
                <p className="text-sm text-gray-600">{quest.description}</p>
              </div>
            </div>
            
            {/* 進捗と報酬表示 */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium flex items-center">
                  <span>進捗: {quest.progress} / {quest.required_count}</span>
                  <span className={`ml-2 ${quest.completed ? 'text-green-600' : 'text-blue-600'}`}>
                    ({Math.round(progress)}%)
                  </span>
                </div>
                <div className="text-sm font-medium flex items-center space-x-1">
                  <span>報酬:</span>
                  <span className="text-blue-600">{quest.reward}</span>
                  <span className="text-gray-600">PARC</span>
                </div>
              </div>
              
              {/* プログレスバー */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    quest.completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 期限表示 */}
            {quest.expires_at && (
              <div className="mt-2">
                <span className={`text-sm ${
                  new Date(quest.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000)
                    ? 'text-red-600 font-medium'
                    : 'text-gray-600'
                }`}>
                  期限: {format(new Date(quest.expires_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </span>
              </div>
            )}
          </div>

          {/* 報酬受け取りボタン */}
          <div className="ml-4">
            {quest.action_type === 'login' && !quest.completed && quest.type === 'daily' ? ( // typeチェックを追加
              // デイリーログインクエスト用のボタン
              <Button
                variant="primary"
                onClick={handleLoginQuest}
                className="whitespace-nowrap hover:scale-105 transform transition"
              >
                ログインする
              </Button>
            ) : quest.completed && !quest.reward_claimed ? (
              // 通常の報酬受け取りボタン
              <Button
                variant="primary"
                onClick={() => handleClaimReward(quest.id)}
                className="whitespace-nowrap animate-pulse hover:scale-105 transform transition"
              >
                報酬を受け取る
              </Button>
            ) : quest.reward_claimed ? (
              <span className="text-green-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                受取済み
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Section>
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* デイリークエスト */}
        <div>
          <h2 className="text-2xl font-bold mb-4">デイリークエスト</h2>
          <div className="space-y-4">
            {dailyQuests.length > 0 ? (
              dailyQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <Card className="p-4">
                <p className="text-gray-600 text-center">
                  現在アクティブなデイリークエストはありません
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* ウィークリークエスト */}
        <div>
          <h2 className="text-2xl font-bold mb-4">ウィークリークエスト</h2>
          <div className="space-y-4">
            {weeklyQuests.length > 0 ? (
              weeklyQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <Card className="p-4">
                <p className="text-gray-600 text-center">
                  現在アクティブなウィークリークエストはありません
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Quest;