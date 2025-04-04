import React from 'react';
import Section from '../components/shared/Section';
import DonateCard from '../components/donate/DonateCard';
import Card from '../components/shared/Card';

const Donate = () => {
  return (
    <>
      {/* 寄付プラン */}
      <Section>
        <DonateCard />
      </Section>
    </>
  );
};

export default Donate;