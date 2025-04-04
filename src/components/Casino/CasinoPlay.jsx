import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SlotMachine from './SlotMachine';
import RouletteGame from './RouletteGame';
import BlackjackGame from './BlackJackGame';
import LoginPrompt from '../shared/LoginPrompt';

const CasinoPlay = () => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [activeGame, setActiveGame] = useState('slot');
  const [balance, setBalance] = useState({ parc: 0, jpy: 0 });
  const [betAmount, setBetAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoMode, setDemoMode] = useState(!isAuthenticated); // 未ログインならデモモード
  const [transaction, setTransaction] = useState(null); // 取引履歴を表示するための状態
  const [previousBalance, setPreviousBalance] = useState(null); // 前回の残高を保存
  const [showBalanceChange, setShowBalanceChange] = useState(false); // 残高変動表示フラグ
  const navigate = useNavigate();
  
  // 残高変更をハイライト表示するための関数
  const highlightBalanceChange = (newBalance, oldBalance) => {
    if (oldBalance !== null && newBalance !== oldBalance) {
      setPreviousBalance(oldBalance);
      setShowBalanceChange(true);
      
      // 3秒後にハイライトを消す
      setTimeout(() => {
        setShowBalanceChange(false);
      }, 3000);
    }
  };
  
  // 残高更新ロジックを改善し、エラー時にも適切に処理

const fetchUserBalance = useCallback(async () => {
  if (!isAuthenticated || demoMode) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // タイムアウトを5秒に増加
    
    const response = await fetch('https://example.com/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const userData = await response.json();
      
      // 前の残高と新しい残高を比較してハイライト表示
      if (balance.parc !== userData.balance) {
        highlightBalanceChange(userData.balance, balance.parc);
      }
      
      setBalance({
        parc: userData.balance || 0,
        jpy: userData.jpy_balance || 0
      });
    } else if (response.status === 429) {
      // レート制限に引っかかった場合は静かに失敗し、次回のポーリングで再試行
      console.log('Rate limit reached for balance update, will retry later');
      // エラーメッセージは表示しない（ユーザーエクスペリエンスを維持）
    } else {
      console.warn('Failed to fetch user balance:', response.status, response.statusText);
      
      if (response.status === 401 || response.status === 403) {
        await refreshUser();
      } else if (response.status >= 500 && !demoMode) {
        console.warn('Server error occurred. Switching to demo mode.');
        toast.info('サーバーエラーが発生したため、デモモードに切り替えます。');
        setDemoMode(true);
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Balance update request timed out');
    } else {
      console.error('Failed to fetch user balance:', error);
      
      if (!demoMode) {
        console.warn('Connection error. Switching to demo mode.');
        toast.info('接続エラーが発生したため、デモモードに切り替えます。');
        setDemoMode(true);
      }
    }
  }
}, [isAuthenticated, balance.parc, refreshUser, demoMode]);
  
  // 初期ロードと定期的な残高更新
  useEffect(() => {
    // 最初にユーザー情報があれば残高を設定
    if (isAuthenticated && user) {
      setBalance({
        parc: user.balance || 0,
        jpy: user.jpy_balance || 0
      });
      
      // 初期状態では前回の残高も現在の残高と同じに設定
      setPreviousBalance(user.balance || 0);
      
      // 初回のデータ取得
      fetchUserBalance();
    }
    
    // 定期的に残高を更新（間隔を15秒から30秒に拡大）
    const intervalId = setInterval(() => {
      if (isAuthenticated && !demoMode) {
        // ランダムな遅延を追加してリクエストの集中を避ける (jitter)
        const jitter = Math.floor(Math.random() * 5000); // 0-5秒のランダムな遅延
        setTimeout(() => {
          fetchUserBalance();
        }, jitter);
      }
    }, 30000); // 30秒ごとに変更
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, demoMode, fetchUserBalance]);

  // カスタムイベントリスナーを設定して残高更新を検知
  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchUserBalance();
    };
    
    window.addEventListener('balance-update', handleBalanceUpdate);
    return () => window.removeEventListener('balance-update', handleBalanceUpdate);
  }, [fetchUserBalance]);

  // 取引情報を表示するためのタイマー
  useEffect(() => {
    if (transaction) {
      const timer = setTimeout(() => {
        setTransaction(null);
      }, 5000); // 5秒後に取引表示を非表示に
      
      return () => clearTimeout(timer);
    }
  }, [transaction]);
  
  // デモモードの強化

  // API障害時の回避策として、強制的にデモモードに切り替える
  useEffect(() => {
    const checkApiHealth = async () => {
      if (!isAuthenticated || demoMode) return;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒でタイムアウト
        
        const response = await fetch('https://example.com/api/health', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn('API health check failed. Switching to demo mode.');
          toast.info('サーバー通信に問題があるため、一時的にデモモードに切り替えます。');
          setDemoMode(true);
        }
      } catch (error) {
        console.warn('API health check failed with error:', error);
        toast.info('サーバー通信に問題があるため、一時的にデモモードに切り替えます。');
        setDemoMode(true);
      }
    };
    
    checkApiHealth();
  }, [isAuthenticated, demoMode]);
  
  // ベット額オプション
  const betOptions = [10, 50, 100, 500];
  
  // ゲームオプション
  const gameOptions = [
    { id: 'slot', label: 'スロットマシン', icon: '🎰' },
    { id: 'roulette', label: 'ルーレット', icon: '🎡' },
    { id: 'blackjack', label: 'ブラックジャック', icon: '🃏' },
  ];
  
  // 残高が不足している場合のチェック
  const checkBalance = () => {
    if (demoMode) return true; // デモモードでは常に残高あり
    if (!isAuthenticated) return false;
    return balance.parc >= betAmount;
  };
  
  // ゲームプレイ時の処理（ベット、勝敗処理）
  const handleGameAction = async (actionType, betResult) => {
    // デモモードの場合は変更なし
    if (demoMode) {
      if (actionType === 'bet') {
        return true; // デモモードでは常にベット成功
      }
      if (actionType === 'result') {
        // 勝ち負けのメッセージだけ表示
        const { won, multiplier = 1 } = betResult;
        if (won) {
          const winAmount = betAmount * multiplier;
          toast.success(`【デモ】おめでとう！ ${winAmount} PARCの勝利です！`);
          
          // デモモードでも取引履歴に表示
          setTransaction({
            type: 'win',
            amount: winAmount,
            game: activeGame,
            timestamp: new Date()
          });
        } else {
          toast.info('【デモ】残念、次回の勝利を祈ります！');
          
          // デモモードでも取引履歴に表示
          setTransaction({
            type: 'lose',
            amount: betAmount,
            game: activeGame,
            timestamp: new Date()
          });
        }
        return true;
      }
      return false;
    }
    
    if (!isAuthenticated || isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
      // ベット処理
      if (actionType === 'bet') {
        if (!checkBalance()) {
          toast.error('残高が不足しています');
          setIsProcessing(false);
          return false;
        }
        
        // ベット前に残高を事前に更新して表示
        const oldBalance = balance.parc;
        const newBalance = oldBalance - betAmount;
        
        // UI上の残高をまず更新（オプティミスティックUI）
        setBalance(prev => ({
          ...prev,
          parc: newBalance
        }));
        
        highlightBalanceChange(newBalance, oldBalance);
        
        // 取引履歴に表示
        setTransaction({
          type: 'bet',
          amount: -betAmount,
          game: activeGame,
          timestamp: new Date()
        });
        
        try {
          const response = await fetch('https://example.com/api/casino/bet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({
              amount: betAmount,
              game: activeGame
            })
          });
          
          if (!response.ok) {
            // エラーの場合は残高を元に戻す
            setBalance(prev => ({
              ...prev,
              parc: oldBalance
            }));
            
            const errorText = await response.text();
            let errorMessage = 'ベットに失敗しました';
            
            try {
              // JSONとしてパースできる場合
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.detail || errorMessage;
            } catch (e) {
              // テキストのまま使用
              if (errorText) errorMessage += `: ${errorText}`;
            }
            
            throw new Error(errorMessage);
          }
          
          // レスポンスをテキストとして取得
          const responseText = await response.text();
          
          // レスポンスが空でない場合のみJSONとしてパース
          let betData = {};
          if (responseText.trim()) {
            try {
              betData = JSON.parse(responseText);
            } catch (e) {
              console.warn('Failed to parse bet response:', e);
            }
          }
          
          // APIが残高を返してきた場合は更新
          if (betData && betData.current_balance !== undefined) {
            setBalance(prev => ({
              ...prev,
              parc: betData.current_balance
            }));
          }

          // カスタムイベントを発火してゲームに通知
          window.dispatchEvent(new CustomEvent('bet-completed', { 
            detail: { success: true }
          }));
          
          return true;
        } catch (error) {
          toast.error(error.message);
          return false;
        }
      }
      
      // 勝敗結果処理部分を修正
      if (actionType === 'result') {
        const { won, multiplier = 1, pattern = null } = betResult;
        
        try {
          // UI更新を先に行う - オプティミスティックUI
          if (won) {
            const winAmount = betAmount * multiplier;
            const oldBalance = balance.parc;
            const newBalance = oldBalance + winAmount;
            
            // UI上の残高をまず更新
            setBalance(prev => ({
              ...prev,
              parc: newBalance
            }));
            
            highlightBalanceChange(newBalance, oldBalance);
            
            // 取引履歴に表示
            setTransaction({
              type: 'win',
              amount: winAmount,
              game: activeGame,
              timestamp: new Date()
            });
            
            toast.success(`おめでとう！ ${winAmount} PARCの勝利です！`);
          } else {
            // 負けの場合
            setTransaction({
              type: 'lose',
              amount: betAmount,
              game: activeGame,
              timestamp: new Date()
            });
            
            toast.info('残念、次回の勝利を祈ります！');
          }
          
          // APIリクエスト - エラーが発生してもUIは既に更新済み
          try {
            const response = await fetch('https://example.com/api/casino/result', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
              },
              body: JSON.stringify({
                game: activeGame,
                won,
                amount: betAmount,
                multiplier,
                pattern
              })
            });
            
            if (!response.ok) {
              console.warn(`結果処理APIエラー: ${response.status} ${response.statusText}`);
              // APIエラーの場合でも自動的にデモモードに切り替えない
              // 既にUIは更新済みなのでユーザー体験は維持される
            } else {
              console.log('結果処理API成功');
            }
          } catch (apiError) {
            console.error('API通信エラー:', apiError);
            // APIエラー時も静かに失敗し、ユーザーエクスペリエンスを継続
          }
          
          // APIの成否に関わらず、後で残高を取得し直す試み
          setTimeout(() => {
            try {
              fetchUserBalance();
            } catch (balanceError) {
              console.error('残高取得エラー:', balanceError);
              // エラーが発生してもUI更新は既に完了しているのでユーザーエクスペリエンスは維持
            }
          }, 1000);
          
          return true; // 常に成功を返す
        } catch (error) {
          console.error('Result processing error:', error);
          toast.error(`エラーが発生しました: ${error.message}`);
          return false;
        }
      }
    } catch (error) {
      console.error('Casino action error:', error);
      toast.error(error.message || 'エラーが発生しました');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // ゲームコンポーネントをレンダリング
  const renderGameComponent = () => {
    const gameProps = {
      betAmount,
      onBet: () => handleGameAction('bet'),
      onResult: (result) => handleGameAction('result', result),
      isProcessing
    };
    
    switch (activeGame) {
      case 'slot':
        return <SlotMachine {...gameProps} />;
      case 'roulette':
        return <RouletteGame {...gameProps} />;
      case 'blackjack':
        return <BlackjackGame {...gameProps} />;
      default:
        return <SlotMachine {...gameProps} />;
    }
  };

  // デモ/本番切り替えボタン
  const toggleMode = () => {
    if (!isAuthenticated && !demoMode) {
      navigate('/login');
      return;
    }
    
    setDemoMode(!demoMode);
  };

  // 取引情報表示のレンダリング
  const renderTransaction = () => {
    if (!transaction) return null;
    
    let icon = '🎮';
    let textColor = 'text-gray-800';
    let bgColor = 'bg-gray-100';
    
    if (transaction.type === 'win') {
      icon = '💰';
      textColor = 'text-green-700';
      bgColor = 'bg-green-50';
    } else if (transaction.type === 'lose') {
      icon = '📉';
      textColor = 'text-red-700';
      bgColor = 'bg-red-50';
    } else if (transaction.type === 'bet') {
      icon = '🎲';
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
    }
    
    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    
    return (
      <motion.div 
        className={`fixed bottom-4 right-4 ${bgColor} p-4 rounded-lg shadow-lg max-w-xs ${textColor} border border-gray-200 z-50`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <div>
            <div className="font-medium">
              {transaction.type === 'win' && `勝利: +${transaction.amount} PARC`}
              {transaction.type === 'lose' && 'ゲーム負け'}
              {transaction.type === 'bet' && `ベット: ${transaction.amount} PARC`}
            </div>
            <div className="text-xs opacity-75">
              {formatTime(transaction.timestamp)} - {getGameLabel(transaction.game)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // ゲーム名の取得
  const getGameLabel = (gameId) => {
    const game = gameOptions.find(g => g.id === gameId);
    return game ? game.label : 'カジノゲーム';
  };

  // 残高変化アニメーションのレンダリング
  const renderBalanceChange = () => {
    if (!showBalanceChange || previousBalance === null || previousBalance === balance.parc) {
      return null;
    }
    
    const isIncrease = balance.parc > previousBalance;
    const difference = Math.abs(balance.parc - previousBalance);
    
    return (
      <motion.div 
        className={`absolute -top-6 ${isIncrease ? 'text-green-500' : 'text-red-500'} font-bold text-sm`}
        initial={{ opacity: 0, y: isIncrease ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        {isIncrease ? '+' : '-'}{difference.toLocaleString()} PARC
      </motion.div>
    );
  };

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
            <span className="inline-block animate-bounce mr-2">🎰</span>
            Paraccoli Casino プレイルーム
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            運と戦略を駆使して、一攫千金を狙いましょう！
            {demoMode ? '【デモモード】' : ''}
          </p>
          <div className="max-w-xl mx-auto">
            <button
              onClick={toggleMode}
              className={`text-sm px-4 py-1 rounded-full ${
                demoMode 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {demoMode 
                ? (isAuthenticated ? '実際のPARCでプレイする' : 'ログインして実際にプレイ') 
                : 'デモモードに切り替え'
              }
            </button>
          </div>
        </motion.div>

        {/* 残高表示 - 認証済みユーザーのみ表示 */}
        {isAuthenticated && (
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`${!demoMode ? 'bg-white' : 'bg-gray-100'} px-6 py-3 rounded-xl shadow-md flex items-center transition-all duration-300 relative`}>
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="text-sm text-gray-500">PARC残高</p>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={balance.parc}
                    className="text-xl font-bold text-amber-600"
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {balance.parc.toLocaleString()} PARC
                  </motion.p>
                </AnimatePresence>
                <AnimatePresence>
                  {showBalanceChange && renderBalanceChange()}
                </AnimatePresence>
                <p className="text-xs text-gray-500">{demoMode ? 'デモモード中のため実際の残高は変動しません' : ''}</p>
              </div>
            </div>
            <div className={`${!demoMode ? 'bg-white' : 'bg-gray-100'} px-6 py-3 rounded-xl shadow-md flex items-center transition-all duration-300`}>
              <span className="text-2xl mr-3">💴</span>
              <div>
                <p className="text-sm text-gray-500">JPY残高</p>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={balance.jpy}
                    className="text-xl font-bold text-green-600"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {balance.jpy.toLocaleString()} JPY
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            
            {!demoMode && (
              <button
                onClick={fetchUserBalance}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full"
                title="残高を更新"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </motion.div>
        )}

        {/* デモモード表示 */}
        {demoMode && (
          <motion.div 
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-sm font-medium text-amber-800">デモモード</h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p>
                    デモモードでは実際の残高は消費されません。実際に遊ぶには
                    <button 
                      onClick={() => isAuthenticated ? setDemoMode(false) : navigate('/login')}
                      className="underline text-amber-600 hover:text-amber-800"
                    >
                      {isAuthenticated ? '実際のPARCでプレイ' : 'ログイン'}
                    </button>
                    してください。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ゲーム選択タブ */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-1 flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {gameOptions.map((game) => (
            <button
              key={game.id}
              className={`px-6 py-3 rounded-lg flex items-center whitespace-nowrap ${
                activeGame === game.id 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveGame(game.id)}
            >
              <span className="text-xl mr-2">{game.icon}</span>
              {game.label}
            </button>
          ))}
        </motion.div>

        {/* ベット額選択 */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-700 mb-3">ベット額を選択</p>
          <div className="flex flex-wrap justify-center gap-3">
            {betOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={!demoMode && amount > balance.parc}
                className={`${
                  betAmount === amount 
                    ? 'bg-amber-500 text-white' 
                    : (!demoMode && amount > balance.parc)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                } px-3 py-1 rounded`}
              >
                {amount}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ゲーム表示エリア */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {renderGameComponent()}
        </motion.div>
        
        {/* 取引履歴表示 */}
        <AnimatePresence>
          {transaction && renderTransaction()}
        </AnimatePresence>
        
        {/* ナビゲーションリンク */}
        <motion.div 
          className="mt-10 flex justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/casino" className="text-gray-600 hover:text-amber-600 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            カジノトップに戻る
          </Link>
          <Link to="/casino/leaderboard" className="text-amber-600 hover:text-amber-700 inline-flex items-center">
            ランキングを見る
            <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CasinoPlay;