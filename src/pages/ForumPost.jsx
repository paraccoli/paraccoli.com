import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MDEditor from '@uiw/react-md-editor';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 10000;
const MAX_COMMENT_LENGTH = 1000;

const ForumPost = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [isLocked, setIsLocked] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState('post');
  const [reportTargetId, setReportTargetId] = useState(null);
  const [error, setError] = useState(null);
  const canEdit = user && post && user.discord_id === post.author_id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://example.com/api/forums/posts/${postId}`);
        
        if (!response.ok) {
          // エラーステータスの場合
          const statusText = response.statusText;
          const errorMessage = 
            response.status === 404 ? 'このフォーラムは削除されたか存在しません。' :
            response.status === 500 ? 'サーバーエラーが発生しました。' :
            `フォーラム取得中にエラーが発生しました (${response.status})`;
          
          setError(errorMessage);
          console.error(`API error: ${response.status} ${statusText}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // データの検証
        if (!data || !data.title) {
          throw new Error('不正なフォーラムデータを受信しました');
        }
        
        setPost(data);
        setIsLocked(data.is_locked || false);
        
        // ユーザーがリアクションしているかチェック
        if (user) {
          setHasReacted(data.reactions?.includes(user.discord_id) || false);
        }
        
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setError('フォーラム投稿の取得に失敗しました。' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  useEffect(() => {
    if (post && isEditing) {
      setEditData({
        title: post.title,
        content: post.content,
        category: post.category
      });
    }
  }, [isEditing, post]);

  useEffect(() => {
    if (post) {
      setIsLocked(post.is_locked || false);
    }
  }, [post]);

  useEffect(() => {
    if (post && user) {
      setHasReacted(post.reactions?.includes(user.discord_id));
    }
  }, [post, user]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await fetch(
        `https://example.com/api/forums/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            content: comment,
            author_id: user.discord_id
          })
        }
      );

      if (response.ok) {
        const newComment = await response.json();
        
        // コメントを追加して画面を更新
        setPost(prev => ({
          ...prev,
          comments: [...prev.comments, newComment],
          comment_count: (prev.comment_count || 0) + 1
        }));
        
        // コメントフォームをクリア
        setComment('');
        
        // コメント欄までスクロール
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.content) {
      return;
    }

    try {
      const response = await fetch(`https://example.com/api/forums/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error('Failed to update post');

      const updatedPost = await response.json();
      setPost(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('本当にこの投稿を削除しますか？')) return;

    try {
      const response = await fetch(`https://example.com/api/forums/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      navigate('/forums', { replace: true });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleLock = async () => {
    try {
      const response = await fetch(`https://example.com/api/forums/posts/${postId}/lock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLocked(data.is_locked);
      }
    } catch (error) {
      console.error('Lock toggle error:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('このコメントを削除しますか？')) return;

    try {
      const response = await fetch(
        `https://example.com/api/forums/posts/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setPost(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId),
          comment_count: prev.comment_count - 1
        }));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReaction = async () => {
    if (!user) return;
    
    try {
        const response = await fetch(
            `https://example.com/api/forums/posts/${postId}/reactions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        const data = await response.json();

        if (response.ok && data.success) {
            // 投稿の状態を更新
            setPost(prev => ({
                ...prev,
                reaction_count: (prev.reaction_count || 0) + 1,
                reactions: [...(prev.reactions || []), user.discord_id]
            }));
            setHasReacted(true);
        } else {
            console.error('Failed to add reaction:', data.message);
        }
    } catch (error) {
        console.error('Failed to add reaction:', error);
    }
};

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setIsReporting(true);
    try {
      const response = await fetch(
        `https://example.com/api/forums/posts/${reportType === 'post' ? postId : reportTargetId}/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            reason: reportReason,
            type: reportType,
            target_id: reportType === 'post' ? postId : reportTargetId
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '通報の送信に失敗しました');
      }

      setIsReportModalOpen(false);
      setReportReason('');
      setReportType('post');
      setReportTargetId(null);
      alert('通報を受け付けました');

    } catch (error) {
      console.error('Failed to report:', error);
      alert(error.message);
    } finally {
      setIsReporting(false);
    }
  };

  const openReportModal = (type, targetId) => {
    setReportType(type);
    setReportTargetId(targetId);
    setIsReportModalOpen(true);
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

  if (error) {
    return (
      <Section>
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error}
          </h2>
          <Link to="/forums">
            <Button variant="primary">
              フォーラム一覧に戻る
            </Button>
          </Link>
        </div>
      </Section>
    );
  }

  if (!post) return null;

  return (
    <Section>
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          {/* 投稿の操作ボタン */}
          <div className="flex justify-end space-x-2 mb-4">
            {/* 編集ボタン（投稿者のみ） */}
            {user && user.discord_id === post.author_id && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'キャンセル' : '編集'}
              </Button>
            )}
            
            {/* コメントロックボタン（投稿者のみ） */}
            {user && user.discord_id === post.author_id && (
              <Button
                variant={isLocked ? "warning" : "secondary"}
                onClick={handleToggleLock}
              >
                {isLocked ? 'コメント解除' : 'コメントロック'}
              </Button>
            )}

            {/* 削除ボタン（投稿者または管理者） */}
            {user && (user.discord_id === post.author_id || user.is_admin) && (
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                {user.is_admin && user.discord_id !== post.author_id ? '管理者として削除' : '削除'}
              </Button>
            )}

            {/* 通報ボタン（投稿者以外） */}
            {user && user.discord_id !== post.author_id && (
              <Button
                variant="secondary"
                onClick={() => openReportModal('post', postId)}
                className="ml-auto"
              >
                通報
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  タイトル
                  <span className="text-sm text-gray-500 ml-2">
                    ({editData.title.length}/{MAX_TITLE_LENGTH})
                  </span>
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_TITLE_LENGTH) {
                      setEditData({ ...editData, title: e.target.value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  カテゴリー
                </label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="general">一般</option>
                  <option value="crypto">仮想通貨</option>
                  <option value="guild">ギルド</option>
                  <option value="help">ヘルプ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本文
                  <span className="text-sm text-gray-500 ml-2">
                    ({editData.content.length}/{MAX_CONTENT_LENGTH})
                  </span>
                </label>
                <MDEditor
                  value={editData.content}
                  onChange={(value) => {
                    if (value && value.length <= MAX_CONTENT_LENGTH) {
                      setEditData({ ...editData, content: value });
                    }
                  }}
                  height={400}
                  preview="edit"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  更新
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <img
                  src={post.author_avatar || '/default-avatar.png'}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {post.author_name || '不明なユーザー'}
                  </div>
                  <div className="text-sm text-gray-500">
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: post.content ? DOMPurify.sanitize(marked(post.content)) : '' 
                }}
              />
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={handleReaction}
                  disabled={hasReacted || (user?.discord_id === post.author_id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full 
                    ${hasReacted 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200`}
                >
                  <span className="text-lg">🪙</span>
                  <span>{post.reaction_count || 0}</span>
                </button>
              </div>
            </>
          )}
        </Card>

        <div className="space-y-6" id="comments-section">
          <h2 className="text-xl font-semibold text-gray-900">
            コメント ({post.comments?.length || 0})
          </h2>

          {!isLocked ? (
            <Card>
              <form onSubmit={handleComment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    コメント
                    <span className="text-sm text-gray-500 ml-2">
                      ({comment.length}/{MAX_COMMENT_LENGTH})
                    </span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                        setComment(e.target.value);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="コメントを書く..."
                    rows="3"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={!comment.trim()}
                  >
                    コメントする
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="text-center p-4 text-gray-500">
              コメントは現在ロックされています
            </div>
          )}

          {post.comments?.map((comment) => (
            <Card key={comment.id}>
              <div className="flex space-x-4">
                <img
                  src={comment.author_avatar || '/default-avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {comment.author_name || '不明なユーザー'}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* コメント操作ボタン（報告ボタンなど） */}
                    {user && user.discord_id !== comment.author_id && (
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => openReportModal('comment', comment.id)}
                      >
                        通報
                      </Button>
                    )}
                  </div>
                  
                  <p className="mt-2 text-gray-700">
                    {comment.content || '（内容なし）'}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* コメントがない場合のメッセージ */}
          {(!post.comments || post.comments.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              コメントはまだありません
            </div>
          )}
        </div>
      </div>

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {reportType === 'post' ? '投稿' : 'コメント'}を通報
            </h3>
            <form onSubmit={handleReport}>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="通報理由を入力してください"
                rows="4"
                required
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportReason('');
                    setReportType('post');
                    setReportTargetId(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={isReporting}
                >
                  {isReporting ? '送信中...' : '通報する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Section>
  );
};

export default ForumPost;