import React from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';

const Terms = () => {
  return (
    <Section>
      <Card className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">利用規約</h1>

        <h2 className="text-2xl font-bold mt-8">第1条（適用範囲）</h2>
        <p>
          本利用規約（以下、「本規約」といいます。）は、Project Paraccoli【PARC】（以下、「当プロジェクト」といいます。）が提供するWebサイト、およびParaccoli Crypto【PARC】、Paraccoli Guild【PARC】、Paraccoli Casino【PARC】（以下、「当サービス」といいます。）の利用条件を定めるものです。
        </p>
        <p>
          ユーザー（以下、「利用者」といいます。）は、本規約の内容を理解し、これに同意した上で当サービスを利用するものとします。利用者が当サービスを利用した時点で、本規約に同意したものとみなされます。
        </p>

        <h2 className="text-2xl font-bold mt-8">第2条（定義）</h2>
        <ol className="list-decimal pl-6">
          <li>「利用者」とは、本規約に同意し、当サービスを利用する個人または法人を指します。</li>
          <li>「アカウント」とは、利用者が当サービスを利用するために作成する個人識別情報を指します。</li>
          <li>「ギルド」とは、利用者が組織することができるオンライン上の団体を指します。</li>
          <li>「コンテンツ」とは、利用者が当サービス内で投稿、共有、送信、保存する情報（テキスト、画像、動画、データ等）を指します。</li>
          <li>「運営」とは、当プロジェクトの管理・運営チームを指します。</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第3条（利用登録）</h2>
        <ol className="list-decimal pl-6">
          <li>
            利用者は、Discordアカウント等の外部認証サービスを通じて当サービスに登録するものとします。
          </li>
          <li>
            当プロジェクトは、以下のいずれかに該当すると判断した場合、利用登録を拒否または登録解除する権利を有します。
            <ul className="list-disc pl-6">
              <li>登録情報に虚偽の内容を含む場合</li>
              <li>過去に規約違反等により利用停止措置を受けたことがある場合</li>
              <li>その他、当プロジェクトが不適切と判断する場合</li>
            </ul>
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第4条（アカウント管理）</h2>
        <ol className="list-decimal pl-6">
          <li>利用者は、自己の責任においてアカウントを管理・保持するものとします。</li>
          <li>アカウントの譲渡、貸与、共有は禁止されます。</li>
          <li>
            アカウント情報が第三者によって不正利用された場合であっても、当プロジェクトは一切の責任を負いません。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第5条（禁止事項）</h2>
        <p>
          利用者は、当サービスの利用にあたり、以下の行為を行ってはなりません。
        </p>
        <ol className="list-decimal pl-6">
          <li>法令または公序良俗に違反する行為</li>
          <li>他の利用者に対する誹謗中傷、嫌がらせ、脅迫行為</li>
          <li>虚偽の情報を登録・発信する行為</li>
          <li>当サービスの運営を妨害する行為</li>
          <li>第三者の知的財産権を侵害する行為</li>
          <li>不正アクセス行為、アカウントの不正利用</li>
          <li>本人の同意なく個人情報を公開する行為</li>
          <li>ギルドを悪用した不正行為（マネーロンダリング等）</li>
          <li>その他、当プロジェクトが不適切と判断する行為</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第6条（サービスの変更・停止）</h2>
        <ol className="list-decimal pl-6">
          <li>
            当プロジェクトは、利用者に通知することなく、当サービスの全部または一部の内容を変更・停止することができます。
          </li>
          <li>
            当サービスの変更・停止により生じた損害について、当プロジェクトは一切の責任を負いません。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第7条（免責事項）</h2>
        <ol className="list-decimal pl-6">
          <li>当サービスは、現状有姿で提供されるものであり、完全性・正確性・適用性を保証しません。</li>
          <li>
            利用者間または第三者との間で発生したトラブルについて、当プロジェクトは一切の責任を負いません。
          </li>
          <li>
            サーバー障害、システムエラー、外部攻撃等により生じた損害について、当プロジェクトは責任を負いません。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第8条（知的財産権）</h2>
        <ol className="list-decimal pl-6">
          <li>当サービスに関連する全ての知的財産権は、当プロジェクトまたは適法な権利者に帰属します。</li>
          <li>
            利用者は、当プロジェクトの事前の許可なく、コンテンツを転載、複製、商用利用することはできません。
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">第9条（準拠法・管轄）</h2>
        <p>
          本規約の解釈および適用は、日本法を準拠法とします。
        </p>
        <p>
          本規約に関する紛争が生じた場合は、当プロジェクトの運営拠点を管轄する裁判所を第一審の専属的合意管轄とします。
        </p>

        <p className="mt-8 text-sm text-gray-600">
          制定日: 2025年3月  
          最終更新日: 2025年3月  
          Project Paraccoli【PARC】運営チーム
        </p>
      </Card>
    </Section>
  );
};

export default Terms;
