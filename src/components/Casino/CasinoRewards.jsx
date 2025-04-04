import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GiftIcon, TrophyIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const CasinoRewards = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            <GiftIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">カジノ報酬プログラム</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paraccoli Casinoでは、プレイするほど特典が増えていきます。
            様々な報酬をゲットして、さらにゲームを楽しみましょう！
          </p>
        </motion.div>
        
        {/* デイリーボーナス */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-10"
            variants={itemVariants}
          >
            日々の報酬
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <div className="flex items-center mb-4">
                <div className="bg-amber-500 p-3 rounded-full mr-4">
                    <StarIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">デイリーボーナス</h2>
              </div>
              
              <motion.p variants={itemVariants} className="text-gray-600 mb-4">
                毎日Discordで <code className="bg-gray-100 px-2 py-1 rounded">/daily</code> コマンドを使用すると、無料チップを獲得できます。
                連続ログイン日数に応じてボーナスが増加します！
              </motion.p>
              
              <motion.ul variants={itemVariants} className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>初日: <strong>50 PARC</strong></span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>3日連続: <strong>100 PARC</strong></span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>7日連続: <strong>250 PARC</strong></span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>30日連続: <strong>1000 PARC + 特別バッジ</strong></span>
                </li>
              </motion.ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-6 rounded-xl text-white text-center shadow-md">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-xl font-bold mb-2">今すぐボーナスを受け取ろう！</h3>
                <p className="mb-4">Discordで <code className="bg-white bg-opacity-20 px-2 py-1 rounded">/daily</code> を実行</p>
                <a 
                  href={process.env.DISCORD_INVITE_URL || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-amber-600 px-6 py-2 rounded-lg inline-block font-medium hover:bg-gray-100 transition"
                >
                  Discordに参加
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>
        
        {/* ランキング報酬 */}
        <motion.section 
          className="mb-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-8 text-white"
          variants={containerVariants}
          initial="hidden" 
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-10"
            variants={itemVariants}
          >
            <TrophyIcon className="w-8 h-8 inline mb-1 mr-2" />
            ランキング報酬
          </motion.h2>
          
          <motion.p 
            className="text-center text-lg mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            毎月のカジノランキングで上位に入ると、豪華報酬が獲得できます！
            上位3名には特別な特典が用意されています。
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-300 text-white rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-2">
                  <span className="text-2xl">🥇</span>
                  <h3 className="text-xl font-bold ml-2">1位報酬</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>10,000 PARC + 限定バッジ</li>
                  <li>VIPステータス（1ヶ月）</li>
                  <li>カジノボーナス2倍（2週間）</li>
                  <li>特別なプロフィールフレーム</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white rounded-xl p-6 shadow-md mt-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl">🥈</span>
                  <h3 className="text-xl font-bold ml-2">2位報酬</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>5,000 PARC + レアバッジ</li>
                  <li>VIPステータス（2週間）</li>
                  <li>カジノボーナス1.5倍（1週間）</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-xl p-6 shadow-md mt-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl">🥉</span>
                  <h3 className="text-xl font-bold ml-2">3位報酬</h3>
                </div>
                <ul className="space-y-1 text-sm">
                  <li>2,500 PARC + バッジ</li>
                  <li>VIPステータス（1週間）</li>
                  <li>カジノボーナス1.2倍（3日間）</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 特別イベント */}
        <motion.section
          className="mb-16"
          variants={containerVariants}
          initial="hidden" 
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-10"
            variants={itemVariants}
          >
            <UserGroupIcon className="w-8 h-8 inline mb-1 mr-2" />
            特別イベント
          </motion.h2>
          
          <motion.p 
            className="text-center text-lg mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            定期的に開催される特別イベントでは、通常では手に入らない限定報酬が獲得できます。
            開催情報はDiscordで確認できます。
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="text-xl font-bold mb-2">カジノナイト</h3>
              <p className="text-gray-600 mb-4">毎週金曜の夜に開催される特別イベント。勝率アップボーナスがもらえます！</p>
              <span className="text-amber-600 font-medium">参加報酬: ボーナスチップ 100 PARC</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-xl font-bold mb-2">トーナメント</h3>
              <p className="text-gray-600 mb-4">マンスリートーナメントで他のプレイヤーと競争！上位入賞者には特別報酬が！</p>
              <span className="text-amber-600 font-medium">優勝賞金: 10,000 PARC</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="text-xl font-bold mb-2">ギフトラッシュ</h3>
              <p className="text-gray-600 mb-4">不定期開催！プレイヤーにランダムで豪華賞品をプレゼント！</p>
              <span className="text-amber-600 font-medium">賞品: 限定NFT & PARC</span>
            </motion.div>
          </div>
        </motion.section>
        
        {/* VIP特典 */}
        <motion.section
          className="mb-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-10 text-white"
          variants={containerVariants}
          initial="hidden" 
          animate="visible"
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            variants={itemVariants}
          >
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">VIP特典プログラム</h2>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-gray-300 mb-8">
            Paraccoli CasinoのVIPメンバーになると、様々な特別特典が受けられます。
            VIPレベルは、カジノでのプレイ頻度や賭け金額に応じて上昇します。
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="text-lg font-bold mb-1">専用チャンネル</h3>
              <p className="text-sm text-gray-300">VIPメンバー限定Discordチャンネル</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-4xl mb-2">🎰</div>
              <h3 className="text-lg font-bold mb-1">カジノボーナス</h3>
              <p className="text-sm text-gray-300">すべてのゲームで勝利配当が1.2倍に</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-4xl mb-2">👑</div>
              <h3 className="text-lg font-bold mb-1">特別バッジ</h3>
              <p className="text-sm text-gray-300">プロフィール用の限定VIPバッジ</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-lg font-bold mb-1">優先アクセス</h3>
              <p className="text-sm text-gray-300">新機能への優先アクセス権</p>
            </motion.div>
          </div>
        </motion.section>

        {/* ナビゲーションリンク */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <Link to="/casino" className="text-gray-600 hover:text-amber-600 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            カジノトップに戻る
          </Link>
          <Link to="/casino/play" className="text-amber-600 hover:text-amber-700 inline-flex items-center">
            カジノで遊ぶ
            <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CasinoRewards;