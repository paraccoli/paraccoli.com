import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

const Forums = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://example.com/api/forums/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Section>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 注意事項カード */}
        <Card className="bg-blue-50 border border-blue-100 prose max-w-none p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
        コミュニティフォーラム利用における注意事項
      </h1>

      <p className="text-gray-700 mb-6">
        本フォーラムは、Project Paraccoli【PARC】のユーザー同士が情報交換を行い、コミュニティを発展させる場です。<br />
        全ての参加者が快適に利用できるように、以下の注意事項を遵守してください。
      </p>

      {/* 1. 基本ルール */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">1. 基本ルール</h2>

      <h3 className="text-lg font-semibold text-gray-800">1.1 誰もが安心して利用できる環境を作る</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li>他のユーザーを尊重し、礼儀正しい態度で接してください。</li>
        <li>攻撃的な発言、差別的・侮辱的なコメントは禁止します。</li>
        <li>相手を不快にさせる表現（煽り・嫌がらせ・過度な批判）は慎んでください。</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-800 mt-4">1.2 禁止行為</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li><strong>スパム・広告行為</strong>: 商業目的の宣伝やリンクの連投は禁止。</li>
        <li><strong>詐欺・勧誘</strong>: 他ユーザーを騙す行為や金銭・トークンの詐取は禁止。</li>
        <li><strong>なりすまし</strong>: 他人または管理者を装う行為は禁止。</li>
        <li><strong>荒らし行為</strong>: 無意味な投稿や過度な連投を行うことは禁止。</li>
        <li><strong>NSFW（成人向け）コンテンツの投稿</strong>: 不適切な画像・文章は禁止。</li>
      </ul>

      {/* 2. 投稿に関するルール */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">2. 投稿に関するルール</h2>

      <h3 className="text-lg font-semibold text-gray-800">2.1 適切なトピックを選ぶ</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li>フォーラムにはカテゴリがあるため、適切な場所に投稿してください。</li>
        <li>関連のないスレッドへの投稿（オフトピック）を避けてください。</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-800 mt-4">2.2 誤解を招く情報の拡散禁止</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li>偽情報、誤情報を拡散しないよう注意してください。</li>
        <li>未確認の情報を共有する場合は、「未確定情報」と明記してください。</li>
      </ul>

      {/* 3. 運営・モデレーション */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">3. 運営・モデレーション</h2>

      <h3 className="text-lg font-semibold text-gray-800">3.1 通報システム</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li>不適切な投稿を発見した場合は、通報ボタンを使用してください。</li>
        <li>重大な違反行為があれば、管理者またはモデレーターに直接報告してください。</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-800 mt-4">3.2 モデレーターの権限</h3>
      <ul className="list-disc pl-5 text-gray-700">
        <li>ルール違反の投稿の削除</li>
        <li>違反者への警告</li>
        <li>悪質なユーザーの一時的・永久的なBAN</li>
      </ul>

      {/* 4. プライバシーとセキュリティ */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">4. プライバシーとセキュリティ</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>実名、住所、電話番号、メールアドレスなどの個人情報を投稿しないでください。</li>
        <li>他者の個人情報を許可なく共有することは禁止です。</li>
      </ul>

      {/* 5. ルール違反への対応 */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">5. ルール違反への対応</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>軽度の違反 → <strong>警告（投稿の編集・削除）</strong></li>
        <li>中度の違反 → <strong>一定期間の利用停止（BAN）</strong></li>
        <li>重度の違反 → <strong>永久BAN（アカウント停止）</strong></li>
      </ul>

      {/* 6. フィードバックと改善 */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">6. コミュニティの発展に向けて</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>情報を共有し、建設的な議論を行うことで、より良いコミュニティを作りましょう。</li>
        <li>フォーラムの改善案、機能追加の要望などがあれば、運営に提案してください。</li>
      </ul>

      {/* 7. 最終規定 */}
      <h2 className="text-xl font-bold text-gray-800 mt-6">7. 最終規定</h2>
      <p className="text-gray-700">
        本規約は、必要に応じて改訂されることがあります。利用者は本ルールを遵守する義務があります。
        管理者の判断により、例外的な対応が行われる場合があります。
      </p>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          詳細な利用規約は「<Link to="/terms" className="text-blue-600 hover:underline">利用規約</Link>」をご確認ください。
          不適切な投稿を見つけた場合は、投稿の通報機能をご利用ください。
        </p>
      </div>

      <div className="mt-4 text-right text-sm text-gray-500">
        <p>最終更新日: 2024年2月22日</p>
        <p>運営: Project Paraccoli【PARC】</p>
      </div>
    </Card>

        {/* フォーラムヘッダー */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">コミュニティフォーラム</h1>
          <Link to="/new">
            <Button variant="primary">新規投稿</Button>
          </Link>
        </div>

        {/* 投稿一覧 */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <Link to={`/forums/${post.id}`}>
                  <div className="flex items-start space-x-4">
                    <img
                      src={post.author_avatar || '/default-avatar.png'}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{post.author_name || '不明なユーザー'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.comment_count} コメント</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

export default Forums;