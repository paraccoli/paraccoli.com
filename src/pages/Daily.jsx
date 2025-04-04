import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Daily = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [dailyStatus, setDailyStatus] = useState(null);

  // デイリーボーナスのステータスを取得
  const fetchDailyStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://example.com/api/daily/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDailyStatus(data);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'デイリーボーナス情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to fetch daily bonus status:', error);
      toast.error('デイリーボーナス情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // デイリーボーナスを受け取る
  const claimDailyBonus = async () => {
    try {
      setClaimLoading(true);
      const response = await fetch('https://example.com/api/daily/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // 残高更新イベントを発火
        window.dispatchEvent(new CustomEvent('balance-update'));
        
        // ステータスを再取得
        await fetchDailyStatus();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'デイリーボーナスの受け取りに失敗しました');
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      toast.error('デイリーボーナスの受け取りに失敗しました');
    } finally {
      setClaimLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDailyStatus();
    }
  }, [isAuthenticated]);

  // ユーザーが認証されていない場合はログインを要求
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
            <p className="mb-6 text-gray-600">デイリーボーナスを受け取るにはログインしてください。</p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              ログインする
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-10"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            💰 デイリーボーナス
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            毎日ログインして、PARCボーナスをゲットしよう！連続ログインでボーナスがアップ！
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-6">
                <h2 className="text-2xl font-bold mb-2">
                  {dailyStatus?.claimed_today 
                    ? '本日のボーナスは受け取り済みです' 
                    : '本日のボーナスを受け取ろう！'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {dailyStatus?.claimed_today 
                    ? `次回は明日受け取れます`
                    : '下のボタンを押してボーナスを受け取りましょう！'}
                </p>
                
                {dailyStatus?.streak > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="font-medium text-blue-700">
                      現在の連続ログイン: <span className="font-bold">{dailyStatus.streak}日</span>
                    </p>
                    <p className="text-blue-600">
                      合計ボーナス受け取り回数: {dailyStatus.total_claims}回
                    </p>
                  </div>
                )}

                {!dailyStatus?.claimed_today && (
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={claimDailyBonus}
                    disabled={claimLoading || dailyStatus?.claimed_today}
                    className="w-full md:w-auto"
                  >
                    {claimLoading ? (
                      <span className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" /> 受け取り中...
                      </span>
                    ) : (
                      '今日のボーナスを受け取る'
                    )}
                  </Button>
                )}
              </div>

              <div className="w-full md:w-1/3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-6 text-center">
                <div className="text-5xl mb-2">🏆</div>
                <p className="text-sm text-amber-800 mb-1">次回のボーナス</p>
                <p className="text-2xl font-bold text-amber-900">
                  {dailyStatus?.next_amount} PARC
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  {dailyStatus?.next_streak}日連続ログイン達成時
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">連続ログインボーナス表</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">連続日数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基本ボーナス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">追加ボーナス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合計</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">1日目</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">-</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">100 PARC</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">3日目</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+30 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">130 PARC</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">7日目 🎉</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+70 PARC + 200 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-700">370 PARC</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">10日目</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">200 PARC</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">14日目 🎉</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+140 PARC + 500 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-700">740 PARC</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">20日目</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+200 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">300 PARC</td>
                  </tr>
                  <tr className="bg-amber-100">
                    <td className="px-6 py-4 whitespace-nowrap font-bold">30日目 🌟</td>
                    <td className="px-6 py-4 whitespace-nowrap">100 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap">+300 PARC + 1000 PARC</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-900">1400 PARC</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="mb-2"><span className="font-bold">💡 ポイント:</span></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>毎日必ずボーナスを受け取りましょう！1日でも逃すとストリークがリセットされます。</li>
                <li>7日、14日、30日は特別ボーナスがあります。この日を逃さないように！</li>
                <li>30日連続ログインで最大1400 PARCが獲得できます！</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Daily;