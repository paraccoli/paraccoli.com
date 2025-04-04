import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { toast } from 'react-toastify';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyYenIcon,
  ChartBarIcon,
  CircleStackIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MarketStat = ({ icon: Icon, label, value, suffix = '', colorClass = 'text-gray-900' }) => (
  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
    <Icon className="h-6 w-6 text-gray-500 mb-2" />
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className={`text-lg font-bold ${colorClass}`}>
      {value}{suffix}
    </div>
  </div>
);

const MarketChart = () => {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const UPDATE_INTERVAL = 60000; // 自動更新間隔: 1分
  const MIN_UPDATE_INTERVAL = 10000; // 手動更新の最小間隔: 10秒

  const fetchMarketData = async (showToast = true) => {
    const now = Date.now();
    // 手動更新の場合、最小更新間隔をチェック
    if (showToast && now - lastUpdate < MIN_UPDATE_INTERVAL) {
      toast.warn(`更新は${MIN_UPDATE_INTERVAL/1000}秒以上の間隔を空けてください`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // API URLを環境変数から取得するか、デフォルト値を使用
      const apiUrl = import.meta.env.VITE_API_URL || 'https://example.com/api';
      const response = await fetch(`${apiUrl}/crypto/market`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`マーケットデータの取得に失敗しました: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setMarketData(result.data);
        setLastUpdate(now);
        if (showToast) {
          toast.success('マーケットデータを更新しました');
        }
      } else {
        throw new Error(result.error || '不正なデータ形式です');
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      setError(error.message);
      if (showToast) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 自動更新の設定
  useEffect(() => {
    // 初回データ取得
    fetchMarketData(false);

    // 定期的な更新を設定
    const interval = setInterval(() => {
      fetchMarketData(false);
    }, UPDATE_INTERVAL);

    // コンポーネントのアンマウント時にクリーンアップ
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PARC/JPY</h2>
            <p className="text-sm text-gray-500">
              最終更新: {marketData?.timestamp ? 
                new Date(marketData.timestamp * 1000).toLocaleString() : '-'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => fetchMarketData(true)}
            disabled={isLoading || Date.now() - lastUpdate < MIN_UPDATE_INTERVAL}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>更新中...</span>
              </>
            ) : (
              <>
                <ChartBarIcon className="h-4 w-4" />
                <span>更新</span>
              </>
            )}
          </Button>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : !marketData ? (
          <div className="text-center text-gray-600 p-4 bg-gray-50 rounded-lg">
            データを取得するには更新ボタンを押してください
          </div>
        ) : (
          <>
            {/* 統計グリッド */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MarketStat
                icon={CurrencyYenIcon}
                label="現在価格"
                value={`¥${marketData.price.current.toLocaleString()}`}
              />
              <MarketStat
                icon={marketData.price.change_rate >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
                label="24時間変動"
                value={`${marketData.price.change_rate.toFixed(2)}%`}
                colorClass={marketData.price.change_rate >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <MarketStat
                icon={ChartBarIcon}
                label="24時間出来高"
                value={marketData.volume['24h'].toLocaleString()}
                suffix=" PARC"
              />
              <MarketStat
                icon={CircleStackIcon}
                label="時価総額"
                value={`¥${(marketData.market_cap / 1000000).toFixed(2)}M`}
              />
            </div>

            {/* チャート */}
            {marketData.chart ? (
              <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <img
                  src={`data:image/png;base64,${marketData.chart}`}
                  alt="Price Chart"
                  className="w-full rounded-lg"
                  onError={(e) => {
                    console.error('画像読み込みエラー');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="mt-6 p-4 text-center text-gray-600 bg-gray-50 rounded-lg">
                チャートデータが利用できません
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default MarketChart;