import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPrompt = ({ 
  title = 'ログインが必要です',
  message = 'このコンテンツを利用するにはログインが必要です。',
  theme = 'blue', // blue, amber, green
}) => {
  const navigate = useNavigate();
  
  // テーマに応じたスタイルを設定
  const themeStyles = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      buttonBg: 'bg-blue-600',
      buttonHover: 'hover:bg-blue-700',
      outlineBorder: 'border-blue-500',
      outlineText: 'text-blue-500',
      outlineHover: 'hover:bg-blue-50',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      buttonBg: 'bg-amber-500',
      buttonHover: 'hover:bg-amber-600',
      outlineBorder: 'border-amber-500',
      outlineText: 'text-amber-500',
      outlineHover: 'hover:bg-amber-50',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      buttonBg: 'bg-green-600',
      buttonHover: 'hover:bg-green-700',
      outlineBorder: 'border-green-500',
      outlineText: 'text-green-500',
      outlineHover: 'hover:bg-green-50',
    }
  };
  
  const style = themeStyles[theme];
  
  return (
    <motion.div
      className={`${style.bg} ${style.border} border rounded-xl p-6 shadow-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          <svg className={`w-10 h-10 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>
        
        <h2 className={`text-2xl font-bold ${style.text} mb-2`}>{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
      
      <div className="flex flex-col space-y-3">
        <button
          onClick={() => navigate('/login')}
          className={`${style.buttonBg} text-white py-2 px-4 rounded-lg font-medium ${style.buttonHover} transition`}
        >
          Discordでログイン
        </button>
        
        <button
          onClick={() => navigate('/')}
          className={`bg-white ${style.outlineBorder} border ${style.outlineText} py-2 px-4 rounded-lg font-medium ${style.outlineHover} transition`}
        >
          トップページに戻る
        </button>
      </div>
    </motion.div>
  );
};

export default LoginPrompt;