import React from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';

const Privacy = () => {
  return (
    <Section>
      <Card className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

        <p>
          本プライバシーポリシー（以下、「本ポリシー」といいます。）は、Project Paraccoli【PARC】（以下、「当プロジェクト」といいます。）が提供するサービス（以下、「当サービス」といいます。）における、利用者の個人情報の取り扱いについて定めたものです。
          当サービスを利用するすべてのユーザー（以下、「利用者」といいます。）は、本ポリシーを十分に理解し、同意の上でご利用ください。
        </p>

        <h2 className="text-2xl font-bold mt-8">第1条（収集する情報の種類）</h2>
        <p>当プロジェクトは、以下の利用者情報を収集する場合があります。</p>
        <ol className="list-decimal pl-6">
          <li>Discord ID、ユーザー名、アイコン画像、プロフィール情報</li>
          <li>当サービス上での活動履歴（取引履歴、メッセージ履歴、ログイン履歴等）</li>
          <li>ユーザーが当サービス内で入力、送信した情報（ギルド情報、投稿データ等）</li>
          <li>デバイス情報（IPアドレス、ブラウザ情報、OS等）</li>
          <li>Cookie情報およびその他のトラッキング技術による情報</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第2条（個人情報の利用目的）</h2>
        <p>当プロジェクトは、収集した個人情報を以下の目的で利用します。</p>
        <ol className="list-decimal pl-6">
          <li>当サービスの提供、管理、運営のため</li>
          <li>利用者の認証およびセキュリティ向上のため</li>
          <li>サービス向上のための統計データの作成・分析</li>
          <li>不正行為の防止および対応</li>
          <li>利用者へのカスタマーサポートの提供</li>
          <li>法令または規制当局の要請への対応</li>
          <li>利用者に適した広告・プロモーションの配信</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第3条（個人情報の第三者提供）</h2>
        <p>
          当プロジェクトは、以下のいずれかに該当する場合を除き、利用者の個人情報を第三者に提供することはありません。
        </p>
        <ol className="list-decimal pl-6">
          <li>利用者の同意がある場合</li>
          <li>法令に基づき開示が求められる場合</li>
          <li>人命や財産の保護が必要な場合であり、利用者の同意を得ることが困難である場合</li>
          <li>公共の利益のために必要であると運営が判断した場合</li>
          <li>
            当サービスの運営に関連し、業務委託先（クラウドサービス、決済プロバイダー等）に提供する場合
            （この場合、適切な契約を締結し、個人情報の安全管理を確保します）
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第4条（個人情報の管理）</h2>
        <ol className="list-decimal pl-6">
          <li>
            当プロジェクトは、個人情報の漏洩、滅失、毀損を防ぐため、適切な技術的および組織的安全管理措置を講じます。
          </li>
          <li>
            利用者が自身の個人情報の訂正、削除を希望する場合、当プロジェクトのお問い合わせ窓口より申請することができます。
          </li>
          <li>
            長期間にわたって利用がないアカウントに関しては、適切な基準に基づき個人情報を削除することがあります。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第5条（Cookieおよびトラッキング技術の利用）</h2>
        <p>
          当プロジェクトは、以下の目的でCookieおよび類似技術を使用する場合があります。
        </p>
        <ol className="list-decimal pl-6">
          <li>利用者の利便性向上（ログイン情報の保存、設定の保持等）</li>
          <li>利用状況の分析およびマーケティングデータの収集</li>
          <li>第三者広告ネットワークとの連携によるターゲティング広告の配信</li>
          <li>サービスのセキュリティ強化（不正ログイン対策等）</li>
        </ol>

        <p>
          Cookieの使用を希望しない場合、利用者はブラウザの設定を変更することで無効化することができます。
          ただし、Cookieを無効にすると、一部の機能が正常に動作しない場合があります。
        </p>

        <h2 className="text-2xl font-bold mt-8">第6条（プライバシーポリシーの変更）</h2>
        <ol className="list-decimal pl-6">
          <li>
            当プロジェクトは、法令の改正やサービス内容の変更に応じて、本ポリシーを適宜改訂することがあります。
          </li>
          <li>
            改訂後のプライバシーポリシーは、当サイト上に掲示した時点で効力を生じるものとします。
          </li>
          <li>
            重大な変更がある場合は、利用者に適切な方法で通知を行います。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第7条（お問い合わせ窓口）</h2>
        <p>
          本ポリシーに関するお問い合わせは、以下の窓口までご連絡ください。
        </p>
        <p className="font-bold">Project Paraccoli【PARC】運営チーム</p>
        <p className="text-sm text-gray-600">最終更新日: 2025年3月</p>
      </Card>
    </Section>
  );
};

export default Privacy;
