import React from 'react';
import { Eye, RotateCcw, Heart, BarChart3, Camera, Database } from 'lucide-react';
const benefits = [{
  icon: Eye,
  title: "More local visibility without spending on ads"
}, {
  icon: RotateCcw,
  title: "Recurrent traffic during low hours"
}, {
  icon: Heart,
  title: "Loyal customers thanks to community bonds"
}, {
  icon: BarChart3,
  title: "Measurable retention via our app"
}, {
  icon: Camera,
  title: "Authentic content for social media"
}, {
  icon: Database,
  title: "Automated collection of useful marketing data"
}];
const BusinessBenefits = () => {
  return <section className="py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-[#003444] text-center mb-16">
          Why It Works for Businesses
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-pacers-blue">
                  <benefit.icon className="h-6 w-6 text-[#2EC4B6]" />
                </div>
                <p className="text-[#003444] font-medium leading-relaxed">
                  {benefit.title}
                </p>
              </div>
            </div>)}
        </div>
        
        <div className="text-center">
          <p className="text-xl text-[#003444] font-semibold">
            It's not just running — it's real marketing.
          </p>
        </div>
      </div>
    </section>;
};
export default BusinessBenefits;