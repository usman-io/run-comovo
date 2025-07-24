import React from 'react';
const steps = [{
  title: "You create the plan",
  description: "Pick a time, route, and meeting point."
}, {
  title: "We help you fill it",
  description: "We promote the run and manage communication."
}, {
  title: "You welcome your community",
  description: "Host the run and connect with real people."
}, {
  title: "Your brand grows",
  description: "New customers, loyalty, and useful data."
}];
const HowItWorks = () => {
  return <section className="py-24 px-4 bg-[#003444]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
          How It Works
        </h2>
        
        <div className="space-y-8">
          {steps.map((step, index) => <div key={index} className="flex items-start space-x-6 px-[240px]">
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#003444] font-bold text-lg">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;