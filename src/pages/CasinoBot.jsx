import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CasinoOverview from '../components/Casino/CasinoOverview';
import { 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// アニメーション用のバリアント定義
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

// タブオプション定義を修正
const tabOptions = [
  { id: 'overview', label: 'カジノトップ', icon: <PlayIcon className="w-5 h-5" />, isDefault: true },
  { id: 'play', label: 'プレイする', icon: <PlayIcon className="w-5 h-5" />, routerLink: '/casino/play' },
  { id: 'ranking', label: 'ランキング', icon: <TrophyIcon className="w-5 h-5" />, routerLink: '/casino/leaderboard' },
  { id: 'faq', label: 'よくある質問', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
];

// FAQ データ
const faqData = [
  {
    question: 'PARCとJPYの違いは何ですか？',
    answer: 'PARCはParaccoli独自の仮想通貨で、JPYは日本円をモデルにした仮想通貨です。どちらもカジノゲームで使用可能です。'
  },
  {
    question: 'ゲームの結果はフェアですか？',
    answer: '全てのゲーム結果は暗号化された乱数生成（RNG）によって決定されており、完全に公平です。結果操作は技術的に不可能な仕組みになっています。'
  },
  {
    question: 'カジノで獲得した報酬はどのように使えますか？',
    answer: '獲得した仮想通貨は、専用のPARC交換所でDiscord内で取引できるPARCに変換できます。'
  },
  {
    question: '問題が発生した場合のサポート方法は？',
    answer: 'Discordサーバー内の「サポート」チャンネルで質問を投稿するか、/form報告できます。通常24時間以内に運営チームが対応します。'
  }
];

// コミュニティイベントデータ
const communityEvents = [
  {
    title: '週末ジャックポットレース 🏆',
    description: '週末限定！最も多く勝利したプレイヤーにボーナス付き！',
    date: '毎週土日',
    url: {process.env.DISCORD_INVITE_URL || "#"},
  },
  {
    title: '初心者向けカジノナイト 🎯',
    description: '新規プレイヤー向けの特別イベント！運営メンバーが戦略をレクチャー',
    date: '毎週水曜日',
    url: {process.env.DISCORD_INVITE_URL || "#"},
  },
  {
    title: '月間トーナメント 🏅',
    description: '月間ランキング上位者には特別報酬をプレゼント！',
    date: '毎月開催',
    url: {process.env.DISCORD_INVITE_URL || "#"},
  }
];

const CasinoBot = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ログインしていない場合のプロンプト表示
  useEffect(() => {
    if (!isAuthenticated && activeTab === 'play') {
      setShowLoginPrompt(true);
    } else {
      setShowLoginPrompt(false);
    }
  }, [activeTab, isAuthenticated]);

  // タブコンテンツのレンダリング
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CasinoOverview />;
        
      case 'faq':
        return (
          <motion.div
            className="max-w-4xl mx-auto py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            variants={containerVariants}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">よくある質問</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                カジノゲームに関するよくある質問をまとめました。
                さらに質問がある場合は、Discordの「サポート」チャンネルでお問い合わせください。
              </p>
            </div>
            
            <div className="space-y-6">
              {faqData.map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md"
                  variants={itemVariants}
                  whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                >
                  <h3 className="text-xl font-bold mb-3">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <a 
                href={process.env.DISCORD_INVITE_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 font-medium hover:underline inline-flex items-center"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                他にも質問がありますか？Discordでサポートチームに聞いてみましょう
              </a>
            </div>
          </motion.div>
        );
        
      case 'community':
        return (
          <motion.div
            className="max-w-4xl mx-auto py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            variants={containerVariants}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">カジノコミュニティ</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Paraccoliカジノでは定期的に様々なイベントを開催しています。
                他のプレイヤーと交流しながら、特別な報酬をゲットしましょう！
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {communityEvents.map((event, index) => (
                <motion.a
                  key={index}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-xl shadow-md block hover:no-underline"
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-3">{event.description}</p>
                  <div className="mt-4 text-amber-600 font-medium flex items-center">
                    <span>詳細を見る</span>
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.a>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Discordコミュニティに参加しよう！</h3>
              <p className="mb-6 max-w-lg mx-auto">
                10,000人以上のメンバーが参加するコミュニティで、戦略を共有したり、最新のイベント情報をチェックしましょう！
              </p>
              <a 
                href={process.env.DISCORD_INVITE_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-amber-600 px-6 py-3 rounded-xl font-medium inline-flex items-center hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
                </svg>
                今すぐ参加
              </a>
            </div>
          </motion.div>
        );
        
      default:
        return <CasinoOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-1.5 flex"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {tabOptions.map((tab) => (
              <motion.button
                key={tab.id}
                className={`px-6 py-3 rounded-lg flex items-center whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-md' 
                    : 'text-gray-600 hover:bg-amber-50'
                }`}
                onClick={() => {
                  // Reactルーターを使用したナビゲーション
                  if (tab.routerLink) {
                    navigate(tab.routerLink);
                  } else {
                    // 通常のタブ切り替え
                    setActiveTab(tab.id);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* タブコンテンツ */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CasinoBot;