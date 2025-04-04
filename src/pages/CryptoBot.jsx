import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Section from '../components/shared/Section';
import CryptoOverview from '../components/crypto/CryptoOverview';
import MarketChart from '../components/crypto/MarketChart';
import AiPrediction from '../components/crypto/AiPrediction';
import Button from '../components/shared/Button';

// Section.Header コンポーネントの作成
Section.Header = ({ children }) => (
  <div className="text-center mb-12">{children}</div>
);

// Section.Title コンポーネントの作成
Section.Title = ({ children }) => (
  <h2 className="text-3xl font-bold text-gray-900 mb-4">{children}</h2>
);

// Section.Description コンポーネントの作成
Section.Description = ({ children }) => (
  <p className="text-xl text-gray-600 max-w-2xl mx-auto">{children}</p>
);

const features = [
  {
    title: 'スポット取引',
    description: '基本的な売買取引を行えます。市場価格での取引や指値注文が可能です。'
  },
  {
    title: '価格アラート',
    description: '指定した価格に達した時に通知を受け取れます。'
  },
  {
    title: 'ポートフォリオ管理',
    description: '保有資産の状況や損益をリアルタイムで確認できます。'
  }
];

const CryptoBot = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      <CryptoOverview />

      {/* マーケットデータセクション */}
      <Section id="market-data">
        <Section.Header>
          <Section.Title>リアルタイム市場データ</Section.Title>
          <Section.Description>
            PARCの市場情報をリアルタイムで確認できます
          </Section.Description>
        </Section.Header>
        
        <div className="mt-8">
          {isAuthenticated ? (
            <MarketChart />
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-xl font-medium text-blue-800 mb-3">
                リアルタイムデータを見るにはログインが必要です
              </h3>
              <p className="text-blue-600 mb-4">
                PARCの詳細な市場データやAI予測機能はログイン後にご利用いただけます。
              </p>
              <Link to="/login">
                <Button variant="primary">Discordでログイン</Button>
              </Link>
            </div>
          )}
        </div>
      </Section>

      {/* AIによる価格予測セクション */}
      <Section id="ai-prediction">
        <Section.Header>
          <Section.Title>AIによる価格予測</Section.Title>
          <Section.Description>
            高度なAIモデルを使用して将来の価格を予測します
          </Section.Description>
        </Section.Header>
        
        <div className="mt-8">
          {isAuthenticated ? (
            <AiPrediction />
          ) : (
            <div className="bg-indigo-50 p-6 rounded-lg text-center">
              <h3 className="text-xl font-medium text-indigo-800 mb-3">
                AI予測機能を使うにはログインが必要です
              </h3>
              <p className="text-indigo-600 mb-4">
                高度なAIモデルによる価格予測はログイン後にご利用いただけます。
              </p>
              <Link to="/login">
                <Button variant="primary">Discordでログイン</Button>
              </Link>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default CryptoBot;