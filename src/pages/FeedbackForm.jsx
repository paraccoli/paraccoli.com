import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

const FeedbackForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'improvement',
    url: ''  // URL用のフィールドを追加
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://example.com/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          url: formData.type === 'promotion' ? formData.url : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'フィードバックの送信に失敗しました');
      }

      alert('フィードバックを送信しました');
      setFormData({ title: '', content: '', type: 'improvement', url: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.message);
    }
  };

  return (
    <Section>
      <div className="max-w-2xl mx-auto">
        <Card>
          <h2 className="text-2xl font-bold mb-6">フィードバック</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                種類
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="improvement">改善提案</option>
                <option value="question">質問</option>
                <option value="bug">バグ報告</option>
                <option value="promotion">宣伝報告</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 宣伝報告の場合のみURLフィールドを表示 */}
            {formData.type === 'promotion' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  宣伝URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.type === 'promotion' ? '動画タイトル' : 'タイトル'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.type === 'promotion' ? '補足コメント' : '内容'}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                送信
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Section>
  );
};

export default FeedbackForm;