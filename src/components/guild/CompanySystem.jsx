import React from 'react';
import Section from '../../components/shared/Section';
import Card from '../../components/shared/Card';

const GuildSystem = () => {
  return (
    <div className="space-y-16 py-8">
      
      {/* ヘッダー */}
      <Section className="bg-gradient-to-br from-blue-50 to-white text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          📌 Paraccoli Guild - 概要 & コマンドガイド
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          <strong>Paraccoli Guild</strong> は、<strong>Discord上で楽しめるギルド経営シミュレーションゲーム</strong> です。<br />
          プレイヤーはギルド（会社）を設立し、メンバーを管理しながら仕事を行い、資産を増やしていきます。
        </p>
      </Section>

      {/* 特徴 */}
      <Section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 特徴</h2>
        <ul className="space-y-3 text-gray-700">
          {[
            "ギルドの設立 & メンバー管理（役職システム導入）",
            "仕事システムで収益を上げ、給与を分配",
            "ギルド資産を PARC や JPY で運用し、投資 & 取引が可能",
            "ギルドレベルアップで報酬 & 機能強化",
            "ギルド同士で対抗戦 & イベントを開催し、ランキング上位を狙える！"
          ].map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 📜 コマンド一覧 */}
      <Section className="bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⌨️ 主要コマンド一覧</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">コマンド</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">説明</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                ["/company_create [会社名]", "ギルドを設立（100,000 JPY 必要）"],
                ["/company_invite [@USER] [役職]", "メンバーをギルドに招待（DM & チャンネル通知）"],
                ["/company_manage [@USER] [役職]", "役職を変更（社員 ⇄ 役員）"],
                ["/company_fire [@USER]", "ギルドメンバーを解雇（ファンドマネージャー & 役員のみ）"],
                ["/company_leave", "ギルドを退職"],
                ["/company_buy [枚数] [指値]", "ギルド資産で PARC を購入（指値 or 成行）"],
                ["/company_sell [枚数] [指値]", "ギルド資産の PARC を売却（指値 or 成行）"],
                ["/company_devidente", "収益を社員 & 役員に自動分配（ファンドマネージャーのみ）"],
                ["/force_guildevent", "ギルド対抗イベントを手動発生（管理者のみ）"]
              ].map(([command, description], index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 font-bold">{command}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 🏆 ギルドイベント */}
      <Section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 ギルドイベント</h2>
        <p className="text-gray-700">
          ギルド同士の対戦イベントが開催されます。勝利するとボーナス報酬が得られます！  
          `/force_guildevent` によってイベントを手動発生可能。
        </p>
      </Section>

      {/* 📈 ギルドの資産運用 */}
      <Section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 ギルドの資産運用</h2>
        <p className="text-gray-700">
          ギルドは **JPY（現金）** と **PARC（仮想通貨）** を保有します。  
          **ファンドマネージャーのみ** `/company_buy` `/company_sell` で資産を動かせます。
        </p>
      </Section>

      {/* ⏰ 仕事 & 収益システム */}
      <Section className="bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⏰ 仕事 & 収益システム</h2>
        <p className="text-gray-700">
          ギルドメンバーは **仕事を実行し、ギルドの資産を増やす** ことができます。  
          **役員は仕事完了の承認を行い、報酬が会社資産に追加されます。**
        </p>
      </Section>

      {/* 📝 問い合わせ & ヘルプ */}
      <Section className="bg-red-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 問い合わせ & ヘルプ</h2>
        <p className="text-gray-700">
          **不具合・バグ報告・提案** があれば `/form` で開発チームに問い合わせてください！
        </p>
      </Section>

    </div>
  );
};

export default GuildSystem;
