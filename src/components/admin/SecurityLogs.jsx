// src/components/admin/SecurityLogs.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Section from '../shared/Section';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    eventType: '',
    startDate: '',
    endDate: '',
    userId: '',
    ipAddress: ''
  });
  const [error, setError] = useState(null);
  
  const { markAsRead } = useAdminNotification();

  // フィルターオプション
  const severities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  const eventTypes = [
    'login_attempt',
    'login_success',
    'login_failure',
    'excessive_login_attempts',
    'content_reported',
    'self_report_attempt',
    'report_error',
    'duplicate_report',
    'excessive_reports',
    'api_rate_limit_exceeded',
    'endpoint_rate_limited',
    'token_refresh',
    'admin_action'
  ];

  useEffect(() => {
    fetchLogs();
    // 通知を既読にマーク
    markAsRead('security');
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // フィルターパラメータを構築
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.eventType) params.append('event_type', filters.eventType);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.userId) params.append('user_id', filters.userId);
      if (filters.ipAddress) params.append('ip_address', filters.ipAddress);

      // API URLを環境変数から取得するか、デフォルト値を使用
      const apiUrl = import.meta.env.VITE_API_URL || 'https://example.com/api';
      
      console.log(`Fetching security logs from: ${apiUrl}/admin/security-logs?${params}`);
      
      const response = await fetch(`${apiUrl}/admin/security-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`セキュリティログの取得に失敗しました (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} security logs`);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      severity: '',
      eventType: '',
      startDate: '',
      endDate: '',
      userId: '',
      ipAddress: ''
    });
    // フィルターをリセット後すぐにデータ再取得
    setTimeout(fetchLogs, 100);
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Section>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">セキュリティログ</h2>
        
        {/* フィルター */}
        <Card className="mb-8">
          <form onSubmit={applyFilters}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">重要度</label>
                <select
                  name="severity"
                  value={filters.severity}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {severities.map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">イベントタイプ</label>
                <select
                  name="eventType"
                  value={filters.eventType}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {eventTypes.map(eventType => (
                    <option key={eventType} value={eventType}>{eventType}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
                <input
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ユーザーID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IPアドレス</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={filters.ipAddress}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="IPアドレス"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={resetFilters}>
                リセット
              </Button>
              <Button type="submit" variant="primary">
                フィルター適用
              </Button>
            </div>
          </form>
        </Card>
        
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ログ表示 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発生日時
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    重要度
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    イベントタイプ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザーID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPアドレス
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(logs) && logs.length > 0 ? logs.map((log) => (
                  <tr key={log?.id || Math.random().toString(36).substring(7)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log?.timestamp ? format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm:ss', { locale: ja }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeClass(log?.severity || 'INFO')}`}>
                        {log?.severity || 'INFO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log?.event_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log?.user_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log?.ip_address || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="whitespace-pre-wrap max-w-xs">
                        {log?.details ? JSON.stringify(log.details, null, 2) : '{}'}
                      </pre>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {logs.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                ログが見つかりません
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
};

export default SecurityLogs;