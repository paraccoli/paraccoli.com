export const navigation = [
  {
    name: 'ホーム',
    path: '/',
  },
  {
    name: 'プロジェクト',
    path: '/about',
  },
  {
    name: '仮想通貨',
    path: '/crypto',
  },
  {
    name: 'ギルドシステム',
    path: '/guild',
  },
  {
    name: 'カジノ', // カジノメニューを追加
    path: '/casino',
  },
  {
    name: 'フォーラム',
    path: '/forums',
  },
  {
    name: 'ドキュメント',
    path: '/docs',
  },
  {
    name: '寄付',
    path: '/donate',
  },
  {
    name: 'クエスト',
    path: '/quests',
  }
];

export const socialLinks = [
  {
    name: 'Discord',
    href: {process.env.DISCORD_INVITE_URL || "#"},
    icon: 'discord'
  },
  {
    name: 'Twitter',
    href: 'https://x.com/Paraccoli',
    icon: 'twitter'
  },
  {
    name: 'GitHub',
    href: 'https://github.com/paraccoli',
    icon: 'github'
  }
];