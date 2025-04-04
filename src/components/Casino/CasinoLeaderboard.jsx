import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import LoadingSpinner from '../shared/LoadingSpinner';

const CasinoLeaderboard = () => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ランキングデータを取得
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      // キャッシュを無効化するヘッダーを追加
      const response = await fetch(`https://example.com/api/casino/leaderboard?period=${timeFrame}`, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        // レスポンスがJSONかどうかを確認
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setLeaderboardData(data.leaderboard || []);
        } else {
          // JSONでない場合はテキストとして解析
          const textData = await response.text();
          console.error('Expected JSON but got:', textData);
          toast.error('ランキングデータの形式が正しくありません');
          setLeaderboardData([]);
        }
      } else {
        // エラー時の処理を改善
        let errorMessage = 'ランキングデータの取得に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // JSONパースに失敗した場合は元のエラーメッセージを使用
          console.error('Failed to parse error response:', e);
        }
        console.error('Leaderboard fetch error:', errorMessage);
        toast.error(errorMessage);
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('ネットワークエラー: ランキングデータを取得できませんでした');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFrame]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center">
            <TrophyIcon className="w-10 h-10 text-amber-500 mr-3" />
            カジノランキング
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paraccoli Casinoでトップの座を競い合うプレイヤーたち。
            あなたも上位ランカーを目指しましょう！
          </p>
        </motion.div>
        
        {/* タイムフレーム切り替えタブ */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-1 flex">
            {[
              { id: 'daily', label: 'デイリー' },
              { id: 'weekly', label: 'ウィークリー' },
              { id: 'monthly', label: 'マンスリー' }
            ].map((period) => (
              <button
                key={period.id}
                className={`px-6 py-3 rounded-lg ${
                  timeFrame === period.id
                    ? 'bg-amber-500 text-white font-medium' 
                    : 'text-gray-600 hover:bg-amber-50'
                }`}
                onClick={() => setTimeFrame(period.id)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* ランキング表示 */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-hidden">
              {leaderboardData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ランク
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        プレイヤー
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        獲得金額
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        連勝記録
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardData.map((player, index) => (
                      <motion.tr 
                        key={player.discord_id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={index < 3 ? 'bg-amber-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                            {index > 2 && <span className="font-bold text-gray-700">{index + 1}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={player.avatar || '/default-avatar.png'} 
                              alt={player.username || 'ユーザー'} 
                              className="w-8 h-8 rounded-full mr-3"
                              onError={(e) => {e.target.src = '/default-avatar.png'}}
                            />
                            <span className="font-medium text-gray-900">{player.username || 'ユーザー'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-bold ${index < 3 ? 'text-amber-600' : 'text-gray-900'}`}>
                            {player.winnings.toLocaleString()} PARC
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {player.win_streak}連勝
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">ランキングデータがありません</h3>
                  <p className="mt-1 text-gray-500">
                    現在この期間のランキングデータはありません。カジノゲームをプレイして最初のランキング入りを目指しましょう！
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/casino/play"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none"
                    >
                      カジノでプレイ
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 報酬情報 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">ランキング報酬</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-xl p-6 shadow-lg">
              <div className="text-xl font-bold flex items-center mb-2">
                <span className="text-white mr-2">1位</span>
                <span>🥇</span>
              </div>
              <ul className="text-sm space-y-1">
                <li>10,000 PARC + 限定バッジ</li>
                <li>VIPステータス（1ヶ月）</li>
                <li>カジノボーナス2倍（2週間）</li>
                <li>特別なプロフィールフレーム</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white rounded-xl p-6 shadow-lg">
              <div className="text-xl font-bold flex items-center mb-2">
                <span className="text-white mr-2">2位</span>
                <span>🥈</span>
              </div>
              <ul className="text-sm space-y-1">
                <li>5,000 PARC + レアバッジ</li>
                <li>VIPステータス（2週間）</li>
                <li>カジノボーナス1.5倍（1週間）</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amber-700 to-amber-800 text-white rounded-xl p-6 shadow-lg">
              <div className="text-xl font-bold flex items-center mb-2">
                <span className="text-white mr-2">3位</span>
                <span>🥉</span>
              </div>
              <ul className="text-sm space-y-1">
                <li>2,500 PARC + バッジ</li>
                <li>VIPステータス（1週間）</li>
                <li>カジノボーナス1.2倍（3日間）</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* ナビゲーションリンク */}
        <div className="flex justify-center gap-6">
          <Link to="/casino" className="text-gray-600 hover:text-amber-600 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            カジノトップに戻る
          </Link>
          <Link 
            to="/casino/play"
            className="text-amber-600 hover:text-amber-700 inline-flex items-center"
          >
            カジノで遊ぶ
            <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CasinoLeaderboard;