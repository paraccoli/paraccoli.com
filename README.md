# Project Paraccoli【PARC】 | Discord仮想通貨シミュレーションゲーム 公式ウェブサイト

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Latest-38bdf8.svg)](https://tailwindcss.com/)
[![Discord](https://img.shields.io/badge/Discord-Join-7289da.svg)](https://discord.gg/YOUR_INVITE)

## 📝 概要

**Paraccoli (PARC)** は、Discord上で動作する仮想通貨シミュレーションゲームです。実際のお金を使わずに仮想通貨取引、ギルド（会社）経営、カジノゲームなどを楽しめる教育的プラットフォームです。

このリポジトリは [paraccoli.com](https://paraccoli.com) 公式ウェブサイトのソースコードを含んでいます。

```
🚀 Paraccoli - 遊んで学べる仮想経済シミュレーション
├── 💰 仮想通貨取引 - リアルな市場変動とAI予測
├── 🏢 ギルド経営 - 自分だけの会社を設立・運営
└── 🎰 カジノゲーム - 戦略的なゲームプレイ
```

## 🔧 技術構成

### フロントエンド
- **React 18** (Vite)
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **React Router** - ルーティング
- **Axios** - API通信
- **Headless UI** - アクセシブルなUIコンポーネント
- **Heroicons** - アイコン
- **React Hot Toast** - 通知

### バックエンド
- **Python** (FastAPI)
- **SQLite/PostgreSQL** - データベース
- **Discord.py** - Discordボット

### デプロイメント
- **Vercel/Netlify** - フロントエンドホスティング
- **Heroku/Railway** - バックエンドホスティング

## 📋 プロジェクト構造

```
paraccoli-website/
├── public/              # 静的ファイル
│   ├── images/          # 画像アセット
│   └── documents/       # ドキュメントPDF
├── src/                 # ソースコード
│   ├── components/      # Reactコンポーネント
│   │   ├── shared/      # 共有コンポーネント
│   │   ├── crypto/      # 仮想通貨関連
│   │   ├── guild/       # ギルド関連
│   │   ├── casino/      # カジノ関連
│   │   ├── auth/        # 認証関連
│   │   ├── home/        # ホーム関連
│   │   └── donate/      # 寄付関連
│   ├── contexts/        # Reactコンテキスト
│   ├── hooks/           # カスタムフック
│   ├── pages/           # ページコンポーネント
│   ├── services/        # APIサービス
│   ├── utils/           # ユーティリティ関数
│   ├── styles/          # グローバルスタイル
│   ├── App.jsx          # アプリケーションのルート
│   ├── AppRoutes.jsx    # ルート定義
│   └── main.jsx         # エントリーポイント
├── api/                 # バックエンドAPI (参照用)
└── bot/                 # Discordボット (参照用)
```

## 📱 機能と画面

### 主要機能

1. **仮想通貨取引 (PARC Crypto)**
   - リアルタイム価格チャート
   - 成行・指値注文
   - AI価格予測
   - マイニング・デイリーボーナス
   - 資産ランキング

2. **ギルド経営 (PARC Guild)**
   - ギルド（会社）設立
   - 役職システム
   - 仕事システム
   - ギルド資産運用
   - イベント・ランキング

3. **カジノゲーム (PARC Casino)**
   - 各種ギャンブルゲーム
   - トーナメント
   - 統計・分析

### 画面一覧

| ページ名 | 説明 | 主要コンポーネント |
|---------|------|-----------------|
| ホーム | ランディングページ | `Hero`, `Features`, `HowItWorks` |
| 仮想通貨 | PARC取引システム | `CryptoOverview`, `MarketChart`, `AiPrediction` |
| ギルド | ギルド経営システム | `GuildOverview`, `CompanySystem` |
| カジノ | カジノゲーム | `CasinoOverview`, `CasinoPlay` |
| ドキュメント | マニュアル・企画書 | `Documentation` |
| About | プロジェクト概要 | `About` |
| 寄付 | サポーター募集 | `DonateCard` |
| ログイン | Discord認証 | `DiscordLogin` |

## 🔐 セキュリティ実装

- **Discord OAuth2認証**
  - ユーザー認証にDiscord OAuthを使用
  - JWTトークンによるセッション管理

- **環境変数**
  - API URLやクライアントID等は環境変数で管理
  - `.env.example`ファイルで必要な変数を提示

- **APIセキュリティ**
  - CORS設定によるクロスオリジン制限
  - レート制限の実装
  - 入力バリデーション

- **権限管理**
  - ロールベースのアクセス制御
  - 適切なエラーハンドリング

## 🚀 セットアップ方法

### 前提条件
- Node.js v18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/paraccoli/paraccoli.com.git
cd paraccoli.com

# 依存パッケージをインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# 開発サーバー起動
npm run dev
```

### ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📞 連絡先・サポート

- **Discord**: [Paraccoli Official](https://discord.gg/BRJd9xv7eA)
- **Twitter**: [@Paraccoli](https://twitter.com/Paraccoli)
- **Eメール**: contact@paraccoli.com

## 📜 ライセンス

このプロジェクトは MIT ライセンス の下で公開されています。

## 🤝 コントリビューション

コントリビューションは歓迎します！以下のプロセスに従ってください：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

---

<div align="center">
  <p>© 2025 Project Paraccoli【PARC】. All rights reserved.</p>
  <p>
    <a href="https://paraccoli.com">Website</a> •
    <a href="https://discord.gg/BRJd9xv7eA">Discord</a> •
    <a href="https://twitter.com/Paraccoli">Twitter</a>
  </p>
</div>
