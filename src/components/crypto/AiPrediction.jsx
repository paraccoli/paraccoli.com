import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { toast } from 'react-toastify';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  LightBulbIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// モデル定義
const models = [
  {
    id: "hybrid",
    name: "Hybrid LSTM-CNN",
    description: "LSTMとCNNを組み合わせた高度な深層学習モデル",
    icon: "🤖",
    color: "bg-purple-100 text-purple-700",
    imgFolder: "Hybrid", // 画像フォルダ名
  },
  {
    id: "lstm",
    name: "LSTM",
    description: "時系列データに特化した深層学習モデル",
    icon: "🧠",
    color: "bg-blue-100 text-blue-700",
    imgFolder: "LSTM",
  },
  {
    id: "prophet",
    name: "Prophet",
    description: "Metaが開発した時系列予測モデル",
    icon: "📈",
    color: "bg-green-100 text-green-700",
    imgFolder: "Prophet",
  },
  {
    id: "xgboost",
    name: "XGBoost",
    description: "高速で精度の高い勾配ブースティングモデル",
    icon: "🌳",
    color: "bg-yellow-100 text-yellow-700",
    imgFolder: "XGBoost",
  },
  {
    id: "linear",
    name: "線形回帰",
    description: "シンプルで解釈しやすい統計モデル",
    icon: "📊",
    color: "bg-gray-100 text-gray-700",
    imgFolder: "Linear",
  },
  {
    id: "ensemble",
    name: "アンサンブル",
    description: "複数のモデルを組み合わせた総合予測",
    icon: "🎯",
    color: "bg-red-100 text-red-700",
    imgFolder: "ensemble",
  }
];

// モデル選択カード
const ModelCard = ({ model, selected, onClick }) => (
  <div 
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-full ${model.color}`}>
        <span className="text-xl">{model.icon}</span>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{model.name}</h3>
        <p className="text-sm text-gray-600">{model.description}</p>
      </div>
    </div>
  </div>
);

// メインコンポーネント
const AiPrediction = () => {
  const [selectedModel, setSelectedModel] = useState("hybrid");
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [showExampleResult, setShowExampleResult] = useState(false);

  // 選択されたモデルの情報を取得
  const currentModel = models.find(m => m.id === selectedModel);
  
  // モデル固有の予測画像パス
  const getModelImagePath = () => {
    const modelInfo = models.find(m => m.id === selectedModel);
    return `/images/ScreenShot/${modelInfo.imgFolder}/image.png`;
  };
  
  // サンプル価格データ（モデルに応じて変更）
  const getPriceData = () => {
    // モデルごとに異なるサンプルデータを返す
    const basePrice = 1250.00;
    const modelVariations = {
      hybrid: { change: 2.03, confidence: 85 },
      lstm: { change: 1.87, confidence: 82 },
      prophet: { change: 1.45, confidence: 75 },
      xgboost: { change: -0.98, confidence: 78 },
      linear: { change: 0.74, confidence: 65 },
      ensemble: { change: 1.65, confidence: 88 }
    };
    
    const variation = modelVariations[selectedModel];
    const predictedPrice = basePrice * (1 + variation.change / 100);
    
    return {
      currentPrice: basePrice,
      predictedPrice: predictedPrice,
      changePercent: variation.change,
      confidence: variation.confidence,
      minRange: predictedPrice * 0.98,
      maxRange: predictedPrice * 1.02
    };
  };

  // 例示用の予測実行ハンドラー
  const handleShowExample = () => {
    setIsLoading(true);
    
    // 少し遅延して例示を表示
    setTimeout(() => {
      setIsLoading(false);
      setShowExampleResult(true);
      toast.info(`${currentModel.name}モデルの予測例を表示しています`);
    }, 800);
  };

  // 価格データを取得
  const priceData = getPriceData();

  // レンダリング
  return (
    <Card className="p-6">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI価格予測</h2>
            <p className="text-gray-500">高度なAIモデルを活用して未来の価格を予測</p>
          </div>
          <ComputerDesktopIcon className="h-8 w-8 text-blue-500" />
        </div>

        {/* 機能説明メッセージ */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Discordボットで利用可能な機能</h3>
              <p className="text-sm text-yellow-700 mt-1">
                AI価格予測機能はDiscordボット上で動作します。Discordサーバーで <code className="bg-yellow-100 px-1 rounded">/predict</code> コマンドを使用して、PARCの将来の価格を予測できます。
                このページはデモ表示のみとなります。
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左サイド：設定エリア */}
          <div className="space-y-6">
            {/* 時間設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">予測時間（分）</label>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTimeMinutes(Math.max(1, timeMinutes - 5))}
                >-</Button>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="block w-20 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTimeMinutes(Math.min(60, timeMinutes + 5))}
                >+</Button>
                <span className="text-gray-500">分後</span>
              </div>
            </div>

            {/* モデル選択 */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">予測モデルを選択</p>
              <div className="grid gap-3">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    selected={selectedModel === model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowExampleResult(false); // モデルが変わったら結果をリセット
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 使い方ガイド */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                コマンド使用例
              </h3>
              <div className="mt-2 p-3 bg-gray-800 text-gray-100 rounded font-mono text-sm">
                /predict {timeMinutes} {selectedModel}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                上記のコマンドをDiscordサーバーで使用すると、{timeMinutes}分後の価格を{models.find(m => m.id === selectedModel).name}モデルで予測します。
              </p>
            </div>
          </div>

          {/* 右サイド：結果エリア */}
          <div className="border-l border-gray-200 pl-6 space-y-6">
            <div>
              <Button
                variant="primary"
                className="w-full"
                disabled={isLoading}
                onClick={handleShowExample}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>予測例を表示中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span>{currentModel.name}モデルの予測例を見る</span>
                  </div>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                これはデモ表示です。実際にはDiscordで <code className="bg-gray-100 rounded px-1">/predict {timeMinutes} {selectedModel}</code> を使用してください。
              </p>
            </div>

            {/* 予測結果例示 */}
            {showExampleResult && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {currentModel.name}モデルによる予測結果例：
                  </h4>
                  <img 
                    src={getModelImagePath()}
                    alt={`${currentModel.name}モデルの予測結果例`}
                    className="w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/ScreenShot/predict.png";
                      console.log(`モデル画像の読み込みに失敗しました。フォールバック画像を表示します。`);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 italic text-center">
                    ↑ {currentModel.name}モデルによる予測チャート
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">現在価格</p>
                      <p className="text-xl font-bold">¥{priceData.currentPrice.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{timeMinutes}分後の予測価格</p>
                      <p className="text-xl font-bold">¥{priceData.predictedPrice.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    {priceData.changePercent >= 0 ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${priceData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">信頼度</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${priceData.confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm text-gray-600 mt-1">
                      {priceData.confidence.toFixed(1)}%
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">予測範囲</p>
                    <p className="text-sm">
                      ¥{priceData.minRange.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 〜 ¥{priceData.maxRange.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-700 mb-2">💡 AIモデルについて</h3>
          <p className="text-sm text-blue-600">
            PARCの価格予測には様々なAIモデルを使用しています。それぞれのモデルには得意・不得意があるため、複数のモデルを比較すると良いでしょう。
            予測は過去の価格パターン分析に基づいており、市場の急変や外部要因による価格変動を正確に予測できない場合があります。
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AiPrediction;