import React from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: 'Discordに参加',
    description: 'PARCの公式Discordサーバーに参加',
    icon: '🎮',
    delay: 0.1,
    url: {process.env.DISCORD_INVITE_URL || "#"}
  },
  {
    title: 'アカウント作成',
    description: 'Discordログインで簡単登録',
    icon: '👤',
    delay: 0.3,
    url: '/login'
  },
  {
    title: 'Paracへようこそ',
    description: '100 PARC & 100,000 JPYを初回ボーナスとしてプレゼント',
    icon: '💰',
    delay: 0.5
  },
  {
    title: '取引・活動開始',
    description: 'PARCトークンで取引や報酬獲得',
    icon: '🚀',
    delay: 0.7
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
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

const HowItWorks = () => {
  return (
    <Section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-4xl">🚀</span>
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          簡単4ステップではじめる
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          今すぐParaccoliの世界に飛び込んでみましょう！登録はわずか数分で完了します
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {STEPS.map((step, index) => (
          <motion.div 
            key={index}
            className="relative"
            variants={itemVariants}
            custom={index}
          >
            {step.url ? (
              <Link to={step.url.startsWith('http') ? '' : step.url} 
                    {...(step.url.startsWith('http') ? { href: step.url, target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="block h-full"
              >
                <StepCard step={step} index={index} />
              </Link>
            ) : (
              <StepCard step={step} index={index} />
            )}
            
            {index < STEPS.length - 1 && (
              <motion.div 
                className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
              >
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <Link to="/login">
          <motion.button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            今すぐ始める
          </motion.button>
        </Link>
      </motion.div>
    </Section>
  );
};

const StepCard = ({ step, index }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 h-full border border-gray-100"
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <div className="relative">
        <motion.div 
          className="absolute -top-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
        >
          {index + 1}
        </motion.div>
        
        <motion.div 
          className="text-5xl mb-6 inline-block"
          whileHover={{ rotate: 20 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {step.icon}
        </motion.div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
      <p className="text-gray-600">{step.description}</p>
      
      {step.url && (
        <motion.div 
          className="mt-4 text-sm font-medium text-blue-600 inline-flex items-center"
          whileHover={{ x: 3 }}
        >
          {step.url.startsWith('http') ? '参加する' : '開始する'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HowItWorks;