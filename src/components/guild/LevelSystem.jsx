import React from 'react';
import Card from '../shared/Card';

const levels = [
  {
    level: '初級',
    range: 'レベル 1-10',
    benefits: [
      '基本的な取引機能',
      'ギルド参加権限',
      '基本報酬レート'
    ],
    icon: '🌱'
  },
  {
    level: '中級',
    range: 'レベル 11-30',
    benefits: [
      '取引限度額増加',
      'ギルド作成権限',
      '報酬レート1.2倍'
    ],
    icon: '⚔️'
  },
  {
    level: '上級',
    range: 'レベル 31-50',
    benefits: [
      '特別取引機能解放',
      '企業設立権限',
      '報酬レート1.5倍'
    ],
    icon: '👑'
  }
];

const LevelSystem = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          レベルシステム
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          活動に応じてレベルアップし、より多くの特典を獲得しよう
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((level, index) => (
          <Card key={index} className="text-center">
            <div className="text-4xl mb-4">{level.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {level.level}
            </h3>
            <p className="text-blue-600 font-medium mb-4">
              {level.range}
            </p>
            <ul className="space-y-2 text-gray-600 text-left">
              {level.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center">
                  <span className="mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          レベルアップ方法
        </h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            以下のアクティビティでレベル経験値を獲得できます：
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="text-blue-600">•</span>
              <span>メッセージ送信（1XP）</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="text-blue-600">•</span>
              <span>ボイスチャット参加（5XP/分）</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="text-blue-600">•</span>
              <span>取引実行（10XP）</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-600">
              <span className="text-blue-600">•</span>
              <span>イベント参加（50XP）</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default LevelSystem;