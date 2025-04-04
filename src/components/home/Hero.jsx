import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CurrencyYenIcon, TrophyIcon, UserGroupIcon, BuildingOfficeIcon, RocketLaunchIcon, 
  BriefcaseIcon, GiftIcon, StarIcon, DocumentTextIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '../shared/Button';

const Hero = () => {
  const [isHovering, setIsHovering] = useState(null);
  
  // アニメーション設定
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.03, 
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -5px rgba(59, 130, 246, 0.1)"
    }
  };

  // 特典リスト
  const benefits = [
    {
      icon: <GiftIcon className="h-6 w-6 text-yellow-500" />,
      title: "初回ボーナス",
      description: "100 PARC & 100,000 JPYを登録時に即付与",
      color: "bg-yellow-100"
    },
    {
      icon: <TrophyIcon className="h-6 w-6 text-purple-500" />,
      title: "先行ユーザー限定イベント",
      description: "ランキング上位で追加報酬をゲット",
      color: "bg-purple-100"
    },
    {
      icon: <UserGroupIcon className="h-6 w-6 text-blue-500" />,
      title: "開発者と直接コミュニケーション",
      description: "あなたの意見が反映されやすい環境",
      color: "bg-blue-100"
    },
    {
      icon: <StarIcon className="h-6 w-6 text-pink-500" />,
      title: "限定称号・バッジ",
      description: "正式リリース時に付与予定",
      color: "bg-pink-100"
    }
  ];

  // ゲーム機能紹介
  const features = [
    {
      icon: <CurrencyYenIcon className="h-10 w-10 text-blue-500" />,
      title: "Paraccoli Crypto",
      description: "仮想通貨取引シミュレーション",
      path: "/crypto",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <BuildingOfficeIcon className="h-10 w-10 text-emerald-500" />,
      title: "Paraccoli Guild",
      description: "ギルド（会社）経営シミュレーション",
      path: "/guild",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <ChartBarIcon className="h-10 w-10 text-amber-500" />,
      title: "Paraccoli Casino",
      description: "カジノゲームで一攫千金",
      path: "/casino",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <UserGroupIcon className="h-10 w-10 text-purple-500" />,
      title: "フォーラム・コミュニティ",
      description: "他のプレイヤーと情報交換",
      path: "/forums",
      color: "from-purple-500 to-fuchsia-600"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* 装飾的な背景要素 */}
      <motion.div 
        className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute -bottom-32 -left-16 w-96 h-96 bg-indigo-300 rounded-full opacity-20 blur-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
      />
      <motion.div 
        className="absolute top-60 -left-20 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.6 }}
      />
      
      {/* メインコンテンツ */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          {/* ヘッダー部分 */}
          <motion.div variants={itemVariants} className="inline-block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 mb-4">
              <span className="mr-1">✨</span> 先行アクセス期間
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="block">🎉 先行ユーザーの皆様へ</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              Project Paraccoli へようこそ！
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl font-bold text-blue-800 mb-2 mt-6">
            あなたはProject Paraccoliの初期メンバーです！
          </motion.p>
          
          <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-3xl mx-auto">
            この先行アクセス期間中に、いち早く新機能を体験し、開発にフィードバックを提供できます。
            特別なボーナスやイベントに参加するチャンスもあります！
          </motion.p>
        </motion.div>

        {/* 先行ユーザー特典 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center mb-8">
            <span className="inline-block animate-bounce mr-2">🚀</span> 
            先行ユーザー特典
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <div className="p-5">
                  <div className={`rounded-full ${benefit.color} p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 遊び方・機能紹介 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center mb-8">
            <span className="inline-block animate-pulse mr-2">📖</span>
            Paraccoliでできること
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                variants={itemVariants}
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
              >
                <Link 
                  to={feature.path}
                  className="block h-full"
                >
                  <motion.div 
                    className="h-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {feature.icon}
                        <motion.div 
                          className="bg-gray-100 rounded-full p-1"
                          animate={{ x: isHovering === index ? 5 : 0 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTAセクション */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-8">
            <span className="inline-block animate-pulse mr-2">⚡</span>
            今すぐ始めよう
          </motion.h2>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/login">
              <motion.button
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                ログインしてゲームを始める
              </motion.button>
            </Link>
            
            <a href={process.env.DISCORD_INVITE_URL || "#"} target="_blank" rel="noopener noreferrer">
              <motion.button
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" />
                </svg>
                公式Discordに参加する
              </motion.button>
            </a>
            
            <Link to="/about">
              <motion.button
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                初心者ガイドを見る
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* フィードバック募集 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm"
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                <span className="inline-block animate-bounce mr-2">📩</span>
                フィードバック募集中！
              </h3>
              <p className="text-gray-600">
                バグ報告・改善提案は <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">/form</code> から！<br />
                あなたの意見がProject Paraccoliをより良くします！
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img 
                src="/logo.svg" 
                alt="Paraccoli Logo" 
                className="h-20 w-20 object-contain"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;