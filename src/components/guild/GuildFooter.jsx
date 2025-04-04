import React from 'react';
import Section from '../../components/shared/Section';

const GuildFooter = () => {
  return (
    <Section className="bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 ギルドイベント</h2>
      <p className="text-gray-700">
        ギルド同士の対戦イベントを開催。勝利するとボーナス報酬が得られます！
      </p>
    </Section>
  );
};

export default GuildFooter;