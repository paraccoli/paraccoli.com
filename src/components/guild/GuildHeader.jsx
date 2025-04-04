import React from 'react';
import Section from '../../components/shared/Section';

const GuildHeader = () => {
  return (
    <Section className="bg-gradient-to-br from-blue-50 to-white text-center py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        🏰 Paraccoli Guild - ギルドシステム
      </h1>
      <p className="text-lg text-gray-700 max-w-3xl mx-auto">
        ギルドを設立し、会社を経営することで資産を増やそう。  
        役職ごとの機能を活用し、協力しながらトップギルドを目指せ！
      </p>
    </Section>
  );
};

export default GuildHeader;