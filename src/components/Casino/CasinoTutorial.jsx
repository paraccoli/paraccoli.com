import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

// ゲーム説明データ
const games = [
  {
    id: 'slot',
    title: 'スロットマシン 🎰',
    description: '3つのリールが揃うと配当金を獲得できるゲームです。',
    howToPlay: [
      '/slot [BET金額] コマンドを使用して賭けます',
      '3つの同じシンボルが揃うと勝利です',
      '特定の組み合わせによって配当倍率が変わります',
      '777（ジャックポット）は賭け金の100倍の配当'
    ],
    tips: [
      '少額から始めて様子を見ましょう',
      '予算を決めて遊ぶことをお勧めします',
      'ジャックポットは低確率ですが、大きな払い戻しがあります'
    ],
    command: '/slot [金額]',
    example: '/slot 10'
  },
  {
    id: 'roulette',
    title: 'ルーレット 🎡',
    description: '数字や色に賭けて、ボールが止まる場所を当てるゲームです。',
    howToPlay: [
      '/roulette [BET金額] [赤/黒/数字] コマンドを使用',
      '赤か黒に賭けると2倍の配当',
      '単一の数字に賭けると36倍の配当',
      'ボールが賭けた場所に止まれば勝利です'
    ],
    tips: [
      '確率が高い赤/黒の賭けから始めるとよいでしょう',
      '一度に複数の賭けを分散させるのも戦略の一つです',
      '数字賭けはリスクが高いですが、配当も高くなります'
    ],
    command: '/roulette [金額] [赤/黒/数字]',
    example: '/roulette 10 赤'
  },
  {
    id: 'blackjack',
    title: 'ブラックジャック 🃏',
    description: 'カードの合計が21に近づけるゲームで、ディーラーより高い点数を目指します。',
    howToPlay: [
      '/blackjack [BET金額] コマンドで開始',
      '最初に2枚のカードが配られます',
      'HITでカードを追加、STANDでその時点の手札で勝負',
      '21を超えるとバスト（負け）になります',
      'ディーラーより高い点数で、21以下なら勝利です'
    ],
    tips: [
      '17以上になったらSTANDするのが基本戦略',
      'ディーラーの見えているカードを参考にして判断しましょう',
      'エースは状況によって1か11として扱われます',
      'バスト（21超え）に注意しましょう'
    ],
    command: '/blackjack [金額]',
    example: '/blackjack 10'
  },
  {
    id: 'dice',
    title: 'ダイスゲーム 🎲',
    description: 'サイコロの出目を予想するシンプルなゲームです。',
    howToPlay: [
      '/dice [BET金額] [1-6] コマンドを使用',
      '予想した数字と同じ目が出れば勝利（配当6倍）',
      '偶数/奇数の賭けも可能（配当2倍）'
    ],
    tips: [
      '少額で多くの回数を楽しむのがコツです',
      '運に左右されるゲームなので、冷静にプレイしましょう',
      '連続して同じ数字に賭けるのも戦略の一つです'
    ],
    command: '/dice [金額] [1-6]',
    example: '/dice 10 3'
  }
];

const CasinoTutorial = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            <span className="inline-block mr-2">📚</span>
            カジノゲームチュートリアル
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            各ゲームのルールや遊び方を解説します。初めてのプレイヤーも安心してお楽しみいただけます。
          </p>
        </motion.div>

        {/* ゲームチュートリアル一覧 */}
        <motion.div 
          className="space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {games.map((game) => (
            <motion.div
              key={game.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
              variants={itemVariants}
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center p-8">
                  <h2 className="text-4xl text-white font-bold text-center">{game.title}</h2>
                </div>
                <div className="md:w-2/3 p-6">
                  <p className="text-gray-700 text-lg mb-6">{game.description}</p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">遊び方</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-6">
                    {game.howToPlay.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">コマンド形式</h3>
                  <div className="bg-gray-100 p-4 rounded-md mb-6">
                    <code className="text-amber-700 font-mono">{game.command}</code>
                    <p className="text-gray-600 mt-2">例: <code className="font-mono">{game.example}</code></p>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">攻略のコツ</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-6">
                    {game.tips.map((tip, index) => (
                      <li key={index} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                  
                  <div className="mt-6">
                    <Link 
                      to="/casino/play" 
                      className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                    >
                      このゲームを試す
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* ボーナス情報 */}
        <motion.div
          className="mt-16 bg-indigo-100 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">💎 ボーナスとイベント</h2>
          <p className="text-indigo-700 mb-6">
            Discordで <code className="bg-white bg-opacity-50 px-2 py-1 rounded">/daily</code> コマンドを実行すると、
            毎日無料のボーナスがもらえます！特別イベントも定期開催中です。
          </p>
          <a 
            href={process.env.DISCORD_INVITE_URL || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Discordに参加する
          </a>
        </motion.div>
        
        {/* ナビゲーションリンク */}
        <motion.div 
          className="mt-10 flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default CasinoTutorial;