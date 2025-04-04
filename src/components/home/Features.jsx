import React from 'react';
import Section from '../shared/Section';
import Card from '../shared/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'クリプトシステム',
    description: 'PARCトークンで安全な取引や報酬の授受を実現',
    icon: '💰',
    color: 'from-blue-400 to-indigo-500',
    path: '/crypto'
  },
  {
    title: 'ギルドシステム',
    description: 'メンバーと協力して活動し、ギルドを運営',
    icon: '⚔️',
    color: 'from-green-400 to-emerald-500',
    path: '/guild'
  },
  {
    title: 'プロジェクトの概要',
    description: 'Project Paraccoli【PARC】の概要や目的について知る',
    icon: '📈',
    color: 'from-amber-400 to-orange-500',
    path: '/about'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const Features = () => {
  return (
    <Section>
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-4 relative inline-block">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            パラッコリーの主な機能
          </span>
          <motion.span
            className="absolute -top-6 -right-6 text-2xl"
            animate={{ rotate: [0, 15, 0], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            ✨
          </motion.span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          パラッコリーでは3つの主要機能を提供し、楽しみながら学べる環境を実現しています
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {FEATURES.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Link to={feature.path} className="block h-full">
              <motion.div 
                className="h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                <div className="p-6 text-center">
                  <motion.div 
                    className="text-5xl mb-6 inline-block"
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  
                  <motion.div 
                    className="mt-6 text-sm font-medium text-blue-600 flex items-center justify-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    詳しく見る
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

export default Features;