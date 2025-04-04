import React from 'react';

const LoadingSpinner = ({ variant = 'default', size = 'md', className = '' }) => {
  // サイズクラスのマッピング
  const sizeClasses = {
    xs: 'h-1 w-1',
    sm: 'h-2 w-2',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-12 w-12'
  };
  
  // デフォルトのスピナー
  if (variant === 'default') {
    return (
      <div className={`flex justify-center ${className}`} aria-label="読み込み中">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600`}></div>
      </div>
    );
  }
  
  // ピンドットアニメーション
  if (variant === 'ping') {
    return (
      <div className={`flex justify-center space-x-2 ${className}`} aria-label="読み込み中">
        <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full"></div>
        <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full mx-4"></div>
        <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full"></div>
      </div>
    );
  }
  
  // ドットアニメーション
  if (variant === 'dots') {
    return (
      <div className={`flex justify-center items-center space-x-2 ${className}`} aria-label="読み込み中">
        <div className={`animate-bounce ${sizeClasses[size]} bg-blue-300 rounded-full`}></div>
        <div className={`animate-bounce ${sizeClasses[size]} bg-purple-300 rounded-full`} style={{animationDelay: '0.15s'}}></div>
        <div className={`animate-bounce ${sizeClasses[size]} bg-pink-300 rounded-full`} style={{animationDelay: '0.3s'}}></div>
      </div>
    );
  }
  
  // スピニングキューブ
  if (variant === 'cube') {
    return (
      <div className={`flex justify-center ${className}`} aria-label="読み込み中">
        <div className="animate-spin h-8 w-8 bg-blue-300 rounded-xl"></div>
      </div>
    );
  }

  // デフォルトのフォールバック
  return (
    <div className={`flex justify-center ${className}`} aria-label="読み込み中">
      <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full"></div>
      <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full mx-4"></div>
      <div className="animate-ping h-2 w-2 bg-blue-600 rounded-full"></div>
    </div>
  );
};

export default LoadingSpinner;