import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { FaBitcoin, FaEthereum, FaPatreon, FaCopy, FaDiscord, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// サポータープラン設定
const supporterTiers = [
  {
    name: 'Bronze',
    price: '$3',
    color: 'from-amber-400 to-amber-600',
    icon: '🥉',
    benefits: [
      'サポーター専用Discordロール',
      '開発の舞台裏を公開',
      'サポーター専用チャンネルへのアクセス'
    ],
    description: '基本的なサポートプラン。プロジェクトの成長を支援できます。'
  },
  {
    name: 'Silver',
    price: '$10',
    color: 'from-slate-300 to-slate-500',
    icon: '🥈',
    benefits: [
      'Bronze特典すべて',
      '新機能のベータテスト参加権',
      'ゲーム内ボーナス (月額500 PARC)',
      'PARCウェブサイトでの名前掲載'
    ],
    description: '中級サポートプラン。特別な機能を先行体験できます。',
    featured: true
  },
  {
    name: 'Gold',
    price: '$25',
    color: 'from-yellow-300 to-yellow-500',
    icon: '🥇',
    benefits: [
      'Silver特典すべて',
      'ギルド用カスタムバナー設定',
      'VIPカジノアクセス権',
      'プロジェクト方針への投票権',
      '月額1500 PARCボーナス'
    ],
    description: '最上位サポートプラン。PARCの開発に大きく貢献します。'
  }
];

// 寄付方法（GitHubとPayPalを削除）
const donationMethods = [
  {
    name: 'Patreon',
    icon: <FaPatreon className="text-[#FF424D] text-5xl" />,
    description: 'Patreonで定期サポート',
    url: 'https://www.patreon.com/Paraccoli',
    primary: true,
    instructions: [
      '毎月定額のサポートが可能',
      '各種特典にアクセス可能',
      'クレジットカードで簡単決済'
    ]
  },
  {
    name: 'Discord',
    icon: <FaDiscord className="text-[#5865F2] text-5xl" />,
    description: 'Discordで詳細を確認',
    url: {process.env.DISCORD_INVITE_URL || "#"},
    instructions: [
      'サーバーに参加して詳細を確認',
      'サポーターロールを獲得する方法を案内',
      'コミュニティメンバーと交流'
    ]
  },
  {
    name: 'Bitcoin',
    icon: <FaBitcoin className="text-[#f7931a] text-5xl" />,
    description: 'ビットコインで寄付',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    instructions: [
      '匿名での寄付が可能',
      '国際送金に最適',
      '特典希望の場合はDiscordで連絡',
      'トランザクションを確認後特典付与'
    ]
  },
  {
    name: 'Ethereum',
    icon: <FaEthereum className="text-[#3c3c3d] text-5xl" />,
    description: 'イーサリアムで寄付',
    address: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852',
    instructions: [
      'ETHおよびERC-20トークン対応',
      'スマートコントラクト連携可能',
      '特典希望の場合はDiscordで連絡',
      'トランザクションを確認後特典付与'
    ]
  }
];

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const DonateCard = () => {
  const [hoveredTier, setHoveredTier] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type}アドレスをコピーしました！`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: "#10B981",
          color: "#FFFFFF"
        }
      });
    }).catch(() => {
      toast.error('コピーに失敗しました');
    });
  };

  return (
    <motion.div 
      className="space-y-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ヘッダーセクション */}
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Project Paraccoli【PARC】をサポートする
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          あなたの支援がPARCの未来を創ります。
          ゲームの発展とコミュニティの成長にご協力ください。
        </p>
      </motion.div>

      {/* サポータープランセクション */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="text-4xl mr-2">🏆</span> PARCサポーター特典
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたの支援が、新しいゲーム開発につながります！
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {supporterTiers.map((tier, index) => (
            <motion.div 
              key={index} 
              className="flex"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03,
                transition: { type: "spring", stiffness: 300 }
              }}
              onHoverStart={() => setHoveredTier(index)}
              onHoverEnd={() => setHoveredTier(null)}
            >
              <Card className={`flex flex-col w-full relative overflow-hidden ${
                tier.featured ? 'shadow-xl ring-2 ring-blue-500' : 'shadow-md'
              }`}>
                {tier.featured && (
                  <div className="absolute -top-1 -right-12 transform rotate-45 bg-blue-600 text-white py-1 px-12">
                    <span className="text-sm font-medium">人気</span>
                  </div>
                )}
                
                <div className={`bg-gradient-to-r ${tier.color} text-white p-6 rounded-t-lg relative overflow-hidden`}>
                  <motion.div 
                    className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-0"
                    animate={{
                      opacity: hoveredTier === index ? 0.1 : 0
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <span className="text-3xl">{tier.icon}</span>
                  </div>
                  <div className="mt-2 text-3xl font-bold">
                    {tier.price}<span className="text-sm font-normal">/月</span>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900 mb-3">特典内容:</h4>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-start"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0, 
                            transition: { delay: i * 0.1 + 0.2 } 
                          }}
                        >
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      className="w-full group relative overflow-hidden"
                      onClick={() => window.location.href = 'https://www.patreon.com/Paraccoli'}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        サポートする
                        <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* 寄付方法セクション */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="text-4xl mr-2">💰</span> サポート方法
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたに合った方法でプロジェクトを支援できます
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {donationMethods.map((method, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              onClick={() => setSelectedMethod(selectedMethod === index ? null : index)}
            >
              <Card className={`p-6 flex flex-col h-full cursor-pointer transition-all ${
                method.primary ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100' : ''
              } ${selectedMethod === index ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="text-center mb-6">
                  <motion.div 
                    className="flex justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {method.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900">{method.name}</h3>
                  <p className="text-gray-600 mt-2">{method.description}</p>
                </div>

                <motion.div 
                  className="flex-grow space-y-4"
                  initial={{ height: selectedMethod === index ? "auto" : 0 }}
                  animate={{ 
                    height: selectedMethod === index ? "auto" : "auto",
                    transition: { duration: 0.3 }
                  }}
                >
                  {method.address && (
                    <div className="text-center">
                      <motion.div 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <code className="text-sm text-gray-700 break-all">
                          {method.address}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(method.address, method.name);
                          }}
                          className="ml-2 p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-white"
                          title="アドレスをコピー"
                        >
                          <FaCopy />
                        </button>
                      </motion.div>
                    </div>
                  )}
                  
                  {method.url && (
                    <div className="text-center mt-4">
                      <Button
                        variant={method.primary ? "primary" : "secondary"}
                        className="w-full group relative overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = method.url;
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {method.description}
                          <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                      </Button>
                    </div>
                  )}
                  
                  <ul className="space-y-2 mt-4">
                    {method.instructions.map((instruction, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          transition: { delay: i * 0.1 } 
                        }}
                      >
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-600">{instruction}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* 寄付金の使途 */}
      <motion.div variants={itemVariants}>
        <Card className="p-8 bg-gradient-to-b from-gray-50 to-white border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              寄付金の使途
            </h3>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              皆様からのご支援は以下の目的に活用させていただきます
            </p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            <motion.div 
              className="text-center group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🛠️</div>
              <h4 className="text-xl font-semibold mb-2">サーバー運用費</h4>
              <p className="text-gray-600">
                APIサービス、サーバーレンタル、開発環境の維持費用
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎮</div>
              <h4 className="text-xl font-semibold mb-2">新機能開発</h4>
              <p className="text-gray-600">
                新ゲームモード、インターフェース改善、AI機能などの開発
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🎉</div>
              <h4 className="text-xl font-semibold mb-2">コミュニティイベント</h4>
              <p className="text-gray-600">
                各種コンテスト、トーナメントの開催、ギルド対抗戦の報酬
              </p>
            </motion.div>
          </motion.div>
        </Card>

        {/* サポーター声掛け */}
        <motion.div 
          className="mt-12 text-center"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-lg text-gray-700 font-medium mb-6">
            あなたのサポートがPARACCOLIの未来を作ります。今日から仲間になりませんか？
          </p>
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-3 text-lg group relative overflow-hidden"
            onClick={() => window.location.href = {process.env.DISCORD_INVITE_URL || "#"}}
          >
            <span className="relative z-10 flex items-center justify-center">
              Discordに参加する
              <FaDiscord className="ml-2 text-xl" />
            </span>
            <span className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DonateCard;