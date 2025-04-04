import React from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import { motion } from 'framer-motion';

const stats = [
  {
    title: 'トランザクション数',
    value: '100K+',
    description: '1日あたりの取引数',
    icon: '📊',
    color: 'from-blue-400 to-blue-600'
  },
  {
    title: '取引高',
    value: '¥1M+',
    description: '月間取引総額',
    icon: '💹',
    color: 'from-green-400 to-green-600'
  },
  {
    title: 'アクティブユーザー',
    value: '500+',
    description: '日々活動するユーザー',
    icon: '👥',
    color: 'from-purple-400 to-purple-600'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// カウントアップアニメーション用のコンポーネント
const CountUp = ({ value }) => {
  // 数値を抽出（例: "100K+" から "100" を取得）
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = numericValue;
    
    // スピードを調整
    const totalDuration = 2000; // 2秒
    const incrementTime = totalDuration / end;
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [numericValue]);
  
  return (
    <span>{count}{suffix}</span>
  );
};

const CommunityStats = () => {
  return (
    <Section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <span className="text-4xl text-white">📈</span>
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          急成長中のコミュニティ
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          日々成長を続けるパラッコリーコミュニティの統計データをリアルタイムで確認できます
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden h-full border border-gray-100"
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-8 text-center">
                <motion.div 
                  className="text-5xl mb-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  {stat.icon}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {stat.title}
                </h3>
                
                <motion.div 
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  <CountUp value={stat.value} />
                </motion.div>
                
                <p className="text-gray-600">
                  {stat.description}
                </p>
                
                <motion.div 
                  className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mt-5"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="bg-blue-100 text-blue-800 px-6 py-3 rounded-lg inline-block"
          whileHover={{ scale: 1.05 }}
        >
          <span className="font-medium">リアルタイムで成長中！</span> 毎日新しいユーザーが参加しています
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default CommunityStats;