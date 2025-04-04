import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// スロットのシンボルリスト（重み付け）
const symbolsWeighted = {
  '🍒': 35,  // 一般的なシンボル（高確率）
  '🔔': 25,
  '⭐': 20,
  '🍉': 10,
  '💎': 8,   // レアシンボル（低確率）
  '7️⃣': 2    // 最レアシンボル（非常に低確率）
};

// 重み付けに基づいてシンボルを選択する関数
const selectWeightedSymbol = () => {
  const weights = Object.values(symbolsWeighted);
  const symbols = Object.keys(symbolsWeighted);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < symbols.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return symbols[i];
    }
  }
  return symbols[0]; // フォールバック
};

// デバウンス関数 - 連続呼び出しを防止
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const SlotMachine = ({ betAmount = 10, onBet, onResult, isProcessing = false }) => {
  const [slots, setSlots] = useState(['❓', '❓', '❓']);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [message, setMessage] = useState('');
  const [spinResults, setSpinResults] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isApiCalled, setIsApiCalled] = useState(false);
  
  // 最後のAPIリクエスト時間を追跡
  const lastApiCallRef = useRef(0);
  // APIコールをスロットリングする時間間隔（ミリ秒）
  const API_THROTTLE_MS = 2000;
  
  // APIリクエストをスロットリングする関数
  const throttledApiCall = (apiFunc, ...args) => {
    const now = Date.now();
    if (now - lastApiCallRef.current >= API_THROTTLE_MS) {
      lastApiCallRef.current = now;
      return apiFunc(...args);
    } else {
      console.log('API call throttled');
      return Promise.resolve({ throttled: true });
    }
  };

  // リールが止まった後に結果を処理（デバウンス処理）
  useEffect(() => {
    if (!spinResults || spinning.some(s => s) || isApiCalled) return;
    
    // この時点でスピンが完了しており、APIはまだ呼ばれていない
    const processResults = async () => {
      const { won, multiplier, pattern } = spinResults;
      
      // メッセージを設定
      if (won) {
        const winAmount = betAmount * multiplier;
        if (pattern === "jackpot" && slots[0] === '7️⃣') {
          setMessage(`🎉 ジャックポット！${betAmount * multiplier} PARCの大勝利！ 🎉`);
        } else if (pattern === "jackpot") {
          setMessage(`🎉 3つ揃いました！${betAmount * multiplier} PARCの勝利！ 🎉`);
        } else if (pattern === "pair") {
          setMessage(`✨ 2つそろいました！${betAmount * multiplier} PARCの勝利！ ✨`);
        } else if (pattern === "lucky7") {
          setMessage(`✨ ラッキー7が出た！${betAmount * multiplier} PARCのボーナス！ ✨`);
        }
      } else {
        setMessage(`😢 残念！${betAmount} PARCを失いました`);
      }
      
      // APIコールを一度だけ行う
      setIsApiCalled(true);
      
      try {
        // APIリクエストをスロットリング
        if (typeof onResult === 'function') {
          await throttledApiCall(onResult, spinResults);
        }
      } catch (error) {
        console.error('API communication error:', error);
        // エラー発生時でもユーザーエクスペリエンスを維持
      } finally {
        setIsButtonDisabled(false);
      }
    };
    
    // 結果処理を遅延実行してAPI呼び出しを最適化
    const timer = setTimeout(() => {
      processResults();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [spinning, spinResults, betAmount, onResult, slots, isApiCalled]);

  // スロットを回す処理
  const spinSlot = async () => {
    if (spinning.some(s => s) || isProcessing || isButtonDisabled) return;
    
    try {
      setIsButtonDisabled(true);
      setMessage('');
      setIsApiCalled(false);
      
      // ベット処理 - スロットリング適用
      let betSuccess = false;
      try {
        betSuccess = await throttledApiCall(onBet);
      } catch (error) {
        console.error('Bet API error:', error);
        // エラー時はローカルでゲームを続行
        betSuccess = true; // デモモードのように動作
      }
      
      if (!betSuccess) {
        setIsButtonDisabled(false);
        return;
      }
      
      // アニメーション開始 - すべてのリールを回転状態に
      setSpinning([true, true, true]);
      
      // 結果を事前に決定（公平性のため）
      const newSlots = [
        selectWeightedSymbol(),
        selectWeightedSymbol(),
        selectWeightedSymbol()
      ];
      
      // 結果判定とペイアウト計算
      let won = false;
      let multiplier = 0;
      let pattern = null;
      
      if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
        // 3つ揃い - ジャックポット
        won = true;
        pattern = "jackpot";
        
        if (newSlots[0] === '7️⃣') {
          multiplier = 50;  // 777は特別配当
        } else if (newSlots[0] === '💎') {
          multiplier = 20;  // ダイヤモンド3つは高配当
        } else {
          multiplier = 10;
        }
      } else if (newSlots[0] === newSlots[1] || newSlots[1] === newSlots[2] || newSlots[0] === newSlots[2]) {
        // 2つ揃い - ただし777との組み合わせは除外（より稀に）
        if ((newSlots[0] === '7️⃣' && newSlots[1] === '7️⃣') || 
            (newSlots[1] === '7️⃣' && newSlots[2] === '7️⃣') || 
            (newSlots[0] === '7️⃣' && newSlots[2] === '7️⃣')) {
          // 77は特別配当
          won = true;
          pattern = "pair";
          multiplier = 5;
        } else {
          // 通常の2つ揃い
          won = true;
          pattern = "pair";
          multiplier = 2;
        }
      } else if (newSlots.includes('7️⃣')) {
        // ラッキー7が1つだけ - 25%の確率でのみ勝利（ランダム要素を追加）
        if (Math.random() < 0.25) {
          won = true;
          pattern = "lucky7";
          multiplier = 1.5;
        } else {
          won = false;
          multiplier = 0;
        }
      } else {
        // 負け
        won = false;
        multiplier = 0;
      }
      
      // 結果を保存
      setSpinResults({ won, multiplier, pattern });
      
      // リールを左から順番に停止
      setTimeout(() => {
        setSlots(prev => [newSlots[0], prev[1], prev[2]]);
        setSpinning(prev => [false, prev[1], prev[2]]);
        
        // 中央リール
        setTimeout(() => {
          setSlots(prev => [prev[0], newSlots[1], prev[2]]);
          setSpinning(prev => [prev[0], false, prev[2]]);
          
          // 右リール
          setTimeout(() => {
            setSlots(prev => [prev[0], prev[1], newSlots[2]]);
            setSpinning(prev => [prev[0], prev[1], false]);
          }, 800); // 右リール停止の遅延
        }, 800); // 中リール停止の遅延
      }, 800); // 左リール停止の遅延
      
    } catch (error) {
      console.error('スロット処理エラー:', error);
      toast.error('エラーが発生しました');
      setSpinning([false, false, false]);
      setIsButtonDisabled(false);
    }
  };

  // リールアニメーションのレンダリング
  const renderReel = (index) => {
    const isSpinning = spinning[index];
    const symbol = slots[index];
    
    return (
      <div className="relative w-16 h-16 overflow-hidden">
        <AnimatePresence mode="wait">
          {isSpinning ? (
            // スピン中のアニメーション
            <motion.div
              key={`spinning-${index}`}
              className="w-16 h-16 bg-white rounded shadow-inner flex items-center justify-center absolute"
              initial={{ y: 0 }}
              animate={{ 
                y: [0, -100, 0, -100, 0, -100, 0], 
                transition: { 
                  repeat: Infinity, 
                  duration: 0.5, 
                  ease: "linear"
                }
              }}
            >
              <motion.div
                animate={{
                  opacity: [1, 0, 1],
                  transition: { repeat: Infinity, duration: 0.2 }
                }}
              >
                {['🍒', '🔔', '⭐', '🍉', '💎', '7️⃣'][Math.floor(Math.random() * 6)]}
              </motion.div>
            </motion.div>
          ) : (
            // 停止時のアニメーション
            <motion.div 
              key={`${symbol}-${index}`}
              className="w-16 h-16 bg-white rounded shadow-inner flex items-center justify-center absolute"
              initial={{ y: -100 }}
              animate={{ 
                y: 0,
                transition: { 
                  type: "spring", 
                  damping: 12,
                  duration: 0.5
                }
              }}
            >
              {symbol}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
        <span className="text-3xl mr-2">🎰</span> スロットマシン
      </h2>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-md inline-block">
        <div className="flex space-x-4 text-4xl font-bold mb-4">
          {[0, 1, 2].map(index => renderReel(index))}
        </div>
        <button
          onClick={spinSlot}
          className={`bg-amber-500 text-white px-6 py-3 rounded-lg font-bold mt-4 transition ${
            spinning.some(s => s) || isProcessing || isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-600'
          }`}
          disabled={spinning.some(s => s) || isProcessing || isButtonDisabled}
        >
          {spinning.some(s => s)
            ? 'スピン中...' 
            : `${betAmount} PARCでスピン 🎰`
          }
        </button>
        {message && <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>}
      </div>
      
      <div className="mt-4 bg-amber-50 p-4 rounded-lg text-sm text-gray-600">
        <h3 className="font-bold mb-1">配当表</h3>
        <ul className="text-left">
          <li>777: ベット額の50倍</li>
          <li>💎💎💎: ベット額の20倍</li>
          <li>他の3つ揃い: ベット額の10倍</li>
          <li>77の組み合わせ: ベット額の5倍</li>
          <li>ペア (2つ揃い): ベット額の2倍</li>
          <li>ラッキー7: ベット額の1.5倍 (25%の確率)</li>
        </ul>
        <p className="mt-2 text-xs italic">
          {!isProcessing ? 'リールは左から順に止まります。幸運を祈ります！' : 'しばらくお待ちください...'}
        </p>
      </div>
    </div>
  );
};

export default SlotMachine;