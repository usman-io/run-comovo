
import React from 'react';
import LandingHero from '@/components/landing/LandingHero';
import WhyWeBuilt from '@/components/landing/WhyWeBuilt';
import MissionStatement from '@/components/landing/MissionStatement';
import HowItWorks from '@/components/landing/HowItWorks';
import BusinessBenefits from '@/components/landing/BusinessBenefits';
import WaitlistSection from '@/components/landing/WaitlistSection';
import LandingFooter from '@/components/landing/LandingFooter';

const ComovoLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingHero />
      <WhyWeBuilt />
      <MissionStatement />
      <HowItWorks />
      <BusinessBenefits />
      <WaitlistSection />
      <LandingFooter />
    </div>
  );
};

export default ComovoLandingPage;
