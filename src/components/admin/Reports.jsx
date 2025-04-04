import React, { useState, useEffect } from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead } = useAdminNotification();

  const fetchReports = async () => {
    try {
      const response = await fetch('https://example.com/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // 既読処理
    markAsRead('reports');
  }, []);

  const handleStatusUpdate = async (reportId, status) => {
    try {
      const response = await fetch(`https://example.com/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchReports();
      } else {
        console.error('Failed to update report:', await response.json());
      }
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('この通報を削除しますか？')) return;

    try {
      const response = await fetch(`https://example.com/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchReports();
      } else {
        console.error('Failed to delete report:', await response.json());
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('この投稿を削除しますか？')) return;
  
    try {
      const response = await fetch(`https://example.com/api/admin/forums/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.ok) {
        toast.success('投稿を削除しました');
        // レポート一覧を更新
        await fetchReports();
      } else {
        const error = await response.json();
        toast.error(error.detail || '投稿の削除に失敗しました');
      }
    } catch (error) {
      console.error('投稿の削除に失敗:', error);
      toast.error('投稿の削除に失敗しました');
    }
  };

  const handleGotoContent = (report) => {
    if (!report.post_id) {
      console.error('投稿IDが見つかりません');
      return;
    }
  
    // コメントの場合は投稿ページのコメント部分へリンク
    if (report.type === 'comment') {
      const postUrl = `/forums/${report.post_id}#comment-${report.target_id}`;
      window.open(postUrl, '_blank');
    } else {
      // 投稿の場合は投稿ページへ直接リンク
      const postUrl = `/forums/${report.post_id}`;
      window.open(postUrl, '_blank');
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
        <h2 className="text-2xl font-bold mb-6">通報管理</h2>
        <div className="space-y-4">
          {reports.map(report => (
            <Card key={report.id} className="p-6">
              <div className="flex justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {format(new Date(report.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </div>
                <div className={`px-2 py-1 rounded text-sm ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status === 'pending' ? '対応待ち' :
                   report.status === 'resolved' ? '対応済み' : '却下'}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">通報内容</h3>
                  <p className="mt-1 text-gray-600">{report.reason}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">報告された{report.type === 'post' ? '投稿' : 'コメント'}</h3>
                  <div className="mt-1 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" 
                       onClick={() => handleGotoContent(report)}>
                    {report.reported_content.content}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    投稿者: {report.reported_content.author_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    通報者: {report.reporter_name}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {report.status === 'pending' ? (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        variant="primary"
                      >
                        対応済みにする
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        variant="danger"
                      >
                        却下する
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleDelete(report.id)}
                      variant="danger"
                    >
                      削除
                    </Button>
                  )}
                  {report.type === 'post' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePost(report.target_id)}
                      className="ml-2"
                    >
                      投稿を削除
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Reports;