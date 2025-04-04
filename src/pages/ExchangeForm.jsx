import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';

const ExchangeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    const exchangeAmount = parseFloat(amount);
    if (exchangeAmount < 100) {
      toast.error('最低100 PARC以上から交換可能です');
      return;
    }
    
    if (exchangeAmount > user.balance) {
      toast.error('残高が不足しています');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://example.com/api/exchange/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: exchangeAmount,
          username: user.username
        })
      });

      if (response.ok) {
        toast.success('交換リクエストを送信しました');
        navigate('/notifications');
      } else {
        const error = await response.json();
        toast.error(error.detail || '交換リクエストの送信に失敗しました');
      }
    } catch (error) {
      toast.error('交換リクエストの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">PARC交換フォーム</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交換するPARC数
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border-gray-300"
                min="100"
                step="1"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                ※ 最低100 PARC以上から交換可能です
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !amount || parseFloat(amount) < 100}
              >
                {loading ? '送信中...' : '交換リクエストを送信'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Section>
  );
};

export default ExchangeForm;