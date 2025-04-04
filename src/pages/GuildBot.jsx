import React from 'react';
import Section from '../components/shared/Section';
import GuildOverview from '../components/guild/GuildOverview';

const GuildBot = () => {
  return (
    <>
      {/* ギルド概要 */}
      <Section>
        <GuildOverview />
      </Section>
    </>
  );
};

export default GuildBot;