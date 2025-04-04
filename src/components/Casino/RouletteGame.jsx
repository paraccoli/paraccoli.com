import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// ルーレットの数字定義（ヨーロピアンルーレット）
const rouletteNumbers = [
  { number: 0, color: 'green' },
  { number: 32, color: 'red' },
  { number: 15, color: 'black' },
  { number: 19, color: 'red' },
  { number: 4, color: 'black' },
  { number: 21, color: 'red' },
  { number: 2, color: 'black' },
  { number: 25, color: 'red' },
  { number: 17, color: 'black' },
  { number: 34, color: 'red' },
  { number: 6, color: 'black' },
  { number: 27, color: 'red' },
  { number: 13, color: 'black' },
  { number: 36, color: 'red' },
  { number: 11, color: 'black' },
  { number: 30, color: 'red' },
  { number: 8, color: 'black' },
  { number: 23, color: 'red' },
  { number: 10, color: 'black' },
  { number: 5, color: 'red' },
  { number: 24, color: 'black' },
  { number: 16, color: 'red' },
  { number: 33, color: 'black' },
  { number: 1, color: 'red' },
  { number: 20, color: 'black' },
  { number: 14, color: 'red' },
  { number: 31, color: 'black' },
  { number: 9, color: 'red' },
  { number: 22, color: 'black' },
  { number: 18, color: 'red' },
  { number: 29, color: 'black' },
  { number: 7, color: 'red' },
  { number: 28, color: 'black' },
  { number: 12, color: 'red' },
  { number: 35, color: 'black' },
  { number: 3, color: 'red' },
  { number: 26, color: 'black' }
];

// 賭けの種類
const betTypes = [
  { id: 'red', label: '赤', odds: 2, icon: '🔴' },
  { id: 'black', label: '黒', odds: 2, icon: '⚫' },
  { id: 'odd', label: '奇数', odds: 2, icon: '1️⃣' },
  { id: 'even', label: '偶数', odds: 2, icon: '2️⃣' },
  { id: '1-18', label: '1-18', odds: 2, icon: '⬇️' },
  { id: '19-36', label: '19-36', odds: 2, icon: '⬆️' },
];

const RouletteGame = ({ betAmount = 10, onBet, onResult, isProcessing = false }) => {
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [spinDegree, setSpinDegree] = useState(0);
  
  // ルーレットをスピンする
  const spinRoulette = async () => {
    if (isSpinning || isProcessing) return;
    if (!selectedBet && selectedNumber === null) {
      setMessage('賭けを選択してください');
      return;
    }
    
    try {
      setIsSpinning(true);
      setMessage('');
      
      // ベット処理
      const betSuccess = await onBet();
      if (!betSuccess) {
        setIsSpinning(false);
        return;
      }
      
      // 回転アニメーション用の角度を設定
      const randomRotation = 1080 + Math.floor(Math.random() * 360); // 3回転 + ランダム
      setSpinDegree(randomRotation);
      
      // 結果の決定（1.5秒後）
      setTimeout(async () => {
        const winningIndex = Math.floor(Math.random() * rouletteNumbers.length);
        const winningNumber = rouletteNumbers[winningIndex];
        
        setResult(winningNumber);
        const resultData = determineOutcome(winningNumber);
        
        // 結果送信
        await onResult(resultData);
        
        setIsSpinning(false);
      }, 1500);
    } catch (error) {
      console.error('ルーレット処理エラー:', error);
      toast.error('エラーが発生しました');
      setIsSpinning(false);
    }
  };
  
  // 結果の判定
  const determineOutcome = (winningNumber) => {
    let won = false;
    let multiplier = 0;
    let pattern = null;
    
    if (selectedNumber !== null) {
      // 単一の数字への賭け
      if (selectedNumber === winningNumber.number) {
        won = true;
        multiplier = 36;
        pattern = "exact_number";
        setMessage(`🎉 大当たり！${betAmount * multiplier} PARCの大勝利！`);
      } else {
        setMessage(`残念...${selectedNumber}ではなく${winningNumber.number}でした`);
      }
    } else if (selectedBet) {
      // 色や特性への賭け
      if (selectedBet === 'red' && winningNumber.color === 'red') {
        won = true;
        multiplier = 2;
        pattern = "red";
        setMessage(`🎉 赤の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else if (selectedBet === 'black' && winningNumber.color === 'black') {
        won = true;
        multiplier = 2;
        pattern = "black";
        setMessage(`🎉 黒の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else if (selectedBet === 'odd' && winningNumber.number !== 0 && winningNumber.number % 2 === 1) {
        won = true;
        multiplier = 2;
        pattern = "odd";
        setMessage(`🎉 奇数の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else if (selectedBet === 'even' && winningNumber.number !== 0 && winningNumber.number % 2 === 0) {
        won = true;
        multiplier = 2;
        pattern = "even";
        setMessage(`🎉 偶数の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else if (selectedBet === '1-18' && winningNumber.number >= 1 && winningNumber.number <= 18) {
        won = true;
        multiplier = 2;
        pattern = "low";
        setMessage(`🎉 1-18の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else if (selectedBet === '19-36' && winningNumber.number >= 19 && winningNumber.number <= 36) {
        won = true;
        multiplier = 2;
        pattern = "high";
        setMessage(`🎉 19-36の勝利！${betAmount * multiplier} PARCの勝利！`);
      }
      else {
        setMessage(`残念...${winningNumber.number} ${winningNumber.color === 'red' ? '赤' : winningNumber.color === 'black' ? '黒' : '緑'}でした`);
      }
    }
    
    return { won, multiplier, pattern };
  };

  // 賭ける数字を選択
  const selectNumber = (number) => {
    if (isSpinning) return;
    setSelectedNumber(number);
    setSelectedBet(null);
    setResult(null);
    setMessage(`${number}に賭けました（配当率36倍）`);
  };
  
  // 賭けの種類を選択
  const selectBet = (betType) => {
    if (isSpinning) return;
    setSelectedBet(betType);
    setSelectedNumber(null);
    setResult(null);
    setMessage(`${betTypes.find(b => b.id === betType).label}に賭けました（配当率2倍）`);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
        <span className="text-3xl mr-2">🎡</span> ルーレット
      </h2>
      
      <div className="relative w-64 h-64 mx-auto mb-8">
        <motion.div 
          className="w-full h-full rounded-full overflow-hidden border-4 border-amber-700 relative bg-amber-800"
          animate={{ rotate: isSpinning ? spinDegree : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            {rouletteNumbers.map((item, index) => {
              const angle = (index * 360) / rouletteNumbers.length;
              return (
                <div 
                  key={index}
                  className="absolute w-full h-full transform origin-center"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <div 
                    className={`w-1/2 h-4 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-t-sm ${
                      item.color === 'red' ? 'bg-red-600' : 
                      item.color === 'black' ? 'bg-gray-900' : 'bg-green-600'
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>
        </motion.div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-amber-600 transform rotate-45"></div>
        </div>
      </div>
      
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">結果:</h3>
          <div className={`inline-flex items-center justify-center p-3 rounded-full text-white ${
            result.color === 'red' ? 'bg-red-600' : 
            result.color === 'black' ? 'bg-gray-900' : 'bg-green-600'
          }`}>
            <span className="text-xl font-bold">{result.number}</span>
          </div>
          <p className="mt-2 text-gray-600">
            {result.color === 'red' ? '赤' : result.color === 'black' ? '黒' : '緑'} / 
            {result.number !== 0 && (result.number % 2 === 0 ? ' 偶数' : ' 奇数')} /
            {result.number >= 1 && result.number <= 18 ? ' 1-18' : result.number >= 19 && result.number <= 36 ? ' 19-36' : ''}
          </p>
        </div>
      )}
      
      {message && <p className="my-4 text-lg font-semibold text-gray-700">{message}</p>}
      
      <button
        onClick={spinRoulette}
        className={`bg-amber-500 text-white px-8 py-3 rounded-lg font-bold mt-4 mb-8 transition ${
          isSpinning || isProcessing || (!selectedBet && selectedNumber === null)
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-amber-600'
        }`}
        disabled={isSpinning || isProcessing || (!selectedBet && selectedNumber === null)}
      >
        {isSpinning 
          ? 'スピン中...' 
          : (!selectedBet && selectedNumber === null)
            ? '賭けを選択してください'
            : `${betAmount} PARCでスピン 🎡`
        }
      </button>
      
      {/* 賭けオプション */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">賭け方を選択</h3>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {betTypes.map((bet) => (
            <button
              key={bet.id}
              onClick={() => selectBet(bet.id)}
              className={`px-4 py-2 rounded ${
                selectedBet === bet.id
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              disabled={isSpinning}
            >
              <span className="mr-1">{bet.icon}</span>
              {bet.label}
            </button>
          ))}
        </div>
        
        <h3 className="text-lg font-semibold mb-3">または数字に賭ける (配当36倍)</h3>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 max-w-lg mx-auto">
          {[...Array(37).keys()].map((number) => {
            const rouletteNumber = rouletteNumbers.find(item => item.number === number);
            return (
              <button
                key={number}
                onClick={() => selectNumber(number)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  selectedNumber === number
                    ? 'bg-amber-500 text-white' 
                    : number === 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : rouletteNumber.color === 'red'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                disabled={isSpinning}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 bg-amber-50 p-4 rounded-lg text-sm text-gray-600">
        <h3 className="font-bold mb-1">配当表</h3>
        <ul className="text-left">
          <li>単一の数字: ベット額の36倍</li>
          <li>赤/黒: ベット額の2倍</li>
          <li>奇数/偶数: ベット額の2倍</li>
          <li>1-18/19-36: ベット額の2倍</li>
        </ul>
        <p className="mt-2 text-xs italic">
          これはデモバージョンです。実際のゲームはDiscordで /roulette コマンドを使ってプレイできます。
        </p>
      </div>
    </div>
  );
};

export default RouletteGame;