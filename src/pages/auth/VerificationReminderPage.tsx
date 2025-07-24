
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const VerificationReminderPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="app-container max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <Mail className="w-16 h-16 text-blue-500 mx-auto" />
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thank you for signing up!
                  </h2>
                  <p className="text-gray-600">
                    Please check your email to verify your account.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    We've sent a verification link to your email address. 
                    Click the link to activate your account and start using our platform.
                  </p>
                  
                  <a 
                    href="https://mail.google.com/mail" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
                  >
                    Go to Gmail
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <div className="pt-4">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 pt-4">
                  <p>
                    Don't forget to check your spam folder if you don't see the email in your inbox.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerificationReminderPage;
