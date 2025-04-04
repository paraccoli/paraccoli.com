import React from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RocketLaunchIcon,
  CurrencyYenIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

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

// 特徴の定義
const features = [
  {
    title: '仮想通貨システム',
    description: 'リアルな価格変動を再現したPARC仮想通貨の取引、マイニング、AIを活用した価格予測。',
    icon: CurrencyYenIcon,
  },
  {
    title: 'ギルドシステム',
    description: '自分だけのギルド（会社）を設立し、メンバーと協力して資産を増やす経営シミュレーション。',
    icon: BuildingOfficeIcon,
  },
  {
    title: 'コミュニティフォーラム',
    description: 'ユーザー同士で情報交換や議論ができる活発なフォーラム。取引情報や戦略を共有。',
    icon: UserGroupIcon,
  },
  {
    title: '総合ドキュメント',
    description: '初心者からプロまで、使いやすいガイドと詳細な技術仕様書を提供。',
    icon: DocumentTextIcon,
  },
];

// よくある質問
const faqs = [
  {
    question: 'Paraccoliとは何ですか？',
    answer: 'Discordサーバー内で動作する仮想通貨【PARC】を用いたシミュレーションゲームです。実際の金銭的価値はなく、安全に取引体験が楽しめます。'
  },
  {
    question: '無料で遊べますか？',
    answer: '完全無料で遊べます。課金要素はなく、実際のお金を使う必要はありません。'
  },
  {
    question: '初心者でも参加できますか？',
    answer: 'はい、初心者歓迎です！分かりやすいガイドと段階的なチュートリアルで、取引の基本から学べます。'
  },
  {
    question: '参加方法を教えてください',
    answer: 'Discordサーバーに参加し、簡単な登録コマンドを実行するだけで開始できます。サイトのヘッダーにある「Discord」リンクから参加できます。'
  }
];

// はじめ方のステップ
const startSteps = [
  {
    emoji: '1️⃣',
    title: 'Discordに参加する🌍',
    description: 'Paraccoliの公式Discordサーバーに参加します。コミュニティと一緒に学んでいきましょう！',
    url: {process.env.DISCORD_INVITE_URL || "#"}
  },
  {
    emoji: '2️⃣',
    title: 'アカウントを作成する🔑',
    description: '/register コマンドでアカウントを作成。初期ボーナスとして100 PARC & 100,000 JPYが付与されます。',
  },
  {
    emoji: '3️⃣',
    title: 'ゲームを選んで参加する🎮',
    description: '仮想通貨取引、ギルド経営、カジノゲームなど、好きなコンテンツから始めましょう！',
  },
  {
    emoji: '4️⃣',
    title: 'コミュニティと交流する👥',
    description: 'フォーラムやDiscordでプレイヤー同士と情報交換。取引テクニックやギルド戦略を共有しよう！',
  },
  {
    emoji: '5️⃣',
    title: '報酬と実績を獲得する🏆',
    description: '様々な実績を達成し、ランキング上位を目指しましょう！サーバー内での特典も獲得できます。',
  }
];

const About = () => {
  return (
    <motion.div
      className="space-y-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Section>
        {/* ヘッダー & ウェルカムメッセージ */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl p-6 md:p-8 mb-12 shadow-sm"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-4">
            Project Paraccoli【PARC】について
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            Discordサーバーで使用する仮想通貨【PARC】を用いた、完全無料で楽しめるシミュレーションゲームです。
          </p>
        </motion.div>

        {/* Paraccoli とは？ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <div className="flex items-center">
                <RocketLaunchIcon className="h-8 w-8 text-blue-600 mr-3" />
                <Card.Title className="text-2xl">💡 Paraccoli とは？</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-lg mb-6">
                Paraccoli は、Discord上で動作する複合シミュレーションゲームです。仮想通貨取引・ギルド経営・カジノゲームなど、様々なコンテンツを無料で体験できます。実際のお金を使わずに、楽しみながら経済活動を学べる教育的なプロジェクトです。
              </p>
              
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg mb-6"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ul className="space-y-2">
                  {[
                    "仮想通貨【PARC】を取引し、億り人を目指す",
                    "ギルド（会社）を設立して経営シミュレーションを楽しむ",
                    "フォーラムでユーザー同士の情報交換や交流ができる",
                    "クエスト達成で報酬を獲得し、様々な実績に挑戦",
                    "完全無料でプレイでき、実際の金銭リスクなし"
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

        {/* はじめ方のステップ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <Card.Title className="text-2xl">📜 Paraccoliの始め方</Card.Title>
              <Card.Description className="text-lg font-medium text-blue-600">
                初心者でも簡単！5ステップでParaccoliの世界に参加しよう！
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                {startSteps.map((step, index) => (
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
                          Discordサーバーに参加
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
                    className="inline-block bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    🚀 Paraccoliの世界で億り人を目指そう！
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
              <Card.Title className="text-2xl">📈 Paraccoliの特徴</Card.Title>
              <Card.Description className="text-lg font-medium text-blue-600">
                多彩なコンテンツと機能で、楽しみながら経済活動を学べる！
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
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

        {/* 参加セクション */}
        <motion.div variants={itemVariants}>
          <Card>
            <Card.Header>
              <Card.Title className="text-2xl">📢 Paraccoliに参加しよう！</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="text-center">
                <motion.div 
                  className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg max-w-2xl mx-auto"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-2xl font-bold mb-2">
                    🚀 あなたもParaccoliの世界で億り人になろう！ 💎
                  </h3>
                  <p className="text-white/90">
                    完全無料でリアルな経済シミュレーションを体験。いつでも参加できます！
                  </p>
                  <motion.div 
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <a 
                      href={process.env.DISCORD_INVITE_URL || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors"
                    >
                      Discordサーバーに参加する
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </Section>
    </motion.div>
  );
};

export default About;