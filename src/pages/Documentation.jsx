import React from 'react';
import Section from '../components/shared/Section';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

// Card.Header コンポーネントの作成
Card.Header = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

// Card.Title コンポーネントの作成
Card.Title = ({ children }) => (
  <h3 className="text-xl font-bold text-gray-900 mb-2">{children}</h3>
);

// Card.Description コンポーネントの作成
Card.Description = ({ children }) => (
  <p className="text-gray-600">{children}</p>
);

// Card.Content コンポーネントの作成
Card.Content = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

const documents = [
  {
    title: 'Paraccoli Crypto設計企画書',
    description: '仮想通貨取引システムの詳細な設計と仕様について',
    filename: 'Paraccoli Crypto設計企画書.pdf',
    category: 'crypto'
  },
  {
    title: 'Paraccoli Guildデータベース設計',
    description: 'ギルドシステムのデータベース構造と設計仕様',
    filename: 'Paraccoli Guildデータベース設計.pdf',
    category: 'guild'
  },
  {
    title: 'ギルド（会社）システム 設計企画書',
    description: 'ギルド内の会社システムの詳細な仕様と機能説明',
    filename: 'ギルド（会社）システム 設計企画書.pdf',
    category: 'company'
  }
];

const Documentation = () => {
  // PDFファイルを開く関数
  const openPdf = (filename) => {
    window.open(`/documents/${filename}`, '_blank');
  };

  // PDFファイルをダウンロードする関数
  const downloadPdf = (filename) => {
    const link = document.createElement('a');
    link.href = `/documents/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-16">
      <Section>
        <Section.Header>
          <Section.Title>ドキュメント</Section.Title>
          <Section.Description>
            Paraccoliの仕様書と設計資料をご覧いただけます。
          </Section.Description>
        </Section.Header>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.filename}>
              <Card.Header>
                <Card.Title>{doc.title}</Card.Title>
                <Card.Description>{doc.description}</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {/* PDFプレビュー */}
                  <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`/documents/${doc.filename}#toolbar=0`}
                      className="w-full h-full"
                      title={doc.title}
                    />
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => openPdf(doc.filename)}
                      className="w-full"
                    >
                      閲覧
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => downloadPdf(doc.filename)}
                      className="w-full"
                    >
                      ダウンロード
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </Section>

      {/* PDFビューワーセクション */}
      <Section className="bg-gray-50">
        <div className="container max-w-6xl">
          <Card>
            <Card.Header>
              <Card.Title>詳細ドキュメント</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="aspect-[16/9] w-full">
                <iframe
                  src="/documents/Paraccoli Crypto設計企画書.pdf"
                  className="w-full h-full rounded-lg"
                  title="Detailed Documentation"
                />
              </div>
            </Card.Content>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default Documentation;