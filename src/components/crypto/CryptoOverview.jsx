import React from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import { 
  ChartBarIcon, 
  CurrencyYenIcon, 
  ArrowTrendingUpIcon,
  BellAlertIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Card コンポーネント拡張
Card.Header = ({ children }) => (
  <div className="mb-6">{children}</div>
);

Card.Title = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-900 mb-2">{children}</h3>
);

Card.Description = ({ children }) => (
  <p className="text-gray-600">{children}</p>
);

Card.Content = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

// Section コンポーネント拡張
Section.Header = ({ children }) => (
  <div className="text-center mb-12">{children}</div>
);

Section.Title = ({ children }) => (
  <h2 className="text-3xl font-bold text-gray-900 mb-4">{children}</h2>
);

Section.Description = ({ children }) => (
  <p className="text-xl text-gray-600 max-w-2xl mx-auto">{children}</p>
);

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

// 機能のリスト
const features = [
  {
    title: 'リアルな価格変動',
    description: '実際の仮想通貨市場のような価格変動を再現。1分ごとに更新される本格的な相場環境。',
    icon: ChartBarIcon,
  },
  {
    title: '成行・指値注文',
    description: '成行注文・指値注文・価格アラートを活用して本格トレード！実践的な取引スキルが身につきます。',
    icon: CurrencyYenIcon,
  },
  {
    title: 'AI価格予測',
    description: '最先端のAIが市場の動きを分析し、次の価格を予測！最適な売買タイミングを判断できます。',
    icon: ArrowTrendingUpIcon,
  },
  {
    title: 'マイニング報酬',
    description: '毎日のマイニングやデイリーボーナスで資産を増やせる！アクティブなほど報酬がアップします。',
    icon: BellAlertIcon,
  },
  {
    title: 'ランキングシステム',
    description: '他のトレーダーとランキングで競争！トップトレーダーを目指して取引スキルを磨きましょう。',
    icon: UserGroupIcon,
  }
];

// よくある質問
const faqs = [
  {
    question: '本当に無料で遊べるの？',
    answer: '完全無料！課金要素なしでプレイできます！'
  },
  {
    question: '初心者でもできますか？',
    answer: '大丈夫！コマンド1つで簡単に取引スタートできます！また用語集やサポートが充実しているので安心して取引できます！'
  },
  {
    question: '途中でやめてもいいの？',
    answer: 'OK！いつでも好きなタイミングで参加・退出できます！'
  },
  {
    question: 'どうやってウォレットを作成するの？',
    answer: 'Discord に参加して /register を実行するだけ！'
  }
];

// ゲームの流れステップ
const gameSteps = [
  {
    emoji: '1️⃣',
    title: 'ウォレット作成💼',
    description: '/register を実行すると、ウォレットが作成されます！初期ボーナス 100 PARC & 100,000 JPY を獲得！',
    url: 'https://discord.com/channels/xxxx
  },
  {
    emoji: '2️⃣',
    title: 'マイニングで資産を増やす⛏',
    description: '/mine で毎日 PARC を獲得！無料で毎日マイニングが可能！',
    url: 'https://discord.com/channels/1339125839954055230/1339128725463105536'
  },
  {
    emoji: '3️⃣',
    title: '取引で資産を運用する📈',
    description: '/buy で PARC を購入！/sell で PARC を売却！/alert で価格通知を設定！',
  },
  {
    emoji: '4️⃣',
    title: 'AI価格予測を活用する🔮',
    description: '/predict で AI価格予測を実行！最先端のAIが市場の動きを分析し、次の価格を予測！',
  },
  {
    emoji: '5️⃣',
    title: '億り人を目指す💰',
    description: '1億 JPY に到達するとゲームクリア！ 🎉',
  }
];

// コマンド一覧（カテゴリー別）
const commandCategories = [
  {
    title: '初期設定コマンド(チャンネル指定あり)',
    icon: '🔰',
    commands: [
      {
        name: '/register',
        description: 'ウォレットを作成し、初期ボーナス100PARC付与。アカウントの作成に使用します。',
        url: 'https://discord.com/channels/xxxx
      },
      {
        name: '/daily',
        description: 'デイリーボーナスを受け取る（連続ログインで報酬増加）。毎日実行できます。',
        url: 'https://discord.com/channels/1339125839954055230/1339846644547588176'
      },
      {
        name: '/mine',
        description: 'チャット数に応じてPARCを採掘（24時間に1回実行可能）。アクティブなユーザーほど報酬UP！',
        url: 'https://discord.com/channels/1339125839954055230/1339128725463105536'
      }
    ]
  },
  {
    title: '基本操作コマンド',
    icon: '💰',
    commands: [
      {
        name: '/wallet',
        description: 'PARC/JPY残高の確認、総資産の表示。ポートフォリオの価値も表示されます。'
      },
      {
        name: '/send <@ユーザー/アドレス> <数量>',
        description: '指定先にPARCを送金（手数料0.1%）。友達やギルドメンバーに簡単に送金できます。'
      },
      {
        name: '/history',
        description: '取引履歴の確認、直近の取引を表示。詳細なトランザクション情報を確認できます。'
      },
      {
        name: '/rich',
        description: '資産ランキングを表示。トップトレーダーを確認して、取引戦略の参考にできます。'
      }
    ]
  },
  {
    title: '取引関連コマンド',
    icon: '📈',
    commands: [
      {
        name: '/buy <数量> [価格]',
        description: 'PARC購入（成行/指値）、価格指定で指値注文。例: /buy 100 または /buy 100 1250'
      },
      {
        name: '/sell <数量> [価格]',
        description: 'PARC売却（成行/指値）、価格指定で指値注文。例: /sell 50 または /sell 50 1300'
      },
      {
        name: '/market',
        description: '現在の価格を確認、24時間の変動も表示。市場の動向を把握するのに役立ちます。'
      },
      {
        name: '/orders',
        description: '自分の注文一覧を表示。有効な指値注文をすべて確認できます。'
      },
      {
        name: '/cancel <注文ID>',
        description: '指値注文をキャンセル、複数指定可能（カンマ区切り）。例: /cancel 123 または /cancel 123,456'
      }
    ]
  },
  {
    title: 'アラート関連コマンド',
    icon: '⏰',
    commands: [
      {
        name: '/alert <価格> <条件>',
        description: '価格アラートを設定（above/below指定）。例: /alert 1300 above または /alert 1200 below'
      },
      {
        name: '/alerts',
        description: 'アラート一覧を表示（最大3件まで設定可能）。現在設定中のすべてのアラートを確認できます。'
      },
      {
        name: '/alert_delete <アラートID>',
        description: '指定したアラートを削除。例: /alert_delete 1'
      }
    ]
  },
  {
    title: '分析・予測コマンド',
    icon: '🔍',
    commands: [
      {
        name: '/predict <時間> <モデル>',
        description: 'AIモデルを選択して価格予測を実行(1 ~ 60分まで予測可能)'
      }
    ]
  }
];

const CryptoOverview = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Section>
        {/* ヘッダー & ウェルカムメッセージ */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 mb-12 shadow-sm"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-4">
            Paraccoli Crypto【PARC】へようこそ！
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            「仮想通貨って難しそう...」と思っているあなたでも大丈夫！このゲームなら、完全無料でDiscord上で手軽に仮想通貨取引を体験できます！
          </p>
        </motion.div>

        {/* Paraccoli Cryptoとは？ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <RocketLaunchIcon className="h-8 w-8 text-blue-600 mr-3" />
                </motion.div>
                <Card.Title className="text-2xl">💡 Paraccoli Crypto【PARC】とは？</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-lg mb-6">
                Paraccoli Crypto【PARC】は、仮想通貨「PARC」を売買しながら資産を増やし、最終的に1億JPYに到達すると「億り人」達成するゲームです！
              </p>
              
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg mb-6"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ul className="space-y-2">
                  {[
                    "実際の仮想通貨市場のような価格変動を再現",
                    "成行注文・指値注文・価格アラートを活用して本格トレード！",
                    "AI価格予測を活用し、最適な売買タイミングを判断可能！",
                    "マイニングやデイリーボーナスで資産を増やせる！",
                    "ランキングシステムで他のトレーダーと競争！"
                  ].map((point, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        transition: { delay: index * 0.1 + 0.2 } 
                      }}
                    >
                      <span className="text-green-500 mr-2">✅</span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* ゲームの流れ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <Card.Title className="text-2xl">📜 ゲームの流れ</Card.Title>
              <Card.Description className="text-lg font-medium text-blue-600">
                初心者でも簡単！5ステップで億り人を目指そう！
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                {gameSteps.map((step, index) => (
                  <motion.div 
                    key={index} 
                    className="flex"
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                  >
                    <motion.div 
                      className="bg-blue-600 text-white text-2xl font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-4"
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {step.emoji}
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-gray-600">
                        {step.description}
                      </p>
                      {step.url && (
                        <motion.a 
                          href={step.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:text-blue-800 inline-flex items-center mt-1"
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          コマンド実行チャンネルへ
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="text-center mt-8"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <motion.div 
                    className="inline-block bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    🏆 ランキング上位を狙おう！
                  </motion.div>
                </motion.div>
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* 特徴 */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <Card.Title className="text-2xl">📈 Paraccoli Cryptoの特徴</Card.Title>
              <Card.Description className="text-lg font-medium text-blue-600">
                リアルなトレードを体験しながら、遊んで学べる！
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    variants={itemVariants}
                    whileHover={{ 
                      y: -5,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.div 
                        className="bg-blue-100 p-3 rounded-full"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* FAQセクション */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
                </motion.div>
                <Card.Title className="text-2xl">📣 よくある質問（FAQ）</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="grid gap-6 md:grid-cols-2"
                variants={containerVariants}
              >
                {faqs.map((faq, index) => (
                  <motion.div 
                    key={index} 
                    className="border-l-4 border-blue-500 pl-4"
                    variants={itemVariants}
                    whileHover={{ 
                      x: 5,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    <h4 className="font-medium text-gray-900">❓ Q. {faq.question}</h4>
                    <p className="mt-2 text-gray-600">✅ A. {faq.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* コマンド一覧 */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <Card.Title className="text-2xl">🔧 コマンド一覧</Card.Title>
              <Card.Description>
                Paraccoli Cryptoで使用できる主要コマンドです
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
              >
                {commandCategories.map((category, catIndex) => (
                  <motion.div 
                    key={category.title} 
                    className="space-y-4"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: catIndex * 0.1 } 
                    }}
                  >
                    <h4 className="text-lg font-medium flex items-center border-b border-gray-200 pb-2">
                      <motion.span 
                        className="mr-2"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {category.icon}
                      </motion.span>
                      {category.title}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.commands.map((cmd, cmdIndex) => (
                        <motion.div 
                          key={cmd.name} 
                          className="bg-gray-50 rounded-lg p-4"
                          whileHover={{ 
                            scale: 1.03, 
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0, 
                            transition: { delay: (catIndex * 0.1) + (cmdIndex * 0.05) } 
                          }}
                        >
                          {cmd.url ? (
                            <motion.a 
                              href={cmd.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 font-mono hover:text-blue-800 transition-colors"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {cmd.name}
                            </motion.a>
                          ) : (
                            <code className="text-blue-600 font-mono">{cmd.name}</code>
                          )}
                          <p className="text-gray-600 text-sm mt-2">{cmd.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* コミュニティ参加 */}
        <motion.div variants={itemVariants}>
          <Card>
            <Card.Header>
              <Card.Title className="text-2xl">📢 参加しよう！</Card.Title>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="text-center space-y-4"
                variants={containerVariants}
              >
                <motion.div 
                  className="flex items-center justify-center space-x-8"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-gray-700 mb-2">🌍 公式サイト:</p>
                    <span className="text-blue-600">現在開発中です</span>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-gray-700 mb-2">💬 Discord:</p>
                    <span className="text-blue-600">現在開発中です</span>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-gray-700 mb-2">📢 Twitter:</p>
                    <motion.a 
                      href="https://twitter.com/Paraccoli" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      @Paraccoli
                    </motion.a>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg max-w-2xl mx-auto"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  variants={itemVariants}
                >
                  <h3 className="text-2xl font-bold mb-2">
                    🚀 あなたも Paraccoli Crypto の世界で億り人になろう！ 💎
                  </h3>
                  <p className="text-white/90">
                    完全無料でリアルな取引体験ができるチャンスです！いつでも参加できます。
                  </p>
                  <motion.div 
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link 
                      to="/crypto#market-data" 
                      className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setTimeout(() => {
                          const element = document.getElementById('market-data');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                    >
                      リアルタイム市場データを見る
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </Card.Content>
          </Card>
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default CryptoOverview;