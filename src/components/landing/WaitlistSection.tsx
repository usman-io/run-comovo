
import React from 'react';
import WaitlistForm from '@/components/landing/WaitlistForm';

const WaitlistSection = () => {
  return (
    <section id="waitlist" className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold text-[#003444] mb-6">
          Be the First to Join the Movement
        </h2>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          We're launching soon. Sign up to stay in the loop and access early runs.
        </p>
        
        <WaitlistForm />
        
        <p className="text-sm text-gray-400 mt-6">
          We'll only reach out when it matters.
        </p>
      </div>
    </section>
  );
};

export default WaitlistSection;
