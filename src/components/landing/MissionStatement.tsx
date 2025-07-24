
import React, { useEffect, useRef, useState } from 'react';

const MissionStatement = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 px-4 bg-[#003444] overflow-hidden"
    >
      {/* Animated background that slides up */}
      <div 
        className={`absolute inset-0 bg-[#003444] transform transition-transform duration-1000 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      />
      
      {/* Content that fades in after background animation */}
      <div 
        className={`relative z-10 max-w-4xl mx-auto text-center transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
          Comovo exists to connect people and local businesses through the power of movement — making every run a moment of community.
        </h2>
      </div>
    </section>
  );
};

export default MissionStatement;
