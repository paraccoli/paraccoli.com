import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'react-toastify';
import Section from '../shared/Section';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useAdminNotification } from '../../contexts/AdminNotificationContext';

const ExchangeManagement = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAsRead } = useAdminNotification();

  const fetchExchanges = async () => {
    try {
      const response = await fetch('https://example.com/api/admin/exchange', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExchanges(data);
      }
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
    // 既読処理
    markAsRead('exchange');
  }, []);

  const handleComplete = async (exchangeId) => {
    try {
      const response = await fetch(`https://example.com/api/admin/exchange/${exchangeId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('交換処理を完了しました');
        await fetchExchanges();
      } else {
        const error = await response.json();
        toast.error(error.detail || '交換処理に失敗しました');
      }
    } catch (error) {
      console.error('Failed to complete exchange:', error);
      toast.error('交換処理に失敗しました');
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
        <h2 className="text-2xl font-bold mb-6">PARC交換管理</h2>
        <div className="space-y-4">
          {exchanges.length > 0 ? (
            exchanges.map((exchange) => (
              <Card key={exchange.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">
                          申請者: @{exchange.username}
                        </span>
                      </div>
                      <div className="text-lg font-medium">
                        {exchange.amount} PARC
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      申請日時: {format(new Date(exchange.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </div>
                  </div>

                  {!exchange.completed && (
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={() => handleComplete(exchange.id)}
                      >
                        交換完了
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-gray-500">
              処理待ちの交換リクエストはありません
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
};

export default ExchangeManagement;