import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Section from '../shared/Section';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyForm, setReplyForm] = useState({ 
    id: null, 
    response: '', 
    reward: 0 // PARC報酬を追加
  });

  const { markAsRead } = useAdminNotification();

  const fetchFeedback = async () => {
    try {
      const response = await fetch('https://example.com/api/admin/feedback', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    // 既読処理
    markAsRead('feedback');
  }, []);

  const handleReply = async (feedbackId) => {
    if (!replyForm.response.trim()) return;

    try {
      const response = await fetch(`https://example.com/api/admin/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          response: replyForm.response,
          reward: parseFloat(replyForm.reward) || 0  // 数値に変換
        })
      });

      if (response.ok) {
        await fetchFeedback();
        setReplyForm({ id: null, response: '', reward: 0 });
      } else {
        const error = await response.json();
        console.error('Reply failed:', error);
      }
    } catch (error) {
      console.error('Failed to reply:', error);
    }
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">フィードバック管理</h2>
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    {/* 送信者情報を修正 */}
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">
                        送信者: @{item.author_name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block px-2 py-1 text-sm rounded-full
                        bg-blue-100 text-blue-800 mr-2">
                        {item.type === 'improvement' ? '改善提案' :
                         item.type === 'question' ? '質問' :
                         item.type === 'bug' ? 'バグ報告' :
                         item.type === 'promotion' ? '宣伝報告' : 'その他'}
                      </span>
                      {/* 宣伝URLの表示を修正 */}
                      {item.type === 'promotion' && item.url && (
                        <a
                          href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.url}
                        </a>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 mt-1 block">
                      {format(new Date(item.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.status === 'pending' ? '未回答' : '回答済み'}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-gray-600">{item.content}</p>
                </div>

                {item.response && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-500">
                    <p className="text-sm font-medium">管理者の返信:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.response}</p>
                  </div>
                )}

                {!item.response && (
                  <div className="space-y-2">
                    <textarea
                      value={replyForm.id === item.id ? replyForm.response : ''}
                      onChange={(e) => setReplyForm({
                        ...replyForm,
                        id: item.id,
                        response: e.target.value
                      })}
                      placeholder="返信を入力..."
                      className="w-full p-2 border rounded-md"
                      rows="3"
                    />
                    {/* PARC報酬入力欄を追加 */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={replyForm.id === item.id ? replyForm.reward : 0}
                        onChange={(e) => setReplyForm({
                          ...replyForm,
                          id: item.id,
                          reward: e.target.value
                        })}
                        placeholder="PARC報酬額"
                        className="w-32 p-2 border rounded-md"
                        min="0"
                      />
                      <span className="text-sm text-gray-500">PARC</span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleReply(item.id)}
                        variant="primary"
                      >
                        返信する
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Feedback;