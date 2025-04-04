import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import CommunityStats from '../components/home/CommunityStats';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { 
  CurrencyYenIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [isMarketLoading, setIsMarketLoading] = useState(true); // 初期値をtrueに変更

  // PARC市場データを取得
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMarketData();
    }
  }, [isAuthenticated, user]);

  // 市場データ取得関数
  const fetchMarketData = async () => {
    try {
      setIsMarketLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://example.com/api';
      const response = await fetch(`${apiUrl}/crypto/market`, {
        headers: {
          'Cache-Control': 'no-cache', // キャッシュを無効化
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          setMarketData(responseData.data); // APIレスポンス構造に合わせて修正
        } else {
          console.error('市場データのフォーマットが不正です:', responseData);
          // フォールバックデータを設定
          setMarketData({
            price: {
              current: 1250,
              change_rate: 0.0
            }
          });
        }
      } else {
        console.error('市場データの取得に失敗しました:', response.status);
        // エラー時のフォールバックデータ
        setMarketData({
          price: {
            current: 1250,
            change_rate: 0.0
          }
        });
      }
    } catch (error) {
      console.error('市場データ取得エラー:', error);
      // 例外時のフォールバックデータ
      setMarketData({
        price: {
          current: 1250,
          change_rate: 0.0
        }
      });
    } finally {
      setIsMarketLoading(false);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済みユーザーダッシュボード
  if (isAuthenticated && user) {
    // ダッシュボード上部に表示するアクションカード
    const quickActions = [
      { 
        title: "仮想通貨取引", 
        description: "PARCの売買、市場分析、AIによる予測", 
        icon: <CurrencyYenIcon className="w-8 h-8 text-blue-500" />,
        path: "/crypto",
        color: "bg-gradient-to-br from-blue-500 to-blue-600"
      },
      { 
        title: "ギルド経営", 
        description: "会社設立、メンバー管理、資産運用", 
        icon: <BriefcaseIcon className="w-8 h-8 text-emerald-500" />,
        path: "/guild",
        color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
      },
      { 
        title: "コミュニティ", 
        description: "フォーラムで他のユーザーと交流", 
        icon: <UserGroupIcon className="w-8 h-8 text-purple-500" />,
        path: "/forums",
        color: "bg-gradient-to-br from-purple-500 to-purple-600"
      },
      { 
        title: "クエスト", 
        description: "デイリー・ウィークリーミッションに挑戦", 
        icon: <ChartBarIcon className="w-8 h-8 text-amber-500" />,
        path: "/quests",
        color: "bg-gradient-to-br from-amber-500 to-amber-600"
      }
    ];
    
    // サブアクションカード（下部に表示）
    const subActions = [
      { 
        title: "PARC交換", 
        icon: "💱", 
        path: "/exchange" 
      },
      { 
        title: "ドキュメント", 
        icon: "📚", 
        path: "/docs" 
      },
      { 
        title: "プロフィール", 
        icon: "👤", 
        path: "/profile" 
      },
      { 
        title: "通知", 
        icon: "🔔", 
        path: "/notifications" 
      }
    ];
    
    return (
      <>
        {/* ヒーローセクション - ユーザー情報 */}
        <Section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* ユーザー情報 */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.username || 'ユーザー'}さん、おかえりなさい！
                  </h1>
                  <p className="text-gray-600">Discord ID: {user.discord_id}</p>
                </div>
              </div>
              
              {/* 残高表示 */}
              <div className="mt-6 md:mt-0 flex items-center space-x-2 bg-white px-6 py-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center bg-blue-100 w-10 h-10 rounded-full">
                  <CurrencyYenIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">PARC残高</p>
                  <p className="text-xl font-bold text-blue-600">{user.balance || 0} PARC</p>
                </div>
              </div>
            </div>
            
            {/* アクティビティサマリー */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">最終ログイン</p>
                <p className="font-medium">{new Date(user.last_login).toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">アカウント作成日</p>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">交換したPARC数</p>
                <p className="font-medium">{user.exchanged_parc || 0} PARC</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">PARC/JPY価格</p>
                {isMarketLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent mr-2"></div>
                    <span>取得中...</span>
                  </div>
                ) : marketData?.price?.current ? (
                  <div className="flex items-center">
                    <p className="font-medium">¥{marketData.price.current.toLocaleString()}</p>
                    <span className={`ml-2 text-sm ${marketData.price.change_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marketData.price.change_rate >= 0 ? '▲' : '▼'} {Math.abs(marketData.price.change_rate || 0).toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <p className="font-medium">¥1,250 <span className="text-sm text-gray-500">(オフライン)</span></p>
                )}
              </div>
            </div>
            
            {/* リアルタイムチャートへのリンク */}
            <div className="mt-4">
              <Link 
                to="/crypto#market-data" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ChartBarIcon className="h-5 w-5 mr-1" />
                リアルタイムチャートを見る
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </Section>
        
        {/* メインアクションエリア */}
        <Section className="py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Project Paraccoliでできること</h2>
            
            {/* メインアクション */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path}>
                  <div className="h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* カラーバー */}
                    <div className={`h-2 ${action.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg mr-4">
                          {action.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* サブアクション */}
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">クイックアクセス</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {subActions.map((action, index) => (
                  <Link key={index} to={action.path}>
                    <Card className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                      <div className="text-2xl mr-3">{action.icon}</div>
                      <span className="font-medium">{action.title}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Section>
        
        {/* ニュースとイベント */}
        <Section className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">最新情報</h2>
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex items-center"
                onClick={fetchMarketData}
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                更新
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">

              {/* ヘルプとサポート */}
              <Card>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                  ヘルプとサポート
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/docs" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-500" />
                      <span>ユーザーガイド</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/feedback" className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <CogIcon className="w-5 h-5 mr-3 text-gray-500" />
                      <span>フィードバック送信</span>
                    </Link>
                  </li>
                  <li>
                    <a 
                      href={process.env.DISCORD_INVITE_URL || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <UserGroupIcon className="w-5 h-5 mr-3 text-gray-500" />
                      <span>Discordコミュニティに参加</span>
                    </a>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Section>
      </>
    );
  }

  // 未認証ユーザー向けのランディングページ
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CommunityStats />
    </>
  );
};

export default Home;