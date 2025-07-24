
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingHero = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/lovable-uploads/ff082182-829c-4b20-b38f-82c4b8b12265.png"
          alt="Running community background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-white/60"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-60 animate-pulse-light"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-br from-[#003444]/10 to-transparent rounded-full opacity-60 animate-pulse-light" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-teal-50 to-transparent rounded-full opacity-60 animate-pulse-light" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Logo at the very top - much bigger */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <img 
          src="/lovable-uploads/4cbb34e3-3115-4ff7-9dda-cd8f738ed3d6.png"
          alt="Comovo logo"
          className="h-64 md:h-80 lg:h-96 w-auto"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 mt-60 md:mt-72 lg:mt-80">
        {/* Main heading */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#003444] leading-[0.9]">
            Move Together.<br />
            <span className="text-[#003444]">Build Community.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comovo helps cafés, running stores, and lifestyle brands host community runs. 
            We connect people who want to move with places that want to matter.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <Button 
            onClick={scrollToWaitlist}
            className="bg-[#003444] hover:bg-[#00546d] text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Join the Waitlist
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
