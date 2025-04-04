import React from 'react';
import { Link } from 'react-router-dom';

const CasinoOverview = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">🎰 Paraccoli Casinoへようこそ！</h2>
      <p className="text-lg text-gray-600 mb-6">
        Paraccoli Casinoは、仮想通貨PARCを使って遊べるオンラインカジノです。  
        運と戦略を駆使して、一攫千金を狙いましょう！
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { title: '🎰 スロットマシン', description: '運試しでジャックポットを狙え！', link: '/casino/play?game=slot' },
          { title: '🎡 ルーレット', description: '赤か黒か？戦略的な賭けがカギ！', link: '/casino/play?game=roulette' },
          { title: '🃏 ブラックジャック', description: 'ディーラーとの駆け引きに勝て！', link: '/casino/play?game=blackjack' },
        ].map((game, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
            <h3 className="text-xl font-bold mb-2">{game.title}</h3>
            <p className="text-gray-600 mb-4">{game.description}</p>
            <Link
              to={game.link}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
            >
              プレイする
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-2">💰 デイリーボーナスをゲット！</h3>
        <p className="text-gray-600 mb-4">
          毎日ログインして特別ボーナスをゲット！連続ログインでさらにボーナスアップ！
        </p>
        <Link
          to="/daily"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          ボーナスを受け取る
        </Link>
      </div>
    </div>
  );
};

export default CasinoOverview;