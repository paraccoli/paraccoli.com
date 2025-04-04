import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// カードのスート（マーク）とランク
const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// カードの作成
const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return shuffle(deck);
};

// カードをシャッフル
const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// カードの価値を計算
const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;
  
  for (let card of hand) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }
  
  // Aを1または11として扱う処理
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return value;
};

const BlackjackGame = ({ betAmount = 10 }) => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealerTurn, gameOver
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  
  // 新しいゲームの開始
  const startGame = () => {
    const newDeck = createDeck();
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState('playing');
    setMessage('');
    setResult(null);
    
    // ブラックジャックのチェック
    const playerValue = calculateHandValue(playerCards);
    if (playerValue === 21) {
      if (calculateHandValue(dealerCards) === 21) {
        setMessage('プッシュ！ブラックジャック同士で引き分けです');
        setGameState('gameOver');
        setResult('push');
      } else {
        setMessage('🎉 ブラックジャック！1.5倍の配当です！');
        setGameState('gameOver');
        setResult('blackjack');
      }
    }
  };
  
  // カードを引く
  const hit = () => {
    if (gameState !== 'playing') return;
    
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerHand, newCard];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    const handValue = calculateHandValue(newHand);
    if (handValue > 21) {
      setMessage('バスト！21を超えてしまいました');
      setGameState('gameOver');
      setResult('bust');
    } else if (handValue === 21) {
      stand(); // 21になったら自動的にスタンド
    }
  };
  
  // スタンド（これ以上カードを引かない）
  const stand = () => {
    if (gameState !== 'playing') return;
    
    setGameState('dealerTurn');
    
    // ディーラーの手札を公開して、17以上になるまでカードを引く
    dealerPlay();
  };
  
  // ディーラーのターン
  const dealerPlay = () => {
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    let dealerValue = calculateHandValue(currentDealerHand);
    
    // ディーラーは17未満ならカードを引き続ける
    while (dealerValue < 17) {
      const newCard = currentDeck.pop();
      currentDealerHand.push(newCard);
      dealerValue = calculateHandValue(currentDealerHand);
    }
    
    setDeck(currentDeck);
    setDealerHand(currentDealerHand);
    
    // 勝敗判定
    const playerValue = calculateHandValue(playerHand);
    
    if (dealerValue > 21) {
      setMessage('ディーラーがバスト！あなたの勝ちです！');
      setResult('win');
    } else if (dealerValue > playerValue) {
      setMessage('ディーラーの勝ち！');
      setResult('lose');
    } else if (playerValue > dealerValue) {
      setMessage('あなたの勝ちです！');
      setResult('win');
    }
    else {
      setMessage('引き分けです');
      setResult('push');
    }
    
    setGameState('gameOver');
  };
  
  // 画面表示用：カードの表示
  const renderCard = (card) => {
    const isRedSuit = card.suit === '♥️' || card.suit === '♦️';
    return (
      <div className={`bg-white border border-gray-300 rounded-md px-4 py-6 shadow-sm ${isRedSuit ? 'text-red-600' : 'text-gray-900'}`}>
        <div className="text-lg font-bold">{card.rank}</div>
        <div className="text-2xl">{card.suit}</div>
      </div>
    );
  };
  
  // 画面表示用：勝敗結果による配当額
  const getResultAmount = () => {
    switch (result) {
      case 'blackjack':
        return betAmount * 2.5; // ブラックジャックは賭け金の2.5倍
      case 'win':
        return betAmount * 2; // 通常の勝ちは賭け金の2倍
      case 'push':
        return betAmount; // 引き分けは賭け金返却
      default:
        return 0; // 負けは0
    }
  };

  // 結果に応じたメッセージカラー
  const getResultColor = () => {
    if (result === 'blackjack' || result === 'win') {
      return 'bg-green-100 text-green-800';
    } else if (result === 'push') {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
        <span className="text-3xl mr-2">🃏</span> ブラックジャック
      </h2>
      
      {gameState === 'betting' ? (
        <div>
          <p className="text-lg mb-6">ブラックジャックへようこそ！「ディール」ボタンを押してゲームを開始しましょう。</p>
          <button
            onClick={startGame}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            ディール
          </button>
        </div>
      ) : (
        <>
          {/* ディーラーの手札 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">ディーラーの手札</h3>
            <p className="mb-2 text-gray-600">
              {gameState === 'playing' 
                ? '1枚目のカードのみ表示' 
                : `合計: ${calculateHandValue(dealerHand)}`
              }
            </p>
            <div className="flex justify-center gap-2">
              {dealerHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {index === 1 && gameState === 'playing' ? (
                    // 2枚目のカードは裏向き（ゲーム中）
                    <div className="bg-amber-600 border border-gray-300 rounded-md px-4 py-6 shadow-sm w-16 h-24">
                      <div className="text-white text-center">?</div>
                    </div>
                  ) : (
                    renderCard(card)
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* プレイヤーの手札 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">あなたの手札</h3>
            <p className="mb-2 text-gray-600">合計: {calculateHandValue(playerHand)}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {playerHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {renderCard(card)}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* メッセージ表示 */}
          {message && (
            <motion.div 
              className={`p-4 rounded-lg mb-6 ${gameState === 'gameOver' ? getResultColor() : 'bg-amber-50 text-amber-800'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-lg font-bold">{message}</p>
              {gameState === 'gameOver' && result && (
                <p className="mt-2">
                  {result === 'lose' || result === 'bust' 
                    ? `${betAmount} PARCを失いました` 
                    : `${getResultAmount()} PARCを獲得しました！`
                  }
                </p>
              )}
            </motion.div>
          )}
          
          {/* ゲームコントロールボタン */}
          <div className="flex justify-center gap-4">
            {gameState === 'playing' && (
              <>
                <button
                  onClick={hit}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg"
                >
                  ヒット
                </button>
                <button
                  onClick={stand}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg"
                >
                  スタンド
                </button>
              </>
            )}
            
            {gameState === 'gameOver' && (
              <button
                onClick={startGame}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg"
              >
                次のゲーム
              </button>
            )}
          </div>
        </>
      )}
      
      {/* ルール説明 */}
      <div className="mt-12 border-t pt-6 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">ブラックジャックのルール</h3>
        <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
          <li>カードの合計が21に近づけることが目標です</li>
          <li>数字カードはその数の通り、絵札は10、Aは1または11として扱います</li>
          <li>最初の2枚で21になると「ブラックジャック」で配当が2.5倍になります</li>
          <li>21を超えると「バスト」で負けになります</li>
          <li>ディーラーは17以上になるまでカードを引き続けます</li>
        </ul>
        <p className="mt-4 italic">
          これはデモバージョンです。実際のゲームはDiscordで /blackjack コマンドを使ってプレイできます。
        </p>
      </div>
    </div>
  );
};

export default BlackjackGame;