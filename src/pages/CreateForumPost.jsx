import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MDEditor from '@uiw/react-md-editor';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

const CreateForumPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('タイトルと本文は必須です');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://example.com/api/forums/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          author_id: user.discord_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '投稿の作成に失敗しました');
      }

      // IDが文字列として返されることを保証
      const postId = data.id.toString();

      // 正しい投稿ページに遷移する
      navigate(`/forums/${postId}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section>
      <div className="max-w-4xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">新規投稿</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                タイトル
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                カテゴリー
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="general">一般</option>
                <option value="crypto">仮想通貨</option>
                <option value="guild">ギルド</option>
                <option value="help">ヘルプ</option>
              </select>
            </div>

            <div data-color-mode="light">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                本文
              </label>
              <MDEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value || '' })}
                height={400}
                preview="edit"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/forums')}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Section>
  );
};

export default CreateForumPost;