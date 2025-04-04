// src/components/admin/SecurityLogsDebug.jsx
import React, { useEffect } from 'react';
import Section from '../shared/Section';

const SecurityLogsDebug = () => {
  useEffect(() => {
    console.log('SecurityLogsDebug コンポーネントがマウントされました');
  }, []);

  return (
    <Section>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">セキュリティログデバッグ</h2>
        <div className="bg-white shadow-md rounded p-6">
          <p>これは診断用のシンプルなコンポーネントです。</p>
          <p className="mt-4">このページが表示されている場合、ルーティングは機能していますが、本来のSecurityLogsコンポーネントに問題がある可能性があります。</p>
        </div>
      </div>
    </Section>
  );
};

export default SecurityLogsDebug;