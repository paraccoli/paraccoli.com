import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/shared/Section';
import Button from '../components/shared/Button';

const NotFound = () => {
  return (
    <Section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 mb-8">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          お探しのページは移動または削除された可能性があります。
          トップページに戻るか、別のページをお試しください。
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            トップページに戻る
          </Button>
        </Link>
      </div>
    </Section>
  );
};

export default NotFound;