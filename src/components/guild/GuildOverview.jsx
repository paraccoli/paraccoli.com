import React from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  CurrencyYenIcon,
  TrophyIcon,
  BriefcaseIcon,
  QuestionMarkCircleIcon
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
    title: 'ギルド（会社）設立',
    description: '自分だけのギルドを設立し、メンバーを募集！独自の方針で経営できます。',
    icon: BuildingOfficeIcon,
  },
  {
    title: '役職システム',
    description: 'CEOからインターンまで、役職ごとに権限と責任を設定。組織的な運営が可能です。',
    icon: UsersIcon,
  },
  {
    title: '仕事システム',
    description: '様々な仕事をこなして収益を上げ、ギルドの資産を増やせます。役員が承認すると報酬が発生します。',
    icon: BriefcaseIcon,
  },
  {
    title: '資産運用',
    description: 'ギルド資産でPARCの売買取引が可能。ファンドマネージャーが資産運用を担当します。',
    icon: CurrencyYenIcon,
  },
  {
    title: 'ギルド対抗イベント',
    description: '定期的なイベントでギルド同士が競争。優勝すると特別報酬が獲得できます。',
    icon: TrophyIcon,
  }
];

// よくある質問
const faqs = [
  {
    question: 'ギルドに入るにはどうすればいい？',
    answer: 'まずは会社招待を受け取るか、入社希望を提出しましょう。招待を受けると、入社ボタンが表示されます。'
  },
  {
    question: 'ギルドを作るには何が必要？',
    answer: '設立には100,000JPYが必要です。/company_createコマンドで会社名を指定して設立できます。'
  },
  {
    question: 'ギルドの収入源は？',
    answer: 'メンバーが実行する「仕事」や資産運用（PARC取引）による利益が収入源です！'
  },
  {
    question: 'ギルドを退職するとどうなる？',
    answer: '/company_leave で退職できます。保有している株は自動的に売却され、資金は返還されます。'
  }
];

// ギルド設立・参加の流れ
const guildSteps = [
  {
    emoji: '1️⃣',
    title: 'ギルドを設立する🏢',
    description: '/company_create [会社名] で自分のギルドを設立。設立金は100,000JPY必要です。'
  },
  {
    emoji: '2️⃣',
    title: 'メンバーを招待する👥',
    description: '/company_invite [@USER] [役職] でメンバーを招待。24時間以内に2人以上を招待しないと解散します。'
  },
  {
    emoji: '3️⃣',
    title: '仕事を実行する💼',
    description: '/job [時間] で仕事を開始し、指定時間後に完了報告されます。役員が承認すると報酬獲得！'
  },
  {
    emoji: '4️⃣',
    title: '資産を運用する💰',
    description: '/company_buy や /company_sell でPARCを売買し、ギルド資産を増やしましょう。'
  },
  {
    emoji: '5️⃣',
    title: 'ギルド対抗イベントで勝利を🏆',
    description: 'ギルド同士の対抗戦に参加し、ランキング上位を目指そう！'
  }
];

// コマンド一覧（カテゴリー別）
const commandCategories = [
  {
    title: 'ギルド設立・管理コマンド',
    icon: '🏢',
    commands: [
      {
        name: '/company_create [会社名]',
        description: '新しいギルドを設立。設立には100,000JPY必要です。'
      },
      {
        name: '/company_invite [@USER] [役職]',
        description: 'ギルドにメンバーを招待。'
      },
      {
        name: '/company_manage [@USER] [役職]',
        description: 'メンバーの役職を変更（社員 ⇄ 役員）'
      },
      {
        name: '/company_fire [@USER]',
        description: 'メンバーをギルドから解雇（ファンドマネージャー＆役員のみ）'
      }
    ]
  },
  {
    title: 'メンバー用コマンド',
    icon: '👤',
    commands: [
      {
        name: '/company_leave',
        description: 'ギルドを退職します。'
      },
      {
        name: '/company_info',
        description: 'ギルドの総資産（PARC/JPY）と収支状況を表示、ギルドの現在のレベルと次のレベルアップ条件を確認'
      }
    ]
  },
  {
    title: '仕事関連コマンド',
    icon: '💼',
    commands: [
      {
        name: '/company_in',
        description: '出社（社員のみ）'
      },
      {
        name: '/job [時間]',
        description: '仕事を開始（出社前不可）'
      },
      {
        name: '/job_complete [@USER]',
        description: '仕事完了を認定し報酬を会社資産に追加（役員のみ）'
      },
      {
        name: '/job_info',
        description: '社員の仕事履歴を確認（サボり監視）（ファンドマネージャー・役員のみ）'
      }
    ]
  },
  {
    title: '資産管理コマンド',
    icon: '💰',
    commands: [
      {
        name: '/company_buy [枚数] [指値]',
        description: 'ギルド資産でPARCを購入（指値または成行）（ファンドマネージャーのみ）'
      },
      {
        name: '/company_sell [枚数] [指値]',
        description: 'ギルド保有のPARCを売却（指値または成行）（ファンドマネージャーのみ）'
      },
      {
        name: '/company_devidente',
        description: '収益を社員・役員に分配（ギルド資産の10%）（ファンドマネージャーのみ）'
      },
      {
        name: '/company_invest [通貨] [金額]',
        description: 'ファンドマネージャーの個人資産をギルド資産に追加（ファンドマネージャーのみ）'
      }
    ]
  }
];

const GuildOverview = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Section>
        {/* ヘッダー & ウェルカムメッセージ */}
        <motion.div 
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 md:p-8 mb-12 shadow-sm"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-600 mb-4">
            Paraccoli Guild【PARC】へようこそ！
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            ギルド（会社）を設立・運営して、メンバーと協力し合いながら資産を増やしていく経営シミュレーションです！
          </p>
        </motion.div>

        {/* Paraccoli Guildとは？ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BuildingOfficeIcon className="h-8 w-8 text-emerald-600 mr-3" />
                </motion.div>
                <Card.Title className="text-2xl">💡 Paraccoli Guild【PARC】とは？</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-lg mb-6">
                Paraccoli Guild【PARC】は、プレイヤーがギルド（会社）を設立して運営し、メンバーと協力しながらギルド資産を増やしていく経営シミュレーションゲームです！
              </p>
              
              <motion.div 
                className="bg-emerald-50 p-4 rounded-lg mb-6"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ul className="space-y-2">
                  {[
                    "ギルドの設立・運営で実際の経営を体験できる",
                    "役職システムで組織管理を学べる",
                    "仕事を実行して収益を上げ、給与を分配",
                    "ギルド資産を運用してPARCや現金を増やす",
                    "ギルド対抗イベントで他ギルドと競争"
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

        {/* ギルド参加の流れ */}
        <motion.div variants={itemVariants}>
          <Card className="mb-16">
            <Card.Header>
              <Card.Title className="text-2xl">📜 ギルド設立と運営の流れ</Card.Title>
              <Card.Description className="text-lg font-medium text-emerald-600">
                初心者でも簡単！5ステップでギルド活動をマスターしよう！
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                {guildSteps.map((step, index) => (
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
                      className="bg-emerald-600 text-white text-2xl font-bold rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 mr-4"
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
                    className="inline-block bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    🏆 トップギルドを目指そう！
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
              <Card.Title className="text-2xl">📈 Paraccoli Guildの特徴</Card.Title>
              <Card.Description className="text-lg font-medium text-emerald-600">
                リアルな経営を体験し、仲間と協力して成長しよう！
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
                        className="bg-emerald-100 p-3 rounded-full"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <feature.icon className="h-6 w-6 text-emerald-600" />
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
                  <QuestionMarkCircleIcon className="h-8 w-8 text-emerald-600 mr-3" />
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
                    className="border-l-4 border-emerald-500 pl-4"
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
                Paraccoli Guildで使用できる主要コマンドです
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
                          <code className="text-emerald-600 font-mono">{cmd.name}</code>
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

        {/* 参加セクション */}
        <motion.div variants={itemVariants}>
          <Card>
            <Card.Header>
              <Card.Title className="text-2xl">📢 ギルドを始めよう！</Card.Title>
            </Card.Header>
            <Card.Content>
              <motion.div 
                className="text-center space-y-4"
                variants={containerVariants}
              >
                <motion.div 
                  className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-lg max-w-2xl mx-auto"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  variants={itemVariants}
                >
                  <h3 className="text-2xl font-bold mb-2">
                    🚀 あなたもParaccoli Guildの世界でトップギルドを目指そう！ 🏆
                  </h3>
                  <p className="text-white/90">
                    仲間と協力して経営し、資産を増やしていくやりがいを体験しよう！
                  </p>
                  <motion.div 
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link 
                      to="/guild"
                      className="inline-block bg-white text-emerald-600 px-6 py-2 rounded-full font-medium hover:bg-emerald-50 transition-colors"
                    >
                      ギルドシステムの詳細を見る
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

export default GuildOverview;