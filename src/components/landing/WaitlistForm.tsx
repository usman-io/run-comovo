import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check } from 'lucide-react';
const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store in localStorage for now
    const waitlistEmails = JSON.parse(localStorage.getItem('comovo-waitlist') || '[]');
    waitlistEmails.push({
      email,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('comovo-waitlist', JSON.stringify(waitlistEmails));
    setIsSubmitted(true);
    setIsLoading(false);
    console.log('Waitlist signup:', email);
  };
  if (isSubmitted) {
    return <div className="bg-green-50 border border-green-200 rounded-2xl p-8 max-w-md mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">You're on the list!</h3>
        <p className="text-green-600">We'll notify you when we launch in Madrid.</p>
      </div>;
  }
  return <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-[#003444] focus:ring-0" />
        <Button type="submit" disabled={isLoading} className="text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap bg-pacers-blue">
          {isLoading ? 'Joining...' : 'Join Waitlist'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>;
};
export default WaitlistForm;